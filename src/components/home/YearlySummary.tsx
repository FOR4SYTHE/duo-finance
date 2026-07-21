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

interface YearlySummaryProps {
  year: number;
  onClose: () => void;
}

// --- SVG Donut Chart Component ---
function DonutChart({
  segments,
  size = 180,
  strokeWidth = 28,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212,175,55,0.1)"
          strokeWidth={strokeWidth}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(212,175,55,0.4)"
          fontSize="12"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.05em"
        >
          NO DATA
        </text>
      </svg>
    );
  }

  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments
        .filter((s) => s.value > 0)
        .map((seg, i) => {
          const pct = seg.value / total;
          const dashLen = pct * circumference;
          const gapLen = circumference - dashLen;
          const rotation = (offset / total) * 360 - 90;
          offset += seg.value;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLen} ${gapLen}`}
              strokeLinecap="round"
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              style={{ 
                transition: "stroke-dasharray 0.6s ease",
                filter: `drop-shadow(0 0 6px ${seg.color}60)`
              }}
            />
          );
        })}
      <text
        x={size / 2}
        y={size / 2 - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#D4AF37"
        fontSize="20"
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        ₱{formatCurrency(total)}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(212,175,55,0.6)"
        fontSize="10"
        fontFamily="Inter, sans-serif"
        className="uppercase tracking-widest font-bold"
      >
        yearly spent
      </text>
    </svg>
  );
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
}: {
  name: string;
  saved: number;
  target: number;
}) {
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-2 p-4 bg-[#D4AF37]/5 backdrop-blur-md rounded-[20px] border border-[#D4AF37]/10 shadow-[inset_0_1px_1px_rgba(212,175,55,0.05)]">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#D4AF37] font-medium">{name}</span>
        <span className="text-xs font-semibold text-[#D4AF37]/60 tracking-tight">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1.5 bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #D4AF37, #FFF4D0)',
            boxShadow: '0 0 8px rgba(212,175,55,0.5)',
          }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-[#D4AF37]/40 font-medium">₱{formatCurrency(saved)} <span className="text-[#D4AF37]/20">saved</span></span>
        <span className="text-xs text-[#D4AF37]/40 font-medium">₱{formatCurrency(target)} <span className="text-[#D4AF37]/20">target</span></span>
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

  // Donut segments from budget categories
  const donutSegments = useMemo(() => {
    return categories.map((cat) => ({
      value: categorySpending[cat.name] || 0,
      color: cat.color,
      label: cat.name,
    }));
  }, [categories, categorySpending]);

  // Add uncategorized if present
  const uncategorizedAmount = categorySpending["Uncategorized"] || 0;
  const allSegments = useMemo(() => {
    const segs = [...donutSegments];
    if (uncategorizedAmount > 0) {
      segs.push({
        value: uncategorizedAmount,
        color: "#8E8E93",
        label: "Other",
      });
    }
    return segs.filter((s) => s.value > 0);
  }, [donutSegments, uncategorizedAmount]);

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
              className="flex items-center gap-4 p-5 rounded-[28px] border border-[#D4AF37]/20 bg-gradient-to-br from-[#111] to-black backdrop-blur-2xl shadow-[0_8px_32px_rgba(212,175,55,0.1),_inset_0_1px_1px_rgba(212,175,55,0.1)] relative overflow-hidden"
            >
              <div 
                 className="absolute inset-0 opacity-[0.1]"
                 style={{ background: `radial-gradient(circle at 0% 50%, ${statusColor}, transparent 60%)` }}
              />
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: `${statusColor}25`, border: `1px solid ${statusColor}40` }}
              >
                <StatusIcon
                  className="w-6 h-6"
                  style={{ color: statusColor, filter: `drop-shadow(0 0 8px ${statusColor})` }}
                />
              </div>
              <div className="flex-1 relative z-10">
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-white drop-shadow-sm">
                  {statusLabel}
                </span>
                <p className="text-sm font-medium text-white/60 mt-1 tracking-tight">
                  {remaining >= 0
                    ? `₱${formatCurrency(remaining)} remaining under budget (≈ R${formatCurrency(remaining * exchangeRate)})`
                    : `₱${formatCurrency(Math.abs(remaining))} over yearly budget (≈ R${formatCurrency(Math.abs(remaining) * exchangeRate)})`}
                </p>
              </div>
            </div>

            {/* Spending Breakdown — Donut */}
            <div className="bg-[#111]/80 backdrop-blur-2xl rounded-[28px] border border-[#D4AF37]/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(212,175,55,0.05)] p-6">
              <h3 className="text-[11px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase mb-6">
                Yearly Breakdown
              </h3>
              <div className="flex items-center justify-center mb-6">
                <DonutChart segments={allSegments} size={200} strokeWidth={32} />
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
                  <p className="text-2xl font-bold text-[#D4AF37] tracking-tight drop-shadow-sm">
                    ₱{formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs font-medium text-[#D4AF37]/60 mt-1">
                    ≈ R{formatCurrency(totalSpent * exchangeRate)}
                  </p>
                  <p className="text-xs font-semibold text-[#D4AF37]/40 mt-2 uppercase tracking-wider">Total logged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                    {yearEntries.length}
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
                  {goals.map((g) => (
                    <GoalBar
                      key={g.id}
                      name={g.name}
                      saved={g.savedAmount}
                      target={g.targetAmount}
                    />
                  ))}
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
