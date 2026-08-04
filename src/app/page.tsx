"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Baby,
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
import { DueTodayBanner } from "@/components/home/DueTodayBanner";
import { ConjoiningAvatar } from "@/components/home/ConjoiningAvatar";
import { useNotificationEngine } from "@/hooks/useNotificationEngine";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/animations";
import { filterEntriesByMonth } from "@/utils/budgetFilters";
import { useDevStore } from "@/store/useDevStore";

export default function Home() {
  useNotificationEngine();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const showDevTools = useDevStore((state) => state.showDevTools);
  const isDevAccount = (user?.email?.startsWith('jonathanquidlat') ?? false) && showDevTools;

  const config = useBudgetStore((state) => state.config);
  const setLastSeenMonth = useBudgetStore((state) => state.setLastSeenMonth);
  const _hasHydrated = useBudgetStore((state) => state._hasHydrated);
  const notifications = useBudgetStore((state) => state.notifications);
  const addNotification = useBudgetStore((state) => state.addNotification);
  
  const entries = useSpendStore((state) => state.entries);
  const injectMockEntries = useSpendStore((state) => state.injectMockEntries);
  
  const exchangeRate = useCurrencyStore((state) => state.exchangeRate);
  
  const { primarySymbol, secondarySymbol, getSecondaryValue } = useDualCurrency();
  
  const currentMonthEntries = useMemo(() => filterEntriesByMonth(entries, config.activeMonth || new Date().toISOString().slice(0, 7)), [entries, config.activeMonth]);
  const totalSpent = useMemo(() => currentMonthEntries.reduce((sum, entry) => sum + entry.amount, 0), [currentMonthEntries]);
  const zarTotalSpent = useMemo(() => getSecondaryValue(totalSpent), [totalSpent, getSecondaryValue]);

  const allowedSpend = config.targetAmount * ((config.jarAllowedPercentage || 20) / 100);
  const percentage = allowedSpend > 0 ? (totalSpent / allowedSpend) * 100 : 0;

  let phpColor = "text-white";
  let zarColor = "text-white/60";
  if (totalSpent > 0) {
    if (percentage < 50) {
      phpColor = "text-[#30D158]"; // Green
      zarColor = "text-[#30D158]/70";
    } else if (percentage >= 50 && percentage < 70) {
      phpColor = "text-[#E8A33D]"; // Orange
      zarColor = "text-[#E8A33D]/70";
    } else {
      phpColor = "text-[#FF453A]"; // Red
      zarColor = "text-[#FF453A]/70";
    }
  }

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
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [lastSeen, setLastSeen] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");
  const [recapYear, setRecapYear] = useState(new Date().getFullYear());
  const [showInsuranceFamily, setShowInsuranceFamily] = useState(false);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // setInterval removed — it was re-rendering the entire Home component tree every 4.5s.
  // showInsuranceFamily toggle is not visually used anywhere currently.

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
    } else if (action?.payload?.actionType === 'view_calendar') {
      setShowNotifCenter(false);
      setShowCalendar(true); // Assuming this triggers a calendar modal or scrolls to it
    } else if (action?.payload?.actionType === 'view_cartify') {
      setShowNotifCenter(false);
      window.location.href = '/cartify';
    } else if (action?.payload?.actionType === 'view_budget') {
      setShowNotifCenter(false);
      window.location.href = '/budget';
    }
  };

  if (!mounted || isInitializing) {
    return (
      <div className="flex flex-col w-full min-h-screen px-6 pt-12 bg-[#000000]">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
             <div className="w-[44px] h-[44px] rounded-full bg-white/5 animate-pulse" />
             <div className="flex flex-col gap-2">
               <div className="w-16 h-2 bg-white/5 animate-pulse rounded-full" />
               <div className="w-24 h-4 bg-white/5 animate-pulse rounded-full" />
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
        </div>
        
        {/* Banner Skeleton */}
        <div className="w-full h-12 bg-white/5 animate-pulse rounded-2xl mb-6" />

        {/* Hero Card Skeleton */}
        <div className="w-full aspect-[16/10] min-h-[220px] bg-white/5 animate-pulse rounded-[24px] mb-6" />
        
        {/* Calendar Card Skeleton */}
        <div className="w-full h-[140px] bg-white/5 animate-pulse rounded-[28px] mb-8" />
        
        {/* Grid Skeletons */}
        <div className="grid grid-cols-2 gap-4">
           <div className="aspect-[5/3] bg-white/5 animate-pulse rounded-[28px]" />
           <div className="aspect-[5/3] bg-white/5 animate-pulse rounded-[28px]" />
           <div className="aspect-[5/3] bg-white/5 animate-pulse rounded-[28px]" />
           <div className="aspect-[5/3] bg-white/5 animate-pulse rounded-[28px]" />
        </div>
      </div>
    );
  }

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
        className="flex flex-col w-full font-sans"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <ConjoiningAvatar onTap={() => { router.push('/profile'); }} />
            <div className="flex flex-col justify-center">
              <span className="block text-white/40 text-[9px] font-bold tracking-[0.25em] uppercase mb-1 ml-[2px]">
                DUO ACTIVE
              </span>
              <span className="text-white/90 text-[18px] font-semibold tracking-tight leading-none">
                Good Evening
              </span>
            </div>
          </div>
        <div className="flex items-center gap-3">
          {isDevAccount && (
          <div className="flex gap-2">
            <button 
              title="Test Auth Flow"
              onClick={() => {
                localStorage.removeItem('duo-auth-storage');
                const { useAuthStore } = require('@/store/useAuthStore');
                if (useAuthStore.getState) {
                  useAuthStore.getState().logout();
                }
                window.location.href = '/welcome';
              }}
              className="w-3 h-3 rounded-full bg-[#FF375F] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(255,55,95,0.5)]"
            />
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
            <button 
              title="Test Busy Month Data"
              onClick={() => {
                const mockEntries = Array.from({ length: 35 }).map((_, i) => ({
                  id: `mock-${crypto.randomUUID()}`,
                  amount: Math.floor(Math.random() * 3000) + 100,
                  currency: 'PHP' as const,
                  category: ['Groceries', 'Rent', 'Utilities', 'Child Care', 'Bills'][Math.floor(Math.random() * 5)],
                  note: `Mock Entry ${i + 1}`,
                  timestamp: new Date(2026, 5, Math.floor(Math.random() * 28) + 1).getTime()
                }));
                injectMockEntries(mockEntries);
                setLastSeen("2026-06");
                setShowSummaryModal(true);
              }}
              className="w-3 h-3 rounded-full bg-[#30D158] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(48,209,88,0.5)]"
            />
            <button 
              title="Test Monthly Summary"
              onClick={() => {
                setLastSeen("2026-07");
                setCurrentMonth("2026-08");
                setShowRollover(true);
              }}
              className="w-3 h-3 rounded-full bg-[#0A84FF] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(10,132,255,0.5)]"
            />
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
            <button 
              title="Test Entrance Animation"
              onClick={() => {
                sessionStorage.removeItem('hasSeenHomeAnimation');
                window.location.reload();
              }}
              className="w-3 h-3 rounded-full bg-[#BF5AF2] hover:scale-125 transition-transform shadow-[0_0_8px_rgba(191,90,242,0.5)]"
            />
          </div>
          )}
          
          <button 
            onClick={() => setShowNotifCenter(true)}
            className="w-10 h-10 rounded-full bg-[#1A1A1E]/80 flex items-center justify-center border border-white/[0.06] hover:bg-white/[0.08] transition-colors relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          >
            <Bell className="w-5 h-5 text-white/70" />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#FF453A] rounded-full shadow-[0_0_8px_#FF453A]" />
            )}
          </button>
        </div>
      </motion.div>

      {/* V1 Due Today Banner */}
      <motion.div variants={itemVariants}>
        <DueTodayBanner onTap={() => setShowCalendar(true)} />
      </motion.div>

      {/* Monthly Report Hero Card (photo-backed, budget overlaid) */}
      <motion.div variants={itemVariants}>
        <MonthlyReportCard />
      </motion.div>

      {/* Bills & Calendar Overview */}
      <motion.div variants={itemVariants} className="mb-8" id="calendar-section">
        <BillsCalendarCard 
          forceOpenFullCalendar={showCalendar}
          onCalendarClose={() => setShowCalendar(false)}
        />
      </motion.div>

      {/* Apple Watch Style Bento UI */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-1 px-2">
          Lifestyle & Integrations
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Insurance Tracker */}
          <Link href="/insurance" className="aspect-[5/3] bg-[#1A1A1A] rounded-[28px] p-4 relative overflow-hidden group hover:scale-[0.97] transition-transform flex flex-col justify-between shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)] border border-white/5">
            
            {/* Title moved to top left */}
            <div className="relative z-20 flex flex-col items-start w-full">
              <span className="text-white/50 text-[9px] font-bold tracking-widest uppercase mb-0.5">Life & Health</span>
              <span className="text-white text-[17px] font-black tracking-tight leading-none">Insurance</span>
            </div>
            
            {/* Art Asset in the background/right */}
            <div className="absolute top-0 right-[-10px] bottom-0 w-[65%] z-10 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
              <img 
                src="/InsuranceCard-Art.webp" 
                alt="Insurance Art" 
                className="w-full h-full object-contain object-right" 
              />
            </div>
          </Link>

          {/* Child Care Card */}
          <Link href="/childcare" className="aspect-[5/3] bg-[#1A1A1A] rounded-[28px] p-4 relative overflow-hidden group hover:scale-[0.97] transition-transform flex flex-col justify-between shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)] border border-white/5">
            {/* Title moved to top left */}
            <div className="relative z-20 flex flex-col items-start w-full">
              <span className="text-white/50 text-[9px] font-bold tracking-widest uppercase mb-0.5">Kids & School</span>
              <span className="text-white text-[17px] font-black tracking-tight leading-none">Child Care</span>
            </div>
            
            {/* Art Asset in the background/right */}
            <div className="absolute top-0 right-[-10px] bottom-0 w-[65%] z-10 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
              <img 
                src="/ChildCare-CardArt.webp" 
                alt="Child Care Art" 
                className="w-full h-full object-contain object-right" 
              />
            </div>
          </Link>

          {/* Spend Jar */}
          <div 
            className="aspect-[5/3] bg-[#1A1A1A] rounded-[28px] relative overflow-hidden group hover:scale-[0.97] transition-transform shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.4)] border border-white/5 cursor-pointer [-webkit-tap-highlight-color:transparent] select-none"
            onClick={(e) => {
              // Trigger the spew coins explosion from the ATM's position (left side)
              const event = new CustomEvent('spew-coins', {
                detail: {
                  x: 60, // approximate center of the ATM image
                  y: 60
                }
              });
              window.dispatchEvent(event);
            }}
          >
            {/* Animated Piggy Background (now shoots coins from center-left) */}
            <AnimatedPiggyBank />
            
            <div className="flex flex-row items-center justify-between w-full h-full relative z-20 px-5 pointer-events-none">
              {/* ATM Hero Image (Left side) */}
              <div className="w-[45%] h-full flex items-center justify-center relative">
                <img 
                  src="/images/spend-machine.webp" 
                  alt="Spend Machine" 
                  className="w-[120%] h-auto object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.9)] translate-y-1 -translate-x-3 group-hover:scale-[1.08] group-active:scale-[0.92] transition-transform duration-300 ease-out" 
                />
              </div>
              
              {/* Text Area (Right side) */}
              <div className="flex flex-col items-end text-right w-[55%] pt-1">
                <span className="text-white/50 text-[9px] font-bold tracking-widest uppercase mb-1">Spend Jar</span>
                <span className={`${phpColor} text-[22px] font-black tracking-tighter leading-none mb-0.5 transition-colors duration-300`}>
                  {primarySymbol}{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
                <span className={`${zarColor} text-[10px] font-semibold tracking-wide transition-colors duration-300`}>
                  ≈ {secondarySymbol}{zarTotalSpent.toLocaleString(undefined, {maximumFractionDigits: 0})}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Insight Card */}
          <div className="aspect-[5/3] rounded-[32px] p-1.5 relative bg-gradient-to-b from-white/10 to-white/5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex">
            <div className="flex-1 bg-gradient-to-b from-[#1C1C1E] to-[#151516] rounded-[26px] p-5 relative flex flex-col items-center justify-center border border-black/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
              {/* Top Center Mini Icon */}
              {/* CSS keyframe float — runs on compositor thread, not main JS thread */}
              <div 
                className="mb-2 relative z-10"
                style={{ animation: 'gentle-float 5s ease-in-out infinite' }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-b from-[#2A2A2C] to-[#1A1A1C] flex items-center justify-center border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                  <Shield className="w-3.5 h-3.5 text-[#30D158]" />
                </div>
              </div>

              <p className="text-[#E5E5E5] text-[15px] font-medium leading-[1.3] text-center tracking-tight relative z-10 px-1">
                <span className="text-white/40">Prioritize your</span><br/>emergency fund first this month.
              </p>

              {/* Floating Right Mini Squircle — CSS keyframe, not Framer Motion */}
              <div 
                className="absolute right-4 bottom-5 w-7 h-7 rounded-[8px] bg-gradient-to-br from-white/30 to-white/5 p-[1px] shadow-[0_8px_16px_rgba(0,0,0,0.4)] z-20"
                style={{ animation: 'gentle-float-delayed 6.5s ease-in-out infinite' }}
              >
                <div className="w-full h-full bg-[#1A1A1C] rounded-[7px] flex items-center justify-center">
                   <PiggyBank className="w-4 h-4 text-[#FF9F0A]" strokeWidth={2.5} />
                </div>
              </div>

              {/* CSS keyframes for floating — compositor thread, zero main-thread cost */}
              <style jsx>{`
                @keyframes gentle-float {
                  0%, 100% { transform: translateY(-2px) translateX(-0.5px); }
                  50% { transform: translateY(2px) translateX(0.5px); }
                }
                @keyframes gentle-float-delayed {
                  0%, 100% { transform: translateY(-3px) rotate(3deg); }
                  50% { transform: translateY(3px) rotate(9deg); }
                }
              `}</style>
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
                   <span 
                       className="ml-1.5 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]"
                   >
                       AI
                   </span>
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