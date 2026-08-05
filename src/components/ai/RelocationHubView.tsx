import { useState, useMemo } from 'react';
import { usePluginsStore, FlightConfig } from '@/store/usePluginsStore';
import { useAIChatStore } from '@/store/useAIChatStore';
import { useCurrencyStore } from '@/store/useCurrencyStore';
import { ArrowLeft, PlaneTakeoff, Plane, CheckCircle2, Circle, Plus, Trash2, Box, Scale, Pencil, RefreshCw, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RelocationHubView() {
    const { relocationTasks, toggleRelocationTask, addRelocationTask, deleteRelocationTask, shippingRateZarPerKg, setShippingRateZarPerKg, flightConfig, setFlightConfig } = usePluginsStore();
    const { setActiveTab } = useAIChatStore();
    const { exchangeRate } = useCurrencyStore();
    
    const [newTaskText, setNewTaskText] = useState('');
    const [shippingKg, setShippingKg] = useState<number | ''>(20);

    const [isEditingRate, setIsEditingRate] = useState(false);
    const [tempRate, setTempRate] = useState(shippingRateZarPerKg.toString());

    const [isConfiguringFlight, setIsConfiguringFlight] = useState(false);
    const [tempFlight, setTempFlight] = useState<FlightConfig>(flightConfig || { airline: '', flightNumber: '', origin: '', destination: '', date: '' });
    
    const [isTracking, setIsTracking] = useState(false);
    const [flightStatus, setFlightStatus] = useState<{ gate?: string, seat?: string, terminal?: string, status?: string, flightDuration?: string } | null>(null);
    const [trackError, setTrackError] = useState('');

    const barcodeWidths = useMemo(() => {
        return [...Array(35)].map(() => Math.random() * 4 + 1);
    }, []);

    const flightProgress = useMemo(() => {
        if (!flightStatus) return 0;
        const s = flightStatus.status?.toLowerCase() || '';
        if (s.includes('arrive') || s.includes('land') || s.includes('complete')) return 100;
        if (s.includes('air') || s.includes('fly')) return 70;
        if (s.includes('depart')) return 40;
        if (s.includes('board')) return 20;
        return 0; // Scheduled / Delayed
    }, [flightStatus]);

    const handleTrackFlight = async () => {
        if (!flightConfig) return;
        setIsTracking(true);
        setTrackError('');
        try {
            const res = await fetch('/api/ai/track-flight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightConfig)
            });
            if (!res.ok) throw new Error('Failed to fetch status');
            const data = await res.json();
            setFlightStatus(data);
        } catch (err: any) {
            setTrackError(err.message);
        } finally {
            setIsTracking(false);
        }
    };

    const completedTasksCount = relocationTasks.filter(t => t.completed).length;
    const progressPct = relocationTasks.length > 0 ? Math.round((completedTasksCount / relocationTasks.length) * 100) : 0;

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;
        addRelocationTask(newTaskText.trim());
        setNewTaskText('');
    };

    // Calculate shipping costs based on weight
    const totalZar = (typeof shippingKg === 'number' ? shippingKg : 0) * shippingRateZarPerKg;
    const totalPhp = totalZar * exchangeRate;

    return (
        <div className="flex flex-col h-full bg-[#050505] relative w-full items-center">
            
            {/* Header */}
            <div className="w-full max-w-3xl px-6 pt-8 pb-6 flex items-center justify-between border-b border-white/[0.05] shrink-0 sticky top-0 z-10 bg-[#050505]/90 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveTab('plugins')}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/70" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Relocation Hub</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-full max-w-[150px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPct}%` }}
                                    className="h-full bg-purple-500 rounded-full"
                                />
                            </div>
                            <span className="text-[12px] text-white/50 font-medium">{progressPct}% Complete</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-3xl px-6 py-8 overflow-y-auto pb-32 flex flex-col gap-10 scrollbar-none [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                
                {/* 1. Boarding Pass Card */}
                <section className="relative w-full max-w-xl mx-auto">
                    <div className="relative w-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0A] border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        {/* Cutouts */}
                        <div className="absolute top-[65%] -left-4 w-8 h-8 bg-[#050505] rounded-full border-r border-white/10 z-10" />
                        <div className="absolute top-[65%] -right-4 w-8 h-8 bg-[#050505] rounded-full border-l border-white/10 z-10" />
                        
                        {!flightConfig ? (
                            <div className="p-12 flex flex-col items-center justify-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                    <PlaneTakeoff className="w-8 h-8 text-white/30" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">No flight added yet</h3>
                                    <p className="text-sm text-white/40 max-w-[250px]">Configure your flight details to track it live.</p>
                                </div>
                                <button 
                                    onClick={() => setIsConfiguringFlight(true)}
                                    className="mt-2 px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors"
                                >
                                    Setup Flight
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Top Section */}
                                <div className="p-8 pb-10 flex flex-col gap-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                                <PlaneTakeoff className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-white/80 font-medium text-sm">{flightConfig.airline}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {trackError && <AlertCircle className="w-4 h-4 text-red-400" title={trackError} />}
                                            <button 
                                                onClick={handleTrackFlight} 
                                                disabled={isTracking}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 border border-emerald-500/20"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${isTracking ? 'animate-spin' : ''}`} />
                                                <span>{flightStatus?.status || 'Track Live'}</span>
                                            </button>
                                            <button 
                                                onClick={() => setIsConfiguringFlight(true)}
                                                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[56px] font-black text-white leading-none tracking-tighter drop-shadow-lg">{flightConfig.origin}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col items-center justify-center relative px-6 min-h-[60px]">
                                            <div className="w-full relative flex items-center justify-center h-full">
                                                <div className="w-full border-t-2 border-dashed border-white/20 absolute top-1/2 -translate-y-1/2"></div>
                                                
                                                {flightConfig.layover && (
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1 bg-[#121213] px-3 flex flex-col items-center z-10">
                                                        <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase mb-1">VIA {flightConfig.layover}</span>
                                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500/50 bg-[#121213] shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                                                    </div>
                                                )}

                                                <div 
                                                    className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-1000 ease-out flex items-center justify-center" 
                                                    style={{ left: `${flightProgress}%`, transform: 'translate(-50%, -50%)' }}
                                                >
                                                    <Plane className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                                </div>
                                            </div>

                                            <span className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-2 text-[10px] text-white/40 uppercase tracking-widest font-medium bg-[#121213] px-2 z-10 whitespace-nowrap">
                                                {flightStatus?.flightDuration || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[56px] font-black text-white leading-none tracking-tighter drop-shadow-lg">{flightConfig.destination}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-full border-t-2 border-dashed border-white/10 relative"></div>

                                {/* Bottom Section */}
                                <div className="p-8 pt-6 flex flex-col gap-6 bg-white/[0.02]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Flight</div>
                                            <div className="text-[16px] font-bold text-white">{flightConfig.flightNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Terminal</div>
                                            <div className="text-[16px] font-bold text-white">{flightStatus?.terminal || 'TBD'}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Gate</div>
                                            <div className="text-[16px] font-bold text-white">{flightStatus?.gate || 'TBD'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-medium">Date</div>
                                            <div className="text-[16px] font-bold text-white">{flightConfig.date}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Barcode Mock */}
                                    <div className="w-full h-12 flex items-center justify-between opacity-30 mt-2 mix-blend-screen">
                                        {barcodeWidths.map((w, i) => (
                                            <div key={i} className="h-full bg-white rounded-full" style={{ width: `${w}px`, marginRight: '3px' }} />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* 2. Shipping Estimator */}
                <section className="mt-4">
                    <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-4 pl-1 flex items-center gap-2">
                        <Box className="w-4 h-4" /> Airfreight Estimator (SA to PH)
                    </h3>
                    <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 overflow-hidden">
                        {/* Decorative glow */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                        
                        <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                            <div className="w-full md:w-5/12 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[12px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-emerald-400" /> Total Weight
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {isEditingRate ? (
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="number"
                                                    value={tempRate}
                                                    onChange={(e) => setTempRate(e.target.value)}
                                                    className="w-16 bg-black/40 border border-emerald-500/50 rounded py-1 px-2 text-white text-[11px] font-bold focus:outline-none"
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const num = Number(tempRate);
                                                        if (!isNaN(num) && num > 0) setShippingRateZarPerKg(num);
                                                        setIsEditingRate(false);
                                                    }}
                                                    className="p-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    setTempRate(shippingRateZarPerKg.toString());
                                                    setIsEditingRate(true);
                                                }}
                                                className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                                            >
                                                Rate: {shippingRateZarPerKg} ZAR/kg <Pencil className="w-3 h-3 ml-0.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="relative group">
                                    <input 
                                        type="number" 
                                        value={shippingKg}
                                        onChange={(e) => setShippingKg(e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-4xl text-white font-bold focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.02] transition-all placeholder:text-white/20"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 font-bold text-2xl group-focus-within:text-emerald-500/50 transition-colors">KG</span>
                                </div>
                            </div>
                            
                            <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
                            
                            <div className="w-full md:w-7/12 flex flex-col gap-5">
                                <div className="flex items-end justify-between">
                                    <span className="text-[14px] text-white/50 font-medium tracking-wide">Estimated Cost (ZAR)</span>
                                    <span className="text-2xl font-semibold text-white/80">R {totalZar.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-px bg-white/5" />
                                <div className="flex items-end justify-between">
                                    <span className="text-[14px] text-emerald-400/60 font-medium tracking-wide uppercase">Converted (PHP)</span>
                                    <span className="text-4xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">₱ {Math.round(totalPhp).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Master Checklist */}
                <section className="mt-4">
                    <div className="flex items-center justify-between mb-4 pl-1">
                        <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-wider">Master Move Checklist</h3>
                        <span className="text-[12px] text-white/40 font-medium tracking-wide">{completedTasksCount} / {relocationTasks.length} Done</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        {relocationTasks.map(task => (
                            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-[20px] border transition-all duration-300 group ${task.completed ? 'bg-white/[0.02] border-white/[0.05]' : 'bg-white/[0.05] border-white/10 hover:border-white/20 hover:bg-white/[0.08]'}`}>
                                <button 
                                    onClick={() => toggleRelocationTask(task.id)}
                                    className="shrink-0 focus:outline-none"
                                >
                                    {task.completed ? (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                            <CheckCircle2 className="w-4 h-4 text-black" />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" />
                                    )}
                                </button>
                                <span className={`flex-1 text-[15px] font-medium transition-all duration-300 ${task.completed ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                    {task.text}
                                </span>
                                <button 
                                    onClick={() => deleteRelocationTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddTask} className="mt-6 flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="Add a new task..." 
                                className="w-full bg-transparent border-b-2 border-white/10 py-3 pl-2 pr-4 text-[15px] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>
                        <button type="submit" disabled={!newTaskText.trim()} className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:bg-white/10 text-black disabled:text-white/30 shadow-lg">
                            <Plus className="w-5 h-5" />
                        </button>
                    </form>
                </section>

            </div>

            {/* Flight Setup Modal */}
            <AnimatePresence>
                {isConfiguringFlight && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm bg-[#111] border border-white/10 rounded-[28px] p-6 shadow-2xl flex flex-col gap-5"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Flight Details</h3>
                                <button onClick={() => setIsConfiguringFlight(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="w-4 h-4 text-white/60" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Airline Name</label>
                                    <input type="text" value={tempFlight.airline} onChange={e => setTempFlight({...tempFlight, airline: e.target.value})} placeholder="e.g. Singapore Airlines" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Flight Number</label>
                                        <input type="text" value={tempFlight.flightNumber} onChange={e => setTempFlight({...tempFlight, flightNumber: e.target.value})} placeholder="e.g. SQ 479" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Date</label>
                                        <input type="date" value={tempFlight.date} onChange={e => setTempFlight({...tempFlight, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors [&::-webkit-calendar-picker-indicator]:invert-[0.8]" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Origin (Code)</label>
                                        <input type="text" value={tempFlight.origin} onChange={e => setTempFlight({...tempFlight, origin: e.target.value.toUpperCase()})} placeholder="JNB" maxLength={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors uppercase" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Dest (Code)</label>
                                        <input type="text" value={tempFlight.destination} onChange={e => setTempFlight({...tempFlight, destination: e.target.value.toUpperCase()})} placeholder="MNL" maxLength={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors uppercase" />
                                    </div>
                                </div>
                                
                                <div className="w-full h-px bg-white/5 my-1" />
                                <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center justify-center">Layover (Optional)</div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Layover (Code)</label>
                                        <input type="text" value={tempFlight.layover || ''} onChange={e => setTempFlight({...tempFlight, layover: e.target.value.toUpperCase()})} placeholder="SIN" maxLength={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors uppercase" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Connecting Flight</label>
                                        <input type="text" value={tempFlight.connectingFlightNumber || ''} onChange={e => setTempFlight({...tempFlight, connectingFlightNumber: e.target.value})} placeholder="e.g. SQ 918" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-emerald-500/50 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => {
                                    if (tempFlight.airline && tempFlight.flightNumber && tempFlight.origin && tempFlight.destination && tempFlight.date) {
                                        setFlightConfig(tempFlight);
                                        setFlightStatus(null); // Reset status when new flight is saved
                                        setIsConfiguringFlight(false);
                                    }
                                }}
                                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[14px] transition-colors"
                            >
                                Save Flight
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
