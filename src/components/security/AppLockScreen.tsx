"use client";
import { useState, useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Lock, Check } from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export function AppLockScreen() {
  const { requireFaceId, requirePin, lockTimeout } = useSettingsStore();
  const [isLocked, setIsLocked] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  
  useEffect(() => {
    // If neither is enabled, do nothing
    if (!requireFaceId && !requirePin) {
      setIsLocked(false);
      return;
    }

    let lastActiveTime = Date.now();
    let lockTimer: any = null;

    const checkLock = () => {
      if (lockTimeout === "Immediately") {
         setIsLocked(true);
      } else {
         const timeoutMs = lockTimeout === "After 1 minute" ? 60000 : 300000;
         const timeSinceActive = Date.now() - lastActiveTime;
         if (timeSinceActive >= timeoutMs) {
            setIsLocked(true);
         }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
         lastActiveTime = Date.now();
         if (lockTimeout === "Immediately") {
           setIsLocked(true);
         } else {
           const timeoutMs = lockTimeout === "After 1 minute" ? 60000 : 300000;
           lockTimer = setTimeout(() => {
             setIsLocked(true);
           }, timeoutMs);
         }
      } else {
         if (lockTimer) clearTimeout(lockTimer);
         checkLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Initial check
    checkLock();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [requireFaceId, requirePin, lockTimeout]);

  const handleUnlock = () => {
    triggerHaptic('medium');
    setIsLocked(false);
    setPinEntry("");
  };

  const handlePin = (num: string) => {
    triggerHaptic('light');
    if (pinEntry.length < 4) {
      const newPin = pinEntry + num;
      setPinEntry(newPin);
      if (newPin.length === 4) {
        // mock unlock success
        setTimeout(() => handleUnlock(), 300);
      }
    }
  };

  // Ensure it renders on the client side only
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !isLocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000] text-white flex flex-col items-center justify-center font-sans touch-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center max-w-[320px] w-full"
      >
        <div className="w-16 h-16 rounded-full bg-[#30D158]/10 flex items-center justify-center border-[0.5px] border-[#30D158]/20 mb-6 shadow-[0_0_30px_rgba(48,209,88,0.2)]">
          <Lock className="w-7 h-7 text-[#30D158]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Duo Locked</h1>
        <p className="text-white/50 text-center text-[15px] mb-12">
          {requireFaceId ? "Use FaceID or PIN to unlock your household." : "Enter your 4-digit PIN."}
        </p>

        {/* PIN Indicators */}
        <div className="flex gap-5 mb-14">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${i < pinEntry.length ? 'bg-white border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-transparent border-white/20'}`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full px-6 mb-10">
          {[1,2,3,4,5,6,7,8,9].map((num) => (
            <button 
              key={num}
              onClick={() => handlePin(num.toString())}
              className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-normal bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-[0.9] transition-all mx-auto border-[0.5px] border-white/5"
            >
              {num}
            </button>
          ))}
          {/* Bottom row */}
          <div className="flex items-center justify-center">
            {requireFaceId && (
              <button 
                onClick={handleUnlock}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white/50 hover:text-[#30D158] transition-colors active:scale-95"
              >
                <Fingerprint className="w-8 h-8" />
              </button>
            )}
          </div>
          <button 
            onClick={() => handlePin('0')}
            className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-normal bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-[0.9] transition-all mx-auto border-[0.5px] border-white/5"
          >
            0
          </button>
          <div className="flex items-center justify-center">
             <button 
              onClick={() => {
                triggerHaptic('light');
                setPinEntry(prev => prev.slice(0, -1));
              }}
              className="text-[13px] font-bold text-white/50 uppercase tracking-widest active:scale-95 h-16 w-16 flex items-center justify-center"
             >
               Del
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
