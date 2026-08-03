import { useState } from 'react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useGoalsStore } from '@/store/useGoalsStore';
import { useAIChatStore } from '@/store/useAIChatStore';
import { ArrowLeft, Target, Plus, ShieldAlert, Plane, Home, Car, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DreamBoardView() {
    const { goals, addGoal, addMoneyToGoal } = useGoalsStore();
    const { setActiveTab } = useAIChatStore();
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Target');

    // Aggregate metrics
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

    const availableIcons = [
        { id: 'Target', comp: Target },
        { id: 'ShieldAlert', comp: ShieldAlert },
        { id: 'Plane', comp: Plane },
        { id: 'Home', comp: Home },
        { id: 'Car', comp: Car },
        { id: 'Coins', comp: Coins }
    ];

    const handleCreateGoal = () => {
        if (!newGoalName || !newGoalTarget) return;
        addGoal({
            name: newGoalName,
            targetAmount: parseFloat(newGoalTarget),
            icon: selectedIcon,
            savedAmount: 0
        });
        setIsAddModalOpen(false);
        setNewGoalName('');
        setNewGoalTarget('');
    };

    const getIconComp = (iconName: string) => {
        const match = availableIcons.find(i => i.id === iconName);
        const Comp = match ? match.comp : Target;
        return <Comp className="w-5 h-5 text-white/80" />;
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
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Dream Board</h2>
                        <div className="flex items-center gap-2">
                            <Target className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[12px] text-white/50 font-medium tracking-wide uppercase">Shared Goals & Savings</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-3xl px-6 py-8 overflow-y-auto pb-32 flex flex-col gap-8 scrollbar-none [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                
                {/* 1. Hero Summary */}
                <section className="relative w-full">
                    <div className="w-full rounded-[32px] overflow-hidden bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0A] border border-white/[0.08] shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center justify-center relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-rose-500/10 blur-[100px] pointer-events-none rounded-full" />
                        
                        <div className="text-[14px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-4">Total Dream Fund</div>
                        
                        <div className="flex items-end gap-3 mb-2 relative z-10">
                            <span className="text-[24px] font-bold text-white/30 mb-2">₱</span>
                            <span className="text-[64px] font-black text-white leading-none tracking-tighter drop-shadow-lg">
                                {totalSaved.toLocaleString()}
                            </span>
                        </div>
                        
                        <div className="text-[14px] font-medium text-white/40 mt-2">
                            of ₱{totalTarget.toLocaleString()} target
                        </div>
                    </div>
                </section>

                {/* 2. Goal Cards List */}
                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between pl-1">
                        <h3 className="text-[12px] font-bold text-white/40 uppercase tracking-wider">Active Dreams</h3>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                        >
                            <Plus className="w-4 h-4 text-white/80" />
                            <span className="text-[13px] font-medium text-white/80">New Dream</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {goals.map(goal => {
                            const progress = goal.targetAmount > 0 ? Math.min(100, Math.max(0, (goal.savedAmount / goal.targetAmount) * 100)) : 0;
                            const isComplete = progress >= 100;

                            return (
                                <div key={goal.id} className="relative w-full rounded-[28px] overflow-hidden bg-white/[0.02] border border-white/[0.08] flex flex-col group transition-all duration-300 hover:bg-white/[0.04]">
                                    
                                    <div className="p-6 flex flex-col gap-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isComplete ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                                    {getIconComp(goal.icon)}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[18px] font-bold text-white tracking-tight">{goal.name}</span>
                                                    <span className="text-[14px] text-white/50 font-medium">₱{goal.savedAmount.toLocaleString()} / ₱{goal.targetAmount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            
                                            {!isComplete && (
                                                <button 
                                                    onClick={() => addMoneyToGoal(goal.id, 1000)} // Simulate adding 1k
                                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5 text-white/70" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between text-[14px]">
                                            <span className="text-white/40 font-medium">Progress</span>
                                            <span className={`font-bold ${isComplete ? 'text-emerald-400' : 'text-white'}`}>{progress.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    
                                    {/* Option B: Edge-to-edge sleek linear progress bar at the bottom */}
                                    <div className="w-full h-1.5 bg-black/50 relative">
                                        <div 
                                            className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-rose-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* New Dream Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-0 left-0 w-full z-50 bg-[#1C1C1E] rounded-t-[32px] border-t border-white/10 p-8 flex flex-col gap-6"
                        >
                            <h3 className="text-2xl font-bold text-white">Create a New Dream</h3>
                            
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-2 block pl-1">Dream Name</label>
                                    <input 
                                        type="text"
                                        value={newGoalName}
                                        onChange={e => setNewGoalName(e.target.value)}
                                        placeholder="e.g. Boracay Trip"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-rose-500/50 transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-2 block pl-1">Target Amount (₱)</label>
                                    <input 
                                        type="number"
                                        value={newGoalTarget}
                                        onChange={e => setNewGoalTarget(e.target.value)}
                                        placeholder="50000"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-rose-500/50 transition-colors"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-[12px] font-bold text-white/40 uppercase tracking-wider mb-2 block pl-1">Select Icon</label>
                                    <div className="flex items-center gap-3">
                                        {availableIcons.map(icon => {
                                            const Comp = icon.comp;
                                            return (
                                                <button 
                                                    key={icon.id}
                                                    onClick={() => setSelectedIcon(icon.id)}
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${selectedIcon === icon.id ? 'bg-rose-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                                                >
                                                    <Comp className="w-5 h-5" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleCreateGoal}
                                disabled={!newGoalName || !newGoalTarget}
                                className="w-full py-4 rounded-full bg-white text-black font-bold text-[16px] mt-4 disabled:opacity-50"
                            >
                                Create Dream
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
