"use client";
import { useState, useEffect } from "react";
import { Calculator, Target, Activity, TrendingUp, AlertCircle, Calendar, MoreVertical, Plus, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBudgetStore } from "../../store/useBudgetStore";
import { useCurrencyStore } from "../../store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import * as Icons from "lucide-react";
import { AddGoalSheet, EditGoalSheet, GoalMenuSheet } from "./GoalSheets";
import { AmountInputModal } from "./AmountInputModal";

// ==========================================
// STATIC CONSTANTS
// ==========================================
export const PH_INFLATION_RATE = 0.05; // 5% annual PH inflation
export const UTILITY_SEASONAL_BUFFER = 0.25; // 25% utility buffer
export const GROCERY_SEASONAL_BUFFER = 0.08; // 8% grocery buffer

// ==========================================
// SHARED COMPONENTS
// ==========================================

function PillTabRow({ tabs, activeTab, onSelect }: { tabs: any[], activeTab: string | null, onSelect: (id: string) => void }) {
    return (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 w-full shrink-0">
            {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onSelect(isActive ? '' : tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 text-sm shrink-0 border ${
                            isActive
                                ? `font-medium ${tab.activeClass}` 
                                : `bg-white/[0.02] text-white/50 border-white/[0.05] hover:bg-white/[0.05] ${tab.hoverClass}`
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

function ToolCardShell({ children, isLoading, error, onRetry, title }: { children: React.ReactNode, isLoading?: boolean, error?: string | null, onRetry?: () => void, title?: string }) {
    return (
        <div className="w-full">
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
        </div>
    );
}

// ==========================================
// TOOL CONTENTS
// ==========================================

function EmergencyRunwayContent() {
    const [isLogging, setIsLogging] = useState(false);
    const { categories, goals, config, setRunwayMultiplier, updateGoal } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    
    const multiplier = config.runwayMultiplier || 3;

    const emergencyGoal = goals.find(g => g.id === 'goal-1');
    const savedSoFar = emergencyGoal?.savedAmount || 0;

    // Sum of all categories' target amounts (which are stored natively as monthly targets)
    const monthlyBaseline = categories.reduce((sum, cat) => sum + cat.targetAmount, 0);
    const targetRunway = monthlyBaseline * multiplier;

    const progressPct = targetRunway > 0 ? Math.min(100, (savedSoFar / targetRunway) * 100) : 0;
    const remainingAmount = Math.max(0, targetRunway - savedSoFar);

    return (
        <ToolCardShell title="Emergency Runway Calculator">
            <p className="text-white/60 text-xs leading-relaxed">
                Calculates your target emergency fund based on your actual monthly budget. Set your category targets (Rent, Groceries, etc.) first to see how much you need for a {multiplier}-month safety net.
            </p>
            <div className="flex justify-between items-center border border-white/5 rounded-2xl p-4 mt-2">
                <div className="flex flex-col">
                    <span className="text-white/70 text-sm font-medium">Runway Duration</span>
                    <span className="text-white/40 text-[10px]">
                        {monthlyBaseline > 0 ? `Monthly baseline: ₱${formatCurrency(monthlyBaseline)}` : 'Category targets not set'}
                    </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <button 
                        onClick={() => setRunwayMultiplier(Math.max(3, multiplier - 1))} 
                        className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors"
                    >
                        -
                    </button>
                    <span className="text-white font-medium w-16 text-center text-sm">{multiplier} Months</span>
                    <button 
                        onClick={() => setRunwayMultiplier(Math.min(6, multiplier + 1))} 
                        className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50 uppercase tracking-wider font-semibold">Saved So Far</span>
                    <span className="text-white/40">≈ ZAR {formatCurrency(savedSoFar * exchangeRate)}</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-4 border border-white/5 w-full justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-white/40 text-sm font-medium">₱</span>
                        <span className="text-white font-semibold text-lg">{formatCurrency(savedSoFar)}</span>
                    </div>
                    <button 
                        onClick={() => setIsLogging(true)}
                        className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-white/70 text-xs font-semibold tracking-wide transition-colors"
                    >
                        + Log Savings
                    </button>
                </div>
            </div>

            <div className="mt-2 pt-4 border-t border-white/[0.05] flex flex-col gap-3">
                <div className="flex justify-between items-baseline">
                    <span className="text-white/50 text-xs font-medium">Target ({multiplier} mo)</span>
                    <div className="text-right flex flex-col items-end justify-center">
                        {targetRunway > 0 ? (
                            <>
                                <span className="text-white font-semibold">₱{formatCurrency(targetRunway)}</span>
                                <span className="text-white/40 text-xs block">≈ R{formatCurrency(targetRunway * exchangeRate)}</span>
                            </>
                        ) : (
                            <span className="text-white/40 text-[11px] font-medium">Set category budgets to calculate</span>
                        )}
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
                                <span>₱{formatCurrency(remainingAmount)} remaining</span>
                            ) : (
                                <span className="text-[#30D158] font-medium">Runway Fully Funded! 🎉</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <AmountInputModal 
                isOpen={isLogging}
                onClose={() => setIsLogging(false)}
                onConfirm={(amount) => {
                    if (emergencyGoal) {
                        updateGoal(emergencyGoal.id, { savedAmount: savedSoFar + amount });
                    }
                    setIsLogging(false);
                }}
                title="Add to Emergency Fund"
                initialAmount={0}
            />
        </ToolCardShell>
    );
}

// 2. Goals Component (Replaces Inflation Outlook)
function GoalsContent() {
    const { goals, addMoneyToGoal } = useBudgetStore();
    const { exchangeRate, primaryCurrency } = useCurrencyStore();
    
    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [menuGoalId, setMenuGoalId] = useState<string | null>(null);
    const [editGoalId, setEditGoalId] = useState<string | null>(null);
    const [addMoneyGoalId, setAddMoneyGoalId] = useState<string | null>(null);

    return (
        <ToolCardShell title="Savings Goals">
            <div className="flex flex-col gap-4">
                {goals.map(goal => {
                    const progress = goal.targetAmount > 0 ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100) : 0;
                    const Icon = (Icons as any)[goal.icon] || HelpCircle;

                    return (
                        <div key={goal.id} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-white/70">
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium text-sm">{goal.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {goal.targetDate && <span className="text-white/40 text-xs flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(goal.targetDate).toLocaleDateString()}</span>}
                                    <button 
                                        onClick={() => setMenuGoalId(goal.id)}
                                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 transition-colors"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-white font-semibold">₱{formatCurrency(goal.savedAmount)}</div>
                                    <div className="text-white/40 text-xs">≈ R{formatCurrency(goal.savedAmount * exchangeRate)}</div>
                                </div>
                                <div className="text-right">
                                    {goal.targetAmount > 0 ? (
                                        <>
                                            <div className="text-white/50 text-xs mb-1">Target: ₱{formatCurrency(goal.targetAmount)}</div>
                                            <div className="text-[#30D158] text-sm font-medium">{progress.toFixed(0)}%</div>
                                        </>
                                    ) : (
                                        <button onClick={() => setEditGoalId(goal.id)} className="text-white/40 hover:text-white transition-colors text-[10px] mb-1 underline underline-offset-2">Set target to track</button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="w-full bg-white/5 h-2 rounded-full mt-1 relative border border-white/[0.02] mb-3">
                                {goal.targetAmount > 0 && (
                                    <>
                                        <div className="bg-[#30D158] h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(48,209,88,0.4)]" style={{ width: `${progress}%` }} />
                                        {/* Star UI Tracker */}
                                        <div 
                                            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 transition-all duration-500 flex items-center justify-center w-5 h-5 bg-[#30D158] rounded-full shadow-[0_0_12px_rgba(48,209,88,0.8)] border border-[#111]"
                                            style={{ left: `${progress}%` }}
                                        >
                                            <Icons.Sparkles className="w-3 h-3 text-[#111]" />
                                        </div>
                                    </>
                                )}
                            </div>

                            <button 
                                onClick={() => setAddMoneyGoalId(goal.id)}
                                className="mt-2 w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white/70 text-xs font-semibold tracking-wide transition-colors"
                            >
                                + Log Savings
                            </button>
                        </div>
                    );
                })}

                <button 
                    onClick={() => setIsAddGoalOpen(true)}
                    className="flex items-center gap-3 w-full p-4 rounded-2xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 hover:bg-white/[0.02] transition-colors justify-center"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium tracking-wide">Add New Goal</span>
                </button>
            </div>

            <AddGoalSheet isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
            
            <GoalMenuSheet 
                isOpen={!!menuGoalId} 
                onClose={() => setMenuGoalId(null)} 
                goalId={menuGoalId} 
                onEdit={() => { setEditGoalId(menuGoalId); setMenuGoalId(null); }}
            />
            
            <EditGoalSheet 
                isOpen={!!editGoalId} 
                onClose={() => setEditGoalId(null)} 
                goalId={editGoalId} 
            />

            <AmountInputModal
                isOpen={!!addMoneyGoalId}
                onClose={() => setAddMoneyGoalId(null)}
                title={`Add to ${goals.find(g => g.id === addMoneyGoalId)?.name || 'Goal'}`}
                initialAmount={0}
                onConfirm={(amountPHP) => {
                    if (addMoneyGoalId && amountPHP > 0) {
                        addMoneyToGoal(addMoneyGoalId, amountPHP);
                    }
                    setAddMoneyGoalId(null);
                }}
            />
        </ToolCardShell>
    );
}

// 3. Grocery & Utility Inflation Guard Component
function InflationGuardContent() {
    const { categories } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();

    const utilsCategory = categories.find(c => c.name.toLowerCase() === 'utilities');
    const groceriesCategory = categories.find(c => c.name.toLowerCase() === 'groceries');

    const utilsTarget = utilsCategory?.targetAmount || 0;
    const groceriesTarget = groceriesCategory?.targetAmount || 0;

    const suggestedUtilsBuffer = utilsTarget * UTILITY_SEASONAL_BUFFER;
    const suggestedGroceriesBuffer = groceriesTarget * GROCERY_SEASONAL_BUFFER;
    const totalSuggestedBuffer = suggestedUtilsBuffer + suggestedGroceriesBuffer;

    return (
        <ToolCardShell title="Grocery & Utility Seasonal Buffers">
            <p className="text-white/60 text-xs leading-relaxed">
                Applies buffer margins based on PH dry-season heating demands and food inflation cycles.
            </p>

            <div className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                    <div className="flex flex-col">
                        <span className="text-white/70 font-medium">Utilities (Meralco peak)</span>
                        <span className="text-white/40 text-[10px]">Current: ₱{formatCurrency(utilsTarget)}</span>
                    </div>
                    <span className="text-[#E8A33D] font-semibold">+₱{formatCurrency(suggestedUtilsBuffer)} (25%)</span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2.5">
                    <div className="flex flex-col">
                        <span className="text-white/70 font-medium">Groceries (Supply volatility)</span>
                        <span className="text-white/40 text-[10px]">Current: ₱{formatCurrency(groceriesTarget)}</span>
                    </div>
                    <span className="text-[#E8A33D] font-semibold">+₱{formatCurrency(suggestedGroceriesBuffer)} (8%)</span>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                    <span className="text-white/80 font-medium text-xs uppercase tracking-wider">Suggested Buffer</span>
                    <div className="text-right">
                        <span className="text-[#E8A33D] font-semibold text-lg">₱{formatCurrency(totalSuggestedBuffer)}</span>
                        <span className="text-white/40 text-xs block">≈ R{formatCurrency(totalSuggestedBuffer * exchangeRate)}</span>
                    </div>
                </div>

                <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 p-3.5 rounded-xl mt-1">
                    <AlertCircle className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                    <p className="text-white/40 text-[10px] leading-relaxed">
                        Food-price inflation is highly volatile due to supply chain variance; this 8% buffer is a placeholder estimate. The 25% utility buffer is sourced from historical Meralco peak cooling demand reports during dry hot-season months.
                    </p>
                </div>
            </div>
        </ToolCardShell>
    );
}

// 4. Salary Auto-Allocation Component
function SalaryAllocationContent() {
    const { categories, goals } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    
    const [income, setIncome] = useState<number>(0);
    const [needsPct, setNeedsPct] = useState<number>(50);
    const [wantsPct, setWantsPct] = useState<number>(30);
    const [savingsPct, setSavingsPct] = useState<number>(20);
    const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

    const SMART_PRESETS = [
        { label: 'Metro (50/30/20)', needs: 50, wants: 30, savings: 20 },
        { label: 'Essentials (65/15/20)', needs: 65, wants: 15, savings: 20 },
        { label: 'Aggressive (40/30/30)', needs: 40, wants: 30, savings: 30 },
    ];

    const applyPreset = (needs: number, wants: number, savings: number) => {
        setNeedsPct(needs);
        setWantsPct(wants);
        setSavingsPct(savings);
    };

    const handleSliderChange = (type: 'needs' | 'wants' | 'savings', newValue: number) => {
        let others: { type: 'needs' | 'wants' | 'savings', value: number }[] = [];
        
        if (type === 'needs') {
            others = [{ type: 'wants', value: wantsPct }, { type: 'savings', value: savingsPct }];
        } else if (type === 'wants') {
            others = [{ type: 'needs', value: needsPct }, { type: 'savings', value: savingsPct }];
        } else {
            others = [{ type: 'needs', value: needsPct }, { type: 'wants', value: wantsPct }];
        }

        const diff = newValue - (type === 'needs' ? needsPct : type === 'wants' ? wantsPct : savingsPct);
        if (diff === 0) return;

        let otherTotal = others[0].value + others[1].value;
        if (otherTotal === 0) {
            others[0].value = (100 - newValue) / 2;
            others[1].value = (100 - newValue) / 2;
        } else {
            const o0_share = others[0].value / otherTotal;
            let o0_change = diff * o0_share;
            let o1_change = diff - o0_change;

            others[0].value -= o0_change;
            others[1].value -= o1_change;

            if (others[0].value < 0) {
                others[1].value += others[0].value;
                others[0].value = 0;
            } else if (others[1].value < 0) {
                others[0].value += others[1].value;
                others[1].value = 0;
            }
        }

        const finalMain = newValue;
        let finalO0 = Math.round(others[0].value);
        let finalO1 = 100 - finalMain - finalO0;

        if (finalO1 < 0) {
            finalO0 += finalO1;
            finalO1 = 0;
        }

        const setVals = (t: string, val: number) => {
            if (t === 'needs') setNeedsPct(val);
            if (t === 'wants') setWantsPct(val);
            if (t === 'savings') setSavingsPct(val);
        };

        setVals(type, finalMain);
        setVals(others[0].type, finalO0);
        setVals(others[1].type, finalO1);
    };

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

    return (
        <ToolCardShell title="Salary Auto-Allocation">
            <div className="flex flex-col gap-4">
                {/* Smart Presets */}
                <div className="flex flex-col gap-2">
                    <span className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">PH Smart Suggestions</span>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 w-full shrink-0">
                        {SMART_PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => applyPreset(p.needs, p.wants, p.savings)}
                                className="px-2.5 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] text-white/70 text-xs whitespace-nowrap transition-colors shrink-0"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
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
                                    onChange={e => handleSliderChange('needs', Number(e.target.value))}
                                    className="w-full accent-[#30D158] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-semibold text-white/70">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0A84FF]"/> Wants</span>
                                    <span>{wantsPct}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={wantsPct}
                                    onChange={e => handleSliderChange('wants', Number(e.target.value))}
                                    className="w-full accent-[#0A84FF] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-xs font-semibold text-white/70">
                                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#BF5AF2]"/> Savings</span>
                                    <span>{savingsPct}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" value={savingsPct}
                                    onChange={e => handleSliderChange('savings', Number(e.target.value))}
                                    className="w-full accent-[#BF5AF2] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Split Details Breakdown */}
                {income > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 pt-2 border-t border-white/[0.05]">
                        <div className="flex flex-col gap-2">
                            <span className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Suggested Allocations (PHP)</span>
                            <div className="flex flex-col border-b border-white/5 pb-2">
                                <div className="flex justify-between text-xs">
                                    <button onClick={() => setExpandedInfo(expandedInfo === 'rent' ? null : 'rent')} className="text-white/60 flex items-center gap-1.5 hover:text-white transition-colors outline-none text-left">
                                        Rent (60% of Needs) <Icons.Info className="w-3 h-3 opacity-60 shrink-0" />
                                    </button>
                                    <span className="text-white font-medium">₱{formatCurrency(rentAllocation)}</span>
                                </div>
                                <AnimatePresence>
                                    {expandedInfo === 'rent' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <p className="text-white/40 text-[10px] bg-white/[0.02] p-2.5 rounded-lg mt-2 leading-relaxed border border-white/5">
                                                Housing costs typically shouldn't exceed 30% of total income. Modeled here as 60% of your essential Needs bucket.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col border-b border-white/5 pb-2">
                                <div className="flex justify-between text-xs">
                                    <button onClick={() => setExpandedInfo(expandedInfo === 'groceries' ? null : 'groceries')} className="text-white/60 flex items-center gap-1.5 hover:text-white transition-colors outline-none text-left">
                                        Groceries (25% of Needs) <Icons.Info className="w-3 h-3 opacity-60 shrink-0" />
                                    </button>
                                    <span className="text-white font-medium">₱{formatCurrency(groceriesAllocation)}</span>
                                </div>
                                <AnimatePresence>
                                    {expandedInfo === 'groceries' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <p className="text-white/40 text-[10px] bg-white/[0.02] p-2.5 rounded-lg mt-2 leading-relaxed border border-white/5">
                                                Food and household supplies. This makes up 25% of your essentials.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col border-b border-white/5 pb-2">
                                <div className="flex justify-between text-xs">
                                    <button onClick={() => setExpandedInfo(expandedInfo === 'utilities' ? null : 'utilities')} className="text-white/60 flex items-center gap-1.5 hover:text-white transition-colors outline-none text-left">
                                        Utilities (15% of Needs) <Icons.Info className="w-3 h-3 opacity-60 shrink-0" />
                                    </button>
                                    <span className="text-white font-medium">₱{formatCurrency(utilitiesAllocation)}</span>
                                </div>
                                <AnimatePresence>
                                    {expandedInfo === 'utilities' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <p className="text-white/40 text-[10px] bg-white/[0.02] p-2.5 rounded-lg mt-2 leading-relaxed border border-white/5">
                                                Electricity, water, internet, and phone bills. Modeled as 15% of your essentials.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col border-b border-white/5 pb-2">
                                <div className="flex justify-between text-xs">
                                    <button onClick={() => setExpandedInfo(expandedInfo === 'wants' ? null : 'wants')} className="text-white/60 flex items-center gap-1.5 hover:text-white transition-colors outline-none text-left">
                                        Unallocated - Discretionary (Wants) <Icons.Info className="w-3 h-3 opacity-60 shrink-0" />
                                    </button>
                                    <span className="text-[#0A84FF] font-semibold">₱{formatCurrency(wantsAmount)}</span>
                                </div>
                                <AnimatePresence>
                                    {expandedInfo === 'wants' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <p className="text-white/40 text-[10px] bg-white/[0.02] p-2.5 rounded-lg mt-2 leading-relaxed border border-white/5">
                                                Non-essentials like dining out, entertainment, and shopping. This is your guilt-free spending money.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col pb-1">
                                <div className="flex justify-between text-xs">
                                    <button onClick={() => setExpandedInfo(expandedInfo === 'savings' ? null : 'savings')} className="text-white/60 flex items-center gap-1.5 hover:text-white transition-colors outline-none text-left">
                                        Emergency Savings target <Icons.Info className="w-3 h-3 opacity-60 shrink-0" />
                                    </button>
                                    <span className="text-[#BF5AF2] font-semibold">₱{formatCurrency(savingsAmount)}</span>
                                </div>
                                <AnimatePresence>
                                    {expandedInfo === 'savings' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <p className="text-white/40 text-[10px] bg-white/[0.02] p-2.5 rounded-lg mt-2 leading-relaxed border border-white/5">
                                                Target monthly contribution to build your emergency runway and long-term investments.
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
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
        { 
            id: 'runway', 
            icon: <Activity className="w-4 h-4" />, 
            label: 'Runway',
            activeClass: 'bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/30',
            hoverClass: 'hover:text-[#0A84FF] hover:border-[#0A84FF]/30'
        },
        { 
            id: 'goals', 
            icon: <Target className="w-4 h-4" />, 
            label: 'Goals',
            activeClass: 'bg-[#30D158]/10 text-[#30D158] border-[#30D158]/30',
            hoverClass: 'hover:text-[#30D158] hover:border-[#30D158]/30'
        },
        { 
            id: 'guard', 
            icon: <TrendingUp className="w-4 h-4" />, 
            label: 'Inflation Guard',
            activeClass: 'bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/30',
            hoverClass: 'hover:text-[#E8A33D] hover:border-[#E8A33D]/30'
        },
        { 
            id: 'allocation', 
            icon: <Calculator className="w-4 h-4" />, 
            label: 'Salary Split',
            activeClass: 'bg-[#BF5AF2]/10 text-[#BF5AF2] border-[#BF5AF2]/30',
            hoverClass: 'hover:text-[#BF5AF2] hover:border-[#BF5AF2]/30'
        },
    ];

    return (
        <div className="w-full rounded-[32px] relative z-30 mb-8 overflow-hidden p-[1px] group shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            {/* The traveling light (Conic gradient border) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1500px] h-[1500px] bg-[conic-gradient(from_0deg,transparent_60%,rgba(255,255,255,0.05)_80%,rgba(255,255,255,0.5)_100%)] animate-[spin_5s_linear_infinite] z-0 opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* The card body */}
            <div className="relative z-10 w-full h-full rounded-[31px] p-6 bg-[#0a0a0a] flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-white font-medium">Smart Tools</span>
                        <span className="text-white/50 text-xs tracking-wide">Planning & projections</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <PillTabRow tabs={TABS} activeTab={activeTool} onSelect={setActiveTool} />
                </div>

                <div className="relative z-10">
                    {/* Outer: height open/close — only fires when activeTool goes null ↔ non-null */}
                    <AnimatePresence>
                        {activeTool && (
                            <motion.div
                                key="tool-container"
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                className="overflow-hidden w-full"
                            >
                                {/* Inner: quick crossfade between tool contents */}
                                <AnimatePresence mode="wait">
                                    {activeTool === 'runway' && (
                                        <motion.div key="runway" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <EmergencyRunwayContent />
                                        </motion.div>
                                    )}
                                    {activeTool === 'goals' && (
                                        <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <GoalsContent />
                                        </motion.div>
                                    )}
                                    {activeTool === 'guard' && (
                                        <motion.div key="guard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <InflationGuardContent />
                                        </motion.div>
                                    )}
                                    {activeTool === 'allocation' && (
                                        <motion.div key="allocation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <SalaryAllocationContent />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
