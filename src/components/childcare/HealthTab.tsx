"use client";

import { useState } from "react";
import { useChildCareStore } from "@/store/useChildCareStore";
import { ArrowRight, HeartPulse, ShieldPlus, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HealthTab() {
  const { cachedData } = useChildCareStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Hospital", "Pediatrician", "Dentist"];

  return (
    <div className="flex flex-col gap-5">
      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 px-1 -mx-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-bold transition-all border ${
              activeCategory === cat 
                ? 'bg-[#FF7B54] text-white border-[#FF7B54] shadow-[0_4px_12px_rgba(255,123,84,0.3)]' 
                : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hospitals / Healthcare Section */}
      <div className="flex flex-col gap-3">
        {cachedData.hospitals
          .filter(h => activeCategory === "All" || h.category === activeCategory)
          .map((hospital) => (
          <motion.div 
            key={hospital.id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1A1A1A] rounded-[24px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-white/5"
          >
            {/* Decorative Corner Shape */}
            <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-[#FF7B54]/10 rounded-full blur-[20px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FF7B54]/20 flex items-center justify-center flex-shrink-0">
                    <HeartPulse className="w-6 h-6 text-[#FF7B54]" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-white text-[15px] leading-tight pr-4">{hospital.name}</h4>
                    <p className="text-[12px] font-medium text-white/50 mt-1">{hospital.type}</p>
                  </div>
                </div>
                {hospital.distance && (
                  <div className="flex items-center gap-1 text-white/40 bg-white/5 px-2 py-1 rounded-full text-[10px] font-bold flex-shrink-0">
                    <MapPin className="w-3 h-3" />
                    {hospital.distance}
                  </div>
                )}
              </div>

              {/* Info Row: Hours & Insurances */}
              <div className="flex flex-col gap-2 mt-2">
                {hospital.operatingHours && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/60">
                    <Clock className="w-3.5 h-3.5" />
                    {hospital.operatingHours}
                  </div>
                )}
                {hospital.acceptedInsurances && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {hospital.acceptedInsurances.map((ins, i) => (
                      <span key={i} className="flex items-center gap-1 text-[10px] font-bold text-emerald-400/90 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {ins}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-4 flex justify-between items-center mt-1">
                <a href={hospital.emergencyHotline ? `tel:${hospital.emergencyHotline}` : "#"} className="text-[12px] font-bold text-[#FF7B54] hover:text-[#FF7B54]/80 transition-colors">
                  {hospital.emergencyHotline ? `Emergency: ${hospital.emergencyHotline}` : "Contact Provider"}
                </a>
                <button className="w-8 h-8 rounded-full bg-[#FF7B54]/20 flex items-center justify-center hover:bg-[#FF7B54]/30 transition-colors">
                  <ArrowRight className="w-4 h-4 text-[#FF7B54]" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {cachedData.hospitals.filter(h => activeCategory === "All" || h.category === activeCategory).length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-8 text-center bg-[#1A1A1A] rounded-[24px] border border-white/5"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-white/30" />
            </div>
            <h4 className="text-[14px] font-bold text-white mb-1">No providers found</h4>
            <p className="text-[12px] text-white/50 max-w-[200px]">There are no {activeCategory.toLowerCase()}s listed nearby. Try expanding your search area.</p>
            <button className="mt-4 px-4 py-2 bg-white/5 rounded-full text-[11px] font-bold text-white/80 hover:bg-white/10 transition-colors">
              Expand Search
            </button>
          </motion.div>
        )}
      </div>

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
