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
      : "#30D158";
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
        className="relative w-full rounded-[28px] overflow-hidden cursor-pointer mb-6 active:scale-[0.985] transition-transform duration-200"
        style={{ aspectRatio: "4 / 3" }}
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
            {/* Budget Status Pill */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: statusColor,
                    boxShadow: `0 0 8px ${statusColor}`,
                  }}
                />
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: statusColor }}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-white tracking-tight">
                  ₱{formatCurrency(Math.max(remaining, 0))}
                </span>
                <span className="text-[10px] text-white/50 font-medium">left</span>
              </div>
              <span className="text-[11px] text-white/40 font-medium">
                ≈ R{formatCurrency(Math.max(remainingZAR, 0))}
              </span>
              {/* Mini progress bar */}
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${100 - progressPct}%`,
                    backgroundColor: statusColor,
                  }}
                />
              </div>
            </div>

            {/* Overflow button → Month Picker */}
            <button
              onClick={handleOverflowTap}
              className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Bottom: Giant month text + attribution */}
          <div className="flex flex-col">
            {/* Entry count badge */}
            <div className="mb-2">
              <span className="bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10">
                {monthEntries.length} entries logged
              </span>
            </div>

            <h2 className="text-7xl sm:text-8xl font-extralight text-white tracking-[-0.04em] leading-[0.85] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              {currentMonthName}
            </h2>

            {/* Attribution */}
            {photo && !error && (
              <div className="mt-3 text-[9px] text-white/40 leading-tight">
                Photo by{" "}
                <a
                  href={`${photo.photographerUrl}?utm_source=duo_finance&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/70 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {photo.photographerName}
                </a>{" "}
                /{" "}
                <a
                  href="https://unsplash.com/?utm_source=duo_finance&utm_medium=referral"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/70 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Unsplash
                </a>
              </div>
            )}
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
