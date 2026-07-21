"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays, ChevronRight, CheckCircle2 } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { BillsCalendar } from "./BillsCalendar";
import { motion, AnimatePresence } from "framer-motion";

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
        className="relative shrink-0 w-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36),_inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-[28px] p-6 mb-6 overflow-hidden"
      >
        {/* Header - Clickable to open full calendar */}
        <div 
          onClick={() => setShowCalendar(true)}
          className="flex items-center justify-between mb-5 cursor-pointer group active:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-white/10 border border-white/5 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:bg-white/20 transition-colors">
              <CalendarDays className="w-5 h-5 text-white/90" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-white tracking-wide">Calendar & Bills</h3>
              <p className="text-[11px] font-medium text-white/40 mt-0.5">
                {upcomingBills.length} upcoming this week
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 group-hover:text-white/80 group-hover:bg-white/10 transition-all">
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
                <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                  {/* Day Headers */}
                  {dayLabels.map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-white/30 font-semibold mb-0.5 uppercase tracking-widest">
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
                          className={`w-[36px] h-[36px] flex flex-col items-center justify-center rounded-full text-[14px] relative transition-all duration-300 ${
                            isSelected
                              ? "bg-white text-black font-bold shadow-[0_4px_12px_rgba(255,255,255,0.3)] scale-110 z-10"
                              : day.isToday
                              ? "bg-white/10 text-white font-bold border border-white/20"
                              : "text-white/70 font-medium hover:bg-white/5"
                          }`}
                        >
                          <span>{day.date}</span>
                          
                          {/* Breathing room for indicator dot - anchored to bottom */}
                          {day.hasBill && !isSelected && (
                            <div className={`w-1 h-1 rounded-full absolute bottom-[3px] ${day.isToday ? "bg-white/80" : "bg-white/30"}`} />
                          )}
                          {day.hasBill && isSelected && (
                            <div className="w-1 h-1 rounded-full bg-black/60 absolute bottom-[3px]" />
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
                className="w-full h-full flex gap-4 items-center justify-start cursor-pointer"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset }) => {
                  if (offset.x > 30) setView('grid');
                }}
              >
                {/* Giant Date Presentation */}
                <div className="flex flex-col shrink-0 min-w-[70px] justify-center items-center">
                  <span className="text-[10px] font-bold text-[#FF9F0A] uppercase tracking-widest mb-0.5 text-center">
                    {isSelectedToday ? "Today" : selectedDayName.slice(0, 3)}
                  </span>
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[44px] font-black text-white tracking-tighter leading-[0.8]">{selectedDayNum}</span>
                    <span className="text-[14px] font-bold text-white/40 tracking-tight mt-1">{selectedMonthName}</span>
                  </div>
                </div>

                {/* Right: Luxury Information Card */}
                <div className="flex-1 h-full py-1">
                  <div className="w-full h-full rounded-[20px] bg-white/[0.03] border border-white/[0.05] p-3.5 flex flex-col justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden">
                    {/* Subtle gradient glow inside the card depending on state */}
                    <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-[30px] opacity-20 pointer-events-none ${selectedBills.length > 0 ? "bg-[#FF9F0A]" : "bg-white/20"}`} />
                    
                    {selectedBills.length > 0 ? (
                      <>
                        <div className="flex items-start justify-between relative z-10">
                          <span className="text-[14px] font-bold text-white/90 leading-tight">
                            {selectedBills.length > 1 ? `${selectedBills.length} Bills Scheduled` : selectedBills[0].name}
                          </span>
                          <div className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                            Due
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between relative z-10 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest mb-0.5">Amount</span>
                            <span className="text-[18px] font-bold text-white leading-none tracking-tight">
                              <span className="text-white/50 text-[14px] mr-0.5">₱</span>
                              {selectedBills.length > 1 
                                ? formatCurrency(selectedBills.reduce((acc, curr) => acc + curr.amount, 0)) 
                                : formatCurrency(selectedBills[0].amount)}
                            </span>
                          </div>

                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col justify-center items-center text-center relative z-10">
                        <CheckCircle2 className="w-6 h-6 text-white/20 mb-2" />
                        <span className="text-[13px] font-semibold text-white/60">No bills scheduled</span>
                        <span className="text-[10px] text-white/30 mt-0.5">You're all caught up</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          <button 
            onClick={() => setView('grid')}
            className={`h-1.5 rounded-full transition-all duration-300 ${view === 'grid' ? 'w-4 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
            aria-label="View Calendar Grid"
          />
          <button 
            onClick={() => setView('presentation')}
            className={`h-1.5 rounded-full transition-all duration-300 ${view === 'presentation' ? 'w-4 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
            aria-label="View Bill Details"
          />
        </div>
      </div>

      {/* Full Calendar Overlay */}
      {showCalendar && (
        <BillsCalendar onClose={() => setShowCalendar(false)} />
      )}
    </>
  );
}
