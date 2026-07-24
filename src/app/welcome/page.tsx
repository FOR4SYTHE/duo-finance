"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AuthSheet } from "@/components/auth/AuthSheet";
import { Apple, Mail, KeyRound } from "lucide-react";

export default function WelcomePage() {
  const [authMode, setAuthMode] = useState<"email" | "magic-link">("email");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openSheet = (mode: "email" | "magic-link") => {
    setAuthMode(mode);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-6 py-12 relative overflow-hidden bg-[#050505] selection:bg-white/10">
      
      {/* 
        Slow-Moving Dark Gradient Orb Background 
        (Thinking Orb / Premium AI Style)
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-[150vw] h-[150vw] sm:w-[800px] sm:h-[800px] opacity-40 mix-blend-screen blur-[80px]"
          style={{
            background: "conic-gradient(from 180deg at 50% 50%, #2a8af6 0deg, #a853ba 180deg, #e92a67 360deg)",
          }}
        />
        
        {/* Central Dark Void to make it a ring/orb effect */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-[80vw] h-[80vw] sm:w-[400px] sm:h-[400px] bg-[#050505] rounded-full blur-[40px]" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-center"
        >
          {/* Logo / Mark placeholder */}
          <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] mb-8 backdrop-blur-md">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white">
              <path d="M12 2L2 22H22L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight mb-4">
            Welcome
          </h1>
          <p className="text-lg text-white/50 font-medium tracking-wide">
            Your journey starts from here
          </p>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-4 relative z-10 mt-auto pb-8"
      >
        <button
          onClick={() => openSheet("magic-link")}
          className="w-full h-14 bg-white text-black rounded-2xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] active:scale-[0.98]"
        >
          <KeyRound className="w-5 h-5" /> Continue with Magic Link
        </button>

        <button
          className="w-full h-14 bg-[#1C1C1E] text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-[#2C2C2E] transition-all border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] active:scale-[0.98]"
        >
          <Apple className="w-5 h-5" /> Continue with Apple
        </button>

        <button
          onClick={() => openSheet("email")}
          className="w-full h-14 bg-transparent text-white/70 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-white/[0.04] transition-all active:scale-[0.98]"
        >
          <Mail className="w-5 h-5 text-white/40" /> Continue with Email
        </button>

        <p className="text-center text-[11px] text-white/30 font-medium mt-4 leading-relaxed">
          By pressing on "Continue with..." you agree <br />
          to our <a href="#" className="text-white/50 underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-white/50 underline underline-offset-2">Privacy Policy</a>
        </p>
      </motion.div>

      {/* The Auth Modal Sheet */}
      <AuthSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        mode={authMode} 
      />
    </div>
  );
}
