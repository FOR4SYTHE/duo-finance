"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { motion } from "framer-motion";

export function AIRefreshButton() {
  const { mockTriggerAIUpdate, isUpdatingAI } = useChildCareStore();

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={mockTriggerAIUpdate}
      disabled={isUpdatingAI}
      className={`w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden group shadow-[0_8px_30px_rgba(255,123,84,0.3)]
        ${isUpdatingAI 
          ? 'bg-[#1A1A1A] text-white/30 cursor-not-allowed border border-white/5' 
          : 'bg-[#FF7B54] text-white'
        }`}
    >
      {!isUpdatingAI && (
        <div className="flex items-center justify-center bg-white/20 px-2 py-0.5 rounded-[6px] backdrop-blur-sm shadow-sm border border-white/30 mr-1">
          <span className="text-[10px] font-black tracking-widest text-white">AI</span>
        </div>
      )}
      
      <span className="relative z-10">
        {isUpdatingAI ? "Scanning..." : "Generate Family Planning Report"}
      </span>
    </motion.button>
  );
}
