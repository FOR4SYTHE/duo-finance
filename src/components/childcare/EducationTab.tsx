"use client";

import { useState } from "react";
import { useChildCareStore } from "@/store/useChildCareStore";
import { ArrowRight, GraduationCap, Palette, Plus, MapPin, Calendar, LayoutGrid, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function EducationTab() {
  const { cachedData } = useChildCareStore();
  const [activeActivityCategory, setActiveActivityCategory] = useState<string>("All");

  const categories = ["All", "Sports", "Arts", "Learning", "Lifestyle"];

  return (
    <div className="flex flex-col gap-6">
      {/* Growth Timeline Component */}
      <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#FF7B54]" />
          <h4 className="font-bold text-white text-[15px]">Growth Timeline</h4>
        </div>
        
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#FF7B54] via-white/10 to-transparent" />
          
          {[
            { age: 6, label: "Kindergarten", status: "current" },
            { age: 7, label: "Primary School", status: "next" },
            { age: 10, label: "Sports & Clubs", status: "future" },
            { age: 13, label: "Junior High", status: "future" },
          ].map((milestone, idx) => (
            <div key={idx} className="flex gap-4 items-center relative py-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center relative z-10 ${
                milestone.status === 'current' ? 'bg-[#FF7B54] shadow-[0_0_10px_rgba(255,123,84,0.4)]' : 
                milestone.status === 'next' ? 'bg-[#1A1A1A] border-2 border-[#FF7B54]' : 'bg-[#1A1A1A] border-2 border-white/10'
              }`}>
                {milestone.status === 'current' && <span className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="flex flex-col">
                <span className={`text-[14px] font-bold ${milestone.status === 'current' ? 'text-white' : 'text-white/60'}`}>
                  {milestone.label}
                </span>
                <span className="text-[11px] font-bold text-[#FF7B54]/80 uppercase tracking-widest">
                  Age {milestone.age}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schools Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-bold text-white text-[15px]">Schools & Institutions</h4>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Sort: Distance</span>
        </div>
        {cachedData.schools.map((school) => {
          const zarTuition = Math.round(school.monthlyTuition * 0.27);
          return (
            <div key={school.id} className="bg-[#1A1A1A] rounded-[24px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/5">
              {/* Decorative Corner Shape */}
              <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-[#B9E0F2]/10 rounded-full blur-[20px] pointer-events-none" />
              <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-[#FF7B54]/5 rounded-bl-full pointer-events-none" />
    
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#B9E0F2] flex items-center justify-center flex-shrink-0 shadow-inner">
                      <GraduationCap className="w-6 h-6 text-[#0A0A0A]" />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-bold text-white text-[15px] leading-tight pr-4">{school.name}</h4>
                      <p className="text-[12px] font-medium text-white/50 mt-1">{school.type}</p>
                    </div>
                  </div>
                  {school.distance && (
                    <div className="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-full text-[10px] font-bold">
                      <MapPin className="w-3 h-3" />
                      {school.distance}
                    </div>
                  )}
                </div>

                {/* Chips */}
                {school.chips && (
                  <div className="flex flex-wrap gap-2">
                    {school.chips.map((chip, i) => (
                      <span key={i} className="text-[10px] font-bold tracking-wide text-[#B9E0F2] bg-[#B9E0F2]/10 border border-[#B9E0F2]/20 px-2 py-1 rounded-full">
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
    
                <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Est. Yearly Tuition</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-[#FF7B54]">₱{(school.monthlyTuition * 12).toLocaleString()}</span>
                        <span className="text-[12px] font-medium text-white/50">/ R{(zarTuition * 12).toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5">₱{school.monthlyTuition.toLocaleString()} / mo</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 text-[11px] font-bold border border-white/5 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        Budget
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activities Section */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-white/80" />
            <h4 className="font-bold text-white text-[15px]">Activities</h4>
          </div>
        </div>

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
            const zarCost = Math.round((activity.cost || 5000) * 0.27);
            return (
              <motion.div 
                key={activity.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[4/5] rounded-[24px] overflow-hidden group shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/10 flex flex-col justify-end"
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
                    <button className="w-6 h-6 rounded-full bg-[#FF7B54] flex items-center justify-center shadow-[0_2px_8px_rgba(255,123,84,0.4)]">
                      <Plus className="w-3.5 h-3.5 text-white" />
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
