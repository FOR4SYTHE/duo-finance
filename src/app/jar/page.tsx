"use client";

import { useState } from "react";
import { Plus, Settings2, PiggyBank, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/animations";
import { useEffect } from "react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { QuickLogModal } from "@/components/jar/QuickLogModal";
import { JarLockedModal } from "@/components/jar/JarLockedModal";
import { JarSettingsModal } from "@/components/jar/JarSettingsModal";
import { LogAnimationOverlay } from "@/components/jar/LogAnimationOverlay";

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

  // Calculate totals based on allowed percentage
  const totalSpent = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const allowedSpend = config.targetAmount * ((config.jarAllowedPercentage || 20) / 100);
  const remainingAllowed = allowedSpend - totalSpent;
  const percentage = Math.min((totalSpent / allowedSpend) * 100, 100);
  
  const isLocked = totalSpent >= allowedSpend;
  const isNearingCap = percentage >= 85 && !isLocked;

  // Visuals for ring
  let ringColor = "#30D158"; // Green
  let ringGlow = "rgba(48,209,88,0.6)";
  if (percentage >= 50 && percentage < 70) {
    ringColor = "#E8A33D"; // Amber
    ringGlow = "rgba(232,163,61,0.6)";
  } else if (percentage >= 70) {
    ringColor = "#FF453A"; // Red
    ringGlow = "rgba(255,69,58,0.6)";
  }

  // SVG parameters
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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

  return (
    <motion.div 
      key={isInitialLoad ? "animate" : "static"}
      variants={containerVariants}
      initial={isInitialLoad ? "hidden" : false}
      animate="visible"
      className="flex flex-col w-full h-full px-6 pt-12 pb-8 overflow-y-auto no-scrollbar"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-8 relative z-20 shrink-0">
        <div className="flex items-center gap-3">
            <h1 className="text-3xl text-white font-light tracking-tight">Spend Jar</h1>
            {/* Temporary Reset Button */}
            <button 
                onClick={() => clearEntries()} 
                className="px-2 py-1 bg-white/5 text-white/50 rounded-md text-[10px] uppercase font-bold tracking-wider hover:bg-white/10 hover:text-white transition-colors border border-white/10"
            >
                Reset Logs
            </button>
        </div>
        <button 
          onClick={() => setIsSettingsModalOpen(true)}
          className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors"
        >
          <Settings2 className="w-5 h-5 text-white/70" />
        </button>
      </motion.div>

      {/* Hero Jar Progress */}
      <motion.div variants={itemVariants} className="relative z-20 w-full flex flex-col items-center justify-center py-10 mb-4 shrink-0">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle 
              cx="50" cy="50" r={radius} 
              fill="transparent" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="8"
            />
            {/* Progress Fill */}
            <motion.circle 
              cx="50" cy="50" r={radius} 
              fill="transparent" 
              stroke={ringColor} 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset, stroke: ringColor }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 16px ${ringGlow})` }}
            />
          </svg>
          
          {/* Inner Content */}
          <div className="flex flex-col items-center justify-center text-center z-10">
            <span className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">
              Spent {config.period === 'monthly' ? 'this month' : 'this week'}
            </span>
            <span className="text-4xl font-light text-white tracking-tight mb-1">
              ₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </span>
            <span className="text-white/60 font-medium tracking-wide text-sm mb-4">
              ≈ R{(totalSpent * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </span>
            <div 
              className="px-2.5 py-0.5 rounded-full border transition-colors duration-500 w-fit mx-auto mt-1"
              style={{ backgroundColor: `${ringColor}33`, borderColor: `${ringColor}4D` }}
            >
              <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: ringColor }}>
                {percentage.toFixed(0)}% OF ALLOWED
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Smart Warning */}
      {(isNearingCap || isLocked) && (
        <motion.div variants={itemVariants}>
          <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full rounded-[24px] p-4 mb-8 flex items-start gap-3 border ${
            isLocked 
              ? 'bg-[#FF453A]/10 border-[#FF453A]/30' 
              : 'bg-[#E8A33D]/10 border-[#E8A33D]/30'
          }`}
        >
          <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${isLocked ? 'text-[#FF453A]' : 'text-[#E8A33D]'}`} />
          <div className="flex flex-col">
            <span className={`font-semibold mb-1 ${isLocked ? 'text-[#FF453A]' : 'text-[#E8A33D]'}`}>
              {isLocked ? 'Limit Reached' : 'Approaching Limit'}
            </span>
            <span className="text-white/70 text-sm leading-relaxed">
              {isLocked 
                ? `You have maxed out your allowed extra spend for the ${config.period}.` 
                : `You only have ₱${remainingAllowed.toLocaleString()} left in your allowed extra spend.`
              }
            </span>
          </div>
          </motion.div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.div variants={itemVariants} className="relative z-20 w-full mb-8 shrink-0">
        <button 
          onClick={handleMainAction}
          className={`w-full h-[68px] rounded-full font-semibold text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]
            ${isLocked 
                ? "bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/30 hover:bg-[#FF453A]/20" 
                : "bg-white text-black hover:bg-gray-100"
            }
          `}
        >
          {isLocked ? (
              <>
                  <Lock className="w-5 h-5" strokeWidth={2.5} />
                  <span>Jar Locked</span>
              </>
          ) : (
              <>
                  <Plus className="w-6 h-6" strokeWidth={2.5} />
                  <span>Quick Log Spend</span>
              </>
          )}
        </button>
      </motion.div>

      {/* Recent Entries Feed */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 relative z-20 flex-1">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Recent Drops ({entries.length})</h2>
          <div className="flex flex-col items-end">
            <span className="text-white/30 text-[10px] uppercase font-bold tracking-wider">Allowed: ₱{allowedSpend.toLocaleString()}</span>
            <span className="text-white/20 text-[9px] uppercase font-bold tracking-wider">({config.jarAllowedPercentage || 20}% of ₱{config.targetAmount.toLocaleString()})</span>
          </div>
        </div>
        
        {logsWithColor.map((entry) => (
          <div key={entry.id} className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${entry.bgClass}`}>
                <PiggyBank className={`w-5 h-5 ${entry.colorClass}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-medium mb-0.5">{entry.note || "Quick Log"}</span>
                <span className="text-white/50 text-xs tracking-wide">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-medium ${entry.colorClass}`}>₱{entry.amount.toLocaleString()}</span>
              <span className="text-white/40 text-[10px] uppercase tracking-wider">R{(entry.amount * exchangeRate).toFixed(0)}</span>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-10 opacity-40">
            <span className="text-sm">No expenses logged yet.</span>
          </div>
        )}
      </motion.div>

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
