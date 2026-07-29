"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Plus, Play, Trash2 } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useSubscriptionsStore } from "@/store/useSubscriptionsStore";
import { formatCurrency } from "@/lib/format";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { triggerHaptic } from "@/lib/haptics";
import { AddSubscriptionSheet } from "@/components/profile/AddSubscriptionSheet";

export default function SubscriptionsPage() {
  const router = useRouter();
  const { primaryCurrency, exchangeRate } = useCurrencyStore();
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
  const { subscriptions, removeSubscription } = useSubscriptionsStore();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const totalPHP = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 pt-14 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors border-[0.5px] border-white/5 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6 pr-0.5" />
          </button>
          <h1 className="text-[20px] font-semibold tracking-tight">Subscriptions</h1>
        </div>
        <button 
          onClick={() => {
            triggerHaptic('light');
            setIsAddSheetOpen(true);
          }}
          className="w-10 h-10 bg-white border-[0.5px] border-white rounded-full flex items-center justify-center text-black hover:bg-white/90 transition-colors shadow-[0_4px_12px_rgba(255,255,255,0.2)] active:scale-95">
          <Plus className="w-5 h-5" />
        </button>
      </div>



      <div className="px-6 pt-8 pb-32 z-10 flex flex-col flex-1">
        
        {/* Total Cost Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="w-full bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] p-6 mb-8 flex flex-col items-center justify-center shadow-[0_16px_32px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(255,255,255,0.05)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          <span className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Total Monthly</span>
          <span className="text-white text-[32px] font-medium tracking-tight">
             {primarySymbol} {formatCurrency(getPrimaryValue(totalPHP))}
          </span>
          <span className="text-white/40 text-[14px] mt-1">
             ≈ {secondarySymbol} {formatCurrency(getSecondaryValue(totalPHP))}
          </span>
        </motion.div>

        {/* List Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Active Services</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-[14px]">No active subscriptions</div>
            ) : (
              subscriptions.map((sub, idx) => (
                <div 
                  key={sub.id}
                  className={`w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors ${idx !== subscriptions.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center`}>
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/90 font-medium text-[16px] tracking-tight">{sub.name}</span>
                      <span className="text-white/40 text-[12px]">{sub.cycle}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                      <span className="font-medium text-white">
                        {primarySymbol} {formatCurrency(getPrimaryValue(sub.amount))}
                      </span>
                    <button 
                      onClick={() => {
                        triggerHaptic('medium');
                        removeSubscription(sub.id);
                      }}
                      className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border-[0.5px] border-red-500/20 active:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <AddSubscriptionSheet isOpen={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)} />
    </div>
  );
}
