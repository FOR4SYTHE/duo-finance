"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChildCareStore } from "@/store/useChildCareStore";
import Link from "next/link";
import { X, MapPin } from "lucide-react";

export function ChildCareOnboarding() {
  const { profile, updateProfile, completeOnboarding } = useChildCareStore();
  const [step, setStep] = useState(1);
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
  
  const ages = Array.from({ length: 18 }, (_, i) => i + 1); // 1 to 18
  const itemWidth = 60;

  // Set initial scroll position based on current age
  useEffect(() => {
    if (scrollRef.current && profile.age) {
      const index = ages.indexOf(profile.age);
      if (index !== -1) {
        scrollRef.current.scrollLeft = index * itemWidth;
      }
    }
  }, [step]); // re-run when step changes because the dom node might remount

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else completeOnboarding();
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-[100dvh] w-full px-6 py-12 overflow-y-auto no-scrollbar bg-[#0A0A0A]">
      
      {/* Exit Button */}
      <Link 
        href="/"
        className="absolute top-6 left-6 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-colors z-50 shadow-lg"
      >
        <X className="w-5 h-5" />
      </Link>

      <div className="relative z-10 w-full max-w-sm pt-8">
        
        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h2 className="text-3xl font-black tracking-tight text-white mb-3">
                Shape their future.
              </h2>
              <p className="text-white/60 font-medium mb-12 text-[15px] max-w-[260px] leading-relaxed">
                A nurturing space to track, learn, and grow together.
              </p>
              
              {/* Image Placeholder */}
              <div className="w-full aspect-[4/3] bg-gradient-to-br from-[#FF7B54]/20 to-[#B9E0F2]/20 rounded-[40px] border border-white/10 flex items-center justify-center mb-16 relative">
                <div className="absolute top-[-20px] right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-[#FF7B54]">☆</span>
                </div>
                <div className="absolute bottom-[-15px] left-8 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl text-[#B9E0F2]">♡</span>
                </div>
                <span className="text-white/30 text-sm font-semibold tracking-widest uppercase">Art Asset Here</span>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-[#FF7B54]' : 'w-1.5 bg-[#B9E0F2]/30'}`} />
                ))}
              </div>

              <button 
                onClick={nextStep}
                className="w-full bg-[#FF7B54] text-white font-bold text-lg py-4 rounded-[24px] shadow-[0_8px_30px_rgba(255,123,84,0.3)] hover:scale-[0.98] transition-transform"
              >
                Get Started
              </button>
            </motion.div>
          )}

          {/* STEP 2: Child Info (Combined Nickname, Age, Gender) */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center w-full"
            >
              <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                Child Info
              </h2>
              <p className="text-white/60 font-medium mb-10 text-[15px]">
                Let's personalize their experience.
              </p>
              
              <div className="w-full flex flex-col gap-8 mb-10">
                {/* Nickname */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-white/80 ml-1">What's their nickname?</label>
                  <input
                    type="text"
                    placeholder="e.g., Leo"
                    value={profile.nickname || ''}
                    onChange={(e) => updateProfile({ nickname: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-[20px] px-5 py-4 text-lg font-semibold text-white placeholder-white/30 focus:outline-none focus:border-[#FF7B54]/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                  />
                </div>

                {/* Age */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-white/80 ml-1">How old will they turn this year?</label>
                  <div className="w-full bg-[#FF7B54] rounded-[24px] relative overflow-hidden shadow-[0_8px_30px_rgba(255,123,84,0.2)] h-[72px] flex items-center">
                    
                    {/* Fixed Highlight Circle (White for Onboarding) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] pointer-events-none z-0" />

                    <div 
                      ref={scrollRef}
                      onMouseDown={onMouseDown}
                      onMouseLeave={onMouseLeaveOrUp}
                      onMouseUp={onMouseLeaveOrUp}
                      onMouseMove={onMouseMove}
                      onScroll={(e) => {
                        const scrollLeft = e.currentTarget.scrollLeft;
                        const index = Math.round(scrollLeft / itemWidth);
                        const newAge = ages[index];
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
                      {ages.map((age) => {
                        const isActive = profile.age === age;
                        return (
                          <button
                            key={age}
                            onClick={() => {
                              const index = ages.indexOf(age);
                              scrollRef.current?.scrollTo({ left: index * itemWidth, behavior: 'smooth' });
                            }}
                            className={`flex-shrink-0 flex items-center justify-center font-bold transition-colors snap-center h-full ${isActive ? 'text-[#FF7B54] text-xl' : 'text-white/60 hover:text-white text-lg'}`}
                            style={{ width: itemWidth }}
                          >
                            <span className="relative z-10">{age}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-white/80 ml-1">Gender</label>
                  <div className="flex bg-[#B9E0F2]/10 p-1.5 rounded-[24px] w-full border border-white/5 relative">
                    {['boy', 'girl'].map((g) => {
                      const isActive = profile.gender === g;
                      return (
                        <button
                          key={g}
                          onClick={() => updateProfile({ gender: g as any })}
                          className={`flex-1 py-3 text-[15px] font-bold capitalize rounded-[20px] transition-colors relative z-10 ${isActive ? 'text-[#0A0A0A]' : 'text-white/60 hover:text-white'}`}
                        >
                          {g}
                        </button>
                      );
                    })}
                    {/* Active Pill Background */}
                    {profile.gender && (
                      <motion.div
                        layoutId="gender-pill"
                        className="absolute top-1.5 bottom-1.5 w-[calc(50%-4px)] bg-white rounded-[20px] shadow-sm z-0"
                        initial={false}
                        animate={{ 
                          x: profile.gender === 'boy' ? 0 : '100%' 
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-[#FF7B54]' : 'w-1.5 bg-[#B9E0F2]/30'}`} />
                ))}
              </div>

              <button 
                onClick={nextStep}
                disabled={!profile.age || !profile.gender}
                className="w-full bg-[#FF7B54] text-white font-bold text-lg py-4 rounded-[24px] shadow-[0_8px_30px_rgba(255,123,84,0.3)] hover:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100 mt-auto"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 3: Location */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center w-full"
            >
              <div className="text-white/40 font-bold tracking-widest text-[11px] uppercase mb-4">Step 3 of 3</div>
              <h2 className="text-2xl font-black tracking-tight text-white mb-3 text-center">
                Where are you based?
              </h2>
              <p className="text-white/60 font-medium mb-10 text-[15px] text-center max-w-[280px]">
                We'll tailor schools and hospitals to your area.
              </p>
              
              <div className="w-full flex flex-col gap-2 mb-8">
                <label className="text-[13px] font-bold text-white/80 ml-1">Current City or Town</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF7B54]" />
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => updateProfile({ location: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                    className="w-full bg-[#1A1A1A] border border-[#FF7B54]/30 rounded-[20px] pl-12 pr-5 py-4 text-lg font-semibold text-white focus:outline-none focus:border-[#FF7B54] transition-all shadow-[0_4px_20px_rgba(255,123,84,0.1)]"
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="w-full aspect-square bg-[#1A1A1A] border border-white/10 rounded-[32px] mb-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
                <div className="w-16 h-16 bg-[#FF7B54]/20 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#FF7B54] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <span className="absolute bottom-4 text-white/30 text-xs font-bold uppercase tracking-widest">Map Asset Here</span>
              </div>

              <button 
                onClick={nextStep}
                className="w-full bg-[#FF7B54] text-white font-bold text-lg py-4 rounded-[24px] shadow-[0_8px_30px_rgba(255,123,84,0.3)] hover:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-auto"
              >
                Complete Setup
                <span className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]">✓</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
