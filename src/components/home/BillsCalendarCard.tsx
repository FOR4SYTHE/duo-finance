"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight, Bell, BellOff } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { BillsCalendar } from "./BillsCalendar";

export function BillsCalendarCard() {
  const { bills } = useBillsStore();
  const { exchangeRate } = useCurrencyStore();
  const [showCalendar, setShowCalendar] = useState(false);

  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  // Bills due in the next 7 days
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

  // Mini calendar grid (6 weeks max)
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <>
      <div
        onClick={() => setShowCalendar(true)}
        className="relative w-full bg-white/[0.02] border border-white/[0.04] rounded-[24px] p-5 mb-6 cursor-pointer hover:bg-white/[0.04] transition-all active:scale-[0.98] group"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A84FF]/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-[#0A84FF]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">Bills & Due Dates</h3>
              <p className="text-[10px] text-white/30">
                {upcomingBills.length} upcoming this week
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white/20 group-hover:text-white/50 group-hover:bg-white/10 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Mini Calendar Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayLabels.map((d, i) => (
              <div key={i} className="text-center text-[8px] text-white/20 font-medium py-0.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-[10px] relative ${
                  day === currentDay
                    ? "bg-white text-black font-bold"
                    : day
                    ? "text-white/40"
                    : ""
                }`}
              >
                {day}
                {day && billDays.has(day) && day !== currentDay && (
                  <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#0A84FF]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bills List */}
        {upcomingBills.length > 0 && (
          <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.04]">
            {upcomingBills.slice(0, 3).map((bill) => {
              const isDueToday = bill.dueDay === currentDay;
              const isOverdue = bill.dueDay < currentDay;

              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDueToday
                          ? "bg-[#FF9F0A] shadow-[0_0_6px_#FF9F0A]"
                          : isOverdue
                          ? "bg-[#FF453A]"
                          : "bg-[#0A84FF]"
                      }`}
                    />
                    <span className="text-xs text-white/70">{bill.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">
                      {isDueToday ? "Today" : `Day ${bill.dueDay}`}
                    </span>
                    <span className="text-xs text-white font-medium">
                      ₱{formatCurrency(bill.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full Calendar Overlay */}
      {showCalendar && (
        <BillsCalendar onClose={() => setShowCalendar(false)} />
      )}
    </>
  );
}
