"use client";

import { useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ShoppingCart,
  LucideIcon
} from "lucide-react";
import { useBillsStore, Bill } from "@/store/useBillsStore";
import { useHouseholdStore } from "@/store/useHouseholdStore";
import { useCartifyStore } from "@/store/useCartifyStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useInsuranceStore } from "@/store/useInsuranceStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { formatCurrency } from "@/lib/format";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const RAINBOW_COLORS = [
  "#FF3B30", // Red
  "#FF9F0A", // Orange
  "#FFD60A", // Yellow
  "#30D158", // Green
  "#64D2FF", // Light Blue
  "#0A84FF", // Blue
  "#5E5CE6", // Indigo
  "#BF5AF2", // Purple
  "#FF375F", // Pink
  "#FFFFFF", // Default/White
];

const BILL_CATEGORIES = [
  "Housing", "Utilities", "Insurance", "Subscriptions",
  "Education", "Transportation", "Health", "Other",
];

const CATEGORY_HEX: Record<string, string> = {
  Housing: "#FF9F0A",
  Utilities: "#30D158",
  Insurance: "#5E5CE6",
  Subscriptions: "#FF453A",
  Education: "#BF5AF2",
  Transportation: "#64D2FF",
  Health: "#FF375F",
  Cartify: "#30D158",
  Other: "#FFFFFF",
};

const getCategoryArt = (category: string): { icon: LucideIcon; color: string; glow: string } => {
  switch (category) {
    case "Housing": return { icon: Home, color: "bg-[#FF9F0A]", glow: "bg-[#FF9F0A]" };
    case "Utilities": return { icon: Zap, color: "bg-[#30D158]", glow: "bg-[#30D158]" };
    case "Insurance": return { icon: Shield, color: "bg-[#5E5CE6]", glow: "bg-[#5E5CE6]" };
    case "Subscriptions": return { icon: PlaySquare, color: "bg-[#FF453A]", glow: "bg-[#FF453A]" };
    case "Education": return { icon: BookOpen, color: "bg-[#BF5AF2]", glow: "bg-[#BF5AF2]" };
    case "Transportation": return { icon: Car, color: "bg-[#64D2FF]", glow: "bg-[#64D2FF]" };
    case "Health": return { icon: HeartPulse, color: "bg-[#FF375F]", glow: "bg-[#FF375F]" };
    case "Cartify": return { icon: ShoppingCart, color: "bg-[#30D158]", glow: "bg-[#30D158]" };
    default: return { icon: CreditCard, color: "bg-white/90", glow: "bg-white/40" };
  }
};

interface BillsCalendarProps {
  onClose: () => void;
}

