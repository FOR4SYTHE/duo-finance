"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { motion } from "framer-motion";
import { useState, useRef } from "react";

export function ChildProfileHeader() {
  const { profile, updateProfile, cachedData } = useChildCareStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const ages = Array.from({ length: 18 }, (_, i) => i + 1); // 1 to 18

  // Compute total monthly overhead (Mock logic for baseline)
  const totalTuition = cachedData.schools[0]?.monthlyTuition || 0;
  const totalCostPHP = totalTuition + cachedData.monthlyEssentialsCost;
  const totalCostZAR = totalCostPHP * 0.27; // Dummy exchange rate for mock
  
  return (
    <div className="bg-[#1A1A1A] rounded-[32px] p-6 border border-white/5 relative overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_0_8px_16px_rgba(0,0,0,0.2)]">
      {/* Decorative Blur */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#A855F7]/30 to-[#EC4899]/30 blur-[40px] rounded-full pointer-events-none" />

      {/* Name Input */}
      <div className="relative z-10 flex flex-col gap-1 mb-6">
        <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Child's Profile</label>
        {isEditingName ? (
          <input
            autoFocus
            type="text"
            className="bg-transparent text-2xl font-bold text-white outline-none border-b border-white/20 pb-1 w-full"
            placeholder="Nickname (Optional)"
            value={profile.nickname}
            onChange={(e) => updateProfile({ nickname: e.target.value })}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
          />
        ) : (
          <h2 
            className="text-2xl font-bold text-white cursor-pointer flex items-center gap-2"
            onClick={() => setIsEditingName(true)}
          >
            {profile.nickname || "Add Nickname"}
            <span className="text-white/30 text-sm">✎</span>
          </h2>
        )}
      </div>

      {/* Age Selector (Horizontal Scroll) */}
      <div className="relative z-10 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white/70 text-sm font-medium">What is their age?</span>
        </div>
        
        {/* Fading Edges */}
        <div className="absolute left-0 top-8 bottom-0 w-8 bg-gradient-to-r from-[#1A1A1A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-8 bottom-0 w-8 bg-gradient-to-l from-[#1A1A1A] to-transparent z-10 pointer-events-none" />
        
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 py-2 px-4 -mx-4 hide-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {ages.map((age) => {
            const isSelected = profile.age === age;
            return (
              <motion.button
                key={age}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateProfile({ age })}
                className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all snap-center
                  ${isSelected 
                    ? 'bg-white text-black shadow-[0_4px_12px_rgba(255,255,255,0.3)]' 
                    : 'bg-white/10 text-white/50 border border-white/5 hover:bg-white/15'
                  }`}
              >
                {age}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Estimated Overhead */}
      <div className="relative z-10 bg-black/40 rounded-2xl p-4 border border-white/5">
        <div className="text-white/50 text-xs mb-1">Est. Monthly Overhead</div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-semibold tracking-tight text-white">
            ₱{totalCostPHP.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-white/40 mb-1">
            / R{Math.round(totalCostZAR).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
