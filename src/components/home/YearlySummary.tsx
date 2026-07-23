"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
  PiggyBank,
  Target,
  Receipt,
  Sparkles,
} from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { ActivityRingsChart } from "./ActivityRingsChart";
import { Sparkline } from "./Sparkline";
import { AnimatedCounter } from "./AnimatedCounter";

interface YearlySummaryProps {
  year: number;
  onClose: () => void;
}



// --- Horizontal Bar Chart ---
function HorizontalBar({
  label,
  spent,
  budget,
  color,
}: {
  label: string;
  spent: number;
  budget: number;
  color: string;
}) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 120) : 0;
  const isOver = spent > budget;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/90 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold tracking-tight ${isOver ? "text-[#FF453A]" : "text-[#D4AF37]"}`}>
            ₱{formatCurrency(spent)}
          </span>
          <span className="text-xs text-white/30 font-medium">/ ₱{formatCurrency(budget)}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: isOver 
              ? 'linear-gradient(90deg, #FF453A, #FF7B72)' 
              : `linear-gradient(90deg, ${color}, ${color}DD)`,
            boxShadow: `0 0 8px ${isOver ? '#FF453A80' : color + '80'}`,
          }}
        />
      </div>
    </div>
  );
}

// --- Goals Progress Bar ---
function GoalBar({
  name,
  saved,
  target,
  color = "#D4AF37" // Premium Gold for Yearly
}: {
  name: string;
  saved: number;
  target: number;
  color?: string;
}) {
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
  
  const isGold = color === "#D4AF37";
  const trackFillColor = isGold ? "#3A2A0D" : "#2E154C";
  
  const pillGradient = isGold 
    ? 'radial-gradient(100% 100% at 30% 20%, #FFF4D0 0%, #E8B923 40%, #755100 100%)'
    : 'radial-gradient(100% 100% at 30% 20%, #E7C6FF 0%, #A242FF 45%, #4C00A8 100%)';
    
  const pillShadow = isGold
    ? 'inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(232,185,35,0.7)'
    : 'inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -4px 8px rgba(0,0,0,0.5), 0 0 20px rgba(162,66,255,0.7)';

  return (
    <div className="flex flex-col p-6 bg-[#09090B] rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
      
      {/* Top Header Layer */}
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <span 
            className="text-[11px] font-bold tracking-[0.2em] uppercase mb-1.5 block"
            style={{ color: isGold ? '#D4AF37' : '#C496FF' }}
          >
            {name}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-bold text-white tracking-tight tabular-nums leading-none">
              <AnimatedCounter value={saved} prefix="₱" />
            </span>
            <span className="text-sm font-medium text-white/30">
              / ₱{formatCurrency(target)}
            </span>
          </div>
        </div>
        <div className="text-right pb-1">
          <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
            <AnimatedCounter value={pct} />%
          </span>
        </div>
      </div>

      {/* The Premium Animated Track */}
      <div className="relative w-full h-10 p-1 bg-[#000000] rounded-full shadow-[inset_0_4px_16px_rgba(0,0,0,1)] border border-white/5 flex items-center">
        
        {/* The Solid Trailing Beam */}
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, type: "spring", bounce: 0, delay: 0.2 }}
          className="h-full rounded-full flex items-center justify-end"
          style={{
            backgroundColor: trackFillColor,
            minWidth: '32px', // At 0%, the track perfectly houses the 32px thumb
          }}
        >
          {/* The 3D Glossy Jelly Bean Pill */}
          <div 
            className="h-8 w-8 rounded-full relative z-10 flex-shrink-0"
            style={{
              background: pillGradient,
              boxShadow: pillShadow,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

export function YearlySummary({ year, onClose }: YearlySummaryProps) {
  const { config, categories, goals } = useBudgetStore();
  const { entries: spendEntries } = useSpendStore();
  const { exchangeRate } = useCurrencyStore();

  // Filter entries for this entire year
  const yearEntries = useMemo(
    () =>
      spendEntries.filter((e) => {
        return new Date(e.timestamp).getFullYear() === year;
      }),
    [spendEntries, year]
  );

  const totalSpent = yearEntries.reduce((s, e) => s + e.amount, 0);
  // Yearly budget is 12x the monthly config budget
  const totalBudget = config.targetAmount * 12;
  const remaining = totalBudget - totalSpent;
  const spendRatio = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const statusColor =
    spendRatio > 0.9 ? "#FF453A" : spendRatio > 0.7 ? "#FF9F0A" : "#D4AF37";
  const StatusIcon =
    spendRatio > 0.9 ? TrendingUp : spendRatio > 0.7 ? Minus : Sparkles;
  const statusLabel =
    spendRatio > 0.9
      ? "Over Budget"
      : spendRatio > 0.7
      ? "Caution"
      : "Excellent Year";

  // Category spending breakdown
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    yearEntries.forEach((e) => {
      const cat = e.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return map;
  }, [yearEntries]);

  // Activity Rings segments from budget categories
  const ringSegments = useMemo(() => {
    return categories.map((cat) => ({
      value: categorySpending[cat.name] || 0,
      target: cat.targetAmount * 12, // Yearly target is 12x
      color: cat.color,
      label: cat.name,
    }));
  }, [categories, categorySpending]);

  // Add uncategorized if present
  const uncategorizedAmount = categorySpending["Uncategorized"] || 0;
  const allSegments = useMemo(() => {
    const segs = [...ringSegments];
    if (uncategorizedAmount > 0) {
      segs.push({
        value: uncategorizedAmount,
        target: totalBudget, // Yearly total budget
        color: "#8E8E93",
        label: "Other",
      });
    }
    return segs.filter((s) => s.value > 0);
  }, [ringSegments, uncategorizedAmount, totalBudget]);

  const sparklineData = useMemo(() => {
    const monthlyTotals = Array(12).fill(0);
    yearEntries.forEach(e => {
       const m = new Date(e.timestamp).getMonth();
       monthlyTotals[m] += e.amount;
    });
    let running = 0;
    return monthlyTotals.map(d => {
       running += d;
       return running;
    });
  }, [yearEntries]);

  const hasData = yearEntries.length > 0 || totalBudget > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[130] bg-[#0A0A0A] overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-xl mx-auto min-h-full pb-12 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-black to-black opacity-60 pointer-events-none" />
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#0A0A0A]/80 backdrop-blur-2xl px-6 pt-14 pb-4 flex items-center justify-between border-b border-[#D4AF37]/10">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" /> {year}
            </h1>
            <span className="text-xs text-[#D4AF37]/60 font-bold uppercase tracking-widest">Yearly Report</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#D4AF37]/10 backdrop-blur-md flex items-center justify-center hover:bg-[#D4AF37]/20 transition-colors shadow-[inset_0_1px_1px_rgba(212,175,55,0.2)]"
          >
            <X className="w-5 h-5 text-[#D4AF37]" />
          </button>
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center px-6 pt-32 relative z-10">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-4">
              <Receipt className="w-7 h-7 text-[#D4AF37]/40" />
            </div>
            <p className="text-[#D4AF37]/60 text-center font-medium">
              Nothing logged yet for {year}
            </p>
          </div>
        ) : (
          <div className="px-6 pt-6 flex flex-col gap-6 relative z-10">
            {/* Status Banner */}
            <div
              className="flex items-center p-3 pl-4 rounded-full border border-[#D4AF37]/20 bg-gradient-to-br from-[#111] to-black backdrop-blur-2xl shadow-[0_8px_32px_rgba(212,175,55,0.1),_inset_0_1px_1px_rgba(212,175,55,0.1)] relative overflow-hidden"
            >
              <div 
                 className="absolute inset-0 opacity-[0.1]"
                 style={{ background: `radial-gradient(circle at 24px 50%, ${statusColor}, transparent 50%)` }}
              />
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                style={{ backgroundColor: `${statusColor}15` }}
              >
                <StatusIcon
                  className="w-5 h-5"
                  style={{ color: statusColor, filter: `drop-shadow(0 0 8px ${statusColor})` }}
                />
              </div>
              <div className="flex-1 ml-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold tracking-[0.1em] uppercase text-white/90 drop-shadow-sm">
                    {statusLabel}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-none" style={{ color: statusColor, backgroundColor: `${statusColor}20` }}>
                    {spendRatio > 0 ? `${(spendRatio * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-white/60 mt-0.5 tracking-tight truncate pr-2">
                  {remaining >= 0
                    ? `₱${formatCurrency(remaining)} remaining`
                    : `₱${formatCurrency(Math.abs(remaining))} over`}
                  <span className="opacity-50 ml-1">(≈ R${formatCurrency(Math.abs(remaining) * exchangeRate)})</span>
                </p>
              </div>
              {/* Right Chart */}
              <div className="pr-3 relative z-10">
                 <Sparkline data={sparklineData} color={statusColor} width={64} height={24} />
              </div>
            </div>

            {/* Spending Breakdown — Donut */}
            <div className="bg-[#111]/80 backdrop-blur-2xl rounded-[28px] border border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(212,175,55,0.05)] p-6">
              <h3 className="text-[11px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-6">
                Yearly Breakdown
              </h3>
              <div className="flex items-center justify-center mb-6">
                <ActivityRingsChart segments={allSegments} size={200} strokeWidth={14} gap={4} />
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                {allSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}80` }}
                    />
                    <span className="text-xs font-medium text-white/80 truncate">
                      {seg.label}
                    </span>
                    <span className="text-xs font-semibold text-white/40 ml-auto tracking-tight">
                      ₱{formatCurrency(seg.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget vs Actual — Bar Charts */}
            <div className="bg-[#111]/80 backdrop-blur-2xl rounded-[28px] border border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(212,175,55,0.05)] p-6">
              <h3 className="text-[11px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-6">
                Target vs Actual (12 Months)
              </h3>
              <div className="flex flex-col gap-5">
                {categories.map((cat) => (
                  <HorizontalBar
                    key={cat.id}
                    label={cat.name}
                    spent={categorySpending[cat.name] || 0}
                    budget={cat.targetAmount * 12}
                    color={cat.color}
                  />
                ))}
              </div>
            </div>

            {/* Spend Jar Activity */}
            <div className="bg-[#111]/80 backdrop-blur-2xl rounded-[28px] border border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(212,175,55,0.05)] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(212,175,55,0.1)]">
                  <PiggyBank className="w-6 h-6 text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 8px #D4AF37)' }} />
                </div>
                <h3 className="text-[11px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase">
                  Spend Jar
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-black/40 rounded-[20px] p-5 border border-[#D4AF37]/10">
                <div>
                  <p className="text-2xl font-bold text-[#D4AF37] tracking-tight drop-shadow-sm tabular-nums">
                    <AnimatedCounter value={totalSpent} prefix="₱" />
                  </p>
                  <p className="text-xs font-medium text-[#D4AF37]/60 mt-1 tabular-nums">
                    ≈ <AnimatedCounter value={totalSpent * exchangeRate} prefix="R" />
                  </p>
                  <p className="text-xs font-semibold text-[#D4AF37]/40 mt-2 uppercase tracking-wider">Total logged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tracking-tight drop-shadow-sm tabular-nums">
                    <AnimatedCounter value={yearEntries.length} />
                  </p>
                  <p className="text-xs font-semibold text-white/40 mt-2 uppercase tracking-wider">Entries in {year}</p>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            {goals.length > 0 && (
              <div className="bg-[#111]/80 backdrop-blur-2xl rounded-[28px] border border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(212,175,55,0.05)] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(212,175,55,0.1)]">
                    <Target className="w-6 h-6 text-[#D4AF37]" style={{ filter: 'drop-shadow(0 0 8px #D4AF37)' }} />
                  </div>
                  <h3 className="text-[11px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase">
                    Savings Goals Checkpoint
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {(() => {
                    const displayGoals = [...goals];
                    // Inject mock goal so the user can verify the animation!
                    displayGoals.push({
                      id: "mock-emergency-test",
                      name: "Test Emergency Fund (Mock)",
                      savedAmount: 37500,
                      targetAmount: 74997,
                      color: "#D4AF37",
                    } as any);

                    return displayGoals.map((g) => (
                      <GoalBar
                        key={g.id}
                        name={g.name}
                        saved={g.savedAmount}
                        target={g.targetAmount}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Summary Footer */}
            <div className="text-center py-4">
              <p className="text-[10px] text-[#D4AF37]/40 uppercase tracking-widest font-bold">
                Duo Finance • {year} Report
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
