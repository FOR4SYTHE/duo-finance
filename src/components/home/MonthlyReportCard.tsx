"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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
        className="relative w-full aspect-[16/10] min-h-[220px] rounded-[24px] overflow-hidden cursor-pointer mb-6 active:scale-[0.985] transition-transform duration-200"
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
            {/* Budget Status Pill - Apple Ultra Luxury Dark Glass */}
            <div className="bg-black/40 backdrop-blur-2xl rounded-[20px] px-4 py-3 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col gap-1 min-w-[145px]">
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: spendRatio > 0.9 ? '#FF453A' : spendRatio > 0.7 ? '#FF9F0A' : '#34D399',
                    boxShadow: spendRatio > 0.9 ? '0 0 8px #FF453A' : spendRatio > 0.7 ? '0 0 8px #FF9F0A' : '0 0 8px #34D399',
                  }}
                />
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/90 drop-shadow-sm">
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-semibold text-white tracking-tight drop-shadow-sm">
                  ₱{formatCurrency(Math.max(remaining, 0))}
                </span>
                <span className="text-[11px] text-white/60 font-medium">left</span>
              </div>
              <span className="text-xs text-white/40 font-medium">
                ≈ R{formatCurrency(Math.max(remainingZAR, 0))}
              </span>
              {/* Ultra sleek progress bar */}
              <div className="w-full h-1 bg-white/10 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{
                    width: `${100 - progressPct}%`,
                    background: spendRatio > 0.9 
                      ? 'linear-gradient(90deg, #FF453A, #FF7B72)' 
                      : spendRatio > 0.7 
                      ? 'linear-gradient(90deg, #FF9F0A, #FFC043)' 
                      : 'linear-gradient(90deg, #10B981, #6EE7B7)',
                    boxShadow: spendRatio > 0.9 
                      ? '0 0 8px rgba(255,69,58,0.5)' 
                      : spendRatio > 0.7 
                      ? '0 0 8px rgba(255,159,10,0.5)' 
                      : '0 0 8px rgba(52,211,153,0.5)',
                  }}
                />
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
                fontSize: "clamp(60px, 18vw, 100px)",
                background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0px 8px 24px rgba(0,0,0,0.5)", // Smooth text shadow, no glitchy stroke
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

      {/* Month Picker Overlay — portaled to body to escape transform context */}
      {showMonthPicker && typeof document !== 'undefined' && createPortal(
        <MonthPicker
          onClose={() => setShowMonthPicker(false)}
          onSelectMonth={handleMonthSelect}
        />,
        document.body
      )}

      {/* Monthly Summary Overlay — portaled to body to escape transform context */}
      {showSummary && typeof document !== 'undefined' && createPortal(
        <MonthlySummary
          monthKey={summaryMonth}
          onClose={() => setShowSummary(false)}
        />,
        document.body
      )}
    </>
  );
}
