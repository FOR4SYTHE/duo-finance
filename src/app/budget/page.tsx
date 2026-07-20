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
import { getDisplayValue, getCanonicalValue, calculateAllocations } from "@/utils/budgetMath";

const PERIODS: { value: BudgetPeriod; label: string }[] = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: '3-months', label: 'Every 3 Months' },
    { value: '6-months', label: 'Every 6 Months' },
    { value: 'annually', label: 'Annually' }
];

export default function BudgetPage() {
  const { config, categories, setBudget, updateCategory, _hasHydrated } = useBudgetStore();
  const { exchangeRate } = useCurrencyStore();
  
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

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

      {/* Hero Card - Virtual Bank Card Style */}
      <div 
        onClick={() => setIsHeroModalOpen(true)}
        className="w-full rounded-[24px] p-6 mb-8 relative z-20 cursor-pointer overflow-hidden border border-white/10 group shadow-2xl flex flex-col justify-between aspect-[1.58/1]"
        style={{
            background: 'linear-gradient(135deg, #2c2c2e 0%, #1a1a1c 50%, #000000 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Sheen effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[200%] h-[200%] bg-white/[0.03] rounded-full blur-[80px] -mr-[100%] -mt-[100%] transition-opacity group-hover:opacity-100 opacity-50 pointer-events-none" />
        
        <div className="flex justify-between items-start w-full relative z-10">
            <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">Target Budget · {activePeriodLabel}</span>
            <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                <Edit2 className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
            </div>
        </div>

        <div className="flex flex-col relative z-10 w-full mt-auto">
            <div className="text-[2.75rem] leading-none text-white flex items-baseline gap-1 font-medium tracking-tight mb-2 drop-shadow-md">
                <span className="text-2xl text-white/50 font-normal">₱</span>
                <span>{displayTarget.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
            </div>
            
            <div className="flex justify-between items-end w-full">
                <div className="flex flex-col gap-3">
                    <span className="text-white/50 font-medium tracking-wide text-sm">
                        ≈ R{(displayTarget * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                        {displayAllocated > displayTarget ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-[#FF453A] shadow-[0_0_8px_rgba(255,69,58,0.5)] shrink-0" />
                                <span className="text-white/60">
                                    Allocated: ₱{displayAllocated.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </span>
                                <span className="text-white/30 mx-1">·</span>
                                <span className="text-[#FF453A] font-medium">Over-allocated by ₱{(displayAllocated - displayTarget).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_rgba(48,209,88,0.5)] shrink-0" />
                                <span className="text-white/60">
                                    Allocated: ₱{displayAllocated.toLocaleString(undefined, {maximumFractionDigits: 0})} of ₱{displayTarget.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </span>
                                <span className="text-white/30 mx-1">·</span>
                                <span className="text-white/40">₱{displayUnallocated.toLocaleString(undefined, {maximumFractionDigits: 0})} unallocated</span>
                            </>
                        )}
                    </div>
                    {/* Discretionary Spend Jar Allocation */}
                    {displayUnallocated > 0 && config.jarAllowedPercentage !== undefined && (
                        <div 
                            onClick={(e) => {
                                e.stopPropagation();
                                const current = config.jarAllowedPercentage;
                                const next = current === 0 ? 20 : current === 20 ? 50 : current === 50 ? 100 : 0;
                                useBudgetStore.getState().setJarPercentage(next);
                            }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-pointer mt-1 self-start"
                        >
                            <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">Spend Jar Allowance:</span>
                            <span className="text-white font-medium text-xs">{config.jarAllowedPercentage}%</span>
                        </div>
                    )}
                </div>
                
                {/* Monogram Mark */}
                <div className="flex items-center justify-center w-10 h-6 border border-white/20 rounded-md bg-white/5 shrink-0 ml-4">
                    <span className="text-[10px] font-bold text-white/40 italic tracking-wider">BL</span>
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

        <div className="grid grid-cols-2 gap-3 pb-6">
            {categories.map((cat) => {
                const Icon = (Icons as any)[cat.icon] || Icons.HelpCircle;
                const catTarget = getDisplayValue(cat.targetAmount, config.period);
                
                return (
                    <div 
                        key={cat.id} 
                        onClick={() => setEditingCategory(cat)}
                        className="rounded-[24px] p-4 flex flex-col cursor-pointer transition-colors active:scale-[0.98] border border-white/5"
                        style={{ 
                            backgroundColor: `${cat.color}11`, // very soft tint
                            borderColor: `${cat.color}22`
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${cat.color}22` }}
                            >
                                <Icon className="w-5 h-5" style={{ color: cat.color }} />
                            </div>
                        </div>
                        <span className="text-white font-medium mb-1 drop-shadow-sm">{cat.name}</span>
                        <span className="text-white/90 font-semibold mb-0.5">₱{catTarget.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        <span className="text-white/50 text-[10px] uppercase tracking-wider">
                            ≈ R{(catTarget * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </span>
                    </div>
                );
            })}
            
            {/* Add Category Tile */}
            <div 
                onClick={() => setIsAddCategoryOpen(true)}
                className="bg-white/[0.01] border border-white/[0.05] border-dashed rounded-[24px] p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] transition-colors text-white/30 hover:text-white/60 min-h-[140px]"
            >
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-xs font-medium uppercase tracking-widest">Add Category</span>
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

      <AddCategorySheet 
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />
    </div>
  );
}
