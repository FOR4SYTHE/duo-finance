"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode, ShieldCheck, ChevronRight, Settings, LogOut, CheckCircle2, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSheet({ isOpen, onClose }: ProfileSheetProps) {
  const [mounted, setMounted] = useState(false);
  const { user, partner, householdId, toggleMockPartner, logout } = useAuthStore();
  const { primaryCurrency, setPrimaryCurrency, exchangeRate } = useCurrencyStore();
  const { primarySymbol, secondarySymbol } = useDualCurrency();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  const mockInviteCode = householdId ? householdId.split('-')[1]?.toUpperCase() || "8K9P2X" : "8K9P2X";

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[101] h-[92dvh] bg-[#0A0A0C] rounded-t-[36px] flex flex-col overflow-hidden border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
            style={{
               backgroundImage: "radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 70%)"
            }}
          >
            {/* Header Handle & Close */}
            <div className="flex justify-between items-center p-6 pb-2">
              <div className="w-10 h-10 flex items-center justify-center">
                 {/* Hidden space to balance flex */}
              </div>
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
               <h2 className="text-white/90 text-xl font-medium tracking-tight text-center mb-8">Profile & Household</h2>

               {/* Partnership Matrix Hero */}
               <div className="bg-[#141416] border border-white/5 rounded-[32px] p-6 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] relative overflow-hidden mb-6">
                 {/* Ambient glow */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#30D158]/5 blur-[40px] rounded-full" />
                 
                 <div className="flex items-center justify-between mb-8 relative z-10">
                   {/* User Card */}
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2A2A2C] to-[#1A1A1C] border border-white/10 flex items-center justify-center shadow-lg mb-3">
                         <span className="text-white text-2xl font-semibold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                      </div>
                      <span className="text-white/90 font-medium">{user?.name || 'You'}</span>
                      <span className="text-white/40 text-[10px] uppercase tracking-widest mt-1">PHP 🇵🇭</span>
                   </div>

                   {/* Connection Beam */}
                   <div className="flex-1 flex flex-col items-center justify-center px-4">
                     {partner ? (
                        <>
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#30D158]/50 to-transparent relative flex items-center justify-center mb-2">
                            <motion.div 
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="w-1.5 h-1.5 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]"
                            />
                          </div>
                          <span className="text-[#30D158] text-[9px] font-bold tracking-[0.2em] uppercase">Synced</span>
                        </>
                     ) : (
                        <>
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
                          <span className="text-white/30 text-[9px] font-bold tracking-[0.2em] uppercase">Solo Mode</span>
                        </>
                     )}
                   </div>

                   {/* Partner Card */}
                   <div className="flex flex-col items-center">
                     {partner ? (
                       <>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2A2A2C] to-[#1A1A1C] border border-white/10 flex items-center justify-center shadow-lg mb-3">
                           <span className="text-white text-2xl font-semibold">{partner.name[0].toUpperCase()}</span>
                        </div>
                        <span className="text-white/90 font-medium">{partner.name}</span>
                        <span className="text-white/40 text-[10px] uppercase tracking-widest mt-1">ZAR 🇿🇦</span>
                       </>
                     ) : (
                       <>
                        <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center shadow-lg mb-3 bg-white/[0.02]">
                           <span className="text-white/20 text-2xl font-semibold">?</span>
                        </div>
                        <span className="text-white/40 font-medium">Partner</span>
                        <span className="text-white/20 text-[10px] uppercase tracking-widest mt-1">Invite</span>
                       </>
                     )}
                   </div>
                 </div>

                 {/* Invite Code / Status Pill */}
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                   {partner ? (
                     <div className="flex items-center gap-3 w-full justify-center">
                        <ShieldCheck className="w-5 h-5 text-[#30D158]" />
                        <span className="text-white/80 font-medium text-sm tracking-wide">Partnership Active</span>
                     </div>
                   ) : (
                     <div className="w-full">
                       <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mb-2 text-center">Household Invite Code</p>
                       <div className="flex items-center gap-3">
                         <div className="flex-1 bg-white/5 border border-white/10 rounded-xl h-12 flex items-center justify-center">
                           <span className="text-white font-mono text-lg tracking-[0.3em]">{mockInviteCode}</span>
                         </div>
                         <button onClick={handleCopyCode} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 flex items-center justify-center transition-colors">
                            {copied ? <CheckCircle2 className="w-5 h-5 text-[#30D158]" /> : <Copy className="w-5 h-5 text-white/70" />}
                         </button>
                         <button className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 flex items-center justify-center transition-colors">
                            <QrCode className="w-5 h-5 text-white/70" />
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               {/* Mock Toggle for Demo */}
               <button onClick={toggleMockPartner} className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-white/50 text-xs uppercase tracking-wider font-bold mb-8 hover:bg-white/10 transition-colors">
                 Toggle Partner UI (Dev)
               </button>

               {/* Currency Preferences */}
               <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Primary Currency</h3>
               <div className="bg-[#141416] border border-white/5 rounded-[24px] p-2 mb-8 flex relative">
                  <div className="absolute inset-y-2 w-[calc(50%-4px)] bg-[#2A2A2C] rounded-[18px] shadow-md transition-all duration-300 ease-out border border-white/5" 
                       style={{ left: primaryCurrency === 'PHP' ? '4px' : 'calc(50% + 4px)' }} 
                  />
                  <button 
                    onClick={() => setPrimaryCurrency('PHP')}
                    className={`flex-1 h-12 flex items-center justify-center z-10 transition-colors duration-300 ${primaryCurrency === 'PHP' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                  >
                    <span className="font-semibold tracking-wide">PHP 🇵🇭</span>
                  </button>
                  <button 
                    onClick={() => setPrimaryCurrency('ZAR')}
                    className={`flex-1 h-12 flex items-center justify-center z-10 transition-colors duration-300 ${primaryCurrency === 'ZAR' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                  >
                    <span className="font-semibold tracking-wide">ZAR 🇿🇦</span>
                  </button>
               </div>
               
               <div className="flex justify-center mb-8">
                 <p className="text-white/30 text-xs">Live Rate: {primarySymbol}1.00 = {secondarySymbol}{exchangeRate.toFixed(3)} (Auto-updated)</p>
               </div>

               {/* Household Sharing Guide */}
               <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Household Guide</h3>
               <div className="flex overflow-x-auto gap-4 pb-8 -mx-6 px-6 no-scrollbar snap-x snap-mandatory">
                  <div className="min-w-[240px] w-[240px] aspect-video bg-gradient-to-br from-[#1C1C1E] to-[#141416] border border-white/10 rounded-[24px] p-5 flex flex-col justify-end snap-center relative overflow-hidden group">
                     <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                        <Users className="w-8 h-8" />
                     </div>
                     <h4 className="text-white font-medium mb-1">Everything in Sync</h4>
                     <p className="text-white/40 text-xs leading-relaxed">Spend Jar entries stream to both devices in real-time.</p>
                  </div>
                  <div className="min-w-[240px] w-[240px] aspect-video bg-gradient-to-br from-[#1C1C1E] to-[#141416] border border-white/10 rounded-[24px] p-5 flex flex-col justify-end snap-center relative overflow-hidden group">
                     <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                     </div>
                     <h4 className="text-white font-medium mb-1">Cartify Together</h4>
                     <p className="text-white/40 text-xs leading-relaxed">Build a list at home, check items off in the store.</p>
                  </div>
                  <div className="min-w-[240px] w-[240px] aspect-video bg-gradient-to-br from-[#1C1C1E] to-[#141416] border border-white/10 rounded-[24px] p-5 flex flex-col justify-end snap-center relative overflow-hidden group">
                     <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors">
                        <ShieldCheck className="w-8 h-8" />
                     </div>
                     <h4 className="text-white font-medium mb-1">Shared Privacy</h4>
                     <p className="text-white/40 text-xs leading-relaxed">Personal budgets remain private while household totals combine.</p>
                  </div>
               </div>

               {/* App Settings */}
               <h3 className="text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Settings & Security</h3>
               <div className="bg-[#141416] border border-white/5 rounded-[28px] overflow-hidden mb-8">
                 <button className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                       <ShieldCheck className="w-4 h-4 text-white/70" />
                     </div>
                     <span className="text-white/90 font-medium text-sm">Biometrics & PIN</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20" />
                 </button>
                 <button className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                       <Settings className="w-4 h-4 text-white/70" />
                     </div>
                     <span className="text-white/90 font-medium text-sm">App Preferences</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-white/20" />
                 </button>
                 <button 
                  onClick={() => {
                     logout();
                     onClose();
                     window.location.href = '/welcome';
                  }}
                  className="w-full p-5 flex items-center justify-between hover:bg-[#FF453A]/5 transition-colors group">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#FF453A]/10 flex items-center justify-center transition-colors">
                       <LogOut className="w-4 h-4 text-[#FF453A]/70 group-hover:text-[#FF453A]" />
                     </div>
                     <span className="text-[#FF453A]/90 font-medium text-sm">Sign Out</span>
                   </div>
                 </button>
               </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}