export function BillsCalendar({ onClose }: BillsCalendarProps) {
  const { bills, addBill, updateBill, removeBill, toggleReminder, togglePaid } = useBillsStore();
  const { scheduledTrips, deleteScheduledTrip } = useHouseholdStore();
  const { savedTrips, deleteSavedTrip } = useCartifyStore();
  const { policies } = useInsuranceStore();
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Bridge States
  const { addExpense, entries } = useSpendStore();
  const [pendingLogBill, setPendingLogBill] = useState<Bill | null>(null);
  const [syncDriftNotice, setSyncDriftNotice] = useState<{ amount: number; name: string } | null>(null);

  // Add form state
  const formRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Other");
  const [newDueDay, setNewDueDay] = useState(now.getDate());
  const [newRecurring, setNewRecurring] = useState(true);
  const [newColor, setNewColor] = useState<string>("");
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const { categories } = useBudgetStore();

  const router = useRouter();

  const handleTogglePaid = (bill: Bill) => {
    if (!bill.isPaid) {
      // Trying to mark as paid -> Ask for confirmation
      setPendingLogBill(bill);
    } else {
      // Trying to unmark as paid -> Check for drift
      togglePaid(bill.id);
      
      const loggedEntry = entries.find(e => e.sourceBillId === bill.id);
      if (loggedEntry) {
        setSyncDriftNotice({ amount: loggedEntry.amount, name: bill.name });
        setTimeout(() => setSyncDriftNotice(null), 5000);
      }
    }
  };

  const confirmLogPaidBill = () => {
    if (pendingLogBill) {
      addExpense(
        pendingLogBill.amount,
        pendingLogBill.currency,
        pendingLogBill.category,
        `Paid: ${pendingLogBill.name}`,
        undefined, // tripId
        pendingLogBill.id // sourceBillId
      );
      togglePaid(pendingLogBill.id);
      setPendingLogBill(null);
    }
  };

  const declineLogPaidBill = () => {
    if (pendingLogBill) {
      setPendingLogBill(null);
    }
  };

  const handleLogAndViewBudget = () => {
    confirmLogPaidBill();
    onClose();
    router.push('/budget');
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const allEvents = useMemo(() => {
    const events: any[] = bills
      .filter(b => b.isRecurring || (b.dueMonth === viewMonth && b.dueYear === viewYear) || b.dueMonth === undefined)
      .map(b => ({ ...b, eventType: 'bill', dueDay: Math.min(b.dueDay, daysInMonth) }));

    scheduledTrips.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        events.push({
          id: t.id,
          name: t.storeName ? `Trip to ${t.storeName}` : "Scheduled Trip",
          amount: t.estimatedBudgetPHP || 0,
          dueDay: d.getDate(),
          category: "Cartify",
          isRecurring: false,
          eventType: 'trip',
          tripType: 'scheduled',
          reminderEnabled: true
        });
      }
    });

    savedTrips.forEach(t => {
      if (t.scheduledTripId && scheduledTrips.some(st => st.id === t.scheduledTripId)) {
        return;
      }
      const d = new Date(t.date);
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        events.push({
          id: t.id,
          name: `Saved Trip`,
          amount: t.budget,
          dueDay: d.getDate(),
          category: "Cartify",
          isRecurring: false,
          eventType: 'trip',
          tripType: 'saved',
          reminderEnabled: false
        });
      }
    });

    policies.forEach(p => {
      if (!p.dueDate) return;
      const d = new Date(p.dueDate);
      if (d.getMonth() === viewMonth && d.getFullYear() === viewYear) {
        events.push({
          id: p.id,
          name: `${p.provider} Renewal`,
          amount: p.premium || 0,
          dueDay: d.getDate(),
          category: "Insurance",
          isRecurring: p.paymentFrequency === 'Monthly',
          eventType: 'insurance',
          reminderEnabled: true,
          isPaid: false
        });
      }
    });

    return events;
  }, [bills, scheduledTrips, savedTrips, policies, viewMonth, viewYear]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    allEvents.forEach((b) => {
      if (!map[b.dueDay]) map[b.dueDay] = [];
      map[b.dueDay].push(b);
    });
    return map;
  }, [allEvents]);


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
    if (!newName.trim() || !newAmount.trim()) return;
    addBill({
      name: newName.trim(),
      amount: parseFloat(newAmount) || 0,
      currency: "PHP",
      dueDay: newDueDay,
      dueMonth: newRecurring ? undefined : viewMonth,
      dueYear: newRecurring ? undefined : viewYear,
      category: newCategory,
      budgetCategoryId: newCategoryId || undefined,
      isRecurring: newRecurring,
      reminderEnabled: true,
      isPaid: false,
      color: newColor || undefined
    });
    setNewName("");
    setNewAmount("");
    setNewCategory("Other");
    setNewCategoryId(null);
    setNewRecurring(true);
    setNewColor("");
    setShowAddForm(false);
  };

  const isToday = (day: number) =>
    day === now.getDate() &&
    viewMonth === now.getMonth() &&
    viewYear === now.getFullYear();

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
      className="fixed inset-0 z-[110] bg-[#050505] overflow-y-auto no-scrollbar"
      id="bills-calendar-scroll-area"
    >
      <div className="w-full max-w-xl mx-auto min-h-full pb-12">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#050505]/95 px-6 pt-14 pb-4 flex items-center justify-between border-b border-white/[0.04]">
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
                const billsForDay = day ? eventsByDay[day] : [];
                const activeBillsForDay = billsForDay ? billsForDay.filter((b: any) => !b.isPaid) : [];
                const hasBills = activeBillsForDay && activeBillsForDay.length > 0;
                const isSelected = day === selectedDay;
                const todayFlag = day && isToday(day);

                let art = null;
                let hasCartify = false;
                let hasRegularBill = false;
                
                if (hasBills) {
                  const cartifyBill = activeBillsForDay.find((b: any) => b.category === "Cartify");
                  if (cartifyBill) {
                     hasCartify = true;
                     art = getCategoryArt("Cartify");
                     hasRegularBill = activeBillsForDay.some((b: any) => b.category !== "Cartify");
                  } else {
                     art = getCategoryArt(activeBillsForDay[0].category);
                  }
                }

                // Derive the ring color: custom color on the bill, or fall back to category hex
                const regularBill = hasBills ? activeBillsForDay.find((b: any) => b.category !== "Cartify") : undefined;
                const ringHex = regularBill?.color || (regularBill ? CATEGORY_HEX[regularBill.category] || "#FF9F0A" : undefined);
                const customBillColor = hasBills ? activeBillsForDay[0]?.color : undefined;
                
                const tailwindBgClass = !hasCartify && !customBillColor ? art?.color : "";

                return (
                  <button
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    disabled={!day}
                    className={`w-10 h-10 mx-auto rounded-full flex flex-col items-center justify-center relative transition-transform duration-300 ${
                      isSelected ? "scale-110 shadow-[0_4px_16px_rgba(255,255,255,0.15)] z-10" : "active:scale-90"
                    } ${
                      !day
                        ? ""
                        : hasBills
                        ? hasCartify ? `bg-[#30D158] text-black border-none` : `${tailwindBgClass} text-black border-none`
                        : todayFlag
                        ? "bg-white/15 text-white font-bold border border-white/30"
                        : "text-white/60 hover:bg-white/[0.06] font-medium"
                    }`}
                    style={
                      day && hasBills && hasCartify && hasRegularBill && ringHex
                        ? { boxShadow: `0 0 0 2px #050505, 0 0 0 4px ${ringHex}` }
                        : day && hasBills && !hasCartify && customBillColor
                        ? { backgroundColor: customBillColor }
                        : undefined
                    }
                  >
                    {day && hasBills && art ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span className="absolute top-1.5 text-center text-[9px] font-black opacity-60">
                          {day}
                        </span>
                        
                        {hasCartify ? (
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                          >
                            <art.icon className="w-[18px] h-[18px] mt-2 opacity-90" strokeWidth={2.5} />
                          </motion.div>
                        ) : (
                          <art.icon className="w-[18px] h-[18px] mt-2 opacity-90" strokeWidth={2.5} />
                        )}
                        
                        {activeBillsForDay.length > 1 && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black rounded-full text-white text-[9px] font-bold flex items-center justify-center border border-white/20 shadow-md z-50">
                            {activeBillsForDay.length}
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



          {/* Add Bill Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div ref={formRef} className="bg-[#111111] rounded-[28px] border border-white/[0.08] p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <h4 className="text-[15px] font-bold text-white mb-5 tracking-tight">
                    Add New Bill
                  </h4>

                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Bill name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                    />
                    <div className="flex gap-4">
                      <input
                        type="number"
                        placeholder="Amount (PHP)"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-colors"
                      />
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-[10px] font-bold uppercase tracking-wider pointer-events-none">
                          Day
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          placeholder="1-31"
                          value={newDueDay || ''}
                          onChange={(e) => setNewDueDay(parseInt(e.target.value) || 1)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-3 py-3.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Category selector */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categories.map((cat) => {
                        const art = getCategoryArt(cat.name);
                        const isCatSelected = newCategoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setNewCategoryId(cat.id);
                              setNewCategory(cat.name);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                              isCatSelected
                                ? `${art.color} text-black`
                                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.1] border border-white/5"
                            }`}
                          >
                            <art.icon className="w-3.5 h-3.5" />
                            {cat.name}
                          </button>
                        );
                      })}
                      {/* Fallback Other option if no budget category fits */}
                      <button
                        onClick={() => {
                          setNewCategoryId(null);
                          setNewCategory("Other");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                          !newCategoryId && newCategory === "Other"
                            ? `bg-white/90 text-black`
                            : "bg-white/[0.04] text-white/50 hover:bg-white/[0.1] border border-white/5"
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Other
                      </button>
                    </div>

                    {/* Color selector */}
                    <div className="flex flex-col gap-2 mt-3 mb-1">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Optional Custom Color</span>
                        <div className="flex flex-wrap gap-2.5 px-1">
                            {RAINBOW_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setNewColor(newColor === color ? "" : color)}
                                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${newColor === color ? 'scale-125 shadow-[0_0_12px_rgba(255,255,255,0.3)] border-2 border-white' : 'hover:scale-110 opacity-70 hover:opacity-100 border border-white/10'}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {newColor === color && <Check className="w-[10px] h-[10px] text-black stroke-[4]" />}
                                </button>
                            ))}
                        </div>
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

          {/* Bills Overview */}
          <div className="mb-8 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase mb-0">
                {selectedDay ? 'Selected Day' : 'Upcoming Bills'}
              </h3>
              <button
                onClick={() => {
                  if (selectedDay) {
                    setNewDueDay(selectedDay);
                  }
                  setShowAddForm(true);
                  requestAnimationFrame(() => {
                    setTimeout(() => {
                      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
              >
                <Plus className="w-3.5 h-3.5" />
                New Bill
              </button>
            </div>
            
            {(() => {
              let displayBills = allEvents;
              if (selectedDay) {
                displayBills = allEvents.filter(e => e.dueDay === selectedDay);
              }
              const activeList = displayBills.filter(e => !e.isPaid);
              const completedList = displayBills.filter(e => e.isPaid && (selectedDay ? true : e.dueDay === now.getDate()));
              
              const renderBillCard = (bill: any) => {
                const art = getCategoryArt(bill.category);
                return (
                  <div
                    key={bill.id}
                    onClick={() => { if (!bill.isPaid) setSelectedDay(bill.dueDay); }}
                    className={`relative overflow-hidden flex flex-col justify-between p-4 bg-white/[0.03] rounded-[24px] border border-white/[0.04] transition-all min-h-[110px] ${bill.isPaid ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-white/[0.06] active:scale-[0.98]'}`}
                  >
                    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-[0.15] pointer-events-none ${art.glow} ${bill.isPaid ? 'grayscale' : ''}`} />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div 
                          className={`w-11 h-11 rounded-full flex items-center justify-center text-black shadow-lg ${!bill.color ? art.color : ''} ${bill.isPaid ? 'grayscale' : ''}`}
                          style={bill.color ? { backgroundColor: bill.color } : undefined}
                        >
                          <art.icon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span 
                            className="text-[15px] font-bold tracking-wide"
                            style={{ color: bill.color || '#FFFFFF' }}
                          >
                            {bill.name}
                          </span>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{bill.category}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-bold text-white/60">Day {bill.dueDay}</span>
                          {bill.isRecurring && <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] mt-1">Monthly</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 relative z-10 w-full mb-1">
                      {bill.eventType === 'bill' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePaid(bill as Bill);
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors ${bill.isPaid ? 'bg-[#30D158]/20 text-[#30D158] border-[#30D158]/30' : 'bg-white/[0.04] text-white/50 hover:bg-white/[0.1] border-white/5'}`}
                        >
                          {bill.isPaid && <Check className="w-3 h-3" />}
                          {bill.isPaid ? 'Paid' : 'Mark Paid'}
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleReminder(bill.id); }}
                        className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.1] transition-colors border border-white/5"
                      >
                        {bill.reminderEnabled ? (
                          <Bell className={`w-3.5 h-3.5 text-[#0A84FF]`} />
                        ) : (
                          <BellOff className="w-3.5 h-3.5 text-white/30" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (bill.eventType === 'trip') {
                            if (bill.tripType === 'scheduled') {
                              deleteScheduledTrip(bill.id);
                            } else {
                              deleteSavedTrip(bill.id);
                            }
                          } else {
                            removeBill(bill.id);
                          }
                        }}
                        className={`w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center hover:bg-[#FF453A]/20 transition-colors border border-white/5 ${bill.isPaid ? 'pointer-events-auto cursor-pointer' : ''}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-[#FF453A]" />
                      </button>
                    </div>

                    <div className="flex items-end justify-between mt-5 relative z-10">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="text-[26px] font-black text-white tracking-tighter leading-none">{primarySymbol}{formatCurrency(getPrimaryValue(bill.amount))}</span>
                        <span className="text-[12px] font-bold text-white/40 tracking-tight">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(bill.amount))}</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${bill.isPaid ? 'bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20' : 'bg-white/10 text-white/90 border border-white/5'}`}>
                        {bill.isPaid ? 'Paid' : (bill.eventType === 'trip' ? (bill.tripType === 'scheduled' ? 'Scheduled Trip' : 'Saved Trip') : bill.eventType === 'insurance' ? 'Renewal' : 'Scheduled')}
                      </div>
                    </div>
                  </div>
                );
              };

              return (
                <div className="flex flex-col gap-6">
                  {selectedDay && (
                    <h3 className="text-[13px] font-bold text-white tracking-widest uppercase mb-[-12px]">
                      {MONTH_NAMES[viewMonth]} {selectedDay}
                    </h3>
                  )}
                  {activeList.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {activeList.map(renderBillCard)}
                    </div>
                  )}
                  {activeList.length === 0 && completedList.length === 0 && selectedDay && (
                    <div className="text-center py-6">
                      <p className="text-white/40 text-sm font-medium">No bills due on this day.</p>
                    </div>
                  )}
                  {completedList.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-[11px] font-bold text-white/30 tracking-[0.2em] uppercase mb-1 mt-2">
                        Completed
                      </h3>
                      {completedList.map(renderBillCard)}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
    
    {/* Sync Drift Notice Toast */}
    <AnimatePresence>
      {syncDriftNotice && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-24 left-4 right-4 z-[200] p-4 rounded-2xl bg-[#FF453A]/20 backdrop-blur-xl border border-[#FF453A]/30 flex gap-3 shadow-2xl"
        >
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FF453A]/20 flex items-center justify-center text-[#FF453A]">
            <X className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-medium text-sm">Notice: Logged Amount Remains</span>
            <span className="text-white/70 text-xs mt-0.5 leading-relaxed">
              {syncDriftNotice.name} was marked unpaid, but {primarySymbol}{getPrimaryValue(syncDriftNotice.amount).toLocaleString()} is still logged in the Jar. Remove it manually if that was a mistake.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Confirmation Modal */}
    <AnimatePresence>
      {pendingLogBill && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPendingLogBill(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm bg-[#1C1C1E] rounded-[32px] p-6 relative z-10 flex flex-col items-center text-center shadow-2xl border border-white/10"
          >
            <div className="w-16 h-16 rounded-full bg-[#30D158]/20 flex items-center justify-center mb-4 text-[#30D158]">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Mark as Paid</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Log {pendingLogBill.currency === 'PHP' ? primarySymbol : secondarySymbol}{pendingLogBill.currency === 'PHP' ? getPrimaryValue(pendingLogBill.amount).toLocaleString() : getSecondaryValue(pendingLogBill.amount).toLocaleString()} to the {pendingLogBill.category} budget in your Spend Jar?
            </p>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={handleLogAndViewBudget}
                className="w-full py-3.5 rounded-xl bg-[#30D158] hover:bg-[#30D158]/90 transition-colors text-black font-bold shadow-[0_0_20px_rgba(48,209,88,0.3)]"
              >
                Yes, Log & View Budget
              </button>
              <button
                onClick={confirmLogPaidBill}
                className="w-full py-3.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] transition-colors text-white/90 font-bold"
              >
                Yes, Log it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
