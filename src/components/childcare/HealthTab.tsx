"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { ArrowRight, HeartPulse, ShieldPlus } from "lucide-react";

export function HealthTab() {
  const { cachedData } = useChildCareStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Hospitals Section */}
      {cachedData.hospitals.map((hospital) => (
        <div key={hospital.id} className="bg-[#1A1A1A] rounded-[24px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/5">
          {/* Decorative Corner Shape */}
          <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-[#FF7B54]/10 rounded-full blur-[20px] pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF7B54]/20 flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-6 h-6 text-[#FF7B54]" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-white text-[15px] leading-tight">{hospital.name}</h4>
                <p className="text-[12px] font-medium text-white/50 mt-0.5">{hospital.type}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-between items-center">
              <a href={`tel:${hospital.emergencyHotline}`} className="text-[12px] font-bold text-white/80 hover:text-white transition-colors">
                Emergency: {hospital.emergencyHotline}
              </a>
              <a href={`tel:${hospital.emergencyHotline}`} className="w-8 h-8 rounded-full bg-[#FF7B54]/20 flex items-center justify-center hover:bg-[#FF7B54]/30 transition-colors">
                <ArrowRight className="w-4 h-4 text-[#FF7B54]" />
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Essentials Section */}
      <div className="bg-[#FF7B54]/10 rounded-[32px] p-6 mt-2 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 mb-4">
          <ShieldPlus className="w-5 h-5 text-[#FF7B54]" />
          <h4 className="font-bold text-white text-[14px]">Monthly Essentials Focus</h4>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {["Multivitamins", "Healthy Snacks", "Hygiene Supplies"].map((item, idx) => (
            <div key={idx} className="bg-[#1A1A1A] border border-[#FF7B54]/20 px-4 py-2 rounded-full shadow-sm">
              <span className="text-[12px] font-bold text-white/90">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
