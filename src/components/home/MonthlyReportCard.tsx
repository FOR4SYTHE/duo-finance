"use client";

import { useEffect, useState, useCallback } from "react";
import { MoreHorizontal } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { MonthPicker } from "./MonthPicker";
import { MonthlySummary } from "./MonthlySummary";

interface PhotoData {
  url: string;
  photographerName: string;
  photographerUrl: string;
  color: string;
}

interface PhotoCache {
  [monthKey: string]: PhotoData;
}

export function MonthlyReportCard() {
  const [photo, setPhoto] = useState<PhotoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryMonth, setSummaryMonth] = useState<string>("");

  const { config, categories } = useBudgetStore();
  const { entries } = useSpendStore();
  const { exchangeRate } = useCurrencyStore();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthName = now.toLocaleString("en-US", { month: "long" });

  // Budget calculations
  const totalBudget = config.targetAmount;
  const totalAllocated = categories.reduce((s, c) => s + c.targetAmount, 0);
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.timestamp);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const totalSpent = monthEntries.reduce((s, e) => s + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const remainingZAR = remaining * exchangeRate;
  const spendRatio = totalBudget > 0 ? totalSpent / totalBudget : 0;
  const progressPct = Math.min(Math.max(spendRatio * 100, 0), 100);

  const statusColor =
    spendRatio > 0.9
      ? "#FF453A"
      : spendRatio > 0.7
      ? "#FF9F0A"
      : "#00D287"; // Premium fintech mint green
  const statusLabel =
    spendRatio > 0.9
      ? "Over Budget"
      : spendRatio > 0.7
      ? "Caution"
      : "On Track";

  const fetchPhoto = useCallback(async (monthKey: string) => {
    try {
      const res = await fetch(`/api/monthly-photo?month=${monthKey}`);
      if (!res.ok) throw new Error("Failed to fetch photo");
      const data = await res.json();
      if (data.url) {
        setPhoto(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhoto(currentMonthKey);
  }, [currentMonthKey, fetchPhoto]);

  const handleCardTap = () => {
    setSummaryMonth(currentMonthKey);
    setShowSummary(true);
  };

  const handleOverflowTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMonthPicker(true);
  };

  const handleMonthSelect = (monthKey: string) => {
    setSummaryMonth(monthKey);
    setShowMonthPicker(false);
    setShowSummary(true);
  };

  return (
    <>
      {/* Hero Card */}
      <div
        onClick={handleCardTap}
        className="relative w-full aspect-[4/3] min-h-[280px] rounded-[28px] overflow-hidden cursor-pointer mb-6 active:scale-[0.985] transition-transform duration-200"
      >
        {/* Photo Background */}
        {photo && !error ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out scale-[1.02]"
            style={{
              backgroundImage: `url(${photo.url})`,
              backgroundColor: photo.color || "#1a1a1a",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a]" />
        )}

        {/* Dark gradient scrim — neutral, bottom-heavy for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full h-full p-5 flex flex-col justify-between">
          {/* Top Row: Budget overlay + overflow */}
          <div className="flex justify-between items-start">
            {/* Budget Status Pill - Apple Premium Glass */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-[20px] px-4 py-3.5 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),_0_8px_20px_rgba(0,0,0,0.15)] flex flex-col gap-1.5 min-w-[140px]">
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: statusColor,
                    boxShadow: `0 0 10px ${statusColor}`,
                  }}
                />
                <span
                  className="text-[10px] font-bold tracking-[0.15em] uppercase"
                  style={{ color: statusColor }}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-white tracking-tight drop-shadow-sm">
                  ₱{formatCurrency(Math.max(remaining, 0))}
                </span>
                <span className="text-[11px] text-white/70 font-medium">left</span>
              </div>
              <span className="text-xs text-white/50 font-medium">
                ≈ R{formatCurrency(Math.max(remainingZAR, 0))}
              </span>
              {/* Premium progress bar */}
              <div className="w-full h-1.5 bg-black/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${100 - progressPct}%`,
                    backgroundColor: statusColor,
                    boxShadow: `0 0 10px ${statusColor}80`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Overflow button → Month Picker */}
            <button
              onClick={handleOverflowTap}
              className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-white/90" />
            </button>
          </div>

          {/* Bottom: Giant Liquid Glass month text */}
          <div className="flex flex-col items-center w-full mt-auto relative -mb-5">
            <h2 
              className="font-black tracking-[-0.04em] w-full text-center leading-[0.75] select-none translate-y-0 capitalize"
              style={{
                fontSize: "clamp(80px, 22vw, 130px)",
                background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "1px rgba(255, 255, 255, 0.4)",
                filter: "drop-shadow(0px 15px 25px rgba(0,0,0,0.6)) drop-shadow(0px 4px 10px rgba(0,0,0,0.3))",
              }}
            >
              {currentMonthName}
            </h2>

            {/* Entry count badge - Bottom Right */}
            <div className="absolute bottom-8 right-0 z-20">
              <span className="bg-black/20 backdrop-blur-xl text-white/90 text-[10px] font-medium px-3.5 py-1.5 rounded-full border border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                {monthEntries.length} entries logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Picker Overlay */}
      {showMonthPicker && (
        <MonthPicker
          onClose={() => setShowMonthPicker(false)}
          onSelectMonth={handleMonthSelect}
        />
      )}

      {/* Monthly Summary Overlay */}
      {showSummary && (
        <MonthlySummary
          monthKey={summaryMonth}
          onClose={() => setShowSummary(false)}
        />
      )}
    </>
  );
}
