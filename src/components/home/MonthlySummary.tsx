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
} from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthlySummaryProps {
  monthKey: string; // "YYYY-MM"
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
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.2)"
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
      {/* Center text */}
      <text
        x={size / 2}
        y={size / 2 - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
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
        fill="rgba(255,255,255,0.4)"
        fontSize="10"
        fontFamily="Inter, sans-serif"
      >
        total spent
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
          <span className={`text-sm font-semibold tracking-tight ${isOver ? "text-[#FF453A]" : "text-white"}`}>
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
  icon,
}: {
  name: string;
  saved: number;
  target: number;
  icon?: string;
  color?: string;
}) {
  const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-2 p-4 bg-white/5 backdrop-blur-md rounded-[20px] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/90 font-medium">{name}</span>
        <span className="text-xs font-semibold text-white/60 tracking-tight">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1.5 bg-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] rounded-full overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #30D158, #34C759)',
            boxShadow: '0 0 8px rgba(48,209,88,0.5)',
          }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-white/40 font-medium">₱{formatCurrency(saved)} <span className="text-white/20">saved</span></span>
        <span className="text-xs text-white/40 font-medium">₱{formatCurrency(target)} <span className="text-white/20">target</span></span>
      </div>
    </div>
  );
}

export function MonthlySummary({ monthKey, onClose }: MonthlySummaryProps) {
  const { config, categories, goals } = useBudgetStore();
  const { entries: spendEntries } = useSpendStore();
  const { exchangeRate } = useCurrencyStore();

  const [year, monthNum] = monthKey.split("-").map(Number);
  const monthName = MONTH_NAMES[monthNum - 1] || "Unknown";

  // Filter entries for this month
  const monthEntries = useMemo(
    () =>
      spendEntries.filter((e) => {
        const d = new Date(e.timestamp);
        return d.getMonth() === monthNum - 1 && d.getFullYear() === year;
      }),
    [spendEntries, monthNum, year]
  );

  const totalSpent = monthEntries.reduce((s, e) => s + e.amount, 0);
  const totalBudget = config.targetAmount;
  const remaining = totalBudget - totalSpent;
  const spendRatio = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const statusColor =
    spendRatio > 0.9 ? "#FF453A" : spendRatio > 0.7 ? "#FF9F0A" : "#00D287";
  const StatusIcon =
    spendRatio > 0.9 ? TrendingUp : spendRatio > 0.7 ? Minus : TrendingDown;
  const statusLabel =
    spendRatio > 0.9
      ? "Over Budget"
      : spendRatio > 0.7
      ? "Caution"
      : "On Track";

  // Category spending breakdown
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    monthEntries.forEach((e) => {
      const cat = e.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + e.amount;
    });
    return map;
  }, [monthEntries]);

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

  const hasData = monthEntries.length > 0 || totalBudget > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[130] bg-[#050505] overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-xl mx-auto min-h-full pb-12 relative z-10">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-2xl px-6 pt-14 pb-4 flex items-center justify-between border-b border-white/5">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">
              {monthName}
            </h1>
            <span className="text-xs text-white/40 font-medium">{year} Report</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
          >
            <X className="w-5 h-5 text-white/90" />
          </button>
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center px-6 pt-32">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
              <Receipt className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-white/40 text-center font-medium">
              Nothing logged yet for {monthName}
            </p>
            <p className="text-white/20 text-xs text-center mt-1">
              Start tracking expenses to see your report here
            </p>
          </div>
        ) : (
          <div className="px-6 pt-6 flex flex-col gap-6">
            {/* Status Banner */}
            <div
              className="flex items-center gap-4 p-5 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden"
            >
              <div 
                 className="absolute inset-0 opacity-[0.15]"
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
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/90 drop-shadow-sm">
                  {statusLabel}
                </span>
                <p className="text-sm font-medium text-white/60 mt-1 tracking-tight">
                  {remaining >= 0
                    ? `₱${formatCurrency(remaining)} remaining (≈ R${formatCurrency(remaining * exchangeRate)})`
                    : `₱${formatCurrency(Math.abs(remaining))} over budget (≈ R${formatCurrency(Math.abs(remaining) * exchangeRate)})`}
                </p>
              </div>
            </div>

            {/* Spending Breakdown — Donut */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.05)] p-6">
              <h3 className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase mb-6">
                Spending Breakdown
              </h3>
              <div className="flex items-center justify-center mb-6">
                <DonutChart segments={allSegments} size={200} strokeWidth={32} />
              </div>
              {/* Legend */}
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
            <div className="bg-white/5 backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.05)] p-6">
              <h3 className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase mb-6">
                Budget vs Actual
              </h3>
              <div className="flex flex-col gap-5">
                {categories.map((cat) => (
                  <HorizontalBar
                    key={cat.id}
                    label={cat.name}
                    spent={categorySpending[cat.name] || 0}
                    budget={cat.targetAmount}
                    color={cat.color}
                  />
                ))}
              </div>
            </div>

            {/* Spend Jar Activity */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.05)] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#30D158]/15 border border-[#30D158]/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <PiggyBank className="w-6 h-6 text-[#30D158]" style={{ filter: 'drop-shadow(0 0 8px #30D158)' }} />
                </div>
                <h3 className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase">
                  Spend Jar
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-black/20 rounded-[20px] p-5 border border-white/5">
                <div>
                  <p className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                    ₱{formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs font-medium text-white/40 mt-1">
                    ≈ R{formatCurrency(totalSpent * exchangeRate)}
                  </p>
                  <p className="text-xs font-semibold text-white/30 mt-2 uppercase tracking-wider">Total logged</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                    {monthEntries.length}
                  </p>
                  <p className="text-xs font-semibold text-white/30 mt-2 uppercase tracking-wider">Entries</p>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            {goals.length > 0 && (
              <div className="bg-white/5 backdrop-blur-2xl rounded-[28px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.05)] p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#BF5AF2]/15 border border-[#BF5AF2]/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <Target className="w-6 h-6 text-[#BF5AF2]" style={{ filter: 'drop-shadow(0 0 8px #BF5AF2)' }} />
                  </div>
                  <h3 className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase">
                    Savings Goals
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {goals.map((g) => (
                    <GoalBar
                      key={g.id}
                      name={g.name}
                      saved={g.savedAmount}
                      target={g.targetAmount}
                      icon={g.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Summary Footer */}
            <div className="text-center py-4">
              <p className="text-[10px] text-white/20">
                Report for {monthName} {year} • Duo Finance
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
