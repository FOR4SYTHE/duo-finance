"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, Calendar } from "lucide-react";

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

export function MonthPicker({ onClose, onSelectMonth }: MonthPickerProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});

  // Fetch photos for all 12 months of the selected year
  const fetchPhotos = useCallback(async (year: number) => {
    const promises = MONTH_NAMES.map(async (_, idx) => {
      const monthKey = `${year}-${String(idx + 1).padStart(2, "0")}`;
      try {
        const res = await fetch(`/api/monthly-photo?month=${monthKey}`);
        if (!res.ok) return null;
        const data = await res.json();
        return { monthKey, data };
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const newPhotos: Record<string, PhotoData> = {};
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value && r.value.data.url) {
        newPhotos[r.value.monthKey] = r.value.data;
      }
    });
    setPhotos((prev) => ({ ...prev, ...newPhotos }));
  }, []);

  useEffect(() => {
    fetchPhotos(selectedYear);
  }, [selectedYear, fetchPhotos]);

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
                const photoData = photos[monthKey];

                return (
                  <motion.div
                    key={monthKey}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
                    onClick={() => onSelectMonth(monthKey)}
                    className="relative w-full rounded-[24px] overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                    style={{ aspectRatio: "16 / 10" }}
                  >
                    {/* Photo */}
                    {photoData ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
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
                      <div className="flex justify-between items-start">
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold px-3 py-1 rounded-full border border-white/10">
                          {realMonthIdx === now.getMonth() &&
                          selectedYear === currentYear
                            ? "Current month"
                            : `${monthName} ${selectedYear}`}
                        </span>
                      </div>

                      <h3 className="text-5xl sm:text-6xl font-extralight text-white tracking-[-0.04em] leading-[0.85] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                        {monthName}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
