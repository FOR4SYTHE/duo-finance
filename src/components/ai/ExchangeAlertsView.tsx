import { useState } from 'react';
import { usePluginsStore } from '@/store/usePluginsStore';
import { useAIChatStore } from '@/store/useAIChatStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { ArrowLeft, BellRing, TrendingUp, BarChart3, AlertCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export function ExchangeAlertsView() {
    const { targetExchangeRate, setTargetExchangeRate } = usePluginsStore();
    const { setActiveTab } = useAIChatStore();
    const { exchangeRate } = useCurrencyStore();
    
    // Local state for the slider so it drags smoothly before saving
    const [localTarget, setLocalTarget] = useState<number>(targetExchangeRate || 3.25);

    // The global exchangeRate is PHP to ZAR (e.g., 0.27). We want ZAR to PHP (e.g., 3.70).
    const zarToPhpRate = 1 / exchangeRate;

    // Calculate progress
    // Let's say the baseline we care about tracking is between 2.80 and 3.60
    const minSlider = 2.80;
    const maxSlider = 3.80;
    
    const calculatePct = (val: number) => {
        return Math.max(0, Math.min(100, ((val - minSlider) / (maxSlider - minSlider)) * 100));
    };

    const currentPct = calculatePct(zarToPhpRate);
    const targetPct = calculatePct(localTarget);

    const isTargetHit = zarToPhpRate >= localTarget;

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setLocalTarget(val);
        setTargetExchangeRate(val);
    };

    return (
        <div className="flex flex-col h-full bg-[#000] relative w-full items-center">
            
            {/* Header */}
            <div className="w-full max-w-3xl px-6 pt-8 pb-6 flex items-center justify-between shrink-0 sticky top-0 z-10 bg-[#000]/80 backdrop-blur-xl border-b border-white/[0.05]">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveTab('plugins')}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Exchange Alerts</h2>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[12px] text-white/50 font-medium tracking-wide uppercase">Live ZAR to PHP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-3xl px-6 py-8 overflow-y-auto pb-32 flex flex-col gap-10 scrollbar-none [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                
                {/* 1. Live Rate Hero */}
                <section className="relative w-full">
                    <div className="w-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0A] border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center justify-center relative">
                        {/* Subtle glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
                        
                        <div className="text-[14px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-4">Current Rate</div>
                        
                        <div className="flex items-end gap-3 mb-2 relative z-10">
                            <span className="text-[24px] font-bold text-white/30 mb-2">₱</span>
                            <span className="text-[80px] font-black text-white leading-none tracking-tighter drop-shadow-lg">
                                {zarToPhpRate.toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05]">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-[13px] font-medium text-white/60">Live market sync active</span>
                        </div>
                    </div>
                </section>

                {/* 2. Target Setter Slider */}
                <section>
                    <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-6 pl-1 flex items-center gap-2">
                        <Target className="w-4 h-4" /> Set Target Alert
                    </h3>
                    
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-8 flex flex-col gap-8">
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[14px] text-white/50 font-medium">Alert me when 1 ZAR hits</span>
                                <span className="text-[40px] font-black text-white tracking-tight mt-1">₱ {localTarget.toFixed(2)}</span>
                            </div>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isTargetHit ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-white/5 border border-white/10'}`}>
                                <BellRing className={`w-6 h-6 ${isTargetHit ? 'text-black' : 'text-white/40'}`} />
                            </div>
                        </div>

                        {/* Custom Slider Track */}
                        <div className="relative w-full h-16 flex items-center mt-4">
                            {/* Track Base */}
                            <div className="absolute w-full h-3 bg-black/50 rounded-full border border-white/5 overflow-hidden">
                                {/* Fill based on target */}
                                <div 
                                    className="absolute h-full bg-white/20"
                                    style={{ width: `${targetPct}%` }}
                                />
                                {/* Current Rate Indicator inside track */}
                                <div 
                                    className="absolute h-full w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] z-10 transition-all duration-1000 ease-out"
                                    style={{ left: `${currentPct}%` }}
                                />
                            </div>
                            
                            {/* The actual input range layered on top */}
                            <input 
                                type="range" 
                                min={minSlider} 
                                max={maxSlider} 
                                step={0.01}
                                value={localTarget}
                                onChange={handleSliderChange}
                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            
                            {/* Custom Thumb */}
                            <div 
                                className="absolute w-8 h-8 bg-white rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#1C1C1E] pointer-events-none z-10"
                                style={{ left: `calc(${targetPct}% - 16px)` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[12px] font-medium text-white/30 uppercase tracking-widest mt-[-10px]">
                            <span>₱ {minSlider.toFixed(2)}</span>
                            <span>₱ {maxSlider.toFixed(2)}</span>
                        </div>

                    </div>
                </section>

                {/* 3. Status Message */}
                <section>
                    <div className={`rounded-2xl p-6 border flex items-start gap-4 transition-all duration-500 ${isTargetHit ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/[0.02] border-white/[0.05]'}`}>
                        {isTargetHit ? (
                            <BellRing className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-6 h-6 text-white/30 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col gap-1">
                            <span className={`text-[15px] font-semibold ${isTargetHit ? 'text-emerald-400' : 'text-white/80'}`}>
                                {isTargetHit ? 'Target Reached!' : 'Waiting for market...'}
                            </span>
                            <span className="text-[13px] text-white/50 leading-relaxed">
                                {isTargetHit 
                                    ? `The live exchange rate is currently at or above your target of ₱${localTarget.toFixed(2)}. It's a great time to transfer.`
                                    : `We'll let you know when the rate hits ₱${localTarget.toFixed(2)}. The live rate is currently ₱${Math.abs(localTarget - zarToPhpRate).toFixed(2)} away.`}
                            </span>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
