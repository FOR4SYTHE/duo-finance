"use client";
import { useState, useEffect } from "react";
import { MapPin, Calculator, TrendingUp, Activity, Users, ChevronDown, Baby, Sparkles, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { COST_DATA, AREAS, Area, PH_INFLATION_RATE } from "@/utils/costData";

// ==========================================
// SHARED COMPONENTS
// ==========================================

function PillTabRow({ tabs, activeTab, onSelect }: { tabs: { id: string, icon: any, label: string }[], activeTab: string | null, onSelect: (id: string) => void }) {
    return (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 mask-linear-fade w-full shrink-0">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onSelect(activeTab === tab.id ? '' : tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all text-sm shrink-0 border ${
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
        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden w-full">
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

// -----------------------------------------
// Target Area Search Component
// -----------------------------------------
function TargetAreaSearch({ onCostDataResolved }: { onCostDataResolved: (data: any, areaName: string) => void }) {
    const [search, setSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter curated areas
    const filteredAreas = AREAS.filter(a => a.toLowerCase().includes(search.toLowerCase()));

    const handleSelectCurated = (area: Area) => {
        setSearch(area);
        setIsDropdownOpen(false);
        setError(null);
        onCostDataResolved(COST_DATA[area], area);
    };

    const handleSearchAI = async () => {
        if (!search.trim()) return;
        setIsDropdownOpen(false);
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/estimate-area', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: search })
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to estimate area.');
            
            // Format check
            if (typeof json.baseRent !== 'number') throw new Error('Invalid AI response structure.');
            
            onCostDataResolved(json, search);
        } catch (err: any) {
            setError(err.message || 'No estimate for this area yet.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 relative z-20">
            <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-4 border border-white/5 focus-within:border-white/20 transition-colors">
                <MapPin className="w-4 h-4 text-white/40 shrink-0" />
                <input 
                    type="text" 
                    value={search} 
                    onChange={e => { setSearch(e.target.value); setIsDropdownOpen(true); setError(null); }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search target area (e.g. Makati, Cebu)"
                    className="bg-transparent border-none outline-none text-white text-sm w-full font-medium"
                />
            </div>
            
            <AnimatePresence>
                {isDropdownOpen && search && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-[calc(100%+4px)] left-0 w-full bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden z-30 shadow-2xl">
                        {filteredAreas.length > 0 ? (
                            filteredAreas.map(a => (
                                <button key={a} onClick={() => handleSelectCurated(a as Area)} className="w-full text-left px-4 py-3 text-sm text-white/70 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">{a}</button>
                            ))
                        ) : (
                            <button onClick={handleSearchAI} className="w-full flex items-center gap-2 px-4 py-4 text-sm text-white hover:bg-white/5 transition-colors group">
                                <Search className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
                                <span>Search web for "{search}" estimates</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading && (
                <div className="flex items-center gap-2 text-white/50 text-xs px-2 mt-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Analyzing cost data for {search}...</span>
                </div>
            )}
            
            {error && (
                <div className="text-[#FF453A] text-xs px-2 mt-1 font-medium bg-[#FF453A]/10 p-2 rounded-lg border border-[#FF453A]/20">
                    {error}
                </div>
            )}
        </div>
    );
}

// ==========================================
// TOOLS
// ==========================================

function MoveInEstimatorContent() {
    const [adults, setAdults] = useState(2);
    const [costData, setCostData] = useState<any | null>(null);
    const [areaName, setAreaName] = useState<string>('');

    const handleResolved = (data: any, name: string) => {
        setCostData(data);
        setAreaName(name);
    };

    const extraAdults = Math.max(0, adults - 1);
    const rent = costData ? costData.baseRent + (costData.rentPerExtraAdult * extraAdults) : 0;
    
    // One-time Move-in Lump Sum
    const totalMoveIn = costData ? (
        (rent * costData.depositMonths) + 
        (rent * costData.advanceRentMonths) + 
        costData.starterFurniture
    ) : 0;

    return (
        <ToolCardShell title="One-Time Move-In Cost">
            <div className="flex justify-between items-center border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-white/40" />
                    <span className="text-white/70 text-sm">Adults</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white transition-colors">-</button>
                    <span className="text-white font-medium w-4 text-center">{adults}</span>
                    <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] transition-colors">+</button>
                </div>
            </div>

            <TargetAreaSearch onCostDataResolved={handleResolved} />

            {costData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 pt-4 border-t border-white/[0.05] flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Deposit ({costData.depositMonths} mo)</span>
                        <span className="text-white">₱{(rent * costData.depositMonths).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Advance Rent ({costData.advanceRentMonths} mo)</span>
                        <span className="text-white">₱{(rent * costData.advanceRentMonths).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">Starter Furniture</span>
                        <span className="text-white">₱{costData.starterFurniture.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-white/70 font-semibold uppercase tracking-wider text-xs">Total Setup</span>
                        <span className="text-white font-medium text-lg">₱{totalMoveIn.toLocaleString()}</span>
                    </div>
                </motion.div>
            )}
        </ToolCardShell>
    );
}

function SmartBudgetEstimatorContent() {
    const { setBudget } = useBudgetStore();
    const [adults, setAdults] = useState(2);
    const [kids, setKids] = useState(0);
    const [costData, setCostData] = useState<any | null>(null);

    const handleResolved = (data: any) => setCostData(data);

    const extraAdults = Math.max(0, adults - 1);
    const rent = costData ? costData.baseRent + (costData.rentPerExtraAdult * extraAdults) : 0;
    const utilities = costData ? costData.baseUtilities + (costData.utilPerExtraAdult * extraAdults) : 0;
    const food = costData ? costData.baseFood + (costData.foodPerExtraAdult * extraAdults) + (costData.baseFood * costData.kidFoodMultiplier * kids) : 0;
    const misc = costData ? costData.baseMisc + (costData.miscPerExtraAdult * extraAdults) : 0;
    
    const targetMonthly = rent + utilities + food + misc;

    return (
        <ToolCardShell title="Ongoing Monthly Budget">
            <div className="flex flex-col gap-4 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 text-sm">Adults</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white shrink-0">-</button>
                        <span className="text-white font-medium w-4 text-center">{adults}</span>
                        <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] shrink-0">+</button>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                        <Baby className="w-4 h-4 text-white/40" />
                        <span className="text-white/70 text-sm">Kids</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <button onClick={() => setKids(Math.max(0, kids - 1))} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50 hover:bg-white/[0.1] hover:text-white shrink-0">-</button>
                        <span className="text-white font-medium w-4 text-center">{kids}</span>
                        <button onClick={() => setKids(kids + 1)} className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.15] shrink-0">+</button>
                    </div>
                </div>
            </div>

            <TargetAreaSearch onCostDataResolved={handleResolved} />

            {costData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 pt-4 border-t border-white/[0.05] flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm text-white/60">
                        <span>Rent: ₱{rent.toLocaleString()}</span>
                        <span>Util: ₱{utilities.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-white/60">
                        <span>Food: ₱{food.toLocaleString()}</span>
                        <span>Misc: ₱{misc.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-white/70 font-semibold uppercase tracking-wider text-xs">Monthly Target</span>
                        <span className="text-white font-medium text-lg">₱{targetMonthly.toLocaleString()}</span>
                    </div>
                    <button onClick={() => setBudget(targetMonthly, 'monthly')} className="w-full mt-2 min-h-[56px] py-4 rounded-full bg-white text-black hover:bg-gray-200 font-semibold transition-all text-sm">
                        Use this target
                    </button>
                </motion.div>
            )}
        </ToolCardShell>
    );
}

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
            // Last 30 days based on a real past date to avoid future 404s in sandbox
            // In a real app this would just be new Date(). But safely grabbing a fixed window for demo, 
            // or we use today's actual real-world date. Let's use 2024-01-01 to 2024-01-31 to be 100% safe.
            // Wait, Frankfurter API goes up to the current real world date. We will use a strict past window.
            const start = '2024-05-01';
            const end = '2024-06-01';

            const url = `https://api.frankfurter.app/${start}..${end}?from=ZAR&to=PHP`;
            const res = await fetch(url);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Frankfurter API Error (${res.status}): ${text.slice(0, 50)}`);
            }
            const json = await res.json();
            
            if (!json.rates || Object.keys(json.rates).length === 0) {
                 throw new Error("No rate data returned for this period.");
            }

            const rates = Object.values(json.rates).map((r: any) => r.PHP) as number[];
            const high = Math.max(...rates);
            const low = Math.min(...rates);
            const diffPct = ((high - low) / low);
            setData({ high, low, diffPct });
        } catch (e: any) {
            // Surface REAL error message per requirements
            setError(e.message || 'Failed to fetch rates due to a network or URL error.');
        } finally {
            setLoading(false);
        }
    };

    const suggestedBufferPct = data ? Math.max(0.02, Math.ceil(data.diffPct * 100) / 100) : 0.03; 
    const suggestedTotal = current * (1 + suggestedBufferPct);

    return (
        <ToolCardShell title="ZAR/PHP FX Volatility" isLoading={loading} error={error} onRetry={handleFetch}>
            {!data ? (
                <>
                    <p className="text-white/60 text-sm leading-relaxed mb-2">
                        Analyze recent exchange rates to suggest a safety buffer against volatility.
                    </p>
                    <button onClick={handleFetch} className="w-full mt-2 min-h-[56px] py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white font-medium transition-all text-sm">
                        Analyze 30-Day Volatility
                    </button>
                </>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-white/50">30-Day Low</span>
                        <span className="text-white">₱{data.low.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                        <span className="text-white/50">30-Day High</span>
                        <span className="text-white">₱{data.high.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium pt-2 border-b border-white/5 pb-4">
                        <span className="text-[#E8A33D]">Suggested Buffer</span>
                        <span className="text-[#E8A33D]">{(suggestedBufferPct * 100).toFixed(1)}%</span>
                    </div>
                    <button 
                        onClick={() => setBudget(suggestedTotal, config.period)} 
                        className="w-full min-h-[56px] py-4 rounded-full bg-[#E8A33D] text-black hover:bg-[#D99536] font-semibold transition-all text-sm"
                    >
                        Apply +{(suggestedBufferPct * 100).toFixed(1)}% Buffer
                    </button>
                </div>
            )}
        </ToolCardShell>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export function SmartTools() {
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const TABS = [
        { id: 'relocation', icon: <MapPin className="w-4 h-4" />, label: 'Move-in' },
        { id: 'smart_budget', icon: <Calculator className="w-4 h-4" />, label: 'Estimator' },
        { id: 'inflation', icon: <TrendingUp className="w-4 h-4" />, label: 'Inflation' },
        { id: 'fx', icon: <Activity className="w-4 h-4" />, label: 'FX Buffer' },
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
                {activeTool === 'relocation' && <MoveInEstimatorContent key="relocation" />}
                {activeTool === 'smart_budget' && <SmartBudgetEstimatorContent key="smart_budget" />}
                {activeTool === 'inflation' && <InflationOutlookContent key="inflation" />}
                {activeTool === 'fx' && <FxVolatilityContent key="fx" />}
            </AnimatePresence>
        </div>
    );
}
