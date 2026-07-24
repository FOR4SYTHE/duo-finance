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
      className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all relative overflow-hidden group
        ${isUpdatingAI 
          ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' 
          : 'bg-[#1A1A1A] text-white border border-white/10 hover:border-white/30 hover:bg-[#222]'
        }`}
    >
      {/* Background Gradient Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7]/0 via-[#3B82F6]/20 to-[#A855F7]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {!isUpdatingAI && (
        <span className="text-xl">✨</span>
      )}
      
      <span className="relative z-10">
        {isUpdatingAI ? "Scanning..." : "Generate Latest 2026 AI Report"}
      </span>
    </motion.button>
  );
}
