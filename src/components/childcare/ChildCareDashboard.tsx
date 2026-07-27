"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { ChildProfileHeader } from "@/components/childcare/ChildProfileHeader";
import { ChildCareTabs } from "@/components/childcare/ChildCareTabs";
import { GrowthCostForecast } from "@/components/childcare/GrowthCostForecast";
import { AIRefreshButton } from "@/components/childcare/AIRefreshButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { X, CheckCircle2, CircleDashed } from "lucide-react";

export function ChildCareDashboard() {
  const { isUpdatingAI, hasCompletedOnboarding, configuration } = useChildCareStore();

  const handleEditProfile = () => {
    // Restart the onboarding flow to edit data
    useChildCareStore.setState({ hasCompletedOnboarding: false });
  };

  return (
    <div className="relative z-10 w-full flex flex-col gap-6 pt-12">
      
      {/* Header Actions */}
      <div className="absolute top-0 right-0 flex items-center gap-3 z-50">
        <button
          onClick={() => useChildCareStore.getState().reset()}
          className="px-3 py-1.5 h-10 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-full flex items-center justify-center text-[#FF453A] hover:bg-[#FF453A]/20 transition-colors text-xs font-bold tracking-widest uppercase"
        >
          Reset Setup
        </button>
        <Link 
          href="/"
          className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </Link>
      </div>



      {/* Header (Context Engine) */}
      <ChildProfileHeader />

      {/* Setup Progress */}
      <div className="flex flex-col gap-3 mt-2">
        <h4 className="text-[14px] font-bold text-white pl-1">Setup Progress</h4>
        <div className="bg-[#1A1A1A] rounded-[24px] p-4 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-2 gap-4">
            
            {/* School */}
            <div className="flex items-center gap-2">
              {configuration.selectedSchoolId ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <CircleDashed className="w-4 h-4 text-[#FF7B54] flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-white leading-tight">School</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${configuration.selectedSchoolId ? 'text-emerald-400/80' : 'text-[#FF7B54]/80'}`}>
                  {configuration.selectedSchoolId ? 'Selected' : 'Estimated'}
                </span>
              </div>
            </div>

            {/* Activities */}
            <div className="flex items-center gap-2">
              {configuration.selectedActivities.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <CircleDashed className="w-4 h-4 text-[#FF7B54] flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-white leading-tight">Activities</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${configuration.selectedActivities.length > 0 ? 'text-emerald-400/80' : 'text-[#FF7B54]/80'}`}>
                  {configuration.selectedActivities.length > 0 ? 'Configured' : 'Estimated'}
                </span>
              </div>
            </div>

            {/* Healthcare */}
            <div className="flex items-center gap-2">
              {configuration.selectedHealthcareProviders.length > 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <CircleDashed className="w-4 h-4 text-[#FF7B54] flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-white leading-tight">Healthcare</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${configuration.selectedHealthcareProviders.length > 0 ? 'text-emerald-400/80' : 'text-[#FF7B54]/80'}`}>
                  {configuration.selectedHealthcareProviders.length > 0 ? 'Configured' : 'Estimated'}
                </span>
              </div>
            </div>

            {/* Insurance */}
            <div className="flex items-center gap-2">
              <CircleDashed className="w-4 h-4 text-white/30 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-white/50 leading-tight">Insurance</span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Not Connected
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Flagship Forecast Feature */}
      <GrowthCostForecast />

      {/* Content Tabs */}
      <ChildCareTabs />

      {/* AI Refresh Action */}
      <div className="mt-8 mb-6">
        <AIRefreshButton />
      </div>

      {/* AI Loading Overlay */}
      {isUpdatingAI && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 bg-[#1A1A1A] p-8 rounded-[32px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-12 h-12 border-4 border-t-[#A855F7] border-r-[#3B82F6] border-b-[#EC4899] border-l-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-white">Gemini is scanning Malolos...</p>
              <p className="text-sm text-white/50 mt-1">Fetching 2026 tuition & rates</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
