"use client";

import Link from "next/link";
import {
  Bell,
  Calculator,
  PiggyBank,
  ShoppingCart,
  ScanLine,
  Target,
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
import { CashbackDealsRadar } from "@/components/home/CashbackDealsRadar";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 40, opacity: 0, scale: 0.95, filter: 'blur(12px)' },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20,
      mass: 0.8
    }
  }
};

export default function Home() {
  const { config, setLastSeenMonth, _hasHydrated, notifications, addNotification } = useBudgetStore();
  const { entries } = useSpendStore();
  const { exchangeRate } = useCurrencyStore();
  
  const totalSpent = useMemo(() => entries.reduce((sum, entry) => sum + entry.amount, 0), [entries]);
  const zarTotalSpent = useMemo(() => Math.round(totalSpent * exchangeRate), [totalSpent, exchangeRate]);

  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!sessionStorage.getItem('hasSeenHomeAnimation')) {
      setIsInitialLoad(true);
      sessionStorage.setItem('hasSeenHomeAnimation', 'true');
    }
  }, []);

  const [showRollover, setShowRollover] = useState(false);
  const [showYearRollover, setShowYearRollover] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showYearSummaryModal, setShowYearSummaryModal] = useState(false);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [showDealsRadar, setShowDealsRadar] = useState(false);
  
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
    <div suppressHydrationWarning className="flex flex-col w-full min-h-full px-6 pt-12 pb-32">
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

      <AnimatePresence>
        {showDealsRadar && (
          <CashbackDealsRadar onClose={() => setShowDealsRadar(false)} />
        )}
      </AnimatePresence>

      <NotificationCenter
        isOpen={showNotifCenter}
        onClose={() => setShowNotifCenter(false)}
        onActionClick={handleNotificationAction}
      />
      
      <motion.div
        key={isInitialLoad ? "animate" : "static"}
        variants={containerVariants}
        initial={isInitialLoad ? "hidden" : false}
        animate="visible"
        className="flex flex-col w-full"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-6 relative z-20">
        <div className="flex flex-col">
          <span className="text-white/40 text-[11px] font-medium tracking-[0.2em] uppercase mb-1">
            Welcome back
          </span>
          <h1 className="text-2xl text-white font-light tracking-tight">
            Sam & Jon
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* TEMP TRICK: Compact test dots */}
          <div className="flex gap-2">
            {/* Yearly: Gold */}
            <button 
              title="Test Yearly Summary"
              onClick={() => {
                setRecapYear(2026);
                setLastSeen("2026-12");
                setCurrentMonth("2027-01");
                setShowYearRollover(true);
              }}
              className="w-3 h-3 rounded-full bg-[#D4AF37] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(212,175,55,0.5)]"
            />
            {/* Monthly: Blue */}
            <button 
              title="Test Monthly Summary"
              onClick={() => {
                setLastSeen("2026-07");
                setCurrentMonth("2026-08");
                setShowRollover(true);
              }}
              className="w-3 h-3 rounded-full bg-[#0A84FF] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(10,132,255,0.5)]"
            />
            {/* Notif: White */}
            <button 
              title="Test Notification"
              onClick={() => {
                addNotification({
                  title: 'Welcome to Duo Finance',
                  message: 'This is what a premium notification looks like! You can trigger actions from here.',
                  type: 'system',
                  read: false,
                  action: { label: 'Got it!' }
                });
              }}
              className="w-3 h-3 rounded-full bg-white hover:scale-125 transition-transform shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            />
            {/* Animation: Purple */}
            <button 
              title="Test Entrance Animation"
              onClick={() => {
                sessionStorage.removeItem('hasSeenHomeAnimation');
                window.location.reload();
              }}
              className="w-3 h-3 rounded-full bg-[#BF5AF2] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(191,90,242,0.5)]"
            />
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
      </motion.div>

      {/* Monthly Report Hero Card (photo-backed, budget overlaid) */}
      <motion.div variants={itemVariants}>
        <MonthlyReportCard />
      </motion.div>

      {/* Bills Calendar Card */}
      <motion.div variants={itemVariants}>
        <BillsCalendarCard />
      </motion.div>

      {/* Premium Quick Actions Row - Morphing Liquid Circles */}
      <motion.div variants={itemVariants} className="flex justify-between items-start mb-8 relative z-20 px-2">
        
        {/* Calculate */}
        <Link href="/calculator" className="flex flex-col items-center gap-2 group w-[72px]">
          <motion.div 
            initial={{ borderRadius: 34 }} // Perfect circle for 68px
            whileHover={{ borderRadius: 18, scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }}
            whileTap={{ borderRadius: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-[68px] h-[68px] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Calculator className="w-7 h-7 text-white/90 drop-shadow-md relative z-10" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[11px] font-semibold text-white/70 tracking-wide group-hover:text-white transition-colors">
            Calculate
          </span>
        </Link>

        {/* Goals */}
        <Link href="/budget?tool=goals" className="flex flex-col items-center gap-2 group w-[72px]">
          <motion.div 
            initial={{ borderRadius: 34 }}
            whileHover={{ borderRadius: 18, scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }}
            whileTap={{ borderRadius: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-[68px] h-[68px] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Target className="w-7 h-7 text-[#D4AF37] drop-shadow-md relative z-10" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[11px] font-semibold text-white/70 tracking-wide group-hover:text-white transition-colors">
            Goals
          </span>
        </Link>

        {/* Cartify */}
        <Link href="/cartify" className="flex flex-col items-center gap-2 group w-[72px]">
          <motion.div 
            initial={{ borderRadius: 34 }}
            whileHover={{ borderRadius: 18, scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }}
            whileTap={{ borderRadius: 16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-[68px] h-[68px] bg-gradient-to-b from-white/[0.08] to-transparent border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A84FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShoppingCart className="w-7 h-7 text-[#0A84FF] drop-shadow-md relative z-10" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[11px] font-semibold text-white/70 tracking-wide group-hover:text-white transition-colors">
            Cartify
          </span>
        </Link>

        {/* Scan (Soon) */}
        <div className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed relative w-[72px]">
          <motion.div 
            initial={{ borderRadius: 34 }}
            className="w-[68px] h-[68px] bg-white/[0.02] border border-white/[0.02] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <ScanLine className="w-7 h-7 text-white/40 relative z-10" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[11px] font-semibold text-white/40 tracking-wide">
            Scan
          </span>
          <div className="absolute -top-2 -right-1 bg-[#1A1A1A] px-1.5 py-0.5 rounded text-[8px] text-white/70 border border-white/10 shadow-lg uppercase tracking-widest backdrop-blur-md">
            Soon
          </div>
        </div>
      </motion.div>

      {/* Apple Watch Style Bento UI */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1 px-2">
          Lifestyle & Integrations
        </h2>
        <div className="grid grid-cols-2 gap-4">
          
          {/* Spend Jar (Modeled after USDC card) */}
          <Link href="/jar" className="aspect-square bg-[#1A1A1A] rounded-[36px] p-5 relative overflow-hidden group hover:scale-[0.97] transition-transform flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)] border border-white/5">
            {/* Animated Piggy Background */}
            <AnimatedPiggyBank />
            
            <div className="flex justify-between items-start relative z-10 w-full">
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shadow-md backdrop-blur-md">
                <PiggyBank className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              
              <div className="flex flex-col items-end text-right">
                <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">Spend Jar</span>
                <span className="text-white text-[28px] font-black tracking-tighter leading-none mb-1">
                  ₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
                <span className="text-white/60 text-[11px] font-semibold tracking-wide">
                  ≈ R{zarTotalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </Link>

          {/* Insurance Tracker (Family Line Art Animation) */}
          <div className="aspect-square bg-[#1A1A1A] border border-white/5 rounded-[36px] relative overflow-hidden group hover:scale-[0.97] transition-transform flex flex-col shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)]">
            {/* The Line Art Background */}
            <div className="absolute inset-0 w-full h-full opacity-60 invert mix-blend-screen">
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
              <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase mb-0.5">Car & Health</span>
              <span className="text-white text-2xl font-black tracking-tight leading-none">Insurance</span>
            </div>
          </div>

          {/* Cashback & Deals (Modeled after "It's 3° now" typography card) */}
          <button 
            onClick={() => setShowDealsRadar(true)}
            className="text-left w-full col-span-2 bg-[#1C1C1E] rounded-[36px] p-7 relative overflow-hidden group hover:scale-[0.98] transition-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)]"
          >
             <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF9F0A]/10 blur-[50px] rounded-full -translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FF453A]/10 blur-[50px] rounded-full translate-x-1/2 translate-y-1/2" />
             
             <h3 className="text-white/70 text-2xl sm:text-3xl font-medium leading-[1.25] tracking-tight relative z-10 w-full">
               Scan <span className="font-bold text-[#D70F64]">Foodpanda</span>, <span className="font-bold text-[#00B14F]">Grab</span>, <span className="font-bold text-[#EE4D2D]">Shopee</span>, <span className="font-bold text-[#3877FF]">Lazada</span>, <span className="font-bold text-[#FF5722]">Klook</span>, <span className="font-bold text-[#38BDF8]">Agoda</span> & <span className="font-bold text-[#00A3E0]">Cheapflights</span> for deals.
             </h3>

             <div className="flex items-center gap-2 mt-6 relative z-10">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm shadow-md">
                 <span role="img" aria-label="shopping">🛍️</span>
               </div>
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm shadow-md">
                 <span role="img" aria-label="flight">✈️</span>
               </div>
               <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase ml-2 flex items-center">
                   CASHBACK
                   <motion.span 
                       animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="ml-1.5 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]"
                   >
                       AI
                   </motion.span>
               </span>
             </div>
          </button>
        </div>
      </motion.div>
      </motion.div>

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