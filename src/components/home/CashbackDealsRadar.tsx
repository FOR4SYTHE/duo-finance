"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Radar, Clock, Flame } from "lucide-react";

interface Deal {
  id: string;
  brand: string;
  title: string;
  code: string;
  expires: string;
  category: string;
  hot: boolean;
  url: string;
}

interface CashbackDealsRadarProps {
  onClose: () => void;
}

export function CashbackDealsRadar({ onClose }: CashbackDealsRadarProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filters = ["All", "Foodpanda", "Grab", "Shopee", "Lazada", "Klook", "Agoda", "Cheapflights"];

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch("/api/deals");
        const data = await res.json();
        setDeals(data.deals || []);
      } catch (error) {
        console.error("Failed to fetch deals", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  const filteredDeals = activeFilter === "All" 
    ? deals 
    : deals.filter((d) => d.brand === activeFilter);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Foodpanda": return "text-[#D70F64] bg-[#D70F64]/10 border-[#D70F64]/20 ring-[#D70F64]";
      case "Grab": return "text-[#00B14F] bg-[#00B14F]/10 border-[#00B14F]/20 ring-[#00B14F]";
      case "Shopee": return "text-[#EE4D2D] bg-[#EE4D2D]/10 border-[#EE4D2D]/20 ring-[#EE4D2D]";
      case "Lazada": return "text-[#3877FF] bg-[#3877FF]/10 border-[#3877FF]/20 ring-[#3877FF]";
      case "Klook": return "text-[#FF5722] bg-[#FF5722]/10 border-[#FF5722]/20 ring-[#FF5722]";
      case "Agoda": return "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20 ring-[#38BDF8]";
      case "Cheapflights": return "text-[#00A3E0] bg-[#00A3E0]/10 border-[#00A3E0]/20 ring-[#00A3E0]";
      default: return "text-white/80 bg-white/10 border-white/20 ring-white";
    }
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0C] overflow-hidden"
    >
      {/* Scanning Radar Background Effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A84FF]/20 via-[#0A0A0C]/0 to-transparent pointer-events-none opacity-50"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ y: ["0%", "100%", "0%"] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-1 bg-gradient-to-r from-transparent via-[#0A84FF]/30 to-transparent blur-sm"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 relative z-10 pt-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center border border-[#0A84FF]/30 shadow-[0_0_15px_rgba(10,132,255,0.2)]">
            <Radar className="w-5 h-5 text-[#0A84FF]" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-medium tracking-tight">Deals Radar</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
              <span className="text-white/50 text-[11px] font-bold tracking-widest uppercase">Live Scanning</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-2 pb-4 overflow-x-auto no-scrollbar flex items-center gap-2 relative z-10 shrink-0">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all border ${
              activeFilter === filter
                ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Deals Feed */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 relative z-10 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-4 opacity-50">
            <Radar className="w-8 h-8 text-[#0A84FF] animate-spin" />
            <span className="text-white/60 text-xs font-medium tracking-widest uppercase">Intercepting Deals...</span>
          </div>
        ) : filteredDeals.length > 0 ? (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {filteredDeals.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                  className="bg-[#1A1A1C] border border-white/5 rounded-3xl p-5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_8px_16px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col gap-5"
                >
                  {/* Subtle brand glow behind card */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-[0.15] -translate-y-1/2 translate-x-1/4 rounded-full ${getBrandColor(deal.brand).split(' ')[3].replace('ring-', 'bg-')}`} />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-extrabold tracking-wider uppercase border flex items-center gap-1.5 ${getBrandColor(deal.brand).split(' ').slice(0, 3).join(' ')}`}>
                      {deal.brand}
                    </div>
                    {deal.hot && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-md text-[#FF453A]">
                        <Flame className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Hot</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-white text-[17px] font-medium leading-snug relative z-10 pr-4">
                    {deal.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto relative z-10 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-white/40">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-medium uppercase tracking-widest">
                        Valid til {new Date(deal.expires).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(deal.id, deal.code)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all overflow-hidden relative ${
                          copiedId === deal.id 
                            ? "bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30" 
                            : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                        }`}
                      >
                        {copiedId === deal.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{deal.code}</span>
                          </>
                        )}
                      </button>
                      
                      <a
                        href={deal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all overflow-hidden relative bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      >
                        Claim
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 opacity-50">
            <span className="text-white/60 text-xs font-medium tracking-widest uppercase">No active deals found</span>
          </div>
        )}
      </div>
      
      {/* Toast Notification for Copy (Floating at bottom) */}
      <AnimatePresence>
        {copiedId && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#34C759] text-[#0A0A0C] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_8px_30px_rgba(52,199,89,0.3)] z-[110]"
          >
            <Check className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">Promo code copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
