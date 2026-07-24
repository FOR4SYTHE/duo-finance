"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChildCareStore } from "@/store/useChildCareStore";
import Link from "next/link";
import { X } from "lucide-react";

export function ChildCareOnboarding() {
  const { profile, updateProfile, completeOnboarding } = useChildCareStore();
  const [step, setStep] = useState(1);
  
  const ages = Array.from({ length: 18 }, (_, i) => i + 1); // 1 to 18

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else completeOnboarding();
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] w-full px-6 py-12 overflow-hidden">
      
      {/* Exit Button */}
      <Link 
        href="/"
        className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-colors z-50 shadow-lg"
      >
        <X className="w-5 h-5" />
      </Link>

      {/* Fluid Art Background (Siri/Wallet Style) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            borderRadius: ["40%", "50%", "30%", "50%", "40%"]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[120vw] h-[120vw] max-w-[600px] max-h-[600px] bg-gradient-to-tr from-[#A855F7]/30 via-[#EC4899]/20 to-[#3B82F6]/30 blur-[80px] opacity-70 mix-blend-screen"
        />
        <motion.div 
          animate={{
            scale: [1, 1.5, 1],
            rotate: [360, 180, 0],
            borderRadius: ["50%", "30%", "50%", "40%", "50%"]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[100vw] h-[100vw] max-w-[500px] max-h-[500px] bg-gradient-to-bl from-[#FCD34D]/20 via-[#F87171]/20 to-transparent blur-[60px] opacity-60 mix-blend-screen"
        />
      </div>

      {/* Glassmorphic Container */}
      <div className="relative z-10 w-full max-w-sm bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-[0_0_60px_rgba(0,0,0,0.5)]">
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-10">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-3xl font-black tracking-tight text-white mb-4 leading-tight">
                Set up the future<br />of your child.
              </h2>
              <p className="text-white/60 font-medium mb-12 text-sm">
                Financial planning and logistics,<br/>tailored beautifully for your family.
              </p>
              <button 
                onClick={nextStep}
                className="w-full bg-white text-black font-bold text-lg py-4 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-[0.98] transition-transform"
              >
                Let's Begin
              </button>
            </motion.div>
          )}

          {/* STEP 2: Nickname */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight text-white mb-8">
                What's their nickname?
              </h2>
              <input
                autoFocus
                type="text"
                placeholder="Optional"
                value={profile.nickname || ''}
                onChange={(e) => updateProfile({ nickname: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-bold text-white placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all mb-12"
              />
              <button 
                onClick={nextStep}
                className="w-full bg-white text-black font-bold text-lg py-4 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-[0.98] transition-transform"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 3: Age & Gender */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center text-center w-full"
            >
              <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
                Age & Gender
              </h2>
              
              {/* Gender Toggle */}
              <div className="flex bg-white/5 p-1 rounded-2xl w-full mb-8 border border-white/5">
                {['boy', 'girl', 'other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => updateProfile({ gender: g as any })}
                    className={`flex-1 py-3 text-sm font-bold capitalize rounded-xl transition-all ${profile.gender === g ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Age Scroll */}
              <div className="w-full relative mb-12">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#111] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#111] to-transparent z-10 pointer-events-none" />
                
                <div className="flex overflow-x-auto gap-4 py-2 px-8 -mx-8 hide-scrollbar snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {ages.map((age) => (
                    <button
                      key={age}
                      onClick={() => updateProfile({ age })}
                      className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all snap-center
                        ${profile.age === age ? 'bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.3)] scale-110' : 'bg-white/10 text-white/50 border border-white/5 hover:bg-white/15'}`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={nextStep}
                disabled={!profile.age || !profile.gender}
                className="w-full bg-white text-black font-bold text-lg py-4 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-[0.98] transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* STEP 4: Location */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight text-white mb-4">
                Where are you based?
              </h2>
              <p className="text-white/60 font-medium mb-8 text-sm">
                We'll tailor schools, hospitals, and activities to your specific area.
              </p>
              
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => updateProfile({ location: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl font-bold text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all mb-12"
              />
              <button 
                onClick={nextStep}
                className="w-full bg-white text-black font-bold text-lg py-4 rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:scale-[0.98] transition-transform"
              >
                Finish Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
