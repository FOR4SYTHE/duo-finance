"use client";

import { ChevronLeft, Bell, Wallet, UserSquare2, CalendarClock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSettingsStore } from "@/store/useSettingsStore";
import { triggerHaptic } from "@/lib/haptics";

export default function NotificationsPage() {
  const router = useRouter();
  const { budgetAlerts, setBudgetAlerts, partnerActivity, setPartnerActivity, reminders, setReminders } = useSettingsStore();

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#050505]/95 border-b border-white/5 px-6 pt-14 pb-4 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors border-[0.5px] border-white/5 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 pr-0.5" />
        </button>
        <h1 className="text-[20px] font-semibold tracking-tight">Notifications</h1>
      </div>

      <div className="px-6 pt-8 pb-32 z-10 flex flex-col flex-1">
        
        {/* Alerts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        >
          <h3 className="text-white/30 text-[11px] font-bold tracking-[0.2em] uppercase mb-3 px-2">Push Alerts</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[28px] overflow-hidden shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            
            {/* Budget Alerts Toggle */}
            <div className="w-full p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border-[0.5px] border-orange-500/20">
                  <Wallet className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Budget Warnings</span>
                  <span className="text-white/40 text-[12px]">Alert when crossing 80% or 100%</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setBudgetAlerts(!budgetAlerts);
                  triggerHaptic('light');
                }}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${budgetAlerts ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${budgetAlerts ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Partner Activity Toggle */}
            <div className="w-full p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border-[0.5px] border-blue-500/20">
                  <UserSquare2 className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Partner Activity</span>
                  <span className="text-white/40 text-[12px]">When partner logs spend or trips</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setPartnerActivity(!partnerActivity);
                  triggerHaptic('light');
                }}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${partnerActivity ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${partnerActivity ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Reminders Toggle */}
            <div className="w-full p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border-[0.5px] border-purple-500/20">
                  <CalendarClock className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium text-[16px] tracking-tight">Reminders</span>
                  <span className="text-white/40 text-[12px]">Upcoming bills & due dates</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setReminders(!reminders);
                  triggerHaptic('light');
                }}
                className={`relative w-[50px] h-[30px] rounded-full transition-colors duration-300 ease-in-out ${reminders ? 'bg-[#30D158]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] left-0 w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${reminders ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}
