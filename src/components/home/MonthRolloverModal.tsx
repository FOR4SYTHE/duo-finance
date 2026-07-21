"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BarChart3 } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { formatCurrency } from "@/lib/format";
import { MonthlySummary } from "./MonthlySummary";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthRolloverModalProps {
  lastSeenMonthKey: string; // e.g., "2026-07"
  currentMonthKey: string;  // e.g., "2026-08"
  onClose: () => void;
}

export function MonthRolloverModal({ lastSeenMonthKey, currentMonthKey, onClose }: MonthRolloverModalProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const { config } = useBudgetStore();
  const { entries } = useSpendStore();

  const [lastYear, lastMonth] = lastSeenMonthKey.split("-").map(Number);
  const lastMonthName = MONTH_NAMES[lastMonth - 1] || "Last Month";
  
  const [, currentMonth] = currentMonthKey.split("-").map(Number);
  const currentMonthName = MONTH_NAMES[currentMonth - 1] || "This Month";

  // Calculate stats for the last month
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.timestamp);
    return d.getMonth() === lastMonth - 1 && d.getFullYear() === lastYear;
  });

  const totalSpent = monthEntries.reduce((s, e) => s + e.amount, 0);
  const totalBudget = config.targetAmount;
  const remaining = totalBudget - totalSpent;
  const hasData = monthEntries.length > 0 || totalBudget > 0;

  const isOver = remaining < 0;

  useEffect(() => {
    // Fetch the photo for the last month to make it look premium
    fetch(`/api/monthly-photo?month=${lastSeenMonthKey}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.url) setPhotoUrl(data.url);
      })
      .catch(() => {});
  }, [lastSeenMonthKey]);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black flex flex-col overflow-hidden"
        >
          {/* Background Photo */}
          {photoUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000"
              style={{ backgroundImage: `url(${photoUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a]" />
          )}

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full px-8 pb-16 max-w-xl mx-auto w-full">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
              className="mb-10"
            >
              <div className="w-16 h-16 rounded-[20px] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center mb-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]">
                <CalendarIcon className="w-8 h-8 text-white" />
              </div>
              
              <h1 
                className="font-black tracking-tight text-white mb-4 leading-none"
                style={{ fontSize: "clamp(48px, 12vw, 72px)" }}
              >
                {lastMonthName}<br />is a wrap.
              </h1>
              
              <p className="text-white/60 text-lg font-medium leading-relaxed max-w-xs mb-8">
                You logged {monthEntries.length} entries in {lastMonthName}.
                {hasData ? (
                   isOver 
                    ? ` You went over budget by ₱${formatCurrency(Math.abs(remaining))}.`
                    : ` You stayed under budget by ₱${formatCurrency(remaining)}.`
                ) : (
                  " You didn't spend anything from your budget."
                )}
              </p>

              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={() => setShowSummary(true)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[20px] hover:bg-white/15 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-white/80" />
                    <span className="text-white font-medium">View Full Report</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40" />
                </button>

                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center px-6 py-4 bg-white text-black rounded-[20px] font-semibold text-[15px] hover:bg-white/90 transition-all active:scale-[0.98] shadow-[0_8px_32px_rgba(255,255,255,0.2)]"
                >
                  Start {currentMonthName}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Show the Monthly Summary if requested */}
      <AnimatePresence>
        {showSummary && (
          <MonthlySummary 
            monthKey={lastSeenMonthKey} 
            onClose={onClose} 
          />
        )}
      </AnimatePresence>
    </>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}
