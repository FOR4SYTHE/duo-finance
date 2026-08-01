"use client";

// Cache buster for Turbopack HMR
import { useState, useEffect } from "react";
import { ChevronDown, Plus, Edit2 } from "lucide-react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { premiumPageVariants } from "@/utils/animations";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { useBillsStore } from "@/store/useBillsStore";
import { useSubscriptionsStore } from "@/store/useSubscriptionsStore";
import { BudgetPeriod, BudgetCategory } from "@/types/finance";
import { SmartTools } from "@/components/budget/SmartTools";
import { AmountInputModal } from "@/components/budget/AmountInputModal";
import { AddCategorySheet } from "@/components/budget/AddCategorySheet";
import { CategoryDetailsSheet } from "@/components/budget/CategoryDetailsSheet";
import { CategoryMenuSheet } from "@/components/budget/CategoryMenuSheet";
import { CategoryHistorySheet } from "@/components/budget/CategoryHistorySheet";
import { CardSettingsSheet } from "@/components/budget/CardSettingsSheet";
import * as budgetMath from "@/utils/budgetMath";
import * as budgetFilters from "@/utils/budgetFilters";
import { calculateHouseholdPulse, computeCategoryStatus, computeCategoryMemory } from "@/utils/budgetPulse";
import { format, addMonths, subMonths, parseISO } from "date-fns";

const PERIODS: { value: BudgetPeriod; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: '3-months', label: 'Every 3 Months' },
    { value: '6-months', label: 'Every 6 Months' },
    { value: 'annually', label: 'Annually' }
];

