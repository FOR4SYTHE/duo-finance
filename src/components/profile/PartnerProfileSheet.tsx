"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Activity, ShoppingCart, Star, X, Pointer, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { PremiumIcon } from "@/components/ui/PremiumStarIcon";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

interface PartnerProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
  householdId: string | null;
}

export function PartnerProfileSheet({ isOpen, onClose, partner, householdId }: PartnerProfileSheetProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ logsCount: 0, cartifyCount: 0, dreamBoardPct: 0 });
  const authUser = useAuthStore(state => state.user);

  const [isNudged, setIsNudged] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    async function loadPartnerData() {
      if (!isOpen || !partner?.id || !householdId) return;
      const supabase = createClient();
      
      try {
        // Fetch real shared data using the household_id
        const { count: spendCount } = await supabase
          .from('spend_entries')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId)
          .eq('user_id', partner.id);
          
        const { count: cartifyCount } = await supabase
          .from('cartify_saved_trips')
          .select('*', { count: 'exact', head: true })
          .eq('household_id', householdId);

        const { data: goalsData } = await supabase
          .from('goals')
          .select('target_amount, saved_amount')
          .eq('household_id', householdId);

        let pct = 0;
        if (goalsData && goalsData.length > 0) {
          const totalTarget = goalsData.reduce((acc: number, g: any) => acc + (Number(g.target_amount) || 0), 0);
          const totalSaved = goalsData.reduce((acc: number, g: any) => acc + (Number(g.saved_amount) || 0), 0);
          if (totalTarget > 0) pct = Math.round((totalSaved / totalTarget) * 100);
        }

        setStats({
          logsCount: spendCount || 0,
          cartifyCount: cartifyCount || 0,
          dreamBoardPct: pct
        });
      } catch (err) {
        console.error("Failed to load partner stats:", err);
      }
    }
    
    loadPartnerData();
  }, [isOpen, partner, householdId]);

  const handleNudge = async () => {
    setIsNudged(true);
    
    if (authUser?.id && partner?.id && householdId) {
      const supabase = createClient();
      try {
        await supabase.from('notifications').insert({
          household_id: householdId,
          from_user_id: authUser.id,
          to_user_id: partner.id,
          type: 'nudge',
          message: 'Your partner nudged you! 👋'
        });
      } catch (err) {
        console.error("Failed to send nudge:", err);
      }
    }

    setTimeout(() => setIsNudged(false), 2000);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] touch-none"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="fixed inset-0 bg-[#000000] z-[201] overflow-y-auto overflow-x-hidden hide-scrollbar flex flex-col"
          >
            {/* Ambient Background for Sheet */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,rgba(48,209,88,0.08),transparent_70%)]" />
            </div>

            {/* Hero Header (Mirrors Profile Page) */}
            <div className="relative shrink-0 bg-[#0A0A0C] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border-b border-white/5 z-20 overflow-hidden flex flex-col justify-end min-h-[440px] pb-8 pt-6 px-6">
              
              {/* Action Buttons (Top Corners) */}
              <div className="absolute top-10 left-6 right-6 flex items-center justify-between z-30">
                <motion.button 
                  layout
                  onClick={handleNudge}
                  disabled={isNudged}
                  className={`h-10 rounded-full flex items-center justify-center transition-colors border-[0.5px] border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)] overflow-hidden ${isNudged ? 'px-4 text-[#30D158] bg-[#30D158]/20 backdrop-blur-md' : 'w-10 bg-black/40 backdrop-blur-md text-white/70 hover:text-white'}`}
                  transition={{ layout: { type: "spring", bounce: 0, duration: 0.4 } }}
                >
                  <AnimatePresence mode="popLayout">
                    {isNudged ? (
                      <motion.div 
                        key="nudged" 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.8 }} 
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Check className="w-4 h-4" />
                        <span className="text-[12px] font-bold">Nudged!</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="nudge" 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.8 }} 
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                      >
                        <Pointer className="w-5 h-5 -rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors border-[0.5px] border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Background Layer */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0A0A0C]">
                {partner?.avatar ? (
                  <img 
                    src={partner.avatar} 
                    className="absolute top-0 left-0 right-0 w-full h-[85%] object-cover" 
                    style={{ 
                      WebkitMaskImage: 'radial-gradient(ellipse 140% 100% at 50% 0%, black 80%, transparent 100%)', 
                      maskImage: 'radial-gradient(ellipse 140% 100% at 50% 0%, black 80%, transparent 100%)' 
                    }}
                  />
                ) : (
                  <div 
                    className="w-full h-full bg-gradient-to-br from-[#1C2C24] to-[#0A0A0C] flex items-center justify-center"
                    style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
                  >
                     <span className="text-[#30D158]/20 text-[150px] font-bold select-none">{partner?.name?.[0]?.toUpperCase() || 'P'}</span>
                  </div>
                )}
              </div>

              {/* Name and Email at Bottom of Hero */}
              <div className="relative z-20 flex flex-col items-center mt-auto">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="text-[32px] md:text-[40px] leading-none font-extrabold text-white tracking-tight drop-shadow-lg">
                    {partner?.name?.split(' ')[0] || 'Partner'}
                  </h1>
                </div>
                <div className="min-h-[20px] flex items-center justify-center mb-3">
                  <p className="text-[13px] text-white/50 font-medium tracking-wide drop-shadow-md">
                     {partner?.email ? `@${partner.email.split('@')[0]}` : '@partner'}
                  </p>
                </div>
                <div className="px-3 py-1 bg-[#30D158]/10 border border-[#30D158]/20 rounded-full flex items-center gap-1.5 shadow-[0_4px_16px_rgba(48,209,88,0.15)]">
                   <PremiumIcon className="w-3 h-3 text-[#30D158]" />
                   <span className="text-[#30D158] text-[10px] font-bold uppercase tracking-widest">Partnership Active</span>
                </div>
              </div>
            </div>

            {/* Fixed Apple Watch Style Grid Section */}
            <div className="flex-1 px-6 pt-8 pb-12 z-10 flex flex-col relative shrink-0">
              <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Shared Activity</h3>
              
              {/* 3 Fixed Even Cards (Grid Layout) */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Card 1: Recent Activity */}
                <div className="col-span-1 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl aspect-square">
                   <div className="w-full bg-[#2C2C2E] rounded-[24px] p-3 flex flex-col items-start justify-between flex-1">
                     <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                     </div>
                     <div className="flex flex-col mt-4">
                       <span className="text-white font-bold text-[24px] leading-none mb-1">{stats.logsCount}</span>
                       <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Entries</span>
                     </div>
                   </div>
                   <div className="px-2 py-2 flex justify-between items-center">
                     <span className="text-white/50 text-[10px] font-semibold leading-tight">Shared<br/>Ledger</span>
                   </div>
                </div>

                {/* Card 2: Cartify Activity */}
                <div className="col-span-1 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl aspect-square">
                   <div className="w-full bg-white rounded-[24px] p-3 flex flex-col items-start justify-between flex-1">
                     <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-black" />
                     </div>
                     <div className="flex flex-col mt-4">
                       <span className="text-black font-bold text-[24px] leading-none mb-1">{stats.cartifyCount}</span>
                       <span className="text-black/50 text-[10px] font-bold uppercase tracking-wider">Items</span>
                     </div>
                   </div>
                   <div className="px-2 py-2 flex justify-between items-center">
                     <span className="text-white/50 text-[10px] font-semibold leading-tight">Cartify<br/>List</span>
                   </div>
                </div>

                {/* Card 3: Dream Board (Full Width) */}
                <div className="col-span-2 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl h-[120px]">
                   <div className="w-full bg-gradient-to-br from-[#2C2C2E] to-[#1C1C1E] rounded-[24px] p-4 flex items-center justify-between h-full border-[0.5px] border-white/5">
                     <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#FF9F0A]/20 flex items-center justify-center">
                            <Star className="w-3 h-3 text-[#FF9F0A]" />
                          </div>
                          <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Dream Board</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-white font-bold text-[24px] leading-none">{stats.dreamBoardPct}%</span>
                          <span className="text-white/40 text-[12px] font-medium">funded</span>
                        </div>
                     </div>
                     
                     {/* Progress Ring */}
                     <div className="relative w-14 h-14">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.1)"
                            strokeWidth="4"
                          />
                          <motion.path
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${stats.dreamBoardPct}, 100` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#FF9F0A"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                     </div>
                   </div>
                </div>

              </div>

              {/* Message Action at bottom */}
              <div className="mt-8 flex justify-center pb-8">
                <button 
                  onClick={() => {
                    onClose();
                    router.push('/note');
                  }}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-full shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-95 transition-transform"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold text-[14px]">Leave a Note</span>
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
