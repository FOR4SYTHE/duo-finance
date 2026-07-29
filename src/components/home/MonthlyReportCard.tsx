"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, ImagePlus, Trash2, ArrowUpDown, Check } from "lucide-react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { formatCurrency } from "@/lib/format";
import { MonthPicker } from "./MonthPicker";
import { MonthlySummary } from "./MonthlySummary";
import { processAndCompressImage } from "@/utils/imageUpload";
import { calculateAllocations } from "@/utils/budgetMath";
import { AnimatePresence, motion } from "framer-motion";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAdjusting, setIsAdjusting] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const dragStartPosY = useRef<number>(50);
  const [localPositionY, setLocalPositionY] = useState<number | null>(null);

  const { config, categories, setCustomPhoto, removeCustomPhoto, setCustomPhotoPosition } = useBudgetStore();
  const { entries } = useSpendStore();
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthName = now.toLocaleString("en-US", { month: "long" });

  const customPhotoUrl = config.customPhotos?.[currentMonthKey];
  const customPhotoPosition = config.customPhotoPositions?.[currentMonthKey] ?? { x: 50, y: 50 };
  const displayY = localPositionY !== null ? localPositionY : customPhotoPosition.y;

  // Budget calculations
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.timestamp);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const totalSpent = monthEntries.reduce((s, e) => s + e.amount, 0);
  
  const { displayTarget, displayAllocated, displayUnallocated } = calculateAllocations(config, categories, totalSpent);
  
  const effectiveSpent = displayAllocated + totalSpent;
  const remaining = displayUnallocated;
  
  const spendRatio = displayTarget > 0 ? effectiveSpent / displayTarget : 0;
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
    if (isAdjusting) return;
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await processAndCompressImage(file);
      setCustomPhoto(currentMonthKey, dataUrl);
      setIsAdjusting(true); // Automatically enter adjust mode on upload
    } catch (err) {
      console.error("Failed to process image", err);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isAdjusting) return;
    // Don't capture if the user is clicking the action buttons
    if ((e.target as HTMLElement).closest('.actions-container')) return;
    
    dragStartY.current = e.clientY;
    dragStartPosY.current = displayY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isAdjusting || dragStartY.current === null) return;
    const deltaY = e.clientY - dragStartY.current;
    const elementHeight = e.currentTarget.clientHeight || 200;
    
    // Fast local state update for buttery smooth 60fps dragging (no store writes)
    let newY = dragStartPosY.current + (deltaY / elementHeight) * -150;
    newY = Math.max(0, Math.min(100, newY));
    setLocalPositionY(newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isAdjusting) return;
    if (dragStartY.current !== null) {
      // Commit the final position to the store exactly once when drag ends
      if (localPositionY !== null) {
        setCustomPhotoPosition(currentMonthKey, { x: 50, y: localPositionY });
      }
      dragStartY.current = null;
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if pointer capture was already released or not set
    }
  };

  return (
    <>
      {/* Hero Card */}
      <div
        onClick={handleCardTap}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full aspect-[16/10] min-h-[220px] rounded-[24px] overflow-hidden mb-6 transition-transform duration-200 ${
          isAdjusting ? 'touch-none cursor-grab active:cursor-grabbing' : 'cursor-pointer active:scale-[0.985]'
        }`}
      >
        {/* Photo Background */}
        {customPhotoUrl ? (
          <div
            className={`absolute inset-0 bg-cover ${isAdjusting ? 'transition-none' : 'transition-opacity duration-700'} ease-out scale-[1.02]`}
            style={{ 
              backgroundImage: `url(${customPhotoUrl})`,
              backgroundPosition: `${customPhotoPosition.x}% ${displayY}%`
            }}
          />
        ) : photo && !error ? (
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
        <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none transition-opacity duration-300 ${isAdjusting ? 'opacity-0' : 'opacity-100'}`} />

        {/* Adjusting Mode Overlay */}
        <AnimatePresence>
          {isAdjusting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl">
                <span className="text-white font-medium tracking-wide text-sm drop-shadow-md">Drag to reposition</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className={`relative z-20 w-full h-full p-5 flex flex-col justify-between transition-opacity duration-300 ${isAdjusting ? 'opacity-50' : 'opacity-100'}`}>
          {/* Top Row: Budget overlay + overflow */}
          <div className="flex justify-between items-start w-full">
            {/* Budget Status Pill - Apple Ultra Luxury Dark Glass (Floating Overlay) */}
            <div className={`absolute top-5 left-5 z-20 bg-black/40 backdrop-blur-2xl rounded-[20px] px-4 py-3 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col gap-1 min-w-[145px] transition-opacity duration-300 ${isAdjusting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
                  {primarySymbol}{formatCurrency(Math.max(getPrimaryValue(remaining), 0))}
                </span>
                <span className="text-[11px] text-white/60 font-medium">left</span>
              </div>
              <span className="text-xs text-white/40 font-medium">
                ≈ {secondarySymbol}{formatCurrency(Math.max(getSecondaryValue(remaining), 0))}
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

            {/* Empty placeholder spacer for left side of top row flex */}
            <div />

            {/* Actions Container */}
            <div 
              className={`actions-container flex items-center gap-1.5 z-30 pointer-events-auto transition-opacity duration-300 ${isAdjusting ? 'opacity-100' : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center bg-white/5 backdrop-blur-xl rounded-full border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] p-0.5">
                {/* Adjust Photo Position Button */}
                {customPhotoUrl && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAdjusting(!isAdjusting);
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        isAdjusting ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'hover:bg-white/10 text-white/50 hover:text-white'
                      }`}
                      title={isAdjusting ? "Done Adjusting" : "Adjust Photo Position"}
                    >
                      {isAdjusting ? <Check className="w-4 h-4" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
                    </button>
                    {!isAdjusting && <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />}
                  </>
                )}

                {/* Remove Custom Photo Button */}
                {customPhotoUrl && !isAdjusting && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomPhoto(currentMonthKey);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                      title="Remove Custom Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3.5 bg-white/10 mx-0.5" />
                  </>
                )}

                {/* Upload Custom Photo Button */}
                {!isAdjusting && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    title="Upload Custom Photo"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onClick={(e) => e.stopPropagation()}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden" 
              />

              {/* Overflow button → Month Picker */}
              {!isAdjusting && (
                <button
                  onClick={handleOverflowTap}
                  className="w-9 h-9 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] hover:bg-white/10 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4 text-white/80" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom: Giant Liquid Glass month text */}
          <div className={`flex flex-col items-center w-full mt-auto relative pb-2 transition-opacity duration-300 ${isAdjusting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ containerType: 'inline-size' }}>
            <h2 
              className="font-black tracking-[-0.04em] w-full text-center leading-none select-none translate-y-14 capitalize whitespace-nowrap"
              style={{
                fontSize: `clamp(50px, ${currentMonthName.toLowerCase() === 'january' ? 25 : currentMonthName.toLowerCase() === 'february' ? 22.5 : 145 / currentMonthName.length}cqw, 150px)`,
                background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.3) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0px 8px 24px rgba(0,0,0,0.5)",
              }}
            >
              {currentMonthName}
            </h2>

            {/* Entry count badge - Bottom Right */}
            <div className="absolute bottom-2 right-0 z-20">
              <span className="bg-black/40 backdrop-blur-xl text-white/90 text-[10px] font-medium px-3.5 py-1.5 rounded-full border border-white/20 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
                {monthEntries.length} entries logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Month Picker Overlay — portaled to body to escape transform context */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showMonthPicker && (
            <MonthPicker
              onClose={() => setShowMonthPicker(false)}
              onSelectMonth={handleMonthSelect}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Monthly Summary Overlay — portaled to body to escape transform context */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSummary && (
            <MonthlySummary
              monthKey={summaryMonth}
              onClose={() => setShowSummary(false)}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
