"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck, Fingerprint } from "lucide-react";

export default function BiometricsPage() {
  const router = useRouter();
  const [requireFaceId, setRequireFaceId] = useState(true);
  const [requirePin, setRequirePin] = useState(false);
  const [lockTimeout, setLockTimeout] = useState("Immediately");

  return (
    <div className="w-full h-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 pt-14 pb-4 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors border-[0.5px] border-white/5 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="text-[20px] font-semibold tracking-tight">Biometrics & PIN</h1>
      </div>

      <div className="px-6 pt-8 pb-32 z-10 flex flex-col flex-1">
        
        {/* Security Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">App Security</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[28px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)] mb-8">
            
            {/* Require FaceID Toggle */}
            <div className="w-full p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border-[0.5px] border-emerald-500/20">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Unlock with Face ID</span>
                  <span className="text-white/40 text-[12px]">Require biometrics to open app</span>
                </div>
              </div>
              <button 
                onClick={() => setRequireFaceId(!requireFaceId)}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${requireFaceId ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${requireFaceId ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Require PIN Toggle */}
            <div className="w-full p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <ShieldCheck className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Backup PIN</span>
                  <span className="text-white/40 text-[12px]">Use a 4-digit code as backup</span>
                </div>
              </div>
              <button 
                onClick={() => setRequirePin(!requirePin)}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${requirePin ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${requirePin ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Timeout Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Auto-Lock</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[28px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            
            {["Immediately", "After 1 minute", "After 5 minutes"].map((opt, idx, arr) => (
              <button 
                key={opt}
                onClick={() => setLockTimeout(opt)}
                className={`w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors active:bg-white/[0.05] ${idx !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <span className="text-white/90 font-medium text-[16px] tracking-tight">{opt}</span>
                <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center bg-black/20">
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
