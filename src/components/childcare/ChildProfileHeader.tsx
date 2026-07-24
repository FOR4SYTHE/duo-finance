"use client";

import { useState, useRef, useEffect } from "react";
import { useChildCareStore } from "@/store/useChildCareStore";
import { motion } from "framer-motion";

export function ChildProfileHeader() {
  const { profile, updateProfile, cachedData } = useChildCareStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    dragRef.current.isDown = true;
    dragRef.current.startX = e.pageX - scrollRef.current.offsetLeft;
    dragRef.current.scrollLeft = scrollRef.current.scrollLeft;
  };
  const onMouseLeaveOrUp = () => { dragRef.current.isDown = false; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragRef.current.startX) * 1.5;
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - walk;
  };

  const itemWidth = 60;
  const dashboardAges = Array.from({ length: 18 }, (_, i) => i + 1);
  
  // Set initial scroll position based on current age
  useEffect(() => {
    if (scrollRef.current && profile.age) {
      const index = dashboardAges.indexOf(profile.age);
      if (index !== -1) {
        scrollRef.current.scrollLeft = index * itemWidth;
      }
    }
  }, []);

  // Compute total monthly overhead
  const totalTuition = cachedData.schools[0]?.monthlyTuition || 0;
  const totalCostPHP = totalTuition + cachedData.monthlyEssentialsCost;
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
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeaveOrUp}
          onMouseUp={onMouseLeaveOrUp}
          onMouseMove={onMouseMove}
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const index = Math.round(scrollLeft / itemWidth);
            const newAge = dashboardAges[index];
            if (newAge && newAge !== profile.age) {
              updateProfile({ age: newAge });
            }
          }}
          className="flex items-center w-full h-full overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing snap-x snap-mandatory relative z-10" 
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
              <button
                key={age}
                onClick={() => {
                  const index = dashboardAges.indexOf(age);
                  scrollRef.current?.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
                }}
                className={`flex-shrink-0 flex items-center justify-center font-bold text-lg transition-colors snap-center h-full`}
                style={{ width: itemWidth }}
              >
                <span className={`relative z-10 ${isActive ? 'text-white' : 'text-white/40 hover:text-white/60'}`}>{age}</span>
              </button>
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              Live
            </span>
          </div>
        </div>

        {/* Middle Row: Big Numbers */}
        <div className="flex items-baseline gap-2 mb-8 ml-1">
          <span className="text-[42px] leading-none font-black tracking-tighter text-white">
            ₱{totalCostPHP.toLocaleString()}
          </span>
          <div className="bg-[#FF7B54]/10 px-2 py-1 rounded-lg ml-1">
            <span className="text-sm font-bold text-[#FF7B54]">
              R{Math.round(totalCostZAR).toLocaleString()}
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
            className="flex-1 bg-white/5 hover:bg-white/10 transition-colors py-4 rounded-[24px] flex items-center justify-center gap-2 border border-white/5"
          >
            <span className="text-[13px] font-bold text-white">Breakdown</span>
          </button>
        </div>
      </div>
    </div>
  );
}
