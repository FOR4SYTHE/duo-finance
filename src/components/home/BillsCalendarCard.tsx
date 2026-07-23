"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays, ChevronRight, CheckCircle2 } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { BillsCalendar } from "./BillsCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export function BillsCalendarCard() {
  const { bills } = useBillsStore();
  const { exchangeRate } = useCurrencyStore();
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState<'grid' | 'presentation'>('grid');

  const today = useMemo(() => new Date(), []);
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Selected date state (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Auto-rotate between grid and presentation every 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setView((prev) => (prev === 'grid' ? 'presentation' : 'grid'));
    }, 15000);
    return () => clearTimeout(timer);
  }, [view, selectedDate]);

  // Bills due in the next 7 days (used for the header subtitle)
  const upcomingBills = useMemo(() => {
    return bills
      .filter((b) => {
        const daysUntil = b.dueDay >= currentDay ? b.dueDay - currentDay : daysInMonth - currentDay + b.dueDay;
        return daysUntil <= 7;
      })
      .sort((a, b) => {
        const da = a.dueDay >= currentDay ? a.dueDay - currentDay : daysInMonth - currentDay + a.dueDay;
        const db = b.dueDay >= currentDay ? b.dueDay - currentDay : daysInMonth - currentDay + b.dueDay;
        return da - db;
      });
  }, [bills, currentDay, daysInMonth]);

  // Days that have bills
  const billDays = useMemo(() => {
    return new Set(bills.map((b) => b.dueDay));
  }, [bills]);

  // Mini calendar grid (2 weeks - current week and next week)
  const calendarDays = useMemo(() => {
    const days = [];
    // Find Sunday of the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        fullDate: d,
        date: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth(),
        hasBill: billDays.has(d.getDate())
      });
    }
    return days;
  }, [billDays, today]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Selected date details
  const isSelectedToday = selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth();
  const selectedDayName = selectedDate.toLocaleDateString("en-US", { weekday: 'long' });
  const selectedDayNum = selectedDate.getDate();
  const selectedMonthName = selectedDate.toLocaleDateString("en-US", { month: 'short' }).toUpperCase();
  
  const selectedBills = useMemo(() => {
    return bills.filter(b => b.dueDay === selectedDate.getDate());
  }, [bills, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setView('presentation');
  };

  return (
    <>
      <div
        className="relative shrink-0 w-full bg-[#111111] rounded-[32px] p-6 mb-6 overflow-hidden"
      >
        {/* Header - Clickable to open full calendar */}
        <div 
          onClick={() => setShowCalendar(true)}
          className="flex items-center justify-between mb-8 cursor-pointer group active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center transition-colors">
              <CalendarDays className="w-4 h-4 text-[#A1A1A1]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white tracking-wide">Calendar & Bills</h3>
              <p className="text-[12px] font-medium text-[#737373] mt-0.5">
                {upcomingBills.length} upcoming this week
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-end text-[#404040] group-hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* Carousel Area (Grid vs Presentation) */}
        <div className="relative h-[120px] w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {view === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full h-full flex flex-col justify-center"
              >
                {/* 2-Week Compact Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                  {/* Day Headers */}
                  {dayLabels.map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-[#737373] font-semibold mb-1 uppercase tracking-wider">
                      {d}
                    </div>
                  ))}
                  {/* Day Cells */}
                  {calendarDays.map((day, i) => {
                    const isSelected = day.date === selectedDate.getDate() && day.month === selectedDate.getMonth();
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                        onClick={() => handleDateSelect(day.fullDate)}
                      >
                        <div
                          className={`flex flex-col items-center justify-center rounded-full relative transition-all duration-300 ${
                            isSelected
                              ? day.hasBill
                                ? "w-[38px] h-[38px] bg-[#FF9F0A] text-black font-bold shadow-[0_0_24px_rgba(255,159,10,0.25)] z-10"
                                : "w-[38px] h-[38px] bg-[#E5E5E5] text-black font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] z-10"
                              : "w-[38px] h-[38px] text-[#A1A1A1] font-medium hover:text-white"
                          }`}
                        >
                          <span className="text-[15px] relative z-10">{day.date}</span>
                          
                          {/* Dot for bill */}
                          {day.hasBill && !isSelected && (
                            <div className="w-1 h-1 rounded-full absolute bottom-[3px] bg-[#525252]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="presentation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full h-full flex gap-5 items-center justify-start cursor-pointer"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset }) => {
                  if (offset.x > 30) setView('grid');
                }}
              >
                {/* Giant Date Presentation */}
                <div className="flex flex-col shrink-0 min-w-[70px] justify-center items-center">
                  <span className="text-[11px] font-bold text-[#FF9F0A] uppercase tracking-widest mb-1 text-center">
                    {isSelectedToday ? "Today" : selectedDayName.slice(0, 3)}
                  </span>
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[48px] font-black text-[#E5E5E5] tracking-tighter leading-[0.8]">{selectedDayNum}</span>
                    <span className="text-[13px] font-bold text-[#737373] tracking-widest uppercase mt-2">{selectedMonthName}</span>
                  </div>
                </div>

                {/* Right: Luxury Information Card */}
                <div className="flex-1 h-full py-0.5">
                  <div className="w-full h-full rounded-[24px] bg-[#1C1C1E] p-4 flex flex-col justify-center items-center relative overflow-hidden transition-colors">
                    {selectedBills.length > 0 ? (
                      <div className="w-full h-full flex flex-col justify-between">
                        <div className="flex items-start justify-between relative z-10">
                          <span className="text-[15px] font-bold text-[#E5E5E5] leading-tight">
                            {selectedBills.length > 1 ? `${selectedBills.length} Bills Due` : selectedBills[0].name}
                          </span>
                        </div>
                        <div className="flex items-end justify-between relative z-10 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#737373] font-medium uppercase tracking-widest mb-0.5">Amount</span>
                            <span className="text-[18px] font-bold text-[#E5E5E5] leading-none tracking-tight">
                              <span className="text-[#A1A1A1] text-[14px] mr-0.5">₱</span>
                              {selectedBills.length > 1 
                                ? formatCurrency(selectedBills.reduce((acc, curr) => acc + curr.amount, 0)) 
                                : formatCurrency(selectedBills[0].amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center relative z-10">
                        <CheckCircle2 className="w-6 h-6 text-[#525252] mb-2" />
                        <span className="text-[14px] font-bold text-[#A1A1A1]">No bills scheduled</span>
                        <span className="text-[11px] text-[#525252] mt-1 font-medium">You're all caught up</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <button 
            onClick={() => setView('grid')}
            className={`h-1.5 rounded-full transition-all duration-300 ${view === 'grid' ? 'w-4 bg-[#E5E5E5]' : 'w-1.5 bg-[#404040]'}`}
            aria-label="View Calendar Grid"
          />
          <button 
            onClick={() => setView('presentation')}
            className={`h-1.5 rounded-full transition-all duration-300 ${view === 'presentation' ? 'w-4 bg-[#E5E5E5]' : 'w-1.5 bg-[#404040]'}`}
            aria-label="View Bill Details"
          />
        </div>
      </div>

      {/* Full Calendar Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showCalendar && (
            <BillsCalendar onClose={() => setShowCalendar(false)} />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
