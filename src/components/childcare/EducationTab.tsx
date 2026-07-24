"use client";

import { useChildCareStore } from "@/store/useChildCareStore";

export function EducationTab() {
  const { cachedData } = useChildCareStore();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-lg font-bold text-white">Schools in Malolos</h3>
        </div>
        <div className="flex flex-col gap-3">
          {cachedData.schools.map((school) => (
            <div key={school.id} className="bg-[#1A1A1A] rounded-[24px] p-4 border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-white leading-tight">{school.name}</h4>
                  <p className="text-xs text-white/50 mt-1">{school.type}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                <div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Monthly Tuition</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold text-white">₱{school.monthlyTuition.toLocaleString()}</span>
                    <span className="text-xs text-white/50">/ R{Math.round(school.monthlyTuition * 0.27).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Supplies/Term</div>
                  <div className="flex items-baseline gap-1.5 justify-end">
                    <span className="text-sm font-medium text-white">₱{school.suppliesPerTerm.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold text-white mb-3">Summer Activities</h3>
        <div className="flex flex-col gap-3">
          {cachedData.summerActivities.map((activity) => (
            <div key={activity.id} className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 flex justify-between items-center">
              <div>
                <h4 className="font-semibold text-white text-sm">{activity.title || activity.name}</h4>
                <p className="text-xs text-white/50 mt-0.5">{activity.duration}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-white">₱{activity.cost.toLocaleString()}</div>
                <div className="text-[10px] text-white/40">R{Math.round(activity.cost * 0.27).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
