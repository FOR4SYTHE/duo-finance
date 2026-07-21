"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  BellOff,
  Trash2,
  Check,
} from "lucide-react";
import { useBillsStore, Bill } from "@/store/useBillsStore";
import { formatCurrency } from "@/lib/format";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const BILL_CATEGORIES = [
  "Housing", "Utilities", "Insurance", "Subscriptions",
  "Education", "Transportation", "Health", "Other",
];

interface BillsCalendarProps {
  onClose: () => void;
}

export function BillsCalendar({ onClose }: BillsCalendarProps) {
  const { bills, addBill, updateBill, removeBill, toggleReminder } = useBillsStore();
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newRecurring, setNewRecurring] = useState(true);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const billsByDay = useMemo(() => {
    const map: Record<number, Bill[]> = {};
    bills.forEach((b) => {
      if (!map[b.dueDay]) map[b.dueDay] = [];
      map[b.dueDay].push(b);
    });
    return map;
  }, [bills]);

  const selectedDayBills = selectedDay ? billsByDay[selectedDay] || [] : [];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDay(null);
  };

  const handleAddBill = () => {
    if (!newName.trim() || !newAmount.trim() || !selectedDay) return;
    addBill({
      name: newName.trim(),
      amount: parseFloat(newAmount),
      currency: "PHP",
      dueDay: selectedDay,
      category: newCategory,
      isRecurring: newRecurring,
      reminderEnabled: true,
    });
    setNewName("");
    setNewAmount("");
    setNewCategory("Other");
    setNewRecurring(true);
    setShowAddForm(false);
  };

  const isToday = (day: number) =>
    day === now.getDate() &&
    viewMonth === now.getMonth() &&
    viewYear === now.getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[110] bg-[#050505] overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-xl mx-auto min-h-full pb-12">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-xl px-6 pt-14 pb-4 flex items-center justify-between border-b border-white/[0.04]">
          <h1 className="text-xl font-light text-white tracking-tight">
            Bills & Calendar
          </h1>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-6 pt-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-lg font-medium text-white tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white/[0.02] rounded-2xl border border-white/[0.04] p-4 mb-6">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] text-white/25 font-medium py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const hasBills = day ? !!billsByDay[day] : false;
                const billCount = day ? (billsByDay[day]?.length || 0) : 0;
                const isSelected = day === selectedDay;

                return (
                  <button
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all text-xs ${
                      isSelected
                        ? "bg-white text-black font-bold"
                        : isToday(day || 0)
                        ? "bg-[#0A84FF]/20 text-[#0A84FF] font-semibold"
                        : day
                        ? "text-white/50 hover:bg-white/[0.06]"
                        : ""
                    }`}
                  >
                    {day}
                    {hasBills && !isSelected && (
                      <div className="flex gap-0.5 mt-0.5">
                        {Array.from({ length: Math.min(billCount, 3) }).map(
                          (_, j) => (
                            <div
                              key={j}
                              className="w-1 h-1 rounded-full bg-[#0A84FF]"
                            />
                          )
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Bills */}
          {selectedDay && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/70">
                  Day {selectedDay} — {selectedDayBills.length} bill
                  {selectedDayBills.length !== 1 ? "s" : ""}
                </h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A84FF] text-white text-xs font-medium hover:bg-[#0A84FF]/80 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              {selectedDayBills.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedDayBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/[0.04]"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">
                            {bill.name}
                          </span>
                          {bill.isRecurring && (
                            <span className="text-[8px] text-white/30 bg-white/[0.06] px-1.5 py-0.5 rounded uppercase tracking-widest">
                              Monthly
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/40 mt-0.5">
                          {bill.category} • ₱{formatCurrency(bill.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReminder(bill.id)}
                          className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
                        >
                          {bill.reminderEnabled ? (
                            <Bell className="w-3.5 h-3.5 text-[#0A84FF]" />
                          ) : (
                            <BellOff className="w-3.5 h-3.5 text-white/20" />
                          )}
                        </button>
                        <button
                          onClick={() => removeBill(bill.id)}
                          className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-[#FF453A]/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-[#FF453A]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-white/20">
                    No bills due on this day
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add Bill Form */}
          <AnimatePresence>
            {showAddForm && selectedDay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-5">
                  <h4 className="text-sm font-medium text-white mb-4">
                    New Bill — Day {selectedDay}
                  </h4>

                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      placeholder="Bill name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#0A84FF]/50 transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Amount (PHP)"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#0A84FF]/50 transition-colors"
                    />

                    {/* Category selector */}
                    <div className="flex flex-wrap gap-2">
                      {BILL_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setNewCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                            newCategory === cat
                              ? "bg-[#0A84FF] text-white"
                              : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Recurring toggle */}
                    <button
                      onClick={() => setNewRecurring(!newRecurring)}
                      className="flex items-center gap-2 py-2"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          newRecurring
                            ? "bg-[#0A84FF]"
                            : "bg-white/[0.06] border border-white/10"
                        }`}
                      >
                        {newRecurring && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-xs text-white/60">
                        Recurring monthly
                      </span>
                    </button>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-3 rounded-xl bg-white/[0.04] text-white/50 text-sm font-medium hover:bg-white/[0.08] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddBill}
                        disabled={!newName.trim() || !newAmount.trim()}
                        className="flex-1 py-3 rounded-xl bg-[#0A84FF] text-white text-sm font-medium hover:bg-[#0A84FF]/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Save Bill
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Bills Overview */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-3">
              All Recurring Bills
            </h3>
            <div className="flex flex-col gap-2">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  onClick={() => setSelectedDay(bill.dueDay)}
                  className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.03] cursor-pointer hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-xs text-white/40 font-bold">
                      {bill.dueDay}
                    </div>
                    <div>
                      <span className="text-sm text-white/70">{bill.name}</span>
                      <p className="text-[10px] text-white/25">{bill.category}</p>
                    </div>
                  </div>
                  <span className="text-sm text-white font-medium">
                    ₱{formatCurrency(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
