"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Vibrate, Calendar, Moon, Sparkles } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { triggerHaptic } from "@/lib/haptics";

export default function PreferencesPage() {
  const router = useRouter();
  const { darkMode, setDarkMode, haptics, setHaptics, startMonday, setStartMonday } = useSettingsStore();
  const [showDarkModeToast, setShowDarkModeToast] = useState(false);

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/95 px-6 pt-14 pb-4 flex items-center gap-4">
        <button 
          onClick={() => {
            triggerHaptic('light');
            router.back();
          }}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors border-[0.5px] border-white/5 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="text-[20px] font-semibold tracking-tight">App Preferences</h1>
      </div>

      {/* Dark Mode Toast */}
      <AnimatePresence>
        {showDarkModeToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 w-max bg-[#1C1C1E] text-white/90 border border-white/10 px-4 py-2 rounded-full text-[13px] font-medium shadow-2xl z-50"
          >
            Duo is optimized for Dark Mode (Light Mode coming soon)
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-8 pb-32 z-10 flex flex-col flex-1">
        
        {/* General Toggles */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">General</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[28px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)] mb-8">
            
            {/* Dark Mode */}
            <div className="w-full p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Moon className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Dark Mode</span>
                  <span className="text-white/40 text-[12px]">Default for Duo</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  triggerHaptic('medium');
                  setShowDarkModeToast(true);
                  setTimeout(() => setShowDarkModeToast(false), 2500);
                }}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${darkMode ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${darkMode ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Haptics */}
            <div className="w-full p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Vibrate className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Haptic Feedback</span>
                  <span className="text-white/40 text-[12px]">Vibrate on interactions</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setHaptics(!haptics);
                  triggerHaptic('light');
                }}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${haptics ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${haptics ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Calendar Start */}
            <div className="w-full p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Calendar className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Start Week on Monday</span>
                  <span className="text-white/40 text-[12px]">For budgets and reports</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setStartMonday(!startMonday);
                  triggerHaptic('light');
                }}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${startMonday ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${startMonday ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

          </div>
        </motion.div>

        {/* Onboarding / Tour Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Onboarding</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[28px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            
            <button 
              onClick={() => alert("Tour coming soon!")}
              className="w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors active:bg-white/[0.05]"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Sparkles className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white font-medium text-[16px] tracking-tight">Take a Tour</span>
                  <span className="text-white/40 text-[12px]">Replay the welcome guide</span>
                </div>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold text-white/70">
                 Start
              </div>
            </button>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
