"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, Fingerprint, Lock } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { triggerHaptic } from "@/lib/haptics";

export default function BiometricsPage() {
  const router = useRouter();
  const { requireFaceId, setRequireFaceId, requirePin, setRequirePin, lockTimeout, setLockTimeout } = useSettingsStore();

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
      {/* Header */}
      <div className="relative z-50 bg-transparent px-6 pt-14 pb-4 flex items-center gap-4">
        <button 
          onClick={() => {
            triggerHaptic('light');
            router.back();
          }}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors border-[0.5px] border-white/5 shadow-sm backdrop-blur-md active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
      </div>

      <div className="px-6 pt-2 pb-32 z-10 flex flex-col flex-1 overflow-y-auto">
        
        {/* Hero Moment */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="w-full flex flex-col items-center justify-center mb-10 mt-4"
        >
          <div className="relative w-28 h-28 mb-6">
             <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#1C1C1E] to-[#0A0A0C] border-[0.5px] border-white/10 flex items-center justify-center shadow-[0_16px_32px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(255,255,255,0.05)]">
               <Fingerprint className="w-12 h-12 text-white/80" strokeWidth={1.5} />
             </div>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight mb-2">Security</h1>
          <p className="text-white/40 text-[14px] text-center max-w-[240px]">
            Protect your household data with biometrics or a secure PIN.
          </p>
        </motion.div>

        {/* Security Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-4">Unlock Methods</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)] mb-8">
            
            {/* Require FaceID Toggle */}
            <div className="w-full p-5 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-full bg-[#1C1C1E] flex items-center justify-center border-[0.5px] border-white/5 shadow-sm">
                  <Fingerprint className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Face ID</span>
                  <span className="text-white/40 text-[12px]">Require biometrics to open</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setRequireFaceId(!requireFaceId);
                  triggerHaptic('light');
                }}
                className={`relative z-10 w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${requireFaceId ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${requireFaceId ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Require PIN Toggle */}
            <div className="w-full p-5 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 rounded-full bg-[#1C1C1E] flex items-center justify-center border-[0.5px] border-white/5 shadow-sm">
                  <Lock className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Backup PIN</span>
                  <span className="text-white/40 text-[12px]">Use a 4-digit code as backup</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setRequirePin(!requirePin);
                  triggerHaptic('light');
                }}
                className={`relative z-10 w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${requirePin ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${requirePin ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Timeout Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-4">Auto-Lock Time</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            
            {["Immediately", "After 1 minute", "After 5 minutes"].map((opt, idx, arr) => (
              <button 
                key={opt}
                onClick={() => {
                  setLockTimeout(opt as any);
                  triggerHaptic('light');
                }}
                className={`w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors active:bg-white/[0.05] ${idx !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <span className="text-white/90 font-medium text-[15px] tracking-tight">{opt}</span>
                <div className="w-5 h-5 rounded-full border-[1.5px] border-white/20 flex items-center justify-center bg-transparent transition-colors">
                   {lockTimeout === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
