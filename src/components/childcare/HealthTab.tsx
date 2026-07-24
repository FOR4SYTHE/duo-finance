"use client";

import { useChildCareStore } from "@/store/useChildCareStore";

export function HealthTab() {
  const { cachedData } = useChildCareStore();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-lg font-bold text-white mb-3">Pediatric Hospitals</h3>
        <div className="flex flex-col gap-3">
          {cachedData.hospitals.map((hospital) => (
            <div key={hospital.id} className="bg-[#1A1A1A] rounded-[24px] p-4 border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-xl">+</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white leading-tight">{hospital.name}</h4>
                <p className="text-xs text-white/50 mt-0.5">{hospital.type}</p>
              </div>
              <a href={`tel:${hospital.emergencyHotline}`} className="bg-white/10 hover:bg-white/20 transition-colors px-3 py-1.5 rounded-full text-xs font-medium text-white border border-white/5">
                Call
              </a>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-white mb-3">Est. Essentials</h3>
        <div className="bg-[#1A1A1A] rounded-[24px] p-5 border border-white/5">
          <div className="text-sm text-white/70 mb-4">
            Baseline allocation for daily essentials (vitamins, healthy snacks, formula/milk, diapers).
          </div>
          <div className="flex justify-between items-center p-4 bg-black/30 rounded-2xl border border-white/5">
            <div className="text-sm font-medium text-white/80">Monthly Budget</div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">₱{cachedData.monthlyEssentialsCost.toLocaleString()}</div>
              <div className="text-xs text-white/50">R{Math.round(cachedData.monthlyEssentialsCost * 0.27).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
