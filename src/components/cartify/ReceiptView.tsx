"use client";

import { useCartifyStore } from "@/store/useCartifyStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { ChevronLeft, Receipt, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

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

    useEffect(() => {
        if (!isOverBudget && totalSpent > 0) {
            // Trigger celebration for staying under budget!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.3 },
                colors: ['#30D158', '#64D2FF', '#FFD60A', '#FFFFFF']
            });
        }
    }, [isOverBudget, totalSpent]);

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
        <div className="flex flex-col w-full min-h-full relative z-20">
            
            <div className="flex items-center justify-between mb-6 pt-4 px-4 shrink-0">
                <button onClick={hideReceipt} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <span className="text-white/80 font-medium tracking-wide">Summary</span>
                <div className="w-10 h-10" />
            </div>

            <div className="flex-1 px-4 pb-24 flex flex-col">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mx-auto mt-2 flex flex-col"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(255,255,255,0.05))' }}
                >
                    {/* Main Receipt Body */}
                    <div className="w-full bg-[#fcfcfc] rounded-t-[32px] flex flex-col relative">
                        {/* Receipt Header */}
                        <div className="flex flex-col items-center pt-12 pb-6 px-6 relative">
                            {(!isOverBudget && totalSpent > 0) ? (
                                <motion.img 
                                    initial={{ scale: 0, opacity: 0, x: -20 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    src="/mascot/dufi-host.webp"
                                    alt="Dufi Host"
                                    className="w-28 h-28 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.15)] absolute -left-6 top-2 z-20"
                                />
                            ) : (
                                <div className="mb-4 text-4xl">🎉</div>
                            )}
                            <h2 className="text-black text-[2.5rem] font-medium tracking-tight mb-2 mt-4">
                                ₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </h2>
                            <span className="text-black/40 font-medium tracking-wide">
                                ≈ R{(totalSpent * exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                            
                            {isOverBudget ? (
                                <div className="mt-6 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Over Budget</span>
                                </div>
                            ) : (
                                <div className="mt-6 flex items-center gap-2 bg-[#30D158]/10 text-[#28a745] px-4 py-1.5 rounded-full border border-[#30D158]/20">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Under Budget</span>
                                </div>
                            )}
                        </div>

                        {/* The Ticket Cutout Divider */}
                        <div className="relative w-full flex items-center justify-center h-8 my-2">
                            <div className="absolute left-[-16px] w-8 h-8 rounded-full bg-[#050505]" />
                            <div className="absolute right-[-16px] w-8 h-8 rounded-full bg-[#050505]" />
                            <div className="w-full mx-6 border-b-2 border-dashed border-black/10" />
                        </div>

                        {/* Budget & Calculation */}
                        <div className="px-6 py-6 flex flex-col gap-4 border-b-2 border-dashed border-black/10">
                            <div className="flex justify-between items-center text-sm font-medium text-black/50">
                                <span>Target Budget</span>
                                <span className="text-black/70 font-mono">₱{budget.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            {isOverBudget ? (
                                <div className="flex justify-between items-center text-sm font-bold text-red-500">
                                    <span>Amount over budget</span>
                                    <span className="font-mono">₱{overage.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-sm font-bold text-[#28a745]">
                                    <span>Amount saved</span>
                                    <span className="font-mono">₱{(budget - totalSpent).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            )}
                        </div>

                        {/* Over Budget Suggestions */}
                        {isOverBudget && suggestions.length > 0 && (
                            <div className="px-6 py-6 border-b-2 border-dashed border-black/10 bg-red-50/50">
                                <span className="text-red-500/80 text-xs font-bold uppercase tracking-widest mb-3 block">Observations</span>
                                <ul className="flex flex-col gap-2">
                                    {suggestions.map((s, i) => (
                                        <li key={i} className="text-black/70 text-sm leading-relaxed flex gap-2">
                                            <span className="text-red-500">•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Itemized List */}
                        <div className="flex flex-col gap-4 px-6 py-8 border-b-2 border-dashed border-black/10">
                            <span className="text-black/30 text-xs font-bold uppercase tracking-widest mb-2 block">Itemized</span>
                            {items.filter(i => i.status === 'in-cart').map(item => (
                                <div key={item.id} className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-black/90 text-sm font-medium">{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                                        {item.category && <span className="text-black/40 text-xs">{item.category} {!item.isVatable && '• Exempt'}</span>}
                                    </div>
                                    <span className="text-black/80 font-medium font-mono text-sm">₱{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <span className="text-black/30 text-sm text-center block">No items purchased.</span>
                            )}
                        </div>

                        {/* VAT Breakdown & Barcode */}
                        <div className="flex flex-col gap-3 px-6 pt-8 pb-6 bg-black/[0.02]">
                            <span className="text-black/30 text-xs font-bold uppercase tracking-widest mb-2 block">Tax Breakdown</span>
                            
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-black/50">VAT-Exempt Sales</span>
                                <span className="text-black/70 font-mono">₱{vatExemptSubtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-black/50">VATable Sales (Net)</span>
                                <span className="text-black/70 font-mono">₱{vatableNet.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-black/50">VAT Amount (12%)</span>
                                <span className="text-black/70 font-mono">₱{vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            
                            <div className="w-full h-px bg-black/10 my-2" />
                            
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-black/80 font-medium">Grand Total</span>
                                <span className="text-black font-mono font-medium text-lg">₱{totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>

                            {/* Barcode & Date */}
                            <div className="flex flex-col items-center justify-center pt-6 pb-2 border-t-2 border-dashed border-black/10 w-full">
                                <div className="flex h-14 w-full justify-between items-center opacity-80 px-4">
                                    {[2,1,4,1,1,2,3,1,2,1,1,3,2,2,1,4,1,1,2,3,1,2,1,4,1,2,1,1,3,2,1,2,3,1,1,2,1,3,1,2].map((w, i) => (
                                        <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                                    ))}
                                </div>
                                <span className="text-black/50 font-mono text-[11px] tracking-[0.25em] mt-3 uppercase">
                                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Ticket Serration using semi-circle masking out of the bottom edge */}
                    <div 
                        className="w-full h-5 bg-[#fcfcfc]"
                        style={{
                            maskImage: 'radial-gradient(circle at 25px 100%, transparent 14px, black 14.5px)',
                            maskSize: '50px 20px',
                            maskRepeat: 'repeat-x',
                            maskPosition: 'bottom',
                            WebkitMaskImage: 'radial-gradient(circle at 25px 100%, transparent 14px, black 14.5px)',
                            WebkitMaskSize: '50px 20px',
                            WebkitMaskRepeat: 'repeat-x',
                            WebkitMaskPosition: 'bottom'
                        }}
                    />
                </motion.div>

                {/* Finish Action */}
                <div className="mt-8 mb-4">
                    <button
                        onClick={endTrip}
                        className="w-full h-[60px] rounded-full bg-white text-black font-semibold text-base tracking-wide flex items-center justify-center hover:bg-white/90 active:scale-[0.98] shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all duration-300"
                    >
                        Finish & Clear Trip
                    </button>
                </div>
            </div>
        </div>
    );
}
