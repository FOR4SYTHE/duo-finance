"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, TrendingDown, Minus, Receipt, ShoppingCart } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { formatCurrency } from "@/lib/format";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthRecapProps {
  lastSeenMonthKey: string;
  currentMonthKey: string;
  onClose: () => void;
}

// Slide 1: Cover
function SlideCover({ monthName, photoUrl }: { monthName: string, photoUrl: string | null }) {
  return (
    <div className="w-full h-full relative flex flex-col justify-end p-8 pb-20">
      {photoUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photoUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <span className="text-white/60 text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">
          Month in Review
        </span>
        <h1 
          className="font-black tracking-tighter text-white leading-[0.9]"
          style={{ fontSize: "clamp(64px, 18vw, 120px)" }}
        >
          {monthName} <br />
          <span className="text-white/40">Wrap.</span>
        </h1>
        
        <div className="mt-12 flex items-center gap-4 animate-bounce opacity-50">
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Swipe up</span>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 2: The Score
function SlideScore({ config, monthEntries, remaining, isOver }: any) {
  const scorePercent = config.targetAmount > 0 
    ? Math.max(0, 100 - (remaining < 0 ? (Math.abs(remaining)/config.targetAmount)*100 : 0))
    : 100;
    
  return (
    <div className="w-full h-full bg-[#E5E5EA] flex flex-col px-6 pt-16 pb-12">
      <div className="flex-1 flex flex-col justify-center gap-3 max-w-sm mx-auto w-full">
        
        {/* Top White Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col"
        >
          <span className="text-black/40 text-[11px] font-bold tracking-[0.2em] uppercase mb-4">
            Statistics
          </span>
          <h2 className="text-3xl font-medium tracking-tight text-black leading-tight mb-8">
            Hello 👋 <span className="font-semibold">{config.cardName || 'Sam & Jon'}</span>! <br />
            {isOver ? "You went over your budget limit." : "Your budget health is looking stellar."}
          </h2>
          
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-black/5 rounded-full flex items-center gap-2">
              <Trophy className="w-4 h-4 text-black/60" />
              <span className="text-xs font-bold text-black/80">{monthEntries.length} Entries</span>
            </div>
            <div className="px-4 py-2 bg-black/5 rounded-full flex items-center gap-2">
              {isOver ? <TrendingUp className="w-4 h-4 text-[#FF453A]" /> : <TrendingDown className="w-4 h-4 text-[#30D158]" />}
              <span className="text-xs font-bold text-black/80">{isOver ? 'Over' : 'Saved'}</span>
            </div>
          </div>
        </motion.div>

        {/* Middle Yellow Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className={`rounded-[32px] p-8 shadow-sm ${isOver ? 'bg-[#FF453A] text-white' : 'bg-[#FFD60A] text-black'}`}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 3 3 9-3 9 19-9Z"/></svg>
            </div>
            <div className="flex bg-black/10 rounded-full p-1">
              <div className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold">Spent</div>
            </div>
          </div>
          
          <span className="opacity-60 text-[11px] font-bold tracking-[0.2em] uppercase mb-1 block">
            {isOver ? 'Excess' : 'Remaining'}
          </span>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-medium tracking-tight leading-none max-w-[150px]">
              ₱{formatCurrency(Math.abs(remaining))} {isOver ? '💸' : '😇'}
            </h2>
            <span className="text-5xl font-light tracking-tighter">
              {scorePercent.toFixed(0)}%
            </span>
          </div>
        </motion.div>

        {/* Bottom Blue Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="bg-[#64D2FF] text-black rounded-full px-6 py-5 shadow-sm flex items-center justify-between"
        >
          <span className="font-semibold text-sm tracking-tight">
            Target was ₱{formatCurrency(config.targetAmount)}
          </span>
          <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}

// Slide 3: Biggest Hit
function SlideHit({ topCategory, topAmount }: any) {
  return (
    <div className="w-full h-full bg-[#1C1C1E] flex flex-col justify-center px-8 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-1/4 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
        <ShoppingCart className="w-[400px] h-[400px] text-white" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ margin: "-100px" }}
        className="relative z-10"
      >
        <span className="text-[#0A84FF] text-sm font-bold tracking-[0.2em] uppercase mb-6 block">
          The Breakdown
        </span>
        <h2 className="text-4xl font-light text-white tracking-tight leading-tight mb-8">
          Your biggest <br/> expense was <br/>
          <span className="font-semibold text-white">{topCategory}</span>.
        </h2>
        
        <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-full pl-2 pr-6 py-2 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-[#0A84FF] flex items-center justify-center text-white text-lg font-bold">
            ₱
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            {formatCurrency(topAmount)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 4: Outro
function SlideOutro({ onClose, currentMonthName }: any) {
  return (
    <div className="w-full h-full bg-[#0A0A0C] flex flex-col items-center justify-center px-8 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ margin: "-100px" }}
        className="text-center w-full max-w-sm"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-[#30D158] to-[#64D2FF] rounded-full mx-auto mb-8 shadow-[0_0_40px_rgba(48,209,88,0.3)]" />
        <h2 className="text-4xl font-semibold text-white tracking-tight mb-4">
          Ready for <br/> {currentMonthName}?
        </h2>
        <p className="text-white/50 text-sm font-medium mb-12">
          Your recap is saved in your Notification Center. Let's start fresh.
        </p>
        
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-white text-black rounded-[24px] font-bold text-[17px] hover:bg-white/90 transition-transform active:scale-[0.98] shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
        >
          Start Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

export function MonthRecap({ lastSeenMonthKey, currentMonthKey, onClose }: MonthRecapProps) {
  const { config } = useBudgetStore();
  const { entries } = useSpendStore();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  const [lastYear, lastMonth] = lastSeenMonthKey.split("-").map(Number);
  const lastMonthName = MONTH_NAMES[lastMonth - 1] || "Last Month";
  
  const [, currentMonth] = currentMonthKey.split("-").map(Number);
  const currentMonthName = MONTH_NAMES[currentMonth - 1] || "This Month";

  const monthEntries = entries.filter((e) => {
    const d = new Date(e.timestamp);
    return d.getMonth() === lastMonth - 1 && d.getFullYear() === lastYear;
  });

  const totalSpent = monthEntries.reduce((s, e) => s + e.amount, 0);
  const totalBudget = config.targetAmount;
  const remaining = totalBudget - totalSpent;
  const isOver = remaining < 0;

  // Calculate Top Category
  const categorySpending: Record<string, number> = {};
  monthEntries.forEach(e => {
    const cat = e.category || "Uncategorized";
    categorySpending[cat] = (categorySpending[cat] || 0) + e.amount;
  });
  let topCategory = "Nothing";
  let topAmount = 0;
  Object.entries(categorySpending).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  useEffect(() => {
    fetch(`/api/monthly-photo?month=${lastSeenMonthKey}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.url) setPhotoUrl(data.url);
      })
      .catch(() => {});
  }, [lastSeenMonthKey]);

  // Framer Motion transforms for the Worm
  // Mapping 0-1 scroll progress to a height and top position.
  const wormTop = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], ["0%", "33.33%", "66.66%", "100%"]);
  // We stretch the worm slightly while travelling between points.
  const wormHeight = useTransform(
    scrollYProgress, 
    [0, 0.16, 0.33, 0.5, 0.66, 0.83, 1], 
    ["16px", "40px", "16px", "40px", "16px", "40px", "16px"]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[120] bg-black"
    >
      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative"
      >
        <div className="sticky top-0 h-[100dvh] snap-start z-10">
          <SlideCover monthName={lastMonthName} photoUrl={photoUrl} />
        </div>
        
        <div className="sticky top-0 h-[100dvh] snap-start z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <SlideScore config={config} monthEntries={monthEntries} remaining={remaining} isOver={isOver} />
        </div>
        
        <div className="sticky top-0 h-[100dvh] snap-start z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <SlideHit topCategory={topCategory} topAmount={topAmount} />
        </div>
        
        <div className="sticky top-0 h-[100dvh] snap-start z-40 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
          <SlideOutro onClose={onClose} currentMonthName={currentMonthName} />
        </div>
      </div>

      {/* The Worm Progress Indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 h-40 w-1 flex flex-col justify-between items-center z-[130]">
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        
        {/* The Crawling Worm */}
        <motion.div 
          className="absolute w-1.5 bg-white rounded-full top-0 -ml-[0.75px]"
          style={{ 
            top: wormTop, 
            height: wormHeight,
            marginTop: useTransform(wormHeight, (h) => `-${parseInt(h)/2}px`),
            transform: "translateY(-50%)"
          }}
        />
      </div>
    </motion.div>
  );
}
