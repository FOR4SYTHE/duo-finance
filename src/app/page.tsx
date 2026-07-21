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
  Shield,
  Sparkles,
} from "lucide-react";
import { MonthlyReportCard } from "@/components/home/MonthlyReportCard";
import { BillsCalendarCard } from "@/components/home/BillsCalendarCard";
import { MonthRecap } from "@/components/home/MonthRecap";
import { YearRecap } from "@/components/home/YearRecap";
import { MonthlySummary } from "@/components/home/MonthlySummary";
import { YearlySummary } from "@/components/home/YearlySummary";
import { NotificationCenter } from "@/components/home/NotificationCenter";
import { AnimatedPiggyBank } from "@/components/home/AnimatedPiggyBank";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { config, setLastSeenMonth, _hasHydrated, notifications, addNotification } = useBudgetStore();
  const [showRollover, setShowRollover] = useState(false);
  const [showYearRollover, setShowYearRollover] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showYearSummaryModal, setShowYearSummaryModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  
  const [lastSeen, setLastSeen] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [recapYear, setRecapYear] = useState(new Date().getFullYear());
  const [showInsuranceFamily, setShowInsuranceFamily] = useState(false);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowInsuranceFamily(prev => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (_hasHydrated && config.lastSeenMonth) {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      
      const lastYear = parseInt(config.lastSeenMonth.split("-")[0]);
      const currentYear = now.getFullYear();

      // Yearly Rollover takes precedence
      if (currentYear > lastYear) {
        setRecapYear(lastYear);
        setLastSeen(config.lastSeenMonth);
        setCurrentMonth(currentMonthKey);
        setShowYearRollover(true);
      } 
      // Monthly Rollover
      else if (currentMonthKey > config.lastSeenMonth) {
        setLastSeen(config.lastSeenMonth);
        setCurrentMonth(currentMonthKey);
        setShowRollover(true);
      }
    }
  }, [config.lastSeenMonth, _hasHydrated]);

  const handleRolloverClose = () => {
    if (showYearRollover) {
      addNotification({
        title: 'Year in Review',
        message: `Your ${recapYear} yearly summary report is ready. See how you performed over the last 12 months.`,
        type: 'report',
        read: false,
        action: {
          label: 'View Report',
          payload: { actionType: 'view_year_report', year: recapYear }
        }
      });
    } else {
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
    }

    setShowRollover(false);
    setShowYearRollover(false);
    setLastSeenMonth(currentMonth);
  };

  const handleNotificationAction = (action: any) => {
    if (action?.payload?.actionType === 'view_report') {
      setShowNotifCenter(false);
      setLastSeen(action.payload.monthKey);
      setShowSummaryModal(true);
    } else if (action?.payload?.actionType === 'view_year_report') {
      setShowNotifCenter(false);
      setRecapYear(action.payload.year);
      setShowYearSummaryModal(true);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full px-6 pt-12 pb-32">
      {showYearRollover && (
        <YearRecap 
          year={recapYear} 
          onClose={handleRolloverClose} 
        />
      )}

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

      {showYearSummaryModal && (
        <YearlySummary 
          year={recapYear} 
          onClose={() => setShowYearSummaryModal(false)} 
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
                setRecapYear(2026);
                setLastSeen("2026-12");
                setCurrentMonth("2027-01");
                setShowYearRollover(true);
              }}
              className="px-3 py-2 bg-[#D4AF37]/20 rounded-full text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors border border-[#D4AF37]/30"
            >
              Test Yearly
            </button>
            <button 
              onClick={() => {
                setLastSeen("2026-07");
                setCurrentMonth("2026-08");
                setShowRollover(true);
              }}
              className="px-3 py-2 bg-[#0A84FF]/20 rounded-full text-[10px] uppercase tracking-widest font-bold text-[#0A84FF] hover:bg-[#0A84FF]/30 transition-colors border border-[#0A84FF]/30"
            >
              Test Monthly
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

      {/* Apple Watch Style Bento UI */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1 px-2">
          Lifestyle & Integrations
        </h2>
        <div className="grid grid-cols-2 gap-4">
          
          {/* Spend Jar (Modeled after USDC card) */}
          <Link href="/jar" className="aspect-square bg-[#E8E8E8] rounded-[36px] p-5 relative overflow-hidden group hover:scale-[0.97] transition-transform flex flex-col shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_12px_24px_rgba(0,0,0,0.15)] border border-black/5">
            {/* Animated Piggy Background */}
            <AnimatedPiggyBank />
            
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center shadow-md relative z-10 mb-3">
              <PiggyBank className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            
            <div className="flex flex-col items-start relative z-10">
              <span className="text-black/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">Spend Jar</span>
              <span className="text-black text-[28px] font-black tracking-tighter leading-none mb-1">₱1,240</span>
              <span className="text-[#FF3B30] text-[11px] font-extrabold tracking-wide">-₱120</span>
            </div>
          </Link>

          {/* Insurance Tracker (Family Line Art Animation) */}
          <div className="aspect-square bg-[#E8E8E8] border border-black/5 rounded-[36px] relative overflow-hidden group hover:scale-[0.97] transition-transform flex flex-col shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),0_12px_24px_rgba(0,0,0,0.15)]">
            {/* The Line Art Background */}
            <div className="absolute inset-0 w-full h-full opacity-80 mix-blend-multiply">
              <AnimatePresence mode="wait">
                {showInsuranceFamily ? (
                  <motion.div
                    key="family"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image 
                      src="/insurance-family-waving.png" 
                      alt="Family Waving Art" 
                      fill 
                      className="object-cover object-bottom" 
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image 
                      src="/insurance-bg-only.png" 
                      alt="House Background Art" 
                      fill 
                      className="object-cover object-bottom" 
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* The Text Foreground - moved to top left, away from art */}
            <div className="flex flex-col items-start relative z-10 p-2 mt-4 ml-4">
              <span className="text-black/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">Car & Health</span>
              <span className="text-black text-2xl font-black tracking-tight leading-none">Insurance</span>
            </div>
          </div>

          {/* Cashback & Deals (Modeled after "It's 3° now" typography card) */}
          <div className="col-span-2 bg-[#1C1C1E] rounded-[36px] p-7 relative overflow-hidden group hover:scale-[0.98] transition-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)]">
             <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF9F0A]/10 blur-[50px] rounded-full -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FF453A]/10 blur-[50px] rounded-full translate-x-1/2 translate-y-1/2" />
             
             <h3 className="text-white/80 text-3xl font-medium leading-[1.1] tracking-tight relative z-10 w-[85%]">
               Scan <span className="font-semibold text-white">malls, Grab, Shopee,</span> & <span className="font-semibold text-white">Flights</span> for deals.
             </h3>

             <div className="flex items-center gap-2 mt-8 relative z-10">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm shadow-md">
                 <span role="img" aria-label="shopping">🛍️</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm shadow-md">
                 <span role="img" aria-label="flight">✈️</span>
               </div>
               <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase ml-2">Cashback AI</span>
             </div>
          </div>
        </div>
      </div>

      {/* Massive spacer to guarantee scroll clearance over the bottom nav */}
      <div className="h-40 shrink-0 pointer-events-none" />
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