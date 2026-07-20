"use client";
import { useState } from "react";
import { Calculator, TrendingUp, Activity, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBudgetStore } from "../../store/useBudgetStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";

// ==========================================
// STATIC CONSTANTS
// ==========================================
export const PH_INFLATION_RATE = 0.05; // 5% annual PH inflation
export const UTILITY_SEASONAL_BUFFER = 0.25; // 25% utility buffer
export const GROCERY_SEASONAL_BUFFER = 0.08; // 8% grocery buffer

// ==========================================
// SHARED COMPONENTS
// ==========================================

function PillTabRow({ tabs, activeTab, onSelect }: { tabs: { id: string, icon: any, label: string }[], activeTab: string | null, onSelect: (id: string) => void }) {
    return (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 w-full shrink-0 sm:justify-between sm:overflow-visible sm:pb-0">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onSelect(activeTab === tab.id ? '' : tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full whitespace-nowrap transition-all text-sm shrink-0 border ${
                        activeTab === tab.id
                            ? 'bg-white text-black font-medium border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                            : 'bg-white/[0.03] text-white/60 border-white/[0.05] hover:bg-white/[0.08] hover:text-white'
                    }`}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
}

function ToolCardShell({ children, isLoading, error, onRetry, title }: { children: React.ReactNode, isLoading?: boolean, error?: string | null, onRetry?: () => void, title?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
            exit={{ opacity: 0, height: 0, marginTop: 0 }} 
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="overflow-hidden w-full"
        >
            <div className="bg-black/40 rounded-2xl p-6 flex flex-col gap-4 border border-white/5 relative z-10">
                {title && <h3 className="text-white/70 font-medium text-sm tracking-wide">{title}</h3>}
                
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Activity className="w-6 h-6 text-white/50 animate-pulse" />
                    </div>
                ) : error ? (
                    <div className="flex justify-between items-center bg-[#FF453A]/10 border border-[#FF453A]/20 p-4 rounded-xl">
                        <span className="text-[#FF453A] text-sm font-medium">{error}</span>
                        {onRetry && (
                            <button onClick={onRetry} className="text-[#FF453A] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:bg-[#FF453A]/20 transition-colors">
                                Retry
                            </button>
                        )}
                    </div>
                ) : (
                    children
                )}
            </div>
        </motion.div>
    );
}

// ==========================================
// TOOL CONTENTS
// ==========================================

// 1. Emergency Runway Component
function EmergencyRunwayContent() {
    const { categories, savedSoFar, setSavedSoFar } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    const [multiplier, setMultiplier] = useState(3);

    // Sum of all categories' target amounts (which are stored natively as monthly targets)
    const monthlyBaseline = categories.reduce((sum, cat) => sum + cat.targetAmount, 0);
    const targetRunway = monthlyBaseline * multiplier;

    const progressPct = targetRunway > 0 ? Math.min(100, (savedSoFar / targetRunway) * 100) : 0;
    const remainingAmount = Math.max(0, targetRunway - savedSoFar);

    return (
        <ToolCardShell title="Emergency Runway Calculator">
            <div className="flex justify-between items-center border border-white/5 rounded-2xl p-4">
                <div className="flex flex-col">
                    <span className="text-white/70 text-sm font-medium">Runway Duration</span>
                    <span className="text-white/40 text-[10px]">Monthly baseline: ₱{monthlyBaseline.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <button 
                        onClick={() => setMultiplier(Math.max(3, multiplier - 1))} 
                        className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors"
                    >
                        -
                    </button>
                    <span className="text-white font-medium w-16 text-center text-sm">{multiplier} Months</span>
                    <button 
                        onClick={() => setMultiplier(Math.min(6, multiplier + 1))} 
                        className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50 uppercase tracking-wider font-semibold">Saved So Far</span>
                    <span className="text-white/40">≈ ZAR {(savedSoFar * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-4 border border-white/5 focus-within:border-white/20 transition-colors w-full">
                    <span className="text-white/40 text-sm font-medium">₱</span>
                    <input 
                        type="number" 
                        value={savedSoFar || ''} 
                        onChange={e => setSavedSoFar(Number(e.target.value))}
                        placeholder="Enter current savings..."
                        className="bg-transparent border-none outline-none text-white text-sm w-full font-medium"
                    />
                </div>
            </div>

            <div className="mt-2 pt-4 border-t border-white/[0.05] flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-white/50 text-xs font-medium">Target ({multiplier} mo)</span>
                    <div className="text-right">
                        <span className="text-white font-semibold">₱{targetRunway.toLocaleString()}</span>
                        <span className="text-white/40 text-xs block">≈ R{(targetRunway * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                </div>

                {targetRunway > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-[#30D158] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(48,209,88,0.5)]" 
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[11px] text-white/50">
                            <span>{progressPct.toFixed(0)}% Saved</span>
                            {remainingAmount > 0 ? (
                                <span>₱{remainingAmount.toLocaleString()} remaining</span>
                            ) : (
                                <span className="text-[#30D158] font-medium">Runway Fully Funded! 🎉</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ToolCardShell>
    );
}

// 2. Inflation Outlook Component (Unchanged from original)
function InflationOutlookContent() {
    const { config } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    const current = config.targetAmount || 0;
    
    const in6Months = current * (1 + PH_INFLATION_RATE * 0.5);
    const in12Months = current * (1 + PH_INFLATION_RATE);

    return (
        <ToolCardShell title="Inflation Projection">
            <p className="text-white/60 text-sm leading-relaxed mb-2">
                Projected budget needed to maintain current buying power, assuming {PH_INFLATION_RATE * 100}% annual PH inflation.
            </p>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-white/70 font-medium">In 6 months</span>
                <div className="text-right">
                    <div className="text-white font-medium">₱{in6Months.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                    <div className="text-white/40 text-xs">≈ R{(in6Months * exchangeRate).toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-white/70 font-medium">In 12 months</span>
                <div className="text-right">
                    <div className="text-white font-medium">₱{in12Months.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                    <div className="text-white/40 text-xs">≈ R{(in12Months * exchangeRate).toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                </div>
            </div>
        </ToolCardShell>
    );
}

// 3. Grocery & Utility Inflation Guard Component
function InflationGuardContent() {
    const { categories, updateCategory, config, setBudget } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    const [applied, setApplied] = useState(false);

    const utilsCategory = categories.find(c => c.name.toLowerCase() === 'utilities');
    const groceriesCategory = categories.find(c => c.name.toLowerCase() === 'groceries');

    const utilsTarget = utilsCategory?.targetAmount || 0;
    const groceriesTarget = groceriesCategory?.targetAmount || 0;

    const suggestedUtilsBuffer = utilsTarget * UTILITY_SEASONAL_BUFFER;
    const suggestedGroceriesBuffer = groceriesTarget * GROCERY_SEASONAL_BUFFER;
    const totalSuggestedBuffer = suggestedUtilsBuffer + suggestedGroceriesBuffer;

    const handleApplyBuffers = () => {
        if (utilsCategory) {
            updateCategory(utilsCategory.id, { targetAmount: utilsTarget + suggestedUtilsBuffer });
        }
        if (groceriesCategory) {
            updateCategory(groceriesCategory.id, { targetAmount: groceriesTarget + suggestedGroceriesBuffer });
        }
        // Scale the main target budget to fit these changes
        setBudget(config.targetAmount + totalSuggestedBuffer, config.period);
        setApplied(true);
        setTimeout(() => setApplied(false), 2000);
    };

    return (
        <ToolCardShell title="Grocery & Utility Seasonal Buffers">
            <p className="text-white/60 text-xs leading-relaxed">
                Applies buffer margins based on PH dry-season heating demands and food inflation cycles.
            </p>

            <div className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                    <div className="flex flex-col">
                        <span className="text-white/70 font-medium">Utilities (Meralco peak)</span>
                        <span className="text-white/40 text-[10px]">Current: ₱{utilsTarget.toLocaleString()}</span>
                    </div>
                    <span className="text-[#E8A33D] font-semibold">+₱{suggestedUtilsBuffer.toLocaleString()} (25%)</span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                    <div className="flex flex-col">
                        <span className="text-white/70 font-medium">Groceries (Supply volatility)</span>
                        <span className="text-white/40 text-[10px]">Current: ₱{groceriesTarget.toLocaleString()}</span>
                    </div>
                    <span className="text-[#E8A33D] font-semibold">+₱{suggestedGroceriesBuffer.toLocaleString()} (8%)</span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                    <span className="text-white/80 font-medium text-xs uppercase tracking-wider">Suggested Buffer</span>
                    <div className="text-right">
                        <span className="text-[#E8A33D] font-semibold text-lg">₱{totalSuggestedBuffer.toLocaleString()}</span>
                        <span className="text-white/40 text-xs block">≈ R{(totalSuggestedBuffer * exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 p-3.5 rounded-xl mt-1">
                    <AlertCircle className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                    <p className="text-white/40 text-[10px] leading-relaxed">
                        Food-price inflation is highly volatile due to supply chain variance; this 8% buffer is a placeholder estimate. The 25% utility buffer is sourced from historical Meralco peak cooling demand reports during dry hot-season months.
                    </p>
                </div>

                <button 
                    onClick={handleApplyBuffers}
                    disabled={totalSuggestedBuffer === 0 || applied}
                    className={`w-full min-h-[52px] py-3.5 rounded-full font-semibold transition-all text-sm mt-1 border ${
                        applied 
                            ? 'bg-[#30D158] text-white border-transparent' 
                            : 'bg-white text-black hover:bg-gray-200 border-transparent disabled:opacity-40 disabled:pointer-events-none'
                    }`}
                >
                    {applied ? "Buffers Applied! ✓" : "Apply Seasonal Buffers"}
                </button>
            </div>
        </ToolCardShell>
    );
}

// 4. Salary Auto-Allocation Component
function SalaryAllocationContent() {
    const { categories, updateCategoriesTarget, setBudget, setSavedSoFar } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    
    const [income, setIncome] = useState<number>(0);
    const [needsPct, setNeedsPct] = useState<number>(50);
    const [wantsPct, setWantsPct] = useState<number>(30);
    const [applied, setApplied] = useState(false);

    const savingsPct = Math.max(0, 100 - needsPct - wantsPct);

    // Dynamic calculations
    const needsAmount = income * (needsPct / 100);
    const wantsAmount = income * (wantsPct / 100);
    const savingsAmount = income * (savingsPct / 100);

    // Map needs proportionally to Rent (60%), Groceries (25%), Utilities (15%)
    const rentAllocation = needsAmount * 0.60;
    const groceriesAllocation = needsAmount * 0.25;
    const utilitiesAllocation = needsAmount * 0.15;

    // SVG Donut calculation
    const radius = 40;
    const strokeWidth = 10;
    const circ = 2 * Math.PI * radius; // ~251.3

    const needsDash = (circ * needsPct) / 100;
    const wantsDash = (circ * wantsPct) / 100;
    const savingsDash = (circ * savingsPct) / 100;

    const handleUseAllocations = () => {
        const rentCat = categories.find(c => c.name.toLowerCase() === 'rent');
        const groceriesCat = categories.find(c => c.name.toLowerCase() === 'groceries');
        const utilitiesCat = categories.find(c => c.name.toLowerCase() === 'utilities');
        const billsCat = categories.find(c => c.name.toLowerCase() === 'bills');

        const updates: { id: string, targetAmount: number }[] = [];
        if (rentCat) updates.push({ id: rentCat.id, targetAmount: rentAllocation });
        if (groceriesCat) updates.push({ id: groceriesCat.id, targetAmount: groceriesAllocation });
        if (utilitiesCat) updates.push({ id: utilitiesCat.id, targetAmount: utilitiesAllocation });
        if (billsCat) updates.push({ id: billsCat.id, targetAmount: 0 }); // reset bills target to 0 since Wants is discretionary

        // Update bulk allocations in store
        updateCategoriesTarget(updates);

        // Put computed Savings directly into Runway savings target
        setSavedSoFar(savingsAmount);

        // Target budget = Expenses budget (Needs + Wants)
        setBudget(needsAmount + wantsAmount, 'monthly');

        setApplied(true);
        setTimeout(() => setApplied(false), 2000);
    };

    return (
        <ToolCardShell title="Salary Auto-Allocation">
            <div className="flex flex-col gap-4">
                {/* Income Input */}
                <div className="flex flex-col gap-2">
                    <span className="text-white/50 text-xs uppercase tracking-wider font-semibold">Monthly Combined Income</span>
                    <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-4 border border-white/5 focus-within:border-white/20 transition-colors w-full">
                        <span className="text-white/40 text-sm font-medium">₱</span>
                        <input 
                            type="number" 
                            value={income || ''} 
                            onChange={e => setIncome(Number(e.target.value))}
                            placeholder="Enter combined income..."
                            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium"
                        />
                    </div>
                </div>

                {/* Donut and Sliders Layout */}
                {income > 0 && (
                    <div className="flex flex-col sm:flex-row gap-6 items-center bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                        {/* Donut Chart */}
                        <div className="relative w-28 h-28 shrink-0">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Needs */}
                                <circle 
                                    cx="50" cy="50" r={radius}
                                    fill="transparent" stroke="#30D158" strokeWidth={strokeWidth}
                                    strokeDasharray={`${needsDash} ${circ - needsDash}`}
                                    strokeDashoffset="0"
                                />
                                {/* Wants */}
                                <circle 
                                    cx="50" cy="50" r={radius}
                                    fill="transparent" stroke="#0A84FF" strokeWidth={strokeWidth}
                                    strokeDasharray={`${wantsDash} ${circ - wantsDash}`}
                                    strokeDashoffset={-needsDash}
                                />
                                {/* Savings */}
                                <circle 
                                    cx="50" cy="50" r={radius}
                                    fill="transparent" stroke="#BF5AF2" strokeWidth={strokeWidth}
                                    strokeDasharray={`${savingsDash} ${circ - savingsDash}`}
                                    strokeDashoffset={-(needsDash + wantsDash)}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
                                <span className="text-[10px] text-white/40 uppercase font-semibold">Savings</span>
                                <span className="text-sm font-bold text-white">{savingsPct}%</span>
                            </div>
                        </div>

                        {/* Split Adjusters */}
                        <div className="flex-1 w-full flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-semibold text-white/70">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#30D158]"/> Needs</span>
                                    <span>{needsPct}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={needsPct}
                                    onChange={e => {
                                        const nextNeeds = Number(e.target.value);
                                        setNeedsPct(nextNeeds);
                                        // Adjust Wants if needed to not exceed 100
                                        if (nextNeeds + wantsPct > 100) {
                                            setWantsPct(100 - nextNeeds);
                                        }
                                    }}
                                    className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-semibold text-white/70">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0A84FF]"/> Wants</span>
                                    <span>{wantsPct}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max={100 - needsPct} value={wantsPct}
                                    onChange={e => setWantsPct(Number(e.target.value))}
                                    className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex justify-between text-xs font-semibold text-white/40 border-t border-white/5 pt-2">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#BF5AF2]"/> Savings</span>
                                <span>{savingsPct}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Split Details Breakdown */}
                {income > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 pt-2 border-t border-white/[0.05]">
                        <div className="flex flex-col gap-2">
                            <span className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Suggested Allocations (PHP)</span>
                            <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                <span className="text-white/60">Rent (60% of Needs)</span>
                                <span className="text-white font-medium">₱{rentAllocation.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                <span className="text-white/60">Groceries (25% of Needs)</span>
                                <span className="text-white font-medium">₱{groceriesAllocation.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                <span className="text-white/60">Utilities (15% of Needs)</span>
                                <span className="text-white font-medium">₱{utilitiesAllocation.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                                <span className="text-white/60">Unallocated - Discretionary (Wants)</span>
                                <span className="text-[#0A84FF] font-semibold">₱{wantsAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs pb-1">
                                <span className="text-white/60">Emergency Savings target</span>
                                <span className="text-[#BF5AF2] font-semibold">₱{savingsAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleUseAllocations}
                            className={`w-full min-h-[52px] py-3.5 rounded-full font-semibold transition-all text-sm border mt-2 ${
                                applied 
                                    ? 'bg-[#30D158] text-white border-transparent' 
                                    : 'bg-white text-black hover:bg-gray-200 border-transparent'
                            }`}
                        >
                            {applied ? "Allocations applied! ✓" : "Use these allocations"}
                        </button>
                    </motion.div>
                )}
            </div>
        </ToolCardShell>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export function SmartTools() {
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const TABS = [
        { id: 'runway', icon: <Activity className="w-4 h-4" />, label: 'Runway' },
        { id: 'inflation', icon: <TrendingUp className="w-4 h-4" />, label: 'Inflation' },
        { id: 'guard', icon: <Sparkles className="w-4 h-4" />, label: 'Inflation Guard' },
        { id: 'allocation', icon: <Calculator className="w-4 h-4" />, label: 'Salary Split' },
    ];

    return (
        <div className="w-full rounded-[32px] p-6 mb-8 bg-white/[0.02] border border-white/[0.03] relative z-20 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                    <span className="text-white font-medium">Smart Tools</span>
                    <span className="text-white/50 text-xs tracking-wide">Planning & projections</span>
                </div>
            </div>

            <PillTabRow tabs={TABS} activeTab={activeTool} onSelect={setActiveTool} />

            <AnimatePresence mode="wait">
                {activeTool === 'runway' && <EmergencyRunwayContent key="runway" />}
                {activeTool === 'inflation' && <InflationOutlookContent key="inflation" />}
                {activeTool === 'guard' && <InflationGuardContent key="guard" />}
                {activeTool === 'allocation' && <SalaryAllocationContent key="allocation" />}
            </AnimatePresence>
        </div>
    );
}
