"use client";

import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { ChevronLeft, Receipt, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function ReceiptView() {
    const { items, budget, endTrip, hideReceipt } = useCartifyStore();
    const { exchangeRate } = useCurrencyStore();

    const totalSpent = items.reduce((acc, item) => acc + item.amount, 0);
    const vatableSubtotal = items.filter(i => i.isVatable).reduce((acc, i) => acc + i.amount, 0);
    const vatExemptSubtotal = items.filter(i => !i.isVatable).reduce((acc, i) => acc + i.amount, 0);
    
    // VAT is 12% backed out of the vatable subtotal (prices are VAT inclusive)
    const vatAmount = vatableSubtotal * (12 / 112);
    const vatableNet = vatableSubtotal - vatAmount;

    const isOverBudget = totalSpent > budget;
    const overage = totalSpent - budget;

    // Basic rule-based suggestions (no LLM for now per spec)
    const suggestions = [];
    if (isOverBudget) {
        // Group by category to find biggest contributor
        const byCategory = items.reduce((acc, item) => {
            const cat = item.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + item.amount;
            return acc;
        }, {} as Record<string, number>);
        
        let biggestCat = '';
        let biggestAmt = 0;
        for (const [cat, amt] of Object.entries(byCategory)) {
            if (amt > biggestAmt) {
                biggestCat = cat;
                biggestAmt = amt;
            }
        }
        if (biggestCat) {
            suggestions.push(`"${biggestCat}" was your highest category at ₱${biggestAmt.toLocaleString()}.`);
        }
        
        // Find most expensive individual item
        if (items.length > 0) {
            const mostExp = [...items].sort((a, b) => b.amount - a.amount)[0];
            suggestions.push(`Your most expensive item was "${mostExp.name}" (₱${mostExp.amount.toLocaleString()}).`);
        }
    }

    return (
        <div className="flex flex-col w-full h-full relative z-20 pb-24 px-4 overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between mb-8 pt-4">
                <button onClick={hideReceipt} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <span className="text-white/80 font-medium tracking-wide">Summary</span>
                <div className="w-10 h-10" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-[#111] rounded-[32px] border border-white/10 overflow-hidden flex flex-col relative"
            >
                {/* Receipt Header */}
                <div className="flex flex-col items-center pt-10 pb-6 px-6 border-b border-dashed border-white/20">
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <Receipt className="w-6 h-6 text-white/70" />
                    </div>
                    <span className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-2">Trip Receipt</span>
                    <h2 className="text-white text-4xl font-light tracking-tight mb-2">
                        ₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </h2>
                    <span className="text-white/50 font-medium tracking-wide">
                        ≈ R{(totalSpent * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                    
                    {isOverBudget ? (
                        <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Over by ₱{overage.toLocaleString()}</span>
                        </div>
                    ) : (
                        <div className="mt-4 flex items-center gap-2 bg-[#30D158]/10 border border-[#30D158]/20 px-4 py-1.5 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
                            <span className="text-[#30D158] text-xs font-bold uppercase tracking-wider">Under Budget</span>
                        </div>
                    )}
                </div>

                {/* Over Budget Suggestions */}
                {isOverBudget && suggestions.length > 0 && (
                    <div className="px-6 py-6 border-b border-dashed border-white/20 bg-red-500/5">
                        <span className="text-red-500/80 text-xs font-bold uppercase tracking-widest mb-3 block">Observations</span>
                        <ul className="flex flex-col gap-2">
                            {suggestions.map((s, i) => (
                                <li key={i} className="text-white/70 text-sm leading-relaxed flex gap-2">
                                    <span className="text-red-500">•</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Itemized List */}
                <div className="flex flex-col gap-4 px-6 py-8 border-b border-dashed border-white/20">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2 block">Itemized</span>
                    {items.filter(i => i.status === 'in-cart').map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-white/90 text-sm font-medium">{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                                {item.category && <span className="text-white/40 text-xs">{item.category} {!item.isVatable && '• Exempt'}</span>}
                            </div>
                            <span className="text-white/80 font-medium font-mono text-sm">₱{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <span className="text-white/30 text-sm text-center block">No items purchased.</span>
                    )}
                </div>

                {/* VAT Breakdown */}
                <div className="flex flex-col gap-3 px-6 py-8 bg-white/[0.02]">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2 block">Tax Breakdown</span>
                    
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">VAT-Exempt Sales</span>
                        <span className="text-white/70 font-mono">₱{vatExemptSubtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">VATable Sales (Net)</span>
                        <span className="text-white/70 font-mono">₱{vatableNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-white/50">VAT Amount (12%)</span>
                        <span className="text-white/70 font-mono">₱{vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    
                    <div className="w-full h-px bg-white/10 my-2" />
                    
                    <div className="flex justify-between items-center">
                        <span className="text-white/80 font-medium">Grand Total</span>
                        <span className="text-white font-mono font-medium">₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                </div>

                {/* Finish Action */}
                <div className="p-6">
                    <button
                        onClick={endTrip}
                        className="w-full h-[60px] rounded-full bg-white text-black font-semibold text-base tracking-wide flex items-center justify-center hover:bg-white/90 active:scale-[0.98] transition-all duration-300"
                    >
                        Finish & Clear Trip
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
