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
          fill="rgba(255,255,255,0.3)"
          fontSize="12"
          fontFamily="Inter, sans-serif"
        >
          No data
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
              style={{ transition: "stroke-dasharray 0.6s ease" }}
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
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/70 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${isOver ? "text-[#FF453A]" : "text-white"}`}>
            ₱{formatCurrency(spent)}
          </span>
          <span className="text-[10px] text-white/30">/ ₱{formatCurrency(budget)}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: isOver ? "#FF453A" : color,
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
    <div className="flex flex-col gap-1.5 p-3 bg-white/[0.03] rounded-xl border border-white/[0.04]">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/70 font-medium">{name}</span>
        <span className="text-[10px] text-white/40">{pct.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#30D158] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px] text-white/30">₱{formatCurrency(saved)} saved</span>
        <span className="text-[10px] text-white/30">₱{formatCurrency(target)} target</span>
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
    spendRatio > 0.9 ? "#FF453A" : spendRatio > 0.7 ? "#FF9F0A" : "#30D158";
  const StatusIcon =
    spendRatio > 0.9 ? TrendingUp : spendRatio > 0.7 ? Minus : TrendingDown;
  const statusLabel =
    spendRatio > 0.9
      ? "Over Budget"
      : spendRatio > 0.7
      ? "Spending High"
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
      className="fixed inset-0 z-[110] bg-[#050505] overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-xl mx-auto min-h-full pb-12">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-xl px-6 pt-14 pb-4 flex items-center justify-between border-b border-white/[0.04]">
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">
              {monthName}
            </h1>
            <span className="text-xs text-white/40 font-medium">{year} Report</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
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
              className="flex items-center gap-3 p-4 rounded-2xl border"
              style={{
                backgroundColor: `${statusColor}10`,
                borderColor: `${statusColor}20`,
              }}
            >
              <StatusIcon
                className="w-5 h-5"
                style={{ color: statusColor }}
              />
              <div className="flex-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: statusColor }}
                >
                  {statusLabel}
                </span>
                <p className="text-xs text-white/50 mt-0.5">
                  {remaining >= 0
                    ? `₱${formatCurrency(remaining)} remaining (≈ R${formatCurrency(remaining * exchangeRate)})`
                    : `₱${formatCurrency(Math.abs(remaining))} over budget (≈ R${formatCurrency(Math.abs(remaining) * exchangeRate)})`}
                </p>
              </div>
            </div>

            {/* Spending Breakdown — Donut */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5">
              <h3 className="text-xs font-semibold text-white/50 tracking-widest uppercase mb-5">
                Spending Breakdown
              </h3>
              <div className="flex items-center justify-center mb-5">
                <DonutChart segments={allSegments} />
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2">
                {allSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-[11px] text-white/60 truncate">
                      {seg.label}
                    </span>
                    <span className="text-[11px] text-white/30 ml-auto">
                      ₱{formatCurrency(seg.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget vs Actual — Bar Charts */}
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5">
              <h3 className="text-xs font-semibold text-white/50 tracking-widest uppercase mb-5">
                Budget vs Actual
              </h3>
              <div className="flex flex-col gap-4">
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
            <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-[#30D158]/10 flex items-center justify-center">
                  <PiggyBank className="w-4 h-4 text-[#30D158]" />
                </div>
                <h3 className="text-xs font-semibold text-white/50 tracking-widest uppercase">
                  Spend Jar
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    ₱{formatCurrency(totalSpent)}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    ≈ R{formatCurrency(totalSpent * exchangeRate)}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">Total logged</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white tracking-tight">
                    {monthEntries.length}
                  </p>
                  <p className="text-[11px] text-white/40 mt-1">Entries</p>
                </div>
              </div>
            </div>

            {/* Goals Progress */}
            {goals.length > 0 && (
              <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[#BF5AF2]/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#BF5AF2]" />
                  </div>
                  <h3 className="text-xs font-semibold text-white/50 tracking-widest uppercase">
                    Savings Goals
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
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
