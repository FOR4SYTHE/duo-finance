"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useChildCareStore } from "@/store/useChildCareStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calculator } from "lucide-react";

export function ChildProfileHeader() {
  const { profile, updateProfile, cachedData, configuration } = useChildCareStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const itemWidth = 60;
  const dashboardAges = Array.from({ length: 18 }, (_, i) => i + 1);
  
  useEffect(() => {
    setMounted(true);
    if (scrollRef.current && profile.age) {
      const index = dashboardAges.indexOf(profile.age);
      if (index !== -1) {
        scrollRef.current.scrollLeft = index * itemWidth;
      }
    }
  }, []);

  // Compute total monthly overhead dynamically
  const baseEssentials = cachedData.monthlyEssentialsCost || 3000;
  
  // Education
  const configuredSchool = cachedData.schools.find(s => s.id === configuration.selectedSchoolId);
  const tuitionCost = configuredSchool ? configuredSchool.monthlyTuition : 5000; // 5000 is regional estimate
  
  // Healthcare
  const hasHealthcare = configuration.selectedHealthcareProviders.length > 0;
  const healthcareCost = hasHealthcare ? 1500 : 1000; // 1000 is regional estimate
  
  // Activities
  const activitiesCost = configuration.selectedActivities.reduce((total, id) => {
    const act = cachedData.summerActivities.find(a => a.id === id);
    return total + ((act?.cost || 0) / 12);
  }, 0);

  const totalCostPHP = baseEssentials + tuitionCost + healthcareCost + activitiesCost;
  const totalCostZAR = totalCostPHP * 0.27; // Dummy exchange rate for mock

  const handleEditProfile = () => {
    // Restart the onboarding flow to edit data
    useChildCareStore.setState({ hasCompletedOnboarding: false });
  };
  
  return (
    <div className="flex flex-col items-center w-full pt-4">
      {/* Avatar Image */}
      <div className="w-24 h-24 rounded-[32px] bg-[#1A1A1A] border-[4px] border-[#0A0A0A] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_0_2px_rgba(255,255,255,0.05)] overflow-hidden flex items-center justify-center mb-5 relative z-20">
        {profile.gender ? (
          <img 
            src={profile.gender === 'boy' ? '/ChildCareBoy.webp' : '/ChildCareGirl.webp'} 
            alt="Child Profile"
            className="w-full h-full object-cover scale-[1.15]"
          />
        ) : (
          <span className="text-3xl">👦</span>
        )}
      </div>

      {/* Dashboard Title */}
      <h2 className="text-2xl font-black text-white mb-1">
        {profile.nickname ? `${profile.nickname}'s Dashboard` : "Dashboard"}
      </h2>
      <p className="text-sm font-medium text-white/50 mb-6">
        Planning for the years ahead
      </p>

      {/* Dashboard Age Selector Pill */}
      <div className="relative w-full max-w-[280px] mb-8 bg-[#B9E0F2]/10 rounded-full border border-white/5 overflow-hidden shadow-inner h-[60px] flex items-center">
        {/* Fixed Highlight Circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#FF7B54] rounded-full shadow-[0_4px_12px_rgba(255,123,84,0.4)] pointer-events-none z-0" />
        
        <div 
          ref={scrollRef}
          className="flex items-center w-full h-full relative z-10 pointer-events-none overflow-hidden" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            paddingLeft: `calc(50% - ${itemWidth / 2}px)`,
            paddingRight: `calc(50% - ${itemWidth / 2}px)`
          }}
        >
          {dashboardAges.map((age) => {
            const isActive = profile.age === age;
            return (
              <div
                key={age}
                className={`flex-shrink-0 flex items-center justify-center font-bold text-lg transition-colors snap-center h-full`}
                style={{ width: itemWidth }}
              >
                <span className={`relative z-10 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>{age}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Island Monthly Overhead */}
      <div className="w-full bg-[#000000] rounded-[42px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5 flex flex-col relative overflow-hidden z-20">
        
        {/* Top Row: Label & Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {/* Live Indicator */}
            <div className="w-6 h-6 rounded-full bg-[#FF7B54]/10 flex items-center justify-center">
              <span className="w-2 h-2 bg-[#FF7B54] rounded-full shadow-[0_0_10px_#FF7B54]" />
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-white/60">
              Monthly Overhead
            </span>
          </div>
          {/* Top Right Actions / Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF7B54] bg-[#FF7B54]/10 px-3 py-1.5 rounded-full border border-[#FF7B54]/20">
              Updated July 2026
            </span>
          </div>
        </div>

        {/* Middle Row: Big Numbers */}
        <div className="flex flex-col gap-1 mb-8 ml-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[42px] leading-none font-black tracking-tighter text-white">
              ₱{totalCostPHP.toLocaleString()}
            </span>
            <div className="bg-[#FF7B54]/10 px-2 py-1 rounded-lg ml-1">
              <span className="text-sm font-bold text-[#FF7B54]">
                R{Math.round(totalCostZAR).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1 opacity-70">
            <span className="text-[13px] font-bold text-white tracking-wide">
              Est. Yearly: ₱{(totalCostPHP * 12).toLocaleString()}
            </span>
            <span className="text-[12px] font-bold text-white/50">
              / R{Math.round(totalCostZAR * 12).toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Bottom Row: Dynamic Actions */}
        <div className="flex gap-3">
          <button 
            onClick={handleEditProfile}
            className="flex-1 bg-white/5 hover:bg-white/10 transition-colors py-4 rounded-[24px] flex items-center justify-center gap-2 border border-white/5"
          >
            <span className="text-[13px] font-bold text-white">Edit Profile</span>
          </button>
          <button 
            onClick={() => setIsBreakdownOpen(true)}
            className="flex-1 bg-white/5 hover:bg-white/10 transition-colors py-4 rounded-[24px] flex items-center justify-center gap-2 border border-white/5"
          >
            <span className="text-[13px] font-bold text-white">Breakdown</span>
          </button>
        </div>
      </div>

      {/* Breakdown Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isBreakdownOpen && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4 pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBreakdownOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div 
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-md bg-[#1A1A1A] rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#FF7B54]" />
                    <h3 className="text-xl font-black text-white">Cost Breakdown</h3>
                  </div>
                  <button 
                    onClick={() => setIsBreakdownOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/50" />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white">Base Essentials</span>
                      <span className="text-[11px] text-white/50">Food, Diapers, Hygiene</span>
                    </div>
                    <span className="text-[15px] font-bold text-white">₱{baseEssentials.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white">Education</span>
                      <span className="text-[11px] text-[#FF7B54] font-bold uppercase tracking-wide">
                        {configuredSchool ? 'Configured' : 'Estimated'}
                      </span>
                    </div>
                    <span className="text-[15px] font-bold text-white">₱{tuitionCost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white">Healthcare</span>
                      <span className="text-[11px] text-[#FF7B54] font-bold uppercase tracking-wide">
                        {hasHealthcare ? 'Configured' : 'Estimated'}
                      </span>
                    </div>
                    <span className="text-[15px] font-bold text-white">₱{healthcareCost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-white">Activities (Monthly Avg)</span>
                      <span className="text-[11px] text-[#FF7B54] font-bold uppercase tracking-wide">
                        {activitiesCost > 0 ? 'Configured' : 'Estimated'}
                      </span>
                    </div>
                    <span className="text-[15px] font-bold text-white">₱{activitiesCost.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[16px] font-black text-white">Total Monthly</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[20px] font-black text-[#FF7B54]">₱{Math.round(totalCostPHP).toLocaleString()}</span>
                      <span className="text-[12px] font-bold text-white/50">/ R{Math.round(totalCostZAR).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
