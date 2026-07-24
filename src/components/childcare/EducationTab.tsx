"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { ArrowRight, GraduationCap, Palette } from "lucide-react";

export function EducationTab() {
  const { cachedData } = useChildCareStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Schools Section */}
      {cachedData.schools.map((school) => {
        const zarTuition = Math.round(school.monthlyTuition * 0.27);
        return (
          <div key={school.id} className="bg-[#1A1A1A] rounded-[24px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/5">
            {/* Decorative Corner Shape */}
            <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-[#B9E0F2]/10 rounded-full blur-[20px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-[#FF7B54]/5 rounded-bl-full pointer-events-none" />
  
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#B9E0F2] flex items-center justify-center flex-shrink-0 shadow-inner">
                  <GraduationCap className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-white text-[15px] leading-tight">{school.name}</h4>
                  <p className="text-[12px] font-medium text-white/50 mt-0.5">{school.type}</p>
                </div>
              </div>
  
              <div className="border-t border-white/5 pt-4 flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Est. Tuition</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-[#FF7B54]">₱{school.monthlyTuition.toLocaleString()}</span>
                    <span className="text-[12px] font-medium text-white/50">/ R{zarTuition.toLocaleString()}</span>
                    <span className="text-[10px] font-medium text-white/40 ml-0.5">/yr</span>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#B9E0F2]/20 flex items-center justify-center hover:bg-[#B9E0F2]/30 transition-colors">
                  <ArrowRight className="w-4 h-4 text-[#B9E0F2]" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Activities Section */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 px-2">
          <Palette className="w-5 h-5 text-white/80" />
          <h4 className="font-bold text-white text-[15px]">Available Activities</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {cachedData.summerActivities.map((activity, idx) => {
            const zarCost = Math.round((activity.cost || 5000) * 0.27);
            return (
              <div 
                key={activity.id} 
                className="relative aspect-square rounded-[24px] overflow-hidden group shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/10"
              >
                {/* Background Art */}
                <img 
                  src={
                    idx === 0 ? "/childcare/swimming_clinic.png" : 
                    idx === 1 ? "/childcare/art_workshop.png" : 
                    "/childcare/robotics_camp.png"
                  } 
                  alt={activity.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Dark Scrim for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-bold text-[#FF7B54] uppercase tracking-widest mb-1 flex items-baseline gap-1">
                    ₱{activity.cost?.toLocaleString() || "5,000"} 
                    <span className="text-white/50 text-[8px]">/ R{zarCost.toLocaleString()}</span>
                  </span>
                  <span className="text-[14px] font-bold text-white leading-tight">
                    {activity.title}
                  </span>
                  <span className="text-[11px] font-medium text-white/50 mt-1">
                    {activity.duration || "Summer Term"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
