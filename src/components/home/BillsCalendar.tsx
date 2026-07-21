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
  Home,
  Zap,
  Shield,
  PlaySquare,
  BookOpen,
  Car,
  HeartPulse,
  CreditCard,
  LucideIcon
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

const getCategoryArt = (category: string): { icon: LucideIcon; color: string; glow: string } => {
  switch (category) {
    case "Housing": return { icon: Home, color: "bg-[#FF9F0A]", glow: "bg-[#FF9F0A]" };
    case "Utilities": return { icon: Zap, color: "bg-[#30D158]", glow: "bg-[#30D158]" };
    case "Insurance": return { icon: Shield, color: "bg-[#5E5CE6]", glow: "bg-[#5E5CE6]" };
    case "Subscriptions": return { icon: PlaySquare, color: "bg-[#FF453A]", glow: "bg-[#FF453A]" };
    case "Education": return { icon: BookOpen, color: "bg-[#BF5AF2]", glow: "bg-[#BF5AF2]" };
    case "Transportation": return { icon: Car, color: "bg-[#64D2FF]", glow: "bg-[#64D2FF]" };
    case "Health": return { icon: HeartPulse, color: "bg-[#FF375F]", glow: "bg-[#FF375F]" };
    default: return { icon: CreditCard, color: "bg-white/90", glow: "bg-white/40" };
  }
};

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
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <span className="text-xl font-semibold text-white tracking-tight">
              {MONTH_NAMES[viewMonth]} <span className="text-white/40">{viewYear}</span>
            </span>
            <button
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.1] transition-all"
            >
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Creative Calendar Grid */}
          <div className="bg-white/[0.02] rounded-[32px] border border-white/[0.04] p-5 mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {DAY_LABELS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] text-white/30 font-bold uppercase tracking-widest py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((day, i) => {
                const billsForDay = day ? billsByDay[day] : [];
                const hasBills = billsForDay && billsForDay.length > 0;
                const isSelected = day === selectedDay;
                const todayFlag = day && isToday(day);

                let art = null;
                if (hasBills) {
                  art = getCategoryArt(billsForDay[0].category);
                }

                return (
                  <button
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`aspect-square rounded-full flex flex-col items-center justify-center relative transition-transform duration-300 ${
                      isSelected ? "scale-110 shadow-[0_4px_16px_rgba(255,255,255,0.15)] z-10" : "active:scale-90"
                    } ${
                      !day
                        ? ""
                        : hasBills
                        ? `${art?.color} text-black border-none`
                        : todayFlag
                        ? "bg-white/15 text-white font-bold border border-white/30"
                        : "text-white/60 hover:bg-white/[0.06] font-medium"
                    }`}
                  >
                    {day && hasBills && art ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span className="absolute top-1.5 text-center text-[9px] font-black opacity-60">
                          {day}
                        </span>
                        <art.icon className="w-[18px] h-[18px] mt-2 opacity-90" strokeWidth={2.5} />
                        {billsForDay.length > 1 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white/20 shadow-md">
                            {billsForDay.length}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-full border-2 border-white pointer-events-none" />
                        )}
                      </div>
                    ) : (
                      <span className="text-[15px]">{day}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Bills */}
          <AnimatePresence mode="wait">
            {selectedDay && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-white/50 tracking-widest uppercase">
                    Schedule for {MONTH_NAMES[viewMonth].slice(0, 3)} {selectedDay}
                  </h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Bill
                  </button>
                </div>

                {selectedDayBills.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {selectedDayBills.map((bill) => {
                      const art = getCategoryArt(bill.category);
                      return (
                        <div
                          key={bill.id}
                          className="relative overflow-hidden flex flex-col justify-between p-4.5 bg-white/[0.03] rounded-[24px] border border-white/[0.05] min-h-[110px]"
                        >
                          <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none ${art.glow}`} />
                          
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-3.5">
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${art.color} text-black shadow-lg`}>
                                <art.icon className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[16px] font-bold text-white tracking-wide">{bill.name}</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{bill.category}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleReminder(bill.id)}
                                className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.1] transition-colors border border-white/5"
                              >
                                {bill.reminderEnabled ? (
                                  <Bell className={`w-3.5 h-3.5 text-[#0A84FF]`} />
                                ) : (
                                  <BellOff className="w-3.5 h-3.5 text-white/30" />
                                )}
                              </button>
                              <button
                                onClick={() => removeBill(bill.id)}
                                className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-[#FF453A]/20 transition-colors border border-white/5"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-[#FF453A]" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-end justify-between mt-5 relative z-10">
                            <span className="text-3xl font-black text-white tracking-tighter leading-none">₱{formatCurrency(bill.amount)}</span>
                            {bill.isRecurring && (
                              <div className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-[9px] font-bold uppercase tracking-widest border border-white/10">
                                Monthly
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/[0.02] rounded-[24px] border border-white/[0.04]">
                    <Check className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white/60">No bills scheduled</p>
                    <p className="text-[11px] text-white/30 mt-1">Enjoy your free day</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Bill Form */}
          <AnimatePresence>
            {showAddForm && selectedDay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-[#111111] rounded-[28px] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <h4 className="text-[15px] font-bold text-white mb-5 tracking-tight">
                    Add Bill for Day {selectedDay}
                  </h4>

                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Bill name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Amount (PHP)"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                    />

                    {/* Category selector */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {BILL_CATEGORIES.map((cat) => {
                        const art = getCategoryArt(cat);
                        const isCatSelected = newCategory === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setNewCategory(cat)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                              isCatSelected
                                ? `${art.color} text-black`
                                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.1] border border-white/5"
                            }`}
                          >
                            <art.icon className="w-3.5 h-3.5" />
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Recurring toggle */}
                    <button
                      onClick={() => setNewRecurring(!newRecurring)}
                      className="flex items-center gap-3 py-3 mt-2"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          newRecurring
                            ? "bg-[#30D158]"
                            : "bg-white/[0.06] border border-white/10"
                        }`}
                      >
                        {newRecurring && (
                          <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-white/80">
                        Repeat monthly
                      </span>
                    </button>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] text-white/60 text-[13px] font-bold uppercase tracking-widest hover:bg-white/[0.1] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddBill}
                        disabled={!newName.trim() || !newAmount.trim()}
                        className="flex-1 py-3.5 rounded-2xl bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Bills Overview */}
          <div className="mb-8 pt-4">
            <h3 className="text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase mb-4">
              All Recurring Bills
            </h3>
            <div className="flex flex-col gap-3">
              {bills.map((bill) => {
                const art = getCategoryArt(bill.category);
                return (
                  <div
                    key={bill.id}
                    onClick={() => setSelectedDay(bill.dueDay)}
                    className="relative overflow-hidden flex flex-col justify-between p-4 bg-white/[0.03] rounded-[24px] border border-white/[0.04] cursor-pointer hover:bg-white/[0.06] transition-all active:scale-[0.98] min-h-[110px]"
                  >
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-[0.15] pointer-events-none ${art.glow}`} />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${art.color} text-black shadow-lg`}>
                          <art.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-bold text-white tracking-wide">{bill.name}</span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{bill.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-bold text-white/60">Day {bill.dueDay}</span>
                        {bill.isRecurring && <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] mt-1">Monthly</span>}
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-5 relative z-10">
                      <span className="text-[26px] font-black text-white tracking-tighter leading-none">₱{formatCurrency(bill.amount)}</span>
                      <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/10 text-white/90 border border-white/5`}>
                        Scheduled
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
