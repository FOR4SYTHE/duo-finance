"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Calendar, MoreHorizontal } from "lucide-react";

interface PhotoData {
  url: string;
  photographerName: string;
  photographerUrl: string;
  color: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthPickerProps {
  onClose: () => void;
  onSelectMonth: (monthKey: string) => void;
}

function MonthCard({
  monthKey,
  monthName,
  isCurrentMonth,
  label,
  onSelect,
  delay
}: {
  monthKey: string;
  monthName: string;
  isCurrentMonth: boolean;
  label: string;
  onSelect: () => void;
  delay: number;
}) {
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFetched) {
          setHasFetched(true);
          fetch(`/api/monthly-photo?month=${monthKey}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data && data.url) setPhotoData(data);
            })
            .catch(() => {});
        }
      },
      { rootMargin: "300px" } // Fetch slightly before it enters the viewport
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [monthKey, hasFetched]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      onClick={onSelect}
      className="relative w-full aspect-[16/10] min-h-[220px] rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* Photo */}
      {photoData ? (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out"
          style={{
            backgroundImage: `url(${photoData.url})`,
            backgroundColor: photoData.color || "#1a1a1a",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0a]" />
      )}

      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full h-full p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start w-full">
          <span className="bg-white/5 backdrop-blur-xl text-white/90 text-[11px] font-medium px-3.5 py-1.5 rounded-full border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
            {label}
          </span>
          <div className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">
            <MoreHorizontal className="w-4 h-4 text-white/90" />
          </div>
        </div>

        <div className="flex flex-col items-center w-full mt-auto relative -mb-5">
          <h3 
            className="font-black tracking-[-0.04em] w-full text-center leading-[0.75] select-none translate-y-0 capitalize"
            style={{
              fontSize: "clamp(60px, 18vw, 100px)",
              background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0px 8px 24px rgba(0,0,0,0.5)", // Smooth text shadow, no glitchy stroke
            }}
          >
            {monthName}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}

export function MonthPicker({ onClose, onSelectMonth }: MonthPickerProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Only show months up to current month for current year
  const now = new Date();
  const monthsToShow =
    selectedYear === currentYear
      ? MONTH_NAMES.slice(0, now.getMonth() + 1).reverse()
      : [...MONTH_NAMES].reverse();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl"
      >
        <div className="w-full max-w-xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-14 pb-4">
            <button
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="flex items-center gap-2 group"
            >
              <span className="text-2xl font-light text-white tracking-tight">
                {selectedYear}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-white/50 transition-transform ${
                  showYearPicker ? "rotate-180" : ""
                }`}
              />
            </button>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white/40" />
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Year Picker Dropdown */}
          <AnimatePresence>
            {showYearPicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-6"
              >
                <div className="flex gap-3 pb-4">
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <button
                      key={y}
                      onClick={() => {
                        setSelectedYear(y);
                        setShowYearPicker(false);
                      }}
                      className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                        y === selectedYear
                          ? "bg-white text-black"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable Month Cards */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-8">
            <div className="flex flex-col gap-5">
              {monthsToShow.map((monthName, i) => {
                const realMonthIdx = MONTH_NAMES.indexOf(monthName);
                const monthKey = `${selectedYear}-${String(realMonthIdx + 1).padStart(2, "0")}`;
                const isCurrentMonth = realMonthIdx === now.getMonth() && selectedYear === currentYear;
                const label = isCurrentMonth ? "Current month" : `${monthName} ${selectedYear}`;

                return (
                  <MonthCard
                    key={monthKey}
                    monthKey={monthKey}
                    monthName={monthName}
                    isCurrentMonth={isCurrentMonth}
                    label={label}
                    onSelect={() => onSelectMonth(monthKey)}
                    delay={i * 0.06}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
