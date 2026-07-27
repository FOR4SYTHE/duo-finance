"use client";

import { useState } from "react";
import { useChildCareStore } from "@/store/useChildCareStore";
import { Plus, Palette, CheckCircle2, Info } from "lucide-react";
import { motion } from "framer-motion";

export function ActivitiesTab() {
  const { cachedData, configuration, toggleActivity } = useChildCareStore();
  const [activeActivityCategory, setActiveActivityCategory] = useState<string>("All");

  const categories = ["All", "Sports", "Arts", "Learning", "Lifestyle"];

  return (
    <div className="flex flex-col gap-4">
      {/* Activities Section */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#FF7B54]" />
            <h4 className="font-bold text-white text-[15px]">Activities & Camp</h4>
          </div>
        </div>

        {configuration.selectedActivities.length === 0 && (
          <div className="bg-[#FF7B54]/10 border border-[#FF7B54]/20 rounded-2xl p-4 mx-1 flex gap-3 items-start">
            <Info className="w-5 h-5 text-[#FF7B54] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-white leading-tight">No activities selected</span>
              <span className="text-[12px] text-white/70 mt-1 leading-snug">Costs shown in forecasts are currently estimated based on regional averages.</span>
            </div>
          </div>
        )}

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 px-1 -mx-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveActivityCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold transition-all border ${
                activeActivityCategory === cat 
                  ? 'bg-[#FF7B54] text-white border-[#FF7B54] shadow-[0_4px_12px_rgba(255,123,84,0.3)]' 
                  : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          {cachedData.summerActivities
            .filter(a => activeActivityCategory === "All" || a.category === activeActivityCategory)
            .map((activity, idx) => {
            const isSelected = configuration.selectedActivities.includes(activity.id);
            const zarCost = Math.round((activity.cost || 5000) * 0.27);
            return (
              <motion.div 
                key={`${activity.id}-${idx}`} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative aspect-[4/5] rounded-[24px] overflow-hidden group shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col justify-end transition-all ${
                  isSelected ? 'border-2 border-emerald-400' : 'border border-white/10'
                }`}
              >
                {/* Background Art */}
                <img 
                  src={
                    activity.category === "Sports" ? "/childcare/swimming_clinic.png" : 
                    activity.category === "Arts" ? "/childcare/art_workshop.png" : 
                    "/childcare/robotics_camp.png"
                  } 
                  alt={activity.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to a solid gradient if image not found
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.style.background = 'linear-gradient(to bottom right, #1A1A1A, #0A0A0A)';
                  }}
                />
                
                {/* Dark Scrim for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                
                <div className="relative z-10 p-4 flex flex-col gap-1 w-full">
                  <span className="text-[10px] font-bold text-[#FF7B54] uppercase tracking-widest mb-1 flex items-baseline gap-1">
                    ₱{activity.cost?.toLocaleString() || "5,000"} 
                    <span className="text-white/50 text-[8px]">/ R{zarCost.toLocaleString()}</span>
                  </span>
                  <span className="text-[14px] font-bold text-white leading-tight">
                    {activity.title}
                  </span>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-bold text-white/50 tracking-wider">
                      {activity.duration || "Summer Term"}
                    </span>
                    <button 
                      onClick={() => toggleActivity(activity.id)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-emerald-400 shadow-[0_2px_8px_rgba(52,211,153,0.4)]' 
                          : 'bg-[#FF7B54] shadow-[0_2px_8px_rgba(255,123,84,0.4)]'
                      }`}
                    >
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0A0A0A]" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {cachedData.summerActivities.filter(a => activeActivityCategory === "All" || a.category === activeActivityCategory).length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center bg-[#1A1A1A] rounded-[24px] border border-white/5 mt-2"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Palette className="w-6 h-6 text-white/30" />
            </div>
            <h4 className="text-[14px] font-bold text-white mb-1">No activities found</h4>
            <p className="text-[12px] text-white/50 max-w-[200px]">There are no {activeActivityCategory.toLowerCase()} activities listed nearby. Try expanding your search area.</p>
            <button className="mt-4 px-4 py-2 bg-white/5 rounded-full text-[11px] font-bold text-white/80 hover:bg-white/10 transition-colors">
              Expand Search
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
