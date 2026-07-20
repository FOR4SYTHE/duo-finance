"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Plus, Edit2 } from "lucide-react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { BudgetPeriod, BudgetCategory } from "@/types/finance";
import { SmartTools } from "@/components/budget/SmartTools";
import { AmountInputModal } from "@/components/budget/AmountInputModal";
import { AddCategorySheet } from "@/components/budget/AddCategorySheet";
import { CategoryDetailsSheet } from "@/components/budget/CategoryDetailsSheet";
import { CategoryMenuSheet } from "@/components/budget/CategoryMenuSheet";
import { CardSettingsSheet } from "@/components/budget/CardSettingsSheet";
import { getDisplayValue, getCanonicalValue, calculateAllocations } from "@/utils/budgetMath";
import { format, addMonths, subMonths, parseISO } from "date-fns";

const PERIODS: { value: BudgetPeriod; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: '3-months', label: 'Every 3 Months' },
    { value: '6-months', label: 'Every 6 Months' },
    { value: 'annually', label: 'Annually' }
];

export default function BudgetPage() {
  const { config, categories, setBudget, updateCategory, _hasHydrated, setActiveMonth } = useBudgetStore();
  const { exchangeRate } = useCurrencyStore();
  
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [detailsCategory, setDetailsCategory] = useState<BudgetCategory | null>(null);
  const [menuCategory, setMenuCategory] = useState<BudgetCategory | null>(null);
  const [isCardSettingsOpen, setIsCardSettingsOpen] = useState(false);

  // Computed Values
  const { displayTarget, displayAllocated, displayUnallocated } = calculateAllocations(config, categories);

  const handleHeroSave = (amount: number) => {
      const canonical = getCanonicalValue(amount, config.period);
      setBudget(canonical, config.period);
      setIsHeroModalOpen(false);
  };

  const handleCategorySave = (amount: number) => {
      if (editingCategory) {
          const canonical = getCanonicalValue(amount, config.period);
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

  const currentMonth = format(new Date(), 'yyyy-MM');
  const displayMonth = config.activeMonth || currentMonth;

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

  if (!_hasHydrated) {
      return (
          <div className="flex flex-col w-full pb-8 pt-12 px-6">
              <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl text-white font-light tracking-tight">Budget</h1>
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
        <h1 className="text-3xl text-white font-light tracking-tight">Budget</h1>
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
      <div 
        onClick={() => setIsHeroModalOpen(true)}
        className={`w-full rounded-[24px] p-6 mb-8 relative z-20 cursor-pointer overflow-hidden border ${skin.border} group shadow-2xl flex flex-col justify-between aspect-[1.58/1] transition-all duration-500`}
        style={{
            background: skin.background,
            boxShadow: skin.boxShadow
        }}
      >
        {/* Sheen effect */}
        <div className={`absolute inset-0 ${skin.sheen} pointer-events-none transition-all duration-700`} />
        {config.cardSkin !== 'revolut-metal' && config.cardSkin !== 'amex-platinum' && (
            <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-white/[0.03] rounded-full blur-[80px] -mr-[100%] -mt-[100%] transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none" />
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
                <div className={`w-8 h-8 rounded-full ${skin.buttonBg} flex items-center justify-center transition-colors`}>
                    <Edit2 className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>

        <div className="flex flex-col relative z-10 w-full mt-auto">
            <div className={`text-[2.75rem] leading-none ${skin.textColor} flex items-baseline gap-1 font-medium tracking-tight mb-2 drop-shadow-md`}>
                {displayTarget > 0 ? (
                    <>
                        <span className={`text-2xl ${skin.textSecondary} font-normal`}>₱</span>
                        <span>{displayTarget.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                    </>
                ) : (
                    <span className={`text-[1.75rem] ${skin.textSecondary} font-medium tracking-tight`}>Set target budget</span>
                )}
            </div>
            
            <div className="flex justify-between items-end w-full">
                <div className="flex flex-col gap-3">
                    {displayTarget > 0 && (
                        <span className={`${skin.textSecondary} font-medium tracking-wide text-sm`}>
                            ≈ R{(displayTarget * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </span>
                    )}

                    {(displayTarget > 0 || displayAllocated > 0) && (
                        <div className="flex items-center gap-2 text-xs">
                            {displayAllocated > displayTarget ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.5)] shrink-0" />
                                    <span className={`${skin.textSecondary}`}>
                                        Allocated: ₱{displayAllocated.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                    <span className={`${skin.textTertiary} mx-1`}>·</span>
                                    <span className="text-[#FF453A] font-medium">Over by ₱{(displayAllocated - displayTarget).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.5)] shrink-0" />
                                    <span className={`${skin.textSecondary}`}>
                                        Allocated: ₱{displayAllocated.toLocaleString(undefined, {maximumFractionDigits: 0})} of ₱{displayTarget.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                    <span className={`${skin.textTertiary} mx-1`}>·</span>
                                    <span className={`${skin.textTertiary}`}>₱{displayUnallocated.toLocaleString(undefined, {maximumFractionDigits: 0})} unallocated</span>
                                </>
                            )}
                        </div>
                    )}
                    {/* Discretionary Spend Jar Allocation */}
                    {displayUnallocated > 0 && config.jarAllowedPercentage !== undefined && (
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                const current = config.jarAllowedPercentage;
                                const next = current === 0 ? 20 : current === 20 ? 50 : current === 50 ? 100 : 0;
                                useBudgetStore.getState().setJarPercentage(next);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${skin.jarBg} transition-colors cursor-pointer mt-1 self-start`}
                        >
                            <span className={`${skin.textSecondary} text-[10px] uppercase tracking-wider font-semibold`}>Spend Jar Allowance:</span>
                            <span className={`${skin.textColor} font-medium text-xs`}>{config.jarAllowedPercentage}%</span>
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

      <SmartTools />

      {/* Category Bento Grid */}
      <div className="flex flex-col relative z-20 flex-1">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Target Allocations</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-6">
            {categories.map((cat) => {
                const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                const catTarget = getDisplayValue(cat.targetAmount, config.period);
                
                return (
                    <div 
                        key={cat.id} 
                        onClick={() => {
                            const nameLower = cat.name.toLowerCase().trim();
                            const isSubCatCategory = cat.subCategories || nameLower === 'utilities' || nameLower === 'bills';
                            if (isSubCatCategory) {
                                setDetailsCategory(cat);
                            } else {
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
                        <div className="relative z-10 flex flex-col">
                            <span className="text-white/80 font-medium text-[15px] mb-1.5 tracking-wide">{cat.name}</span>
                            {catTarget > 0 ? (
                                <>
                                    <span className="text-white font-semibold text-xl tracking-tight mb-0.5">₱{catTarget.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                                    <span className="text-white/40 text-[11px] font-medium tracking-wider">
                                        ≈ R{(catTarget * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </span>
                                </>
                            ) : (
                                <span className="text-white/30 text-sm font-medium mt-0.5 tracking-wide">Set amount</span>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {/* Add Category Tile */}
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
            isOpen={!!editingCategory}
            onClose={() => setEditingCategory(null)}
            onConfirm={handleCategorySave}
            title={editingCategory.name}
            initialAmount={getDisplayValue(editingCategory.targetAmount, config.period)}
          />
      )}

      <CategoryDetailsSheet
        isOpen={!!detailsCategory}
        onClose={() => setDetailsCategory(null)}
        categoryId={detailsCategory?.id || null}
      />

      <CategoryMenuSheet
        isOpen={!!menuCategory}
        onClose={() => setMenuCategory(null)}
        category={menuCategory}
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
