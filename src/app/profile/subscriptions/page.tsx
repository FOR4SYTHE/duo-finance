"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Plus, Play, Music, Dumbbell, Smartphone } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";

const MOCK_SUBS = [
  { id: 1, name: "Netflix Premium", amount: 549, currency: "PHP", icon: Play, color: "bg-[#E50914]" },
  { id: 2, name: "Spotify Duo", amount: 239, currency: "PHP", icon: Music, color: "bg-[#1DB954]" },
  { id: 3, name: "Anytime Fitness", amount: 2500, currency: "PHP", icon: Dumbbell, color: "bg-[#5D3FD3]" },
  { id: 4, name: "Globe Postpaid", amount: 1499, currency: "PHP", icon: Smartphone, color: "bg-[#00529B]" },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const { primaryCurrency, exchangeRate } = useCurrencyStore();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const totalPHP = MOCK_SUBS.reduce((acc, sub) => acc + sub.amount, 0);

  return (
    <div className="w-full h-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
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
            setShowComingSoon(true);
            setTimeout(() => setShowComingSoon(false), 2000);
          }}
          className="w-10 h-10 bg-white border-[0.5px] border-white rounded-full flex items-center justify-center text-black hover:bg-white/90 transition-colors shadow-[0_4px_12px_rgba(255,255,255,0.2)] active:scale-95">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Coming Soon Toast */}
      {showComingSoon && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="absolute top-32 left-1/2 -translate-x-1/2 bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30 px-4 py-2 rounded-full text-[13px] font-medium backdrop-blur-md z-50"
        >
          Adding subscriptions coming soon
        </motion.div>
      )}

      <div className="px-6 pt-8 pb-32 z-10 flex flex-col flex-1">
        
        {/* Total Cost Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="w-full bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] p-6 mb-8 flex flex-col items-center justify-center shadow-[0_16px_32px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(255,255,255,0.05)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
          <span className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase mb-2">Total Monthly</span>
          <span className="text-white text-[32px] font-medium tracking-tight">
             {primaryCurrency === "PHP" ? "₱" : "R"} {formatCurrency(primaryCurrency === "PHP" ? totalPHP : totalPHP * exchangeRate)}
          </span>
          <span className="text-white/40 text-[14px] mt-1">
             ≈ {primaryCurrency === "PHP" ? "R" : "₱"} {formatCurrency(primaryCurrency === "PHP" ? totalPHP * exchangeRate : totalPHP)}
          </span>
        </motion.div>

        {/* List Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Active Services</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[28px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            
            {MOCK_SUBS.map((sub, idx) => (
              <div key={sub.id} className={`w-full p-4 flex items-center justify-between ${idx !== MOCK_SUBS.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sub.color} shadow-lg`}>
                    <sub.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-[16px] tracking-tight">{sub.name}</span>
                    <span className="text-white/40 text-[12px]">Monthly</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-white font-medium text-[15px]">
                    {sub.currency === primaryCurrency 
                      ? (sub.currency === "PHP" ? "₱" : "R") + " " + formatCurrency(sub.amount)
                      : (primaryCurrency === "PHP" ? "₱" : "R") + " " + formatCurrency(sub.amount * (primaryCurrency === "ZAR" ? exchangeRate : 1/exchangeRate))
                    }
                  </span>
                </div>
              </div>
            ))}

          </div>
        </motion.div>

      </div>
    </div>
  );
}
