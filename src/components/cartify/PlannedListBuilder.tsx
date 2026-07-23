"use client";

import { useState, useRef } from "react";
import { useCartifyStore } from "@/store/useCartifyStore";
import { Plus, ChevronRight, ListTodo, X, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PremiumSparkle = () => (
    <div className="relative flex items-center justify-center w-4 h-4 mx-0.5">
        {/* Ambient glow */}
        <motion.div 
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#30D158] rounded-full blur-[4px]"
        />
        {/* Cross sparkles */}
        <motion.div
            animate={{ rotate: 90 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
        >
            <div className="absolute w-3.5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
            <div className="absolute h-3.5 w-[1.5px] bg-gradient-to-b from-transparent via-white to-transparent opacity-80" />
        </motion.div>
        {/* Core highlight */}
        <div className="w-1 h-1 bg-white rounded-full z-10 shadow-[0_0_5px_white]" />
    </div>
);

const QUICK_CATEGORIES = [
    {
        title: "Groceries",
        items: [
            { icon: "🥛", name: "Milk" },
            { icon: "🥚", name: "Eggs" },
            { icon: "🍞", name: "Bread" },
            { icon: "🥬", name: "Produce" },
            { icon: "🍗", name: "Meat" },
            { icon: "☕️", name: "Coffee" },
            { icon: "🍚", name: "Rice" },
        ]
    },
    {
        title: "Household",
        items: [
            { icon: "🧻", name: "Toilet Paper" },
            { icon: "🧼", name: "Soap" },
            { icon: "🧺", name: "Detergent" },
            { icon: "🗑️", name: "Trash Bags" },
        ]
    },
    {
        title: "Pharmacy & Care",
        items: [
            { icon: "💊", name: "Medicine" },
            { icon: "🩹", name: "First Aid" },
            { icon: "🧴", name: "Vitamins" },
        ]
    }
];

export function PlannedListBuilder() {
    const { items, addPlannedItem, finishBuildingList, removeItem } = useCartifyStore();
    const [newItemName, setNewItemName] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim()) {
            addPlannedItem(newItemName.trim());
            setNewItemName("");
            inputRef.current?.focus();
        }
    };
    
    const handleQuickAdd = (name: string) => {
        addPlannedItem(name);
        inputRef.current?.focus();
    };

    // Check if an item is already added to prevent quick-adding it multiple times accidentally
    const isAdded = (name: string) => items.some(i => i.name.toLowerCase() === name.toLowerCase());

    return (
        <div className="flex flex-col w-full min-h-full relative z-20 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 mt-4 px-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#30D158]/20 to-transparent flex items-center justify-center border border-[#30D158]/30 shadow-[0_0_20px_rgba(48,209,88,0.15)]">
                    <ListTodo className="w-6 h-6 text-[#30D158]" />
                </div>
                <div>
                    <h2 className="text-white text-xl font-semibold tracking-tight">Build your list</h2>
                    <p className="text-white/50 text-[13px] mt-0.5">Add items to buy. Enter prices later.</p>
                </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAdd} className="relative mb-6 px-2">
                <div className="relative flex items-center">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Milk, Eggs, Bread..." 
                        className="w-full h-14 rounded-full pl-5 pr-14 text-white placeholder-white/30 outline-none transition-all duration-300 text-[15px] shadow-inner border-[1.5px] bg-white/[0.04] border-white/[0.08] focus:border-[#30D158]/50 focus:bg-white/[0.06]"
                    />
                    <AnimatePresence>
                        {newItemName.trim() && (
                            <motion.button 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                type="submit"
                                className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-full bg-[#30D158] text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(48,209,88,0.4)]"
                            >
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </form>

            {/* Content Area */}
            <div className="flex-1 flex flex-col gap-8 px-2 overflow-x-hidden pb-4">
                {/* Active Items */}
                <div className="flex flex-col gap-2">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, idx) => (
                            <motion.div 
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-4 flex items-center gap-4 group hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center border border-white/5 shadow-inner">
                                    <span className="text-white/40 text-[10px] font-bold">{idx + 1}</span>
                                </div>
                                <span className="text-white text-[15px] font-medium tracking-wide flex-1">{item.name}</span>
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 active:scale-90 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Quick Suggestions Dropdown / Grid */}
                <motion.div 
                    layout
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="flex flex-col pt-2 pb-8"
                >
                    <AnimatePresence mode="wait">
                        {items.length > 0 && !showSuggestions ? (
                            <motion.button 
                                key="collapsed-btn"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => setShowSuggestions(true)}
                                className="h-10 px-4 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center gap-2 self-start hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
                            >
                                <PremiumSparkle />
                                <span className="text-[13px] font-medium">More quick suggestions</span>
                                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-50" />
                            </motion.button>
                        ) : (
                            <motion.div 
                                key="expanded-grid"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col gap-6"
                            >
                                <div className="flex items-center gap-2 text-[#30D158]/80 mb-1 px-1">
                                    <PremiumSparkle />
                                    <span className="text-[11px] font-bold tracking-widest uppercase">Quick Suggestions</span>
                                </div>
                                
                                {QUICK_CATEGORIES.map(category => (
                                    <div key={category.title} className="flex flex-col gap-2.5">
                                        <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider px-2">
                                            {category.title}
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {category.items.map(item => {
                                                const added = isAdded(item.name);
                                                return (
                                                    <button
                                                        key={item.name}
                                                        type="button"
                                                        onClick={() => !added && handleQuickAdd(item.name)}
                                                        className={`h-9 px-3.5 rounded-full flex items-center gap-2 transition-all duration-300 active:scale-95 ${
                                                            added 
                                                                ? 'bg-[#30D158]/10 border border-[#30D158]/20 text-[#30D158]/60 cursor-default scale-95'
                                                                : 'bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-white/10 text-white/80'
                                                        }`}
                                                    >
                                                        <span className="text-sm">{item.icon}</span>
                                                        <span className="text-[13px] font-medium tracking-wide">
                                                            {item.name}
                                                        </span>
                                                        {added && <Check className="w-3.5 h-3.5 ml-1 text-[#30D158]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <button
                onClick={finishBuildingList}
                disabled={items.length === 0}
                className="w-full mt-auto h-[64px] rounded-full bg-white text-black font-semibold text-[17px] tracking-wide flex items-center justify-between px-6 hover:opacity-90 active:scale-[0.98] transition-all duration-300 group disabled:opacity-50 disabled:bg-white/10 disabled:text-white/40 disabled:scale-100 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
                <span className="pl-2">Start Shopping</span>
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${items.length === 0 ? 'bg-white/10' : 'bg-black/10 group-hover:bg-black/20'}`}>
                    <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                </div>
            </button>
        </div>
    );
}
