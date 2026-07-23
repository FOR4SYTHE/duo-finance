"use client";

import { useState } from "react";
import { Plus, Settings2, PiggyBank, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/animations";
import { useEffect, useRef } from "react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { QuickLogModal } from "@/components/jar/QuickLogModal";
import { JarLockedModal } from "@/components/jar/JarLockedModal";
import { JarSettingsModal } from "@/components/jar/JarSettingsModal";
import { LogAnimationOverlay } from "@/components/jar/LogAnimationOverlay";
import { AnimatePresence } from "framer-motion";

export default function SpendJarPage() {
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem('hasSeenJarAnimation')) {
      setIsInitialLoad(true);
      sessionStorage.setItem('hasSeenJarAnimation', 'true');
    }
  }, []);

  const { config } = useBudgetStore();
  const { entries, addExpense, clearEntries } = useSpendStore();
  const { exchangeRate } = useCurrencyStore();
  
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [animationType, setAnimationType] = useState<'happy' | 'worried' | 'scared' | null>(null);

  const [isLogFlash, setIsLogFlash] = useState(false);
  const [mascotReaction, setMascotReaction] = useState<'idle' | 'action' | 'reset' | 'locked_click'>('idle');
  const previousEntriesLength = useRef(entries.length);

  useEffect(() => {
    if (entries.length > previousEntriesLength.current) {
      setIsLogFlash(true);
      setMascotReaction('action');
      const timer = setTimeout(() => {
        setIsLogFlash(false);
        setMascotReaction('idle');
      }, 3000);
      previousEntriesLength.current = entries.length;
      return () => clearTimeout(timer);
    } else if (entries.length === 0 && previousEntriesLength.current > 0) {
      setMascotReaction('reset');
      const timer = setTimeout(() => {
        setMascotReaction('idle');
      }, 3000);
      previousEntriesLength.current = entries.length;
      return () => clearTimeout(timer);
    }
  }, [entries.length]);

  // Calculate totals based on allowed percentage
  const totalSpent = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const allowedSpend = config.targetAmount * ((config.jarAllowedPercentage || 20) / 100);
  const remainingAllowed = allowedSpend - totalSpent;
  const percentage = Math.min((totalSpent / allowedSpend) * 100, 100);
  
  const isLocked = totalSpent >= allowedSpend;
  const isNearingCap = percentage >= 85 && !isLocked;

  // Visuals for ring
  let ringColor = percentage === 0 ? "transparent" : "#30D158"; // Green
  let ringGlow = "rgba(48,209,88,0.6)";
  if (percentage >= 50 && percentage < 70) {
    ringColor = "#E8A33D"; // Amber
    ringGlow = "rgba(232,163,61,0.6)";
  } else if (percentage >= 70) {
    ringColor = "#FF453A"; // Red
    ringGlow = "rgba(255,69,58,0.6)";
  }

  // SVG parameters (Removed since we use nitro glow ring now)
  
  const handleLogSpend = (amount: number, note: string) => {
      // Calculate new percentage to trigger corresponding animation
      const newTotal = totalSpent + amount;
      const newPercentage = (newTotal / allowedSpend) * 100;
      
      let type: 'happy' | 'worried' | 'scared' = 'happy';
      if (newPercentage >= 70) type = 'scared';
      else if (newPercentage >= 50) type = 'worried';
      
      setAnimationType(type);
      addExpense(amount, 'PHP', undefined, note);
      setIsLogModalOpen(false);
  };

  const handleMainAction = () => {
      if (isLocked) {
          setIsLockedModalOpen(true);
          setMascotReaction('locked_click');
          setTimeout(() => setMascotReaction('idle'), 3000);
      } else {
          setIsLogModalOpen(true);
      }
  };

  // Compute cumulative color for logs
  // Entries are newest first, so we reverse to process oldest to newest, then reverse back
  let runningTotal = 0;
  const logsWithColor = [...entries].reverse().map(entry => {
      runningTotal += entry.amount;
      const perc = (runningTotal / allowedSpend) * 100;
      let colorClass = "text-[#30D158]"; // Green
      let bgClass = "bg-[#30D158]/10";
      
      if (perc >= 70) {
          colorClass = "text-[#FF453A]";
          bgClass = "bg-[#FF453A]/10";
      } else if (perc >= 50) {
          colorClass = "text-[#E8A33D]";
          bgClass = "bg-[#E8A33D]/10";
      }
      return { ...entry, colorClass, bgClass };
  }).reverse();

  // Get active mascot state image
  const getMascotImage = () => {
    let state = 'safe';
    if (percentage >= 85) state = 'danger';
    else if (percentage >= 50) state = 'warning';

    let suffix = '1'; // default idle

    if (mascotReaction === 'reset') {
        state = 'safe';
        suffix = '3'; // Happy Spin
    } else if (mascotReaction === 'locked_click') {
        state = 'danger';
        suffix = '2'; // Dizzy Spin when denied
    } else if (mascotReaction === 'action') {
        suffix = '2'; // Thumbs Up / Gasp
    } else {
        // Idle variations based on specific thresholds
        if (state === 'danger' && isLocked) {
            suffix = '3'; // Fallen Over (100%+)
        } else if (state === 'warning' && percentage >= 75) {
            suffix = '3'; // Heavy Breathing (75% - 84%)
        }
    }

    return `/mascot/difu-${state}-${suffix}.webp`;
  };

  // Compute dynamic background gradient based on budget health
  const bgGradient = 
    percentage >= 85 ? 'radial-gradient(140% 120% at 50% 0%, #3a0b0b 0%, #000000 100%)' :
    percentage >= 50 ? 'radial-gradient(140% 120% at 50% 0%, #362005 0%, #000000 100%)' :
    'radial-gradient(140% 120% at 50% 0%, #06210f 0%, #000000 100%)';

  return (
    <motion.div 
      key={isInitialLoad ? "animate" : "static"}
      variants={containerVariants}
      initial={isInitialLoad ? "hidden" : false}
      animate="visible"
      className="relative flex flex-col w-full h-full overflow-hidden transition-colors duration-1000 ease-in-out"
      style={{ background: bgGradient }}
    >
      
      {/* Floating Header */}
      <motion.div variants={itemVariants} className="absolute top-12 left-6 right-6 flex justify-between items-center z-50">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl text-white font-medium tracking-tight drop-shadow-md">Spend Jar</h1>
              <button 
                  onClick={() => clearEntries()} 
                  className="px-2 py-1 bg-white/[0.05] text-white/50 rounded-md text-[10px] uppercase font-bold tracking-wider hover:bg-white/[0.1] hover:text-white transition-colors border border-white/[0.1]"
              >
                  Reset Logs
              </button>
            </div>
            <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase">Household Budget</span>
        </div>
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-11 h-11 rounded-full bg-white/[0.05] backdrop-blur-xl flex items-center justify-center border border-white/[0.08] hover:bg-white/[0.1] transition-all shadow-lg active:scale-95"
        >
          <Settings2 className="w-5 h-5 text-white/90" />
        </button>
      </motion.div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pt-[20vh] pb-32">
        
        {/* Massive Arch & Mascot Section */}
        <motion.div variants={itemVariants} className="relative w-full flex flex-col items-center justify-center shrink-0">
          
          <div className="relative w-[340px] h-[200px] flex justify-center overflow-visible">
            {/* The Thick Arch (Behind Mascot) */}
            <svg viewBox="0 0 200 120" className="absolute top-0 w-full h-[200px] pointer-events-none drop-shadow-2xl">
              {/* Background Track */}
              <path 
                d="M 20 110 A 80 80 0 0 1 180 110" 
                fill="none" 
                stroke="rgba(255,255,255,0.04)" 
                strokeWidth="18" 
                strokeLinecap="round" 
              />
              {/* Foreground Progress (Length ~ 251.2) */}
              <motion.path 
                d="M 20 110 A 80 80 0 0 1 180 110" 
                fill="none" 
                stroke={ringColor} 
                strokeWidth="18" 
                strokeLinecap="round"
                strokeDasharray={252}
                initial={{ strokeDashoffset: 252 }}
                animate={{ strokeDashoffset: 252 - (percentage / 100) * 252 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ filter: isLogFlash ? `drop-shadow(0 0 12px ${ringColor})` : 'none' }}
              />
            </svg>

            {/* DUFI Mascot Image */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 z-10">
              <div 
                className="w-48 h-48 flex flex-col items-center justify-center relative transition-colors duration-500 overflow-visible"
              >
                <motion.img
                  key={getMascotImage()} // Re-animate on source change
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  src={getMascotImage()}
                  alt="Dufi Mascot"
                  className="w-[140%] max-w-none h-auto object-contain absolute bottom-[-15%]"
                />
                {/* Simulated drop shadow for mascot */}
                <div className="absolute -bottom-2 w-24 h-4 bg-black/60 blur-[10px] rounded-full -z-10" />
              </div>
            </div>
            
            {/* Arc Labels */}
            <div className="absolute bottom-[-10px] left-3 text-[10px] text-white/30 font-bold tracking-widest">₱0</div>
            <div className="absolute bottom-[-10px] right-3 text-[10px] text-white/30 font-bold tracking-widest">
              ₱{Math.round(allowedSpend/1000)}k
            </div>
          </div>
        </motion.div>

        {/* Hero Typography Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center text-center mt-12 relative z-20">
          <span className="text-white/40 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
            Spent {config.period === 'monthly' ? 'this month' : 'this week'}
          </span>
          <div className="flex items-start justify-center">
            <span className="text-3xl text-white/40 font-light mt-2 mr-1">₱</span>
            <span className="text-[5.5rem] leading-none font-light tracking-tighter text-white drop-shadow-2xl">
              {totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </span>
          </div>
          <span className="text-white/30 font-medium tracking-widest text-xs mt-3">
            ≈ R{(totalSpent * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
          </span>
          
          {/* Subtle Status Pill */}
          {totalSpent > 0 && (
            <div 
              className="mt-6 px-5 py-2 rounded-full border backdrop-blur-md shadow-xl transition-all duration-500 w-fit mx-auto"
              style={{ backgroundColor: `${ringColor}15`, borderColor: `${ringColor}30` }}
            >
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold" style={{ color: ringColor, textShadow: `0 0 16px ${ringColor}60` }}>
                {percentage.toFixed(0)}% OF ALLOWED
              </span>
            </div>
          )}
        </motion.div>

        {/* Solid Premium Action Button Area */}
        <motion.div variants={itemVariants} className="w-[85%] mx-auto mt-12 relative z-20">
          {(isNearingCap || isLocked) && (
            <div 
              className={`w-full rounded-[24px] p-5 mb-6 flex items-start gap-4 border shadow-xl transition-colors duration-500 ${
                isLocked 
                  ? 'bg-[#1a0a0a] border-[#FF453A]/30' 
                  : 'bg-[#1a150a] border-[#FF9F0A]/30'
              }`}
            >
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 transition-colors duration-500 ${isLocked ? 'text-[#FF453A]' : 'text-[#FF9F0A]'}`} />
              <div className="flex flex-col">
                <span className={`font-semibold tracking-wide mb-1 transition-colors duration-500 ${isLocked ? 'text-[#FF453A]' : 'text-[#FF9F0A]'}`}>
                  {isLocked ? 'Limit Reached' : 'Approaching Limit'}
                </span>
                <span className="text-white/60 text-sm leading-relaxed">
                  {isLocked 
                    ? `You have maxed out your allowed extra spend for the ${config.period}.` 
                    : `You only have ₱${remainingAllowed.toLocaleString()} left in your allowed extra spend.`
                  }
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={handleMainAction}
            className={`w-full h-14 rounded-full flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)]
              ${isLocked 
                ? 'bg-[#1a0a0a] text-[#FF453A] border border-[#FF453A]/30 cursor-not-allowed opacity-80' 
                : 'bg-white text-black active:scale-[0.97] hover:bg-white/90'
              }
            `}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            )}
            <span className="font-bold tracking-widest text-xs uppercase">
              {isLocked ? 'Jar Locked' : 'Quick Log Spend'}
            </span>
          </button>
        </motion.div>

        {/* Premium Solid Recent Entries Feed */}
        <motion.div variants={itemVariants} className="w-[85%] mx-auto mt-12 flex flex-col gap-3 relative z-20">
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase">Recent Drops ({entries.length})</h2>
            <button 
                onClick={() => clearEntries()} 
                className="text-white/20 text-[9px] uppercase font-bold tracking-[0.15em] hover:text-white/60 transition-colors"
            >
                Reset
            </button>
          </div>
          
          {logsWithColor.map((entry) => (
            <div key={entry.id} className="w-full bg-[#111111] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.04] rounded-[24px] p-5 flex items-center justify-between group transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-colors ${entry.bgClass}`}>
                  <PiggyBank className={`w-5 h-5 ${entry.colorClass}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-white/90 font-medium tracking-wide mb-1 text-sm">{entry.note || "Quick Log"}</span>
                  <span className="text-white/40 text-[10px] tracking-[0.1em] font-mono">
                    {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-semibold tracking-wider ${entry.colorClass}`}>₱{entry.amount.toLocaleString()}</span>
                <span className="text-white/30 text-[10px] uppercase tracking-wider font-mono mt-0.5">R{(entry.amount * exchangeRate).toFixed(0)}</span>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <div className="text-center py-16 opacity-30 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border border-dashed border-white/20 mb-4 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-white/50" />
              </div>
              <span className="text-xs font-medium tracking-widest uppercase">No expenses logged yet</span>
            </div>
          )}
        </motion.div>

      </div>

      <QuickLogModal 
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onConfirm={handleLogSpend}
      />

      <JarLockedModal
        isOpen={isLockedModalOpen}
        onClose={() => setIsLockedModalOpen(false)}
        totalSpent={totalSpent}
        targetAmount={config.targetAmount}
        period={config.period}
      />

      <JarSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <LogAnimationOverlay 
        type={animationType}
        onComplete={() => setAnimationType(null)}
      />
    </motion.div>
  );
}
