"use client";
import { useState, useEffect } from "react";
import { MapPin, Calculator, TrendingUp, Activity, Users, ChevronDown, Baby } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { COST_DATA, AREAS, Area, PH_INFLATION_RATE } from "@/utils/costData";

function ToolPill({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all text-sm shrink-0 border ${
                isActive 
                    ? 'bg-white text-black font-medium border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                    : 'bg-white/[0.03] text-white/60 border-white/[0.05] hover:bg-white/[0.08] hover:text-white'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

// -----------------------------------------
// Tool 1: Relocation Estimator
// -----------------------------------------
function RelocationEstimatorContent() {
    const { categories, updateCategory, config, setBudget } = useBudgetStore();
    const [adults, setAdults] = useState(2);
    const [area, setArea] = useState<Area>('Makati / BGC');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [estimate, setEstimate] = useState<{ rent: number, utilities: number } | null>(null);

    const handleCalculate = () => {
        const data = COST_DATA[area];
        const extraAdults = Math.max(0, adults - 1);
        const rent = data.baseRent + (data.rentPerExtraAdult * extraAdults);
        const utilities = data.baseUtilities + (data.utilPerExtraAdult * extraAdults);
        setEstimate({ rent, utilities });
    };

    const handleUse = () => {
        if (!estimate) return;
        const rentCat = categories.find(c => c.name.toLowerCase() === 'rent');
        const utilCat = categories.find(c => c.name.toLowerCase() === 'utilities');
        if (rentCat) updateCategory(rentCat.id, { targetAmount: estimate.rent });
        if (utilCat) updateCategory(utilCat.id, { targetAmount: estimate.utilities });
        if (config.period !== 'monthly') {
            setBudget(config.targetAmount, 'monthly');
        }
        setEstimate(null);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-center bg-black/40 rounded-2xl p-4 gap-4">
                <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-white/40" />
                    <span className="text-white/70 text-sm">Adults</span>
                </div>
                <div className="hidden sm:flex flex-1 items-end gap-1.5 px-4 justify-end opacity-40">
                    {Array.from({ length: adults }).map((_, i) => (
                        <div key={i} className="w-2.5 bg-white rounded-full flex-shrink-0" style={{ height: i % 2 === 0 ? 20 : 16 }} />
                    ))}
                </div>
                <div className="flex items-center gap-4 ml-auto shrink-0">
                    <button onClick={() => { setAdults(Math.max(1, adults - 1)); setEstimate(null); }} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors shrink-0">-</button>
                    <span className="text-white font-medium w-4 text-center shrink-0">{adults}</span>
                    <button onClick={() => { setAdults(adults + 1); setEstimate(null); }} className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] transition-colors shrink-0">+</button>
                </div>
            </div>

            <div className="relative z-20">
                <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex flex-wrap justify-between items-center bg-black/40 rounded-2xl p-4 gap-4 cursor-pointer hover:bg-black/60 transition-colors">
                    <div className="flex items-center gap-3 shrink-0">
                        <MapPin className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 text-sm">Target Area</span>
                    </div>
                    <div className="flex items-center gap-2 text-white shrink-0">
                        <span className="font-medium text-sm">{area}</span>
                        <ChevronDown className="w-4 h-4 text-white/50" />
                    </div>
                </div>
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-30">
                            {AREAS.map(a => (
                                <button key={a} onClick={() => { setArea(a); setIsDropdownOpen(false); setEstimate(null); }} className={`w-full text-left px-4 py-3 text-sm transition-colors ${a === area ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5'}`}>{a}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <AnimatePresence mode="wait">
                {!estimate ? (
                    <motion.button key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCalculate} className="w-full mt-2 min-h-[56px] py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white font-medium transition-all text-sm">
                        Calculate Move-in Setup
                    </motion.button>
                ) : (
                    <motion.div key="res" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 pt-4 border-t border-white/[0.05] flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/50 text-xs uppercase tracking-wider font-bold">Suggested Base Rent</span>
                            <span className="text-white font-medium">₱{estimate.rent.toLocaleString()} / mo</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-white/50 text-xs uppercase tracking-wider font-bold">Est. Utilities</span>
                            <span className="text-white font-medium">₱{estimate.utilities.toLocaleString()} / mo</span>
                        </div>
                        <button onClick={handleUse} className="w-full mt-2 min-h-[56px] py-4 rounded-full bg-white text-black hover:bg-gray-200 font-semibold transition-all text-sm">
                            Use this estimate
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// -----------------------------------------
// Tool 2: Smart Budget Estimator
// -----------------------------------------
function SmartBudgetEstimatorContent() {
    const { setBudget } = useBudgetStore();
    const [adults, setAdults] = useState(2);
    const [kids, setKids] = useState(0);
    const [area, setArea] = useState<Area>('Makati / BGC');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [estimate, setEstimate] = useState<number | null>(null);

    const handleCalculate = () => {
        const data = COST_DATA[area];
        const extraAdults = Math.max(0, adults - 1);
        const rent = data.baseRent + (data.rentPerExtraAdult * extraAdults);
        const utilities = data.baseUtilities + (data.utilPerExtraAdult * extraAdults);
        const food = data.baseFood + (data.foodPerExtraAdult * extraAdults) + (data.baseFood * data.kidFoodMultiplier * kids);
        const misc = data.baseMisc + (data.miscPerExtraAdult * extraAdults);
        setEstimate(rent + utilities + food + misc);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-center bg-black/40 rounded-2xl p-4 gap-4">
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-white/40" />
                            <span className="text-white/70 text-sm">Adults</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <button onClick={() => { setAdults(Math.max(1, adults - 1)); setEstimate(null); }} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white shrink-0">-</button>
                            <span className="text-white font-medium w-4 text-center">{adults}</span>
                            <button onClick={() => { setAdults(adults + 1); setEstimate(null); }} className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] shrink-0">+</button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.02] pt-4">
                        <div className="flex items-center gap-3">
                            <Baby className="w-4 h-4 text-white/40" />
                            <span className="text-white/70 text-sm">Kids</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <button onClick={() => { setKids(Math.max(0, kids - 1)); setEstimate(null); }} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white shrink-0">-</button>
                            <span className="text-white font-medium w-4 text-center">{kids}</span>
                            <button onClick={() => { setKids(kids + 1); setEstimate(null); }} className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] shrink-0">+</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20">
                <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex flex-wrap justify-between items-center bg-black/40 rounded-2xl p-4 gap-4 cursor-pointer hover:bg-black/60 transition-colors">
                    <div className="flex items-center gap-3 shrink-0">
                        <MapPin className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 text-sm">Target Area</span>
                    </div>
                    <div className="flex items-center gap-2 text-white shrink-0">
                        <span className="font-medium text-sm">{area}</span>
                        <ChevronDown className="w-4 h-4 text-white/50" />
                    </div>
                </div>
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-30">
                            {AREAS.map(a => (
                                <button key={a} onClick={() => { setArea(a); setIsDropdownOpen(false); setEstimate(null); }} className={`w-full text-left px-4 py-3 text-sm transition-colors ${a === area ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5'}`}>{a}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {!estimate ? (
                    <motion.button key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCalculate} className="w-full mt-2 min-h-[56px] py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white font-medium transition-all text-sm">
                        Estimate Overall Budget
                    </motion.button>
                ) : (
                    <motion.div key="res" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 pt-4 border-t border-white/[0.05] flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <span className="text-white/50 text-xs uppercase tracking-wider font-bold">Suggested Monthly Target</span>
                            <span className="text-white font-medium text-lg">₱{estimate.toLocaleString()}</span>
                        </div>
                        <button onClick={() => { setBudget(estimate, 'monthly'); setEstimate(null); }} className="w-full mt-2 min-h-[56px] py-4 rounded-full bg-white text-black hover:bg-gray-200 font-semibold transition-all text-sm">
                            Set Target Budget
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// -----------------------------------------
// Tool 3: Inflation Outlook
// -----------------------------------------
function InflationOutlookContent() {
    const { config } = useBudgetStore();
    const { exchangeRate } = useCurrencyStore();
    const current = config.targetAmount || 0;
    
    // Simple projection
    const in6Months = current * (1 + PH_INFLATION_RATE * 0.5);
    const in12Months = current * (1 + PH_INFLATION_RATE);

    return (
        <div className="flex flex-col gap-4 bg-black/40 rounded-2xl p-6">
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
        </div>
    );
}

// -----------------------------------------
// Tool 4: FX Volatility Buffer
// -----------------------------------------
function FxVolatilityContent() {
    const { config, setBudget } = useBudgetStore();
    const current = config.targetAmount || 0;
    
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ high: number, low: number, diffPct: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            // Last 30 days
            const d = new Date();
            const end = d.toISOString().split('T')[0];
            d.setDate(d.getDate() - 30);
            const start = d.toISOString().split('T')[0];

            const res = await fetch(`https://api.frankfurter.app/${start}..${end}?from=ZAR&to=PHP`);
            if (!res.ok) throw new Error('API failed');
            const json = await res.json();
            
            const rates = Object.values(json.rates).map((r: any) => r.PHP) as number[];
            const high = Math.max(...rates);
            const low = Math.min(...rates);
            const diffPct = ((high - low) / low);
            setData({ high, low, diffPct });
        } catch (e: any) {
            setError(e.message || 'Failed to fetch rates');
        } finally {
            setLoading(false);
        }
    };

    const suggestedBufferPct = data ? Math.max(0.02, Math.ceil(data.diffPct * 100) / 100) : 0.03; 
    const suggestedTotal = current * (1 + suggestedBufferPct);

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-black/40 rounded-2xl p-6">
                <p className="text-white/60 text-sm leading-relaxed mb-4">
                    Analyze ZAR/PHP exchange rates over the last 30 days to suggest a safety buffer against volatility.
                </p>
                
                {!data && !loading && (
                    <button onClick={handleFetch} className="w-full min-h-[56px] py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white font-medium transition-all text-sm">
                        Analyze 30-Day Volatility
                    </button>
                )}
                
                {loading && (
                    <div className="flex justify-center py-4">
                        <Activity className="w-6 h-6 text-white/50 animate-pulse" />
                    </div>
                )}
                
                {error && (
                    <div className="text-[#FF453A] text-sm text-center py-2 bg-[#FF453A]/10 rounded-xl">
                        {error}
                    </div>
                )}
                
                {data && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                            <span className="text-white/50">30-Day Low</span>
                            <span className="text-white">₱{data.low.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                            <span className="text-white/50">30-Day High</span>
                            <span className="text-white">₱{data.high.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium pt-2">
                            <span className="text-[#E8A33D]">Suggested Buffer</span>
                            <span className="text-[#E8A33D]">{(suggestedBufferPct * 100).toFixed(1)}%</span>
                        </div>
                    </motion.div>
                )}
            </div>
            
            {data && (
                <button 
                    onClick={() => setBudget(suggestedTotal, config.period)} 
                    className="w-full min-h-[56px] py-4 rounded-full bg-[#E8A33D] text-black hover:bg-[#D99536] font-semibold transition-all text-sm"
                >
                    Apply +{(suggestedBufferPct * 100).toFixed(1)}% Buffer (₱{suggestedTotal.toLocaleString(undefined, {maximumFractionDigits:0})})
                </button>
            )}
        </div>
    );
}

// -----------------------------------------
// Main Container
// -----------------------------------------
export function SmartTools() {
    const [activeTool, setActiveTool] = useState<'relocation' | 'smart_budget' | 'inflation' | 'fx' | null>(null);

    const toggle = (tool: typeof activeTool) => {
        setActiveTool(activeTool === tool ? null : tool);
    };

    return (
        <div className="w-full rounded-[32px] p-6 mb-8 bg-white/[0.02] border border-white/[0.03] relative z-20 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                    <span className="text-white font-medium">Smart Tools</span>
                    <span className="text-white/50 text-xs tracking-wide">Planning & projections</span>
                </div>
            </div>

            {/* Pills Row */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 mask-linear-fade">
                <ToolPill icon={<MapPin className="w-4 h-4" />} label="Move-in" isActive={activeTool === 'relocation'} onClick={() => toggle('relocation')} />
                <ToolPill icon={<Calculator className="w-4 h-4" />} label="Estimator" isActive={activeTool === 'smart_budget'} onClick={() => toggle('smart_budget')} />
                <ToolPill icon={<TrendingUp className="w-4 h-4" />} label="Inflation" isActive={activeTool === 'inflation'} onClick={() => toggle('inflation')} />
                <ToolPill icon={<Activity className="w-4 h-4" />} label="FX Buffer" isActive={activeTool === 'fx'} onClick={() => toggle('fx')} />
            </div>

            {/* Active Tool Area */}
            <AnimatePresence mode="wait">
                {activeTool && (
                    <motion.div
                        key={activeTool}
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        {activeTool === 'relocation' && <RelocationEstimatorContent />}
                        {activeTool === 'smart_budget' && <SmartBudgetEstimatorContent />}
                        {activeTool === 'inflation' && <InflationOutlookContent />}
                        {activeTool === 'fx' && <FxVolatilityContent />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