export default function BudgetPage() {
    // Always animate on mount for a premium page transition feel

  const config = useBudgetStore((state) => state.config);
  const categories = useBudgetStore((state) => state.categories);
  const setBudget = useBudgetStore((state) => state.setBudget);
  const updateCategory = useBudgetStore((state) => state.updateCategory);
  const _hasHydrated = useBudgetStore((state) => state._hasHydrated);
  const setActiveMonth = useBudgetStore((state) => state.setActiveMonth);
  const syncSnapshots = useBudgetStore((state) => state.syncSnapshots);
  
  const entries = useSpendStore((state) => state.entries);
  
  const exchangeRate = useCurrencyStore((state) => state.exchangeRate);
  const primaryCurrency = useCurrencyStore((state) => state.primaryCurrency);
  
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
  const bills = useBillsStore((state) => state.bills);
  const subscriptions = useSubscriptionsStore((state) => state.subscriptions);
  
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [detailsCategory, setDetailsCategory] = useState<BudgetCategory | null>(null);
  const [menuCategory, setMenuCategory] = useState<BudgetCategory | null>(null);
  const [historyCategory, setHistoryCategory] = useState<BudgetCategory | null>(null);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);

  const currentMonth = budgetFilters.getEffectiveCurrentMonth();
  const displayMonth = config.activeMonth || currentMonth;
  const isPastMonth = displayMonth < currentMonth;

  useEffect(() => {
      if (_hasHydrated) {
          if (config.activeMonth && config.activeMonth < currentMonth) {
              setActiveMonth(currentMonth);
          }
          
          syncSnapshots(entries, currentMonth);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, currentMonth]);

  // Computed Values
  const monthEntries = budgetFilters.filterEntriesByMonth(entries, displayMonth);
  const totalSpent = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const { displayTarget, displayAllocated, displayUnallocated } = budgetMath.calculateAllocations(config, categories, totalSpent, displayMonth);
  
  const pulse = calculateHouseholdPulse(config, categories, monthEntries, bills, displayMonth);

  const handleHeroSave = (amount: number) => {
      const canonical = budgetMath.getCanonicalValue(amount, config.period);
      setBudget(canonical, config.period);
      setIsHeroModalOpen(false);
  };

  const handleCategorySave = (amount: number) => {
      if (editingCategory) {
          const canonical = budgetMath.getCanonicalValue(amount, config.period);
          updateCategory(editingCategory.id, { targetAmount: canonical });
      }
      setEditingCategory(null);
  };

  const handleUseEstimate = (rent: number, utilities: number) => {
      const rentCat = categories.find(c => c.name.toLowerCase() === 'rent');
      const utilCat = categories.find(c => c.name.toLowerCase() === 'utilities');
      
      if (rentCat) updateCategory(rentCat.id, { targetAmount: rent });
      if (utilCat) updateCategory(utilCat.id, { targetAmount: utilities });
      
      if (config.period !== 'monthly') {
          setBudget(config.targetAmount, 'monthly');
      }
  };

  const handlePrevMonth = () => {
      const prev = subMonths(parseISO(`${displayMonth}-01`), 1);
      setActiveMonth(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
      const next = addMonths(parseISO(`${displayMonth}-01`), 1);
      setActiveMonth(format(next, 'yyyy-MM'));
  };

  const getCardSkinStyle = (skinId?: string) => {
      switch (skinId) {
          case 'apple-titanium':
              return {
                  background: 'linear-gradient(135deg, #f5f5f7 0%, #d2d2d7 50%, #b0b0b5 100%)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.1)',
                  textColor: 'text-black/80',
                  textSecondary: 'text-black/50',
                  textTertiary: 'text-black/30',
                  sheen: 'bg-gradient-to-tr from-white/40 via-transparent to-white/40',
                  border: 'border-white/40',
                  markBg: 'bg-black/5 border-black/10 text-black/40',
                  progressBg: 'bg-black/5',
                  buttonBg: 'bg-black/5 hover:bg-black/10 text-black/50 hover:text-black/80',
                  jarBg: 'bg-black/5 hover:bg-black/10'
              };
          case 'revolut-metal':
              return {
                  background: 'linear-gradient(135deg, #f0f0f0 0%, #c0c0c0 100%)', // base silver
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.8)',
                  textColor: 'text-black/90',
                  textSecondary: 'text-black/50',
                  textTertiary: 'text-black/40',
                  sheen: 'bg-[radial-gradient(circle_at_30%_20%,rgba(167,255,181,0.95)_0%,rgba(90,230,160,0.8)_40%,rgba(20,190,170,0.5)_70%,transparent_100%)] mix-blend-multiply',
                  border: 'border-white/40',
                  markBg: 'bg-black/5 border-black/10 text-black/50',
                  progressBg: 'bg-black/5',
                  buttonBg: 'bg-black/5 hover:bg-black/10 text-black/50 hover:text-black/80',
                  jarBg: 'bg-black/5 hover:bg-black/10'
              };
          case 'amex-platinum':
              return {
                  background: 'linear-gradient(135deg, #d3d9df 0%, #a6b2c1 40%, #8e9db0 60%, #cbd2da 100%)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.9)',
                  textColor: 'text-[#1a365d]/90',
                  textSecondary: 'text-[#1a365d]/70',
                  textTertiary: 'text-[#1a365d]/50',
                  sheen: 'bg-gradient-to-tr from-white/40 via-transparent to-black/10',
                  border: 'border-[#1a365d]/20',
                  markBg: 'bg-[#1a365d]/5 border-[#1a365d]/20 text-[#1a365d]/60',
                  progressBg: 'bg-[#1a365d]/10',
                  buttonBg: 'bg-[#1a365d]/5 hover:bg-[#1a365d]/10 text-[#1a365d]/60 hover:text-[#1a365d]/90',
                  jarBg: 'bg-[#1a365d]/5 hover:bg-[#1a365d]/10'
              };
          case 'default-dark':
          default:
              return {
                  background: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #000000 100%)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  textColor: 'text-white',
                  textSecondary: 'text-white/50',
                  textTertiary: 'text-white/30',
                  sheen: 'bg-gradient-to-tr from-white/0 via-white/5 to-white/0',
                  border: 'border-white/10',
                  markBg: 'bg-white/5 border-white/20 text-white/40',
                  progressBg: 'bg-white/5',
                  buttonBg: 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white',
                  jarBg: 'bg-white/5 hover:bg-white/10'
              };
      }
  };

  const skin = getCardSkinStyle(config.cardSkin);
  const customBg = config.customPhotos?.['budget-card'];

  if (!_hasHydrated) {
      return (
          <div className="flex flex-col w-full pb-8 pt-12 px-6">
              <div className="flex justify-between items-center px-4 w-full relative z-10 shrink-0">
                  <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                          <h1 className="text-3xl text-white font-light tracking-tight flex items-center">
                              Budget
                              {isPastMonth && (
                                  <span className="ml-3 px-2 py-0.5 rounded-md bg-white/10 text-white/50 text-[10px] uppercase font-bold tracking-widest border border-white/5">
                                      Archived
                                  </span>
                              )}
                          </h1>
                      </div>
                      <span className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Household Overview</span>
                  </div>
                  <div className="w-24 h-9 bg-white/[0.04] rounded-full animate-pulse" />
              </div>
              <div className="w-full rounded-[24px] aspect-[1.58/1] bg-white/[0.02] border border-white/[0.03] animate-pulse mb-8" />
              <div className="w-full rounded-[32px] h-32 bg-white/[0.02] border border-white/[0.03] animate-pulse mb-8" />
              <div className="grid grid-cols-2 gap-3 pb-6">
                  <div className="rounded-[24px] h-32 bg-white/[0.02] border border-white/[0.03] animate-pulse" />
                  <div className="rounded-[24px] h-32 bg-white/[0.02] border border-white/[0.03] animate-pulse" />
              </div>
          </div>
      );
  }

  const activePeriodLabel = PERIODS.find(p => p.value === config.period)?.label || 'Monthly';

  return (
    <div className="flex flex-col w-full pb-8 pt-12 px-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-30 shrink-0">
        <h1 className="text-3xl text-white font-light tracking-tight flex items-center">
            Budget
            {isPastMonth && (
                <span className="ml-3 px-2 py-0.5 rounded-md bg-white/10 text-white/50 text-[10px] uppercase font-bold tracking-widest border border-white/5">
                    Archived
                </span>
            )}
        </h1>
        <div className="relative">
            <button 
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-4 py-2 rounded-full border border-white/[0.05] hover:bg-white/[0.08] transition-colors"
            >
                <span className="text-xs font-semibold text-white/70 tracking-widest uppercase">{activePeriodLabel}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
            </button>
            <AnimatePresence>
                {isPeriodDropdownOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-[calc(100%+8px)] right-0 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-40"
                    >
                        {PERIODS.map(p => (
                            <button 
                                key={p.value}
                                onClick={() => { setBudget(config.targetAmount, p.value); setIsPeriodDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors ${p.value === config.period ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5'}`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex justify-between items-center mb-6 px-4">
        <button onClick={handlePrevMonth} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
            <Icons.ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-white/90 font-medium tracking-widest uppercase text-sm">
            {format(parseISO(`${displayMonth}-01`), 'MMMM yyyy')}
        </span>
        <button onClick={handleNextMonth} className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
            <Icons.ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Card - Virtual Bank Card Style */}
      <div>
        <div 
          onClick={() => !isPastMonth && setIsHeroModalOpen(true)}
          className={`w-full rounded-[24px] p-6 mb-8 relative z-20 ${!isPastMonth ? 'cursor-pointer' : ''} overflow-hidden border ${skin.border} group shadow-2xl flex flex-col justify-between transition-all duration-500`}
        style={{
            background: customBg ? 'transparent' : skin.background,
            boxShadow: skin.boxShadow
        }}
      >
        {/* Custom Background Image - Optimized for LCP */}
        {customBg && (
            <img 
                src={customBg}
                alt=""
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none z-0"
            />
        )}
        
        {/* Sheen effect & Gradients over custom bg */}
        <div className={`absolute inset-0 ${customBg ? 'bg-black/40 ' : ''}${skin.sheen} pointer-events-none transition-all duration-700 z-0`} />
        {config.cardSkin !== 'revolut-metal' && config.cardSkin !== 'amex-platinum' && (
            <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-white/[0.03] rounded-full blur-[80px] -mr-[100%] -mt-[100%] transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none z-0" />
        )}

        {config.cardSkin === 'amex-platinum' && (
            <>
                {/* Amex Border */}
                <div className="absolute inset-2 border-[1px] border-[#1a365d]/20 rounded-[16px] pointer-events-none" />
                <div className="absolute inset-3 border-[0.5px] border-[#1a365d]/10 rounded-[12px] pointer-events-none" />
            </>
        )}

        <div className="flex justify-between items-start w-full relative z-10">
            <span className={`${skin.textSecondary} text-xs font-semibold tracking-widest uppercase`}>Target Budget · {activePeriodLabel}</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCardSettingsOpen(true);
                    }}
                    className={`w-8 h-8 rounded-full ${skin.buttonBg} flex items-center justify-center transition-colors`}
                >
                    <Icons.Settings2 className="w-3.5 h-3.5" />
                </button>
                {!isPastMonth && (
                    <div className={`w-8 h-8 rounded-full ${skin.buttonBg} flex items-center justify-center transition-colors`}>
                        <Edit2 className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>
        </div>

        <div className="flex flex-col relative z-10 w-full mt-4">
            
            {/* HOUSEHOLD PULSE UI */}
            <div className="flex flex-col mb-6">
                <div className="flex items-center gap-2 mb-2">
                    {pulse.status !== 'Setup' && pulse.status !== 'Archived' && (
                        <div className={`w-2 h-2 rounded-full ${
                            pulse.status === 'Excellent' ? 'bg-[#30D158]' :
                            pulse.status === 'On Track' ? 'bg-[#30D158]' :
                            pulse.status === 'Tight' ? 'bg-[#E8A33D]' : 'bg-[#FF453A]'
                        } shadow-[0_0_8px_currentColor]`} />
                    )}
                    <span className={`${skin.textSecondary} text-xs uppercase font-bold tracking-widest`}>
                        {pulse.status}
                    </span>
                    {pulse.status !== 'Setup' && pulse.status !== 'Archived' && pulse.unpaidBillsCount > 0 && (
                        <span className={`${skin.textTertiary} text-[10px] ml-1 tracking-wider`}>
                            ({pulse.unpaidBillsCount} unpaid bills)
                        </span>
                    )}
                </div>

                {pulse.status === 'Setup' ? (
                    <div className={`text-[1.75rem] leading-tight ${skin.textColor} font-medium tracking-tight drop-shadow-md`}>
                        Set your budget<br/>to see your Pulse
                    </div>
                ) : pulse.status === 'Archived' ? (
                    <div className={`text-[2rem] leading-none ${skin.textColor} font-medium tracking-tight drop-shadow-md`}>
                        Archived
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <span className={`${skin.textSecondary} text-[10px] uppercase font-bold tracking-widest mb-1 opacity-70`}>Safe to Spend Today</span>
                        <div className={`text-[3.25rem] leading-none ${pulse.safeToSpendToday < 0 ? 'text-[#FF453A]' : skin.textColor} flex items-baseline gap-1 font-medium tracking-tight drop-shadow-md`}>
                            <span className={`text-2xl ${pulse.safeToSpendToday < 0 ? 'text-[#FF453A]/70' : skin.textSecondary} font-normal`}>{primarySymbol}</span>
                            <span>{getPrimaryValue(pulse.safeToSpendToday).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                        </div>
                        <span className={`${skin.textSecondary} font-medium tracking-wide text-sm mt-2 opacity-80`}>
                            ≈ {secondarySymbol}{getSecondaryValue(pulse.safeToSpendToday).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-end w-full">
                <div className="flex flex-col gap-3 flex-1">
                    {/* SECONDARY ROW: Target, Allocated, Spent, Left */}
                    <div className={`flex flex-col gap-3 p-4 rounded-2xl bg-black/10 border border-white/5`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`${skin.textSecondary} text-[10px] uppercase tracking-widest font-bold`}>Master Plan</span>
                            <span className={`${skin.textColor} text-sm font-semibold`}>
                                {primarySymbol}{getPrimaryValue(displayTarget).toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </span>
                            <span className={`${skin.textTertiary} text-[10px]`}>
                                ≈ {secondarySymbol}{getSecondaryValue(displayTarget).toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Allocated Column */}
                            <div className="flex flex-col gap-0.5">
                                <span className={`${skin.textTertiary} text-[9px] uppercase tracking-widest font-bold`}>Allocated</span>
                                <span className={`font-semibold ${displayAllocated > displayTarget ? 'text-[#FF453A]' : skin.textColor} text-xs`}>
                                    {primarySymbol}{getPrimaryValue(displayAllocated).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </span>
                            </div>

                            <div className={`w-[1px] h-5 border-l ${skin.border} opacity-50`} />

                            {/* Spent Column */}
                            <div className="flex flex-col gap-0.5">
                                <span className={`${skin.textTertiary} text-[9px] uppercase tracking-widest font-bold`}>Spent</span>
                                <span className={`font-semibold text-xs ${totalSpent > displayTarget ? 'text-[#FF453A]' : skin.textColor}`}>
                                    {primarySymbol}{getPrimaryValue(totalSpent).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </span>
                            </div>

                            <div className={`w-[1px] h-5 border-l ${skin.border} opacity-50`} />

                            {/* Left Column */}
                            <div className="flex flex-col gap-0.5">
                                <span className={`${skin.textTertiary} text-[9px] uppercase tracking-widest font-bold`}>Left</span>
                                <span className={`font-semibold text-xs ${totalSpent > displayTarget ? 'text-[#FF453A]' : skin.textColor}`}>
                                    {primarySymbol}{getPrimaryValue(Math.max(0, displayTarget - totalSpent)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Overall Progress Bar */}
                    {(displayTarget > 0) && (
                        <div className="w-full mt-2">
                            <div className={`w-full h-1.5 rounded-full ${skin.progressBg} overflow-hidden flex`}>
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out ${totalSpent > displayTarget ? 'bg-[#FF453A]' : 'bg-[#30D158]'}`}
                                    style={{ width: `${Math.min((totalSpent / displayTarget) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center mt-1.5 px-0.5">
                                <span className={`${skin.textTertiary} text-[9px] font-medium tracking-wider uppercase`}>{((totalSpent / displayTarget) * 100).toFixed(0)}% Spent</span>
                            </div>
                        </div>
                    )}
                    {displayUnallocated > 0 && config.jarAllowedPercentage !== undefined && (
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                const current = config.jarAllowedPercentage;
                                const next = current === 0 ? 20 : current === 20 ? 50 : current === 50 ? 100 : 0;
                                useBudgetStore.getState().setJarPercentage(next);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${skin.jarBg} transition-colors cursor-pointer mt-3 self-start`}
                        >
                            <span className={`${skin.textSecondary} text-[10px] uppercase tracking-wider font-semibold`}>Spend Jar:</span>
                            <span className={`${skin.textColor} font-medium text-xs`}>
                                {config.jarAllowedPercentage}% · {primarySymbol}{getPrimaryValue(displayUnallocated * (config.jarAllowedPercentage / 100)).toLocaleString(undefined, {maximumFractionDigits: 0})} allowed
                            </span>
                        </div>
                    )}
                </div>
                
                {/* Monogram Mark */}
                <div className={`flex items-center justify-center h-6 px-3 border rounded-md shrink-0 ml-4 ${skin.markBg}`}>
                    <span className={`text-[10px] font-bold italic tracking-wider whitespace-nowrap`}>
                        {config.cardName || 'BL'}
                    </span>
                </div>
            </div>
        </div>
      </div>
      </div>

      {!isPastMonth && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Planning Studio</h2>
          </div>
          <SmartTools />
        </div>
      )}

      {/* Category Bento Grid */}
      <div className="flex flex-col relative z-20 flex-1">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Household Plan</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-6">
            {categories.map((cat) => {
                const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                const historicalTarget = (displayMonth && cat.targetHistory?.[displayMonth]) !== undefined ? cat.targetHistory![displayMonth] : cat.targetAmount;
                const catTarget = budgetMath.getDisplayValue(historicalTarget, config.period);
                
                const catSpent = budgetFilters.sumByCategory(monthEntries, cat.name);
                
                // Calculate committed bills for this category
                const catBills = bills.filter(b => b.category === cat.name);
                const catSubs = subscriptions.filter(s => s.category === cat.name);
                const committed = catBills.reduce((sum, b) => sum + b.amount, 0) + 
                                  catSubs.reduce((sum, s) => sum + s.amount, 0);

                const catPercent = catTarget > 0 ? (catSpent / catTarget) * 100 : 0;
                const catHealth = catPercent >= 90 ? '#FF453A' : catPercent >= 60 ? '#E8A33D' : '#30D158';
                
                const statusBadge = computeCategoryStatus(catSpent, catTarget, cat.isFixedObligation, cat.id, bills, displayMonth);
                const memoryLine = computeCategoryMemory(cat, entries, displayMonth, getPrimaryValue, primarySymbol);
                
                return (
                    <div 
                        key={cat.id} 
                        onClick={() => {
                            const nameLower = cat.name.toLowerCase().trim();
                            const isSubCatCategory = cat.subCategories || nameLower === 'utilities' || nameLower === 'bills';
                            if (isSubCatCategory) {
                                setDetailsCategory(cat);
                            } else if (!isPastMonth) {
                                setEditingCategory(cat);
                            }
                        }}
                        className="rounded-[28px] p-5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.97] hover:brightness-110 group relative overflow-hidden min-h-[160px]"
                        style={{ 
                            background: `linear-gradient(145deg, ${cat.color}15 0%, ${cat.color}05 100%)`,
                            boxShadow: `inset 0 1px 1px rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.3), inset 0 0 0 1px ${cat.color}15`,
                        }}
                    >
                        {/* Soft light burst on hover */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundColor: cat.color }} />
                        
                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div 
                                className="w-11 h-11 rounded-full flex items-center justify-center relative"
                                style={{ 
                                    backgroundColor: `${cat.color}25`,
                                    boxShadow: `0 8px 16px ${cat.color}20, inset 0 1px 1px rgba(255,255,255,0.15)`,
                                    border: `1px solid ${cat.color}30`
                                }}
                            >
                                <Icon className="w-5 h-5 relative z-10" style={{ color: cat.color }} />
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuCategory(cat);
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.1] text-white/30 hover:text-white transition-colors border border-white/5"
                            >
                                <Icons.MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="relative z-10 flex flex-col mt-auto">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-white/80 font-medium text-[15px] tracking-wide">{cat.name}</span>
                                {catTarget > 0 && (
                                    <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm border ${statusBadge.color} ${statusBadge.bg}`}>
                                        {statusBadge.label}
                                    </span>
                                )}
                            </div>
                            {catTarget > 0 ? (
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-1 mb-0.5">
                                        <span className="text-white font-semibold text-xl tracking-tight">{primarySymbol}{getPrimaryValue(catTarget).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                        <span className="text-white/40 text-[10px] font-medium tracking-wider ml-1">≈ {secondarySymbol}{getSecondaryValue(catTarget).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex justify-between items-start text-[10px]">
                                            <span className="text-white/50 tracking-wide uppercase mt-0.5">Spent</span>
                                            <div className="flex flex-col items-end">
                                                <span className="text-white font-medium">{primarySymbol}{getPrimaryValue(catSpent).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                                <span className="text-white/30 text-[8.5px] font-medium tracking-widest mt-0.5">≈ {secondarySymbol}{getSecondaryValue(catSpent).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                            </div>
                                        </div>
                                        
                                        {committed > 0 && (
                                            <div className="flex justify-between items-start text-[10px]">
                                                <span className="text-white/40 tracking-wide uppercase mt-0.5">Bills</span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-white/70 font-medium">{primarySymbol}{getPrimaryValue(committed).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                                    <span className="text-white/30 text-[8.5px] font-medium tracking-widest mt-0.5">≈ {secondarySymbol}{getSecondaryValue(committed).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-start text-[10px]">
                                            <span className="text-white/50 tracking-wide uppercase mt-0.5">Left</span>
                                            <div className="flex flex-col items-end">
                                                <span className={`font-medium ${catSpent > catTarget ? 'text-[#FF453A]' : 'text-white'}`}>
                                                    {primarySymbol}{getPrimaryValue(Math.max(0, catTarget - catSpent)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </span>
                                                <span className="text-white/30 text-[8.5px] font-medium tracking-widest mt-0.5">
                                                    ≈ {secondarySymbol}{getSecondaryValue(Math.max(0, catTarget - catSpent)).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full h-1 bg-white/[0.05] rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000`}
                                            style={{ 
                                                width: `${Math.min(catPercent, 100)}%`,
                                                backgroundColor: catHealth
                                            }}
                                        />
                                    </div>
                                    
                                    {memoryLine && (
                                        <div className="mt-2 text-white/30 text-[9px] font-medium tracking-wide">
                                            {memoryLine}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-white/30 text-sm font-medium mt-0.5 tracking-wide">Set amount</span>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {/* Add Category Tile */}
            {isPastMonth ? (
                <div className="flex items-center justify-center p-3 rounded-[20px] bg-white/[0.02] border border-white/[0.02] text-white/30 text-xs font-medium min-h-[160px]">
                    Editing locked for past months
                </div>
            ) : (
                <div 
                    onClick={() => setIsAddCategoryOpen(true)}
                    className="rounded-[28px] p-5 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/[0.04] active:scale-[0.97] min-h-[160px] relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.01)',
                        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/[0.02] pointer-events-none" />
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/[0.03] mb-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/[0.05]">
                        <Plus className="w-5 h-5 text-white/40" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Add Category</span>
                </div>
            )}
        </div>
      </div>

      <AmountInputModal 
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        onConfirm={handleHeroSave}
        title="Overall Budget"
        initialAmount={displayTarget}
      />

      {editingCategory && (
          <AmountInputModal 
            isOpen={true}
            onClose={() => setEditingCategory(null)}
            onConfirm={handleCategorySave}
            initialAmount={budgetMath.getDisplayValue(editingCategory.targetAmount, config.period)}
            title={`${editingCategory.name} Target`}
          />
      )}

      {isPastMonth ? (
          <CategoryDetailsSheet
              isOpen={!!detailsCategory}
              onClose={() => setDetailsCategory(null)}
              categoryId={detailsCategory?.id || null}
              monthKey={displayMonth}
              readOnly={true}
          />
      ) : (
          <CategoryDetailsSheet
              isOpen={!!detailsCategory}
              onClose={() => setDetailsCategory(null)}
              categoryId={detailsCategory?.id || null}
              monthKey={displayMonth}
          />
      )}

      <CategoryMenuSheet 
        isOpen={!!menuCategory}
        onClose={() => setMenuCategory(null)}
        category={categories.find(c => c.id === menuCategory?.id) || null}
        onViewHistory={() => {
          if (menuCategory) setHistoryCategory(menuCategory);
        }}
      />
      
      <CategoryHistorySheet 
        isOpen={!!historyCategory}
        onClose={() => setHistoryCategory(null)}
        category={historyCategory}
      />

      <CardSettingsSheet
        isOpen={isCardSettingsOpen}
        onClose={() => setIsCardSettingsOpen(false)}
      />

      <AddCategorySheet 
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />
    </div>
  );
}
