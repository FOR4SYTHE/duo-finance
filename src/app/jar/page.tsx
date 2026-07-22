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
  const previousEntriesLength = useRef(entries.length);

  useEffect(() => {
    if (entries.length > previousEntriesLength.current) {
      setIsLogFlash(true);
      const timer = setTimeout(() => setIsLogFlash(false), 800);
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
  let ringColor = "#30D158"; // Green
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
      <motion.div variants={itemVariants} className="relative z-20 w-full flex flex-col items-center justify-center py-6 mb-4 shrink-0">
        <div className="relative w-64 h-64 flex flex-col items-center justify-center mb-6">
          {/* Subtle ambient background glow (reduced intensity) */}
          <motion.div 
            className="absolute inset-0 rounded-full blur-[20px] opacity-10 mix-blend-screen"
            animate={{
              scale: [1, 1.05, 1],
              opacity: percentage >= 85 ? [0.15, 0.3, 0.15] : percentage >= 50 ? [0.1, 0.2, 0.1] : [0.05, 0.1, 0.05]
            }}
            transition={{
              duration: percentage >= 85 ? 1 : percentage >= 50 ? 2 : 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ backgroundColor: ringColor }}
          />
          
          {/* Cartoon Progress Circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible z-20 pointer-events-none" viewBox="0 0 100 100">
            {/* Background Track (Darker, solid) */}
            <circle 
              cx="50" cy="50" r={46} 
              fill="transparent" 
              stroke="rgba(255,255,255,0.06)" 
              strokeWidth="3.5"
            />
            {/* Progress Fill (Solid cartoon color) */}
            <motion.circle 
              cx="50" cy="50" r={46} 
              fill="transparent" 
              stroke={ringColor} 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 46}
              initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
              animate={{ 
                 strokeDashoffset: (2 * Math.PI * 46) - (percentage / 100) * (2 * Math.PI * 46),
                 stroke: ringColor,
                 filter: isLogFlash ? 'brightness(1.5) drop-shadow(0 0 8px currentColor)' : 'brightness(1) drop-shadow(0 0 0px currentColor)' 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>

          {/* Mascot Image Crossfade */}
          <div className="relative z-10 w-56 h-56 rounded-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {percentage < 50 && (
                <motion.img
                  key="safe"
                  src="/mascot_safe.webp"
                  alt="Safe Mascot"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ opacity: { duration: 0.5 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              )}
              {percentage >= 50 && percentage < 85 && (
                <motion.img
                  key="warning"
                  src="/mascot_warning.webp"
                  alt="Warning Mascot"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ opacity: { duration: 0.5 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              )}
              {percentage >= 85 && (
                <motion.img
                  key="danger"
                  src="/mascot_danger.webp"
                  alt="Danger Mascot"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ opacity: { duration: 0.5 }, y: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } }}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              )}
            </AnimatePresence>
            
            {/* Extra Overlay Elements (Seamless FX) */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden rounded-full">
              <AnimatePresence>
                {percentage < 50 && (
                  <motion.div
                    key="safe-fx"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-around"
                  >
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-[#30D158] rounded-full blur-[1px]"
                        animate={{
                          y: [-10, -60],
                          opacity: [0, 0.8, 0],
                          scale: [0, 1.5, 0],
                        }}
                        transition={{
                          duration: 2.5 + i,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                )}
                
                {percentage >= 50 && percentage < 85 && (
                  <motion.div
                    key="warning-fx"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-2 border-[4px] border-[#E8A33D]/20 rounded-full"
                    style={{
                      animation: "pulse 2s infinite ease-in-out"
                    }}
                  />
                )}
                
                {percentage >= 85 && (
                  <motion.div
                    key="danger-fx"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex justify-center"
                  >
                    {/* Fiery Embers */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute bottom-4 w-2.5 h-2.5 bg-[#FF453A] rounded-full blur-[2px]"
                        style={{ left: `${30 + (i * 5)}%` }}
                        animate={{
                          y: [0, -120],
                          x: [0, (i % 2 === 0 ? 20 : -20), 0],
                          opacity: [0, 1, 0],
                          scale: [1, 0.3, 0]
                        }}
                        transition={{
                          duration: 1 + (i * 0.15),
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                    {/* Danger vignette inner shadow */}
                    <motion.div 
                      className="absolute inset-0 rounded-full shadow-[inset_0_0_50px_rgba(255,69,58,0.8)] mix-blend-screen"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Inner Content Text - Repositioned Below Mascot */}
        <div className="flex flex-col items-center justify-center text-center z-10 mt-2">
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
            className="px-3 py-1 rounded-full border transition-colors duration-500 w-fit mx-auto shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: `${ringColor}22`, borderColor: `${ringColor}4D` }}
          >
            <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: ringColor, textShadow: `0 0 12px ${ringGlow}` }}>
              {percentage.toFixed(0)}% OF ALLOWED
            </span>
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
      <motion.div variants={itemVariants} className="relative z-20 w-full mb-12 shrink-0 flex flex-col items-center justify-center mt-6">
        <button 
          onClick={handleMainAction}
          className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
            ${isLocked ? 'cursor-not-allowed opacity-70' : 'active:scale-[0.97]'}
          `}
        >
          {/* Base shadow/depth */}
          <div className="absolute inset-0 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.6)] bg-black" />
          
          {/* Bevel edge (Bottom rim) */}
          <div className={`absolute inset-0 rounded-full translate-y-2 ${isLocked ? 'bg-[#8B251F]' : 'bg-[#B0C1C7]'}`} />
          
          {/* Top Surface */}
          <div className={`absolute inset-0 rounded-full border-t border-white/50 shadow-[inset_0_4px_12px_rgba(255,255,255,0.8),inset_0_-8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300 flex items-center justify-center
            ${isLocked 
              ? 'bg-gradient-to-b from-[#FF5A50] to-[#E33D33] translate-y-2' 
              : 'bg-gradient-to-b from-[#FFFFFF] to-[#E2EBED] group-active:translate-y-2'
            }
          `}>
             {isLocked ? (
                  <Lock className="w-8 h-8 text-black/30" strokeWidth={3} />
              ) : (
                  <Plus className="w-10 h-10 text-black/60 drop-shadow-sm" strokeWidth={3} />
              )}
          </div>
        </button>
        <span className={`mt-8 text-xs tracking-[0.2em] uppercase font-bold ${isLocked ? 'text-[#FF453A]' : 'text-white/60'}`}>
          {isLocked ? 'Jar Locked' : 'Quick Log Spend'}
        </span>
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
