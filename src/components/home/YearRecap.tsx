"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy, Sparkles, Star, Crown, Activity } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { formatCurrency } from "@/lib/format";
import confetti from "canvas-confetti";

interface YearRecapProps {
  year: number;
  onClose: () => void;
}

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    y: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  })
};

// Slide 1: Cover
function SlideCover({ year }: { year: number }) {
  return (
    <div className="w-full h-full relative flex flex-col justify-center p-8 bg-[#0a0a0a]">
      {/* Abstract Gold Background */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/30 via-black to-black" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center"
      >
        <Sparkles className="w-12 h-12 text-[#D4AF37] mx-auto mb-8 animate-pulse" />
        <h1 
          className="font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#FFF4D0] to-[#D4AF37] leading-[0.9]"
          style={{ fontSize: "clamp(64px, 18vw, 120px)" }}
        >
          {year} <br />
          <span className="text-white/60">Wrapped.</span>
        </h1>
        <p className="text-[#D4AF37]/60 mt-6 font-medium tracking-[0.2em] uppercase text-sm">
          A year of duo finance
        </p>
      </motion.div>
    </div>
  );
}

// Slide 2: The Grand Total
function SlideTotals({ totalEntries, totalSpent, config }: any) {
  return (
    <div className="w-full h-full bg-[#1a1a1a] flex flex-col px-6 pt-16 pb-12 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 opacity-5">
        <Star className="w-96 h-96 text-[#D4AF37]" />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-black/40 border border-[#D4AF37]/20 rounded-[32px] p-8 backdrop-blur-xl shadow-[0_0_40px_rgba(212,175,55,0.05)]"
        >
          <span className="text-[#D4AF37] text-[11px] font-bold tracking-[0.2em] uppercase mb-4 block">
            The Grand Total
          </span>
          <h2 className="text-3xl font-light text-white leading-tight mb-8">
            You were incredibly consistent this year.
          </h2>
          <div className="flex items-center gap-4 border-t border-[#D4AF37]/10 pt-6">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
              <Trophy className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white tracking-tight">{totalEntries}</div>
              <div className="text-[#D4AF37]/60 text-xs font-bold uppercase tracking-widest mt-1">Total Entries Logged</div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-[32px] p-8 bg-gradient-to-br from-[#D4AF37] to-[#AA8529] shadow-lg text-black"
        >
          <span className="opacity-80 text-[11px] font-black tracking-[0.2em] uppercase mb-2 block">
            Total Spend
          </span>
          <h2 className="text-4xl font-bold tracking-tighter mb-4">
            ₱{formatCurrency(totalSpent)}
          </h2>
          <p className="text-sm font-medium opacity-80 leading-snug">
            That's a whole year of managing your household budget together.
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}

// Slide 3: Biggest Hit
function SlideHit({ topCategory, topAmount }: any) {
  return (
    <div className="w-full h-full bg-black flex flex-col justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#1a1a1a] via-black to-black" />
      
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        className="relative z-10"
      >
        <div className="w-16 h-16 rounded-[20px] bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 mb-8">
          <Crown className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <span className="text-[#D4AF37] text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
          The Heavyweight Champion
        </span>
        <h2 className="text-4xl font-light text-white tracking-tight leading-tight mb-8">
          Your biggest <br/> expense of the year was <br/>
          <span className="font-bold text-[#D4AF37]">{topCategory}</span>.
        </h2>
        
        <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-md rounded-full pl-2 pr-6 py-2 border border-white/10">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-black text-lg font-bold">
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

// Slide 4: Busiest Month
function SlideBusiest({ busiestMonthName, busiestMonthEntries }: any) {
  return (
    <div className="w-full h-full bg-[#111] flex flex-col justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
        <Activity className="w-full h-full text-white" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center"
      >
        <span className="text-white/40 text-sm font-bold tracking-[0.2em] uppercase mb-6 block">
          Consistency is Key
        </span>
        <h2 className="text-5xl font-bold text-white tracking-tighter mb-4">
          {busiestMonthName}
        </h2>
        <p className="text-xl font-light text-white/70 mb-10">
          was your busiest month.
        </p>
        
        <div className="w-32 h-32 mx-auto rounded-full bg-black/50 border border-white/10 flex flex-col items-center justify-center shadow-[inset_0_4px_20px_rgba(255,255,255,0.05)]">
          <span className="text-4xl font-black text-[#D4AF37]">{busiestMonthEntries}</span>
          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Entries</span>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 5: Outro
function SlideOutro({ onClose, nextYear }: any) {
  const handleClose = () => {
    // Fire confetti just before closing
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFF4D0', '#FFFFFF', '#000000']
    });
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center px-8 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-sm relative z-10"
      >
        <div className="w-24 h-24 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37] to-[#AA8529] rounded-full mx-auto mb-10 shadow-[0_0_60px_rgba(212,175,55,0.4)] flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-black" />
        </div>
        <h2 className="text-4xl font-medium text-white tracking-tight mb-6">
          Cheers to a <br/> richer {nextYear}.
        </h2>
        <p className="text-[#D4AF37]/60 text-sm font-medium mb-12">
          Your full yearly recap is saved in your Notification Center. Let's conquer {nextYear}.
        </p>
        
        <button
          onClick={handleClose}
          className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-[#D4AF37] to-[#AA8529] text-black rounded-[24px] font-bold text-[17px] hover:brightness-110 transition-all active:scale-[0.98] shadow-[0_8px_32px_rgba(212,175,55,0.2)]"
        >
          Start Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

export function YearRecap({ year, onClose }: YearRecapProps) {
  const { config } = useBudgetStore();
  const { entries } = useSpendStore();

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    const next = page + newDirection;
    if (next >= 0 && next < 5) {
      setPage([next, newDirection]);
    }
  };

  // 1. Calculate stats for the year
  const yearEntries = entries.filter((e) => {
    return new Date(e.timestamp).getFullYear() === year;
  });

  const totalSpent = yearEntries.reduce((s, e) => s + e.amount, 0);

  // 2. Top Category
  const categorySpending: Record<string, number> = {};
  yearEntries.forEach(e => {
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

  // 3. Busiest Month
  const monthCounts: Record<number, number> = {};
  yearEntries.forEach(e => {
    const m = new Date(e.timestamp).getMonth();
    monthCounts[m] = (monthCounts[m] || 0) + 1;
  });
  let busiestMonthIdx = 0;
  let busiestMonthEntries = 0;
  Object.entries(monthCounts).forEach(([mStr, count]) => {
    const m = parseInt(mStr);
    if (count > busiestMonthEntries) {
      busiestMonthEntries = count;
      busiestMonthIdx = m;
    }
  });
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const busiestMonthName = monthNames[busiestMonthIdx] || "January";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black overflow-hidden flex flex-col"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ y: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.y) * velocity.y;
              if (swipe < -10000 || offset.y < -50) {
                paginate(1);
              } else if (swipe > 10000 || offset.y > 50) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing pointer-events-auto"
          >
            {page === 0 && <SlideCover year={year} />}
            {page === 1 && <SlideTotals totalEntries={yearEntries.length} totalSpent={totalSpent} config={config} />}
            {page === 2 && <SlideHit topCategory={topCategory} topAmount={topAmount} />}
            {page === 3 && <SlideBusiest busiestMonthName={busiestMonthName} busiestMonthEntries={busiestMonthEntries} />}
            {page === 4 && <SlideOutro onClose={onClose} nextYear={year + 1} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Indicators */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[130] pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div 
            key={i}
            animate={{ 
              height: page === i ? 24 : 6,
              opacity: page === i ? 1 : 0.2
            }}
            className="w-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]"
          />
        ))}
      </div>
      
      {/* Desktop Helper */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 z-[130] md:flex hidden pointer-events-none opacity-30">
         <span className="text-[#D4AF37] text-xs tracking-widest uppercase">Click & drag up/down</span>
      </div>
    </motion.div>
  );
}
