"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { GraduationCap, Plus, MapPin, Calendar } from "lucide-react";

export function EducationTab() {
  const { cachedData } = useChildCareStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Growth Timeline Component */}
      <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#FF7B54]" />
          <h4 className="font-bold text-white text-[15px]">Growth Timeline</h4>
        </div>
        
        <div className="flex flex-col gap-0 relative">
          <div className="absolute left-3 -translate-x-1/2 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#FF7B54] via-white/10 to-transparent" />
          
          {[
            { age: 6, label: "Kindergarten", status: "current" },
            { age: 7, label: "Primary School", status: "next" },
            { age: 10, label: "Sports & Clubs", status: "future" },
            { age: 13, label: "Junior High", status: "future" },
          ].map((milestone, idx) => (
            <div key={idx} className="flex gap-4 items-center relative py-2">
              <div className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center relative z-10 ${
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
    </div>
  );
}
