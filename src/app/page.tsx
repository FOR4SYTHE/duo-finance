"use client";

import Link from "next/link";
import {
  Bell,
  Calculator,
  PiggyBank,
  ShoppingCart,
  ScanLine,
  ArrowRight,
  PieChart,
} from "lucide-react";
import { MonthlyReportCard } from "@/components/home/MonthlyReportCard";
import { BillsCalendarCard } from "@/components/home/BillsCalendarCard";
import { MonthRecap } from "@/components/home/MonthRecap";
import { MonthlySummary } from "@/components/home/MonthlySummary";
import { NotificationCenter } from "@/components/home/NotificationCenter";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useEffect, useState, useMemo } from "react";

export default function Home() {
  const { config, setLastSeenMonth, _hasHydrated, notifications, addNotification } = useBudgetStore();
  const [showRollover, setShowRollover] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  
  const [lastSeen, setLastSeen] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    if (_hasHydrated && config.lastSeenMonth) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      
      // If the calendar month has moved past the last seen month, trigger rollover
      if (currentMonthKey > config.lastSeenMonth) {
        setLastSeen(config.lastSeenMonth);
        setCurrentMonth(currentMonthKey);
        setShowRollover(true);
      }
    }
  }, [_hasHydrated, config.lastSeenMonth]);

  const handleRolloverClose = () => {
    setShowRollover(false);
    setLastSeenMonth(currentMonth);

    // Give them a notification so they can easily find the report later!
    addNotification({
      title: 'Month in Review',
      message: 'Your monthly summary report is ready to view. See how you performed against your budget.',
      type: 'report',
      read: false,
      action: {
        label: 'View Report',
        payload: { actionType: 'view_report', monthKey: lastSeen }
      }
    });
  };

  const handleNotificationAction = (action: any) => {
    if (action?.payload?.actionType === 'view_report') {
      setShowNotifCenter(false);
      setLastSeen(action.payload.monthKey);
      setShowSummaryModal(true);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full px-6 pt-12 pb-8">
      {showRollover && (
        <MonthRecap 
          lastSeenMonthKey={lastSeen} 
          currentMonthKey={currentMonth} 
          onClose={handleRolloverClose} 
        />
      )}

      {showSummaryModal && (
        <MonthlySummary 
          monthKey={lastSeen} 
          onClose={() => setShowSummaryModal(false)} 
        />
      )}

      <NotificationCenter
        isOpen={showNotifCenter}
        onClose={() => setShowNotifCenter(false)}
        onActionClick={handleNotificationAction}
      />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-20">
        <div className="flex flex-col">
          <span className="text-white/40 text-[11px] font-medium tracking-[0.2em] uppercase mb-1">
            Welcome back
          </span>
          <h1 className="text-2xl text-white font-light tracking-tight">
            Sam & Jon
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* TEMP TRICK: Buttons for testing */}
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setLastSeen("2026-07");
                setCurrentMonth("2026-08");
                setShowRollover(true);
              }}
              className="px-3 py-2 bg-[#0A84FF]/20 rounded-full text-[10px] uppercase tracking-widest font-bold text-[#0A84FF] hover:bg-[#0A84FF]/30 transition-colors border border-[#0A84FF]/30"
            >
              Test Rollover
            </button>
            <button 
              onClick={() => {
                addNotification({
                  title: 'Welcome to Duo Finance',
                  message: 'This is what a premium notification looks like! You can trigger actions from here.',
                  type: 'system',
                  read: false,
                  action: { label: 'Got it!' }
                });
              }}
              className="px-3 py-2 bg-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors border border-white/5"
            >
              Test Notif
            </button>
          </div>
          
          <button 
            onClick={() => setShowNotifCenter(true)}
            className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors relative"
          >
            <Bell className="w-5 h-5 text-white/70" />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-[#FF453A] rounded-full border-2 border-[#0A0A0C] shadow-[0_0_8px_#FF453A]" />
            )}
          </button>
        </div>
      </div>

      {/* Monthly Report Hero Card (photo-backed, budget overlaid) */}
      <MonthlyReportCard />

      {/* Bills Calendar Card */}
      <BillsCalendarCard />

      {/* Quick Actions Row */}
      <div className="flex justify-between items-start mb-8 relative z-20 px-2">
        <Link
          href="/calculator"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <Calculator className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Calculate
          </span>
        </Link>
        <Link
          href="/jar"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <PiggyBank className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Log Spend
          </span>
        </Link>
        <Link
          href="/cartify"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Start Trip
          </span>
        </Link>
        <div className="flex flex-col items-center gap-3 opacity-40 cursor-not-allowed relative">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/[0.02] flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Scan
          </span>
          <div className="absolute -top-2 -right-2 bg-black px-1.5 py-0.5 rounded text-[8px] text-white/80 border border-white/10 uppercase tracking-widest">
            Soon
          </div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/40 text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 px-1">
          Modules
        </h2>

        <Link
          href="/budget"
          className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8A33D]/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#E8A33D]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Budgeting</span>
              <span className="text-white/50 text-xs tracking-wide">
                Plan monthly targets
              </span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>

        <Link
          href="/jar"
          className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[#30D158]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Spend Jar</span>
              <span className="text-white/50 text-xs tracking-wide">
                Log everyday expenses
              </span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>

        <Link
          href="/cartify"
          className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0654B]/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#F0654B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Cartify</span>
              <span className="text-white/50 text-xs tracking-wide">
                Live shopping tracker
              </span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 group-hover:text-white/80 group-hover:bg-white/10 transition-all">
      <ArrowRight className="w-4 h-4" />
    </div>
  );
}