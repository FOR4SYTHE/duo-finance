"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Edit3, Target, Calendar, HelpCircle } from "lucide-react";
import * as Icons from "lucide-react";
import { useBudgetStore, Goal } from "@/store/useBudgetStore";
import { AmountInputModal } from "./AmountInputModal";

interface AddGoalSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const GOAL_ICONS = ['Target', 'Car', 'Plane', 'Home', 'GraduationCap', 'Heart', 'ShieldAlert', 'ShoppingBag', 'Laptop'];

export function AddGoalSheet({ isOpen, onClose }: AddGoalSheetProps) {
    const { addGoal } = useBudgetStore();
    const [name, setName] = useState("");
    const [icon, setIcon] = useState("Target");
    const [date, setDate] = useState("");
    const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);

    const handleConfirmAmount = (amount: number) => {
        addGoal({
            name,
            icon,
            targetAmount: amount,
            targetDate: date || undefined,
            savedAmount: 0
        });
        setName("");
        setIcon("Target");
        setDate("");
        setIsAmountModalOpen(false);
        onClose();
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" onClick={(e) => e.stopPropagation()}>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                            exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                            className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[90dvh] overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="text-white font-medium">Create Goal</h3>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar min-h-0 pb-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Goal Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Dream Vacation"
                                        className="bg-black/40 border border-white/5 outline-none text-white text-sm px-4 py-3 rounded-2xl focus:border-white/20 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GOAL_ICONS.map(ic => {
                                            const Icon = (Icons as any)[ic] || HelpCircle;
                                            return (
                                                <button
                                                    key={ic}
                                                    onClick={() => setIcon(ic)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                                        icon === ic ? 'bg-white text-black' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Target Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        value={date} 
                                        onChange={e => setDate(e.target.value)}
                                        className="bg-black/40 border border-white/5 outline-none text-white text-sm px-4 py-3 rounded-2xl focus:border-white/20 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <div className="shrink-0 pt-4 mt-auto">
                                <button 
                                    disabled={!name.trim()}
                                    onClick={() => setIsAmountModalOpen(true)}
                                    className="w-full h-14 rounded-full bg-white text-black font-semibold tracking-wide disabled:opacity-50 disabled:bg-white/10 disabled:text-white/50 transition-colors"
                                >
                                    Set Target Amount
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AmountInputModal 
                isOpen={isAmountModalOpen}
                onClose={() => setIsAmountModalOpen(false)}
                onConfirm={handleConfirmAmount}
                title={`Target for ${name}`}
                initialAmount={0}
            />
        </>
    );
}

export function EditGoalSheet({ isOpen, onClose, goalId }: { isOpen: boolean, onClose: () => void, goalId: string | null }) {
    const { goals, updateGoal } = useBudgetStore();
    const goal = goals.find(g => g.id === goalId);

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("Target");
    const [date, setDate] = useState("");
    const [savedAmount, setSavedAmount] = useState(0);
    const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);

    // Sync state when goal changes
    useEffect(() => {
        if (isOpen && goal) {
            setName(goal.name);
            setIcon(goal.icon);
            setDate(goal.targetDate || "");
            setSavedAmount(goal.savedAmount);
        }
    }, [isOpen, goal?.id]);

    const handleConfirmAmount = (amount: number) => {
        if (goal) {
            updateGoal(goal.id, {
                name,
                icon,
                targetAmount: amount,
                targetDate: date || undefined,
                savedAmount
            });
        }
        setIsAmountModalOpen(false);
        onClose();
        // Reset state
        setName(""); setIcon("Target"); setDate("");
    };

    const handleSaveWithoutAmountChange = () => {
        if (goal) {
            updateGoal(goal.id, {
                name,
                icon,
                targetDate: date || undefined,
                savedAmount
            });
        }
        onClose();
        setName(""); setIcon("Target"); setDate("");
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && goal && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" onClick={(e) => e.stopPropagation()}>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                            exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                            className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col max-h-[90dvh] overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 shrink-0">
                                <h3 className="text-white font-medium">Edit Goal</h3>
                                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar min-h-0 pb-2">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Goal Name</label>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={e => setName(e.target.value)}
                                        disabled={goalId === 'goal-1'}
                                        placeholder="e.g. Dream Vacation"
                                        className="bg-black/40 border border-white/5 outline-none text-white text-sm px-4 py-3 rounded-2xl focus:border-white/20 transition-colors disabled:opacity-50"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {GOAL_ICONS.map(ic => {
                                            const Icon = (Icons as any)[ic] || HelpCircle;
                                            return (
                                                <button
                                                    key={ic}
                                                    onClick={() => setIcon(ic)}
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                                        icon === ic ? 'bg-white text-black' : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.1] hover:text-white'
                                                    }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Target Date (Optional)</label>
                                    <input 
                                        type="date" 
                                        value={date} 
                                        onChange={e => setDate(e.target.value)}
                                        className="bg-black/40 border border-white/5 outline-none text-white text-sm px-4 py-3 rounded-2xl focus:border-white/20 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Saved So Far</label>
                                    <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 focus-within:border-white/20 transition-colors">
                                        <span className="text-white/50 font-medium">₱</span>
                                        <input 
                                            type="number"
                                            value={savedAmount || ''}
                                            onChange={e => setSavedAmount(Number(e.target.value) || 0)}
                                            placeholder="0"
                                            className="bg-transparent border-none outline-none text-white text-sm w-full font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-auto shrink-0 pt-4">
                                <button 
                                    disabled={!name.trim()}
                                    onClick={handleSaveWithoutAmountChange}
                                    className="flex-1 h-14 rounded-full bg-white/[0.05] border border-white/10 text-white font-semibold tracking-wide disabled:opacity-50 transition-colors"
                                >
                                    Save Details
                                </button>
                                {goalId !== 'goal-1' && (
                                    <button 
                                        disabled={!name.trim()}
                                        onClick={() => setIsAmountModalOpen(true)}
                                        className="flex-1 h-14 rounded-full bg-white text-black font-semibold tracking-wide disabled:opacity-50 transition-colors"
                                    >
                                        Edit Target
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AmountInputModal 
                isOpen={isAmountModalOpen}
                onClose={() => setIsAmountModalOpen(false)}
                onConfirm={handleConfirmAmount}
                title={`Target for ${name}`}
                initialAmount={goal?.targetAmount || 0}
            />
        </>
    );
}

export function GoalMenuSheet({ isOpen, onClose, goalId, onEdit }: { isOpen: boolean, onClose: () => void, goalId: string | null, onEdit: () => void }) {
    const { goals, removeGoal } = useBudgetStore();
    const goal = goals.find(g => g.id === goalId);
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!goal || !isOpen) return null;

    const isEmergency = goal.id === 'goal-1';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4" onClick={(e) => e.stopPropagation()}>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0, transition: { type: "spring", damping: 28, stiffness: 300 } }}
                        exit={{ y: "100%", transition: { type: "tween", duration: 0.2, ease: "easeIn" } }}
                        className="w-full max-w-md bg-[#111] sm:rounded-[32px] rounded-t-[32px] border border-white/10 p-6 relative z-10 flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-medium">{goal.name}</h3>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {confirmDelete ? (
                            <div className="bg-[#FF453A]/10 border border-[#FF453A]/20 p-4 rounded-2xl flex flex-col gap-4">
                                <div className="text-center">
                                    <p className="text-[#FF453A] font-medium mb-1">Delete this goal?</p>
                                    <p className="text-[#FF453A]/70 text-xs leading-relaxed">This will discard all tracked progress. This cannot be undone.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setConfirmDelete(false)}
                                        className="flex-1 py-3 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => {
                                            removeGoal(goal.id);
                                            setConfirmDelete(false);
                                            onClose();
                                        }}
                                        className="flex-1 py-3 rounded-full bg-[#FF453A] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                                    >
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => { onClose(); onEdit(); }}
                                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.02] transition-colors text-left text-white"
                                >
                                    <Edit3 className="w-5 h-5 text-white/70" />
                                    <span className="font-medium">Edit Goal Details</span>
                                </button>
                                {!isEmergency && (
                                    <button 
                                        onClick={() => setConfirmDelete(true)}
                                        className="flex items-center gap-3 w-full p-4 rounded-2xl transition-colors text-left bg-[#FF453A]/5 hover:bg-[#FF453A]/10 border border-[#FF453A]/10 text-[#FF453A]"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">Delete Goal</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
