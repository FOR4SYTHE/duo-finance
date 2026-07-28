"use client";

import { useMemo, useState, useEffect } from "react";
import { CalendarDays, ChevronRight, CheckCircle2, ShoppingCart } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";
import { useHouseholdStore } from "@/store/useHouseholdStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { BillsCalendar } from "./BillsCalendar";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface BillsCalendarCardProps {
  forceOpenFullCalendar?: boolean;
  onCalendarClose?: () => void;
}

export function BillsCalendarCard({ forceOpenFullCalendar, onCalendarClose }: BillsCalendarCardProps = {}) {
  const { bills } = useBillsStore();
  const { scheduledTrips } = useHouseholdStore();
  const { savedTrips } = useCartifyStore();
  const { exchangeRate } = useCurrencyStore();
  const [showFullCalendar, setShowFullCalendar] = useState(false);
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

  // Handle forced open from notifications
  useEffect(() => {
    if (forceOpenFullCalendar) {
      setShowFullCalendar(true);
    }
  }, [forceOpenFullCalendar]);

  const handleClose = () => {
    setShowFullCalendar(false);
    if (onCalendarClose) onCalendarClose();
  };

  const allEvents = useMemo(() => {
    const events: any[] = [...bills.map(b => ({ ...b, eventType: 'bill' }))];

    scheduledTrips.forEach(t => {
      const d = new Date(t.date);
      events.push({
        id: t.id,
        name: t.storeName ? `Trip to ${t.storeName}` : "Scheduled Trip",
        amount: t.estimatedBudgetPHP || 0,
        dueDay: d.getDate(),
        dueMonth: d.getMonth(),
        dueYear: d.getFullYear(),
        category: "Cartify",
        isRecurring: false,
        eventType: 'trip',
        reminderEnabled: true
      });
    });

    savedTrips.forEach(t => {
      const d = new Date(t.date);
      events.push({
        id: t.id,
        name: `Saved Trip`,
        amount: t.budget,
        dueDay: d.getDate(),
        dueMonth: d.getMonth(),
        dueYear: d.getFullYear(),
        category: "Cartify",
        isRecurring: false,
        eventType: 'trip',
        reminderEnabled: false
      });
    });

    return events;
  }, [bills, scheduledTrips, savedTrips]);

  // Bills due in the next 7 days (used for the header subtitle)
  const upcomingBills = useMemo(() => {
    return allEvents
      .filter((b) => {
        // Simple heuristic for upcoming next 7 days (assuming mostly same month or early next month)
        const daysUntil = b.dueDay >= currentDay ? b.dueDay - currentDay : daysInMonth - currentDay + b.dueDay;
        return daysUntil <= 7 && daysUntil >= 0;
      })
      .sort((a, b) => {
        const da = a.dueDay >= currentDay ? a.dueDay - currentDay : daysInMonth - currentDay + a.dueDay;
        const db = b.dueDay >= currentDay ? b.dueDay - currentDay : daysInMonth - currentDay + b.dueDay;
        return da - db;
      });
  }, [allEvents, currentDay, daysInMonth]);

  // Mini calendar grid (2 weeks - current week and next week)
  const calendarDays = useMemo(() => {
    const days = [];
    // Find Sunday of the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const eventsForDay = allEvents.filter(b => 
        (b.isRecurring && b.dueDay === d.getDate()) || 
        (!b.isRecurring && b.dueDay === d.getDate() && b.dueMonth === d.getMonth() && b.dueYear === d.getFullYear())
      );
      
      days.push({
        fullDate: d,
        date: d.getDate(),
        month: d.getMonth(),
        year: d.getFullYear(),
        isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth(),
        hasBill: eventsForDay.length > 0,
        eventsForDay
      });
    }
    return days;
  }, [allEvents, today]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  // Selected date details
  const isSelectedToday = selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth();
  const selectedDayName = selectedDate.toLocaleDateString("en-US", { weekday: 'long' });
  const selectedDayNum = selectedDate.getDate();
  const selectedMonthName = selectedDate.toLocaleDateString("en-US", { month: 'short' }).toUpperCase();
  
  const selectedBills = useMemo(() => {
    return allEvents.filter(b => 
        (b.isRecurring && b.dueDay === selectedDate.getDate()) ||
        (!b.isRecurring && b.dueDay === selectedDate.getDate() && b.dueMonth === selectedDate.getMonth() && b.dueYear === selectedDate.getFullYear())
    );
  }, [allEvents, selectedDate]);

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
          onClick={() => setShowFullCalendar(true)}
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
                    const hasCartify = day.eventsForDay?.some(b => b.category === "Cartify");
                    const hasRegular = day.eventsForDay?.some(b => b.category !== "Cartify");
                    const firstRegularBill = day.eventsForDay?.find(b => b.category !== "Cartify");
                    const customColor = firstRegularBill?.color;
                    // Derive ring color: custom color first, then category default
                    const CATEGORY_HEX: Record<string, string> = {
                      Housing: "#FF9F0A", Utilities: "#30D158", Insurance: "#5E5CE6",
                      Subscriptions: "#FF453A", Education: "#BF5AF2", Transportation: "#64D2FF",
                      Health: "#FF375F", Other: "#FFFFFF",
                    };
                    const ringHex = customColor || (firstRegularBill ? CATEGORY_HEX[firstRegularBill.category] || "#FF9F0A" : undefined);
                    
                    let bgClass = "bg-[#E5E5E5] text-black font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)]";
                    if (day.hasBill) {
                      if (hasCartify && hasRegular) {
                        bgClass = "bg-[#30D158] text-black font-bold shadow-[0_0_24px_rgba(48,209,88,0.25)]";
                      } else if (hasCartify) {
                        bgClass = "bg-[#30D158] text-black font-bold shadow-[0_0_24px_rgba(48,209,88,0.25)]";
                      } else {
                        bgClass = customColor 
                          ? "text-black font-bold shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                          : "bg-[#FF9F0A] text-black font-bold shadow-[0_0_24px_rgba(255,159,10,0.25)]";
                      }
                    }

                    return (
                      <div
                        key={i}
                        className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                        onClick={() => handleDateSelect(day.fullDate)}
                      >
                        <div
                          className={`flex flex-col items-center justify-center rounded-full relative transition-all duration-300 ${
                            isSelected
                              ? `w-[38px] h-[38px] z-10 ${bgClass}`
                              : "w-[38px] h-[38px] text-[#A1A1A1] font-medium hover:text-white"
                          }`}
                          style={
                            isSelected && hasCartify && hasRegular && ringHex
                              ? { boxShadow: `0 0 0 2px #111111, 0 0 0 4px ${ringHex}` }
                              : isSelected && !hasCartify && customColor
                              ? { backgroundColor: customColor }
                              : undefined
                          }
                        >
                          {/* Premium warning beam pulse for selected bills */}
                          {isSelected && day.hasBill && (
                            <div 
                              className={`absolute inset-0 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40 pointer-events-none -z-10`} 
                              style={{ backgroundColor: hasCartify ? '#30D158' : (ringHex || '#FF9F0A') }}
                            />
                          )}

                          {isSelected && hasCartify ? (
                            <motion.div 
                              animate={{ y: [0, -4, 0] }} 
                              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }} 
                              className="relative z-10 flex items-center justify-center"
                            >
                              <ShoppingCart className="w-[18px] h-[18px] text-black" strokeWidth={2.5} />
                            </motion.div>
                          ) : (
                            <span className="text-[15px] relative z-10">{day.date}</span>
                          )}
                          
                          {/* Dot for bill */}
                          {day.hasBill && !isSelected && (
                            <div 
                              className="w-1 h-1 rounded-full absolute bottom-[3px]"
                              style={{ backgroundColor: hasCartify ? '#30D158' : (ringHex || '#525252') }}
                            />
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
                          <span 
                            className="text-[15px] font-bold leading-tight"
                            style={{ color: selectedBills.length === 1 && selectedBills[0].color ? selectedBills[0].color : '#E5E5E5' }}
                          >
                            {selectedBills.length > 1 ? `${selectedBills.length} Bills Due` : selectedBills[0].name}
                          </span>
                        </div>
                        <div className="flex items-end justify-between relative z-10 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-[#737373] font-medium uppercase tracking-widest mb-0.5">Amount</span>
                            <div className="flex flex-col items-start gap-0.5">
                              <span className="text-[18px] font-bold text-[#E5E5E5] leading-none tracking-tight flex items-center">
                                <span className="text-[#A1A1A1] text-[14px] mr-0.5">₱</span>
                                {selectedBills.length > 1 
                                  ? formatCurrency(selectedBills.reduce((acc, curr) => acc + curr.amount, 0)) 
                                  : formatCurrency(selectedBills[0].amount)}
                              </span>
                              <span className="text-[11px] font-bold text-[#737373] tracking-tight">
                                ≈ R{((selectedBills.length > 1 
                                  ? selectedBills.reduce((acc, curr) => acc + curr.amount, 0) 
                                  : selectedBills[0].amount) * exchangeRate).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center gap-4 relative z-10 px-2">
                        <img 
                          src="/mascot/dufi-bills-relaxed.webp" 
                          alt="No bills" 
                          className="w-24 h-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-[14px] font-bold text-[#E5E5E5]">No bills scheduled</span>
                          <span className="text-[12px] text-[#A1A1A1] mt-0.5 font-medium">You're all caught up</span>
                        </div>
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
          {showFullCalendar && (
            <BillsCalendar onClose={handleClose} />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
