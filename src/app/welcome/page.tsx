"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AuthSheet } from "@/components/auth/AuthSheet";
import { ArrowRight } from "lucide-react";
import { WelcomeShader } from "@/components/auth/WelcomeShader";

export default function WelcomePage() {
  const [authMode, setAuthMode] = useState<"email" | "magic-link">("email");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openSheet = (mode: "email" | "magic-link") => {
    setAuthMode(mode);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col w-full fixed inset-0 z-50 overflow-hidden bg-[#000000] selection:bg-white/10 font-sans">
      
      {/* Background WebGL Shader (Green Orbs) */}
      <WelcomeShader />

      {/* Top Header - Chrome Logo */}
      <header className="relative z-10 w-full flex justify-center pt-[12dvh]">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-[48px] font-extrabold uppercase tracking-[0.2em] relative"
          style={{
            // Premium Chrome/Metal 3D Text Effect
            background: "linear-gradient(to bottom, #ffffff 0%, #b3b3b3 40%, #4a4a4a 45%, #909090 55%, #e0e0e0 80%, #ffffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.8))",
          }}
        >
          DUO
          {/* Subtle reflection overlay */}
          <span 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
        </motion.h1>
      </header>

      {/* Main Content & Actions Area */}
      <main className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-end flex-grow pb-12 px-6">
        
        {/* Text Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-center mb-12 space-y-3 w-full"
        >
          <h2 className="text-[36px] md:text-[48px] font-bold text-[#e4e2e4] leading-tight tracking-[-0.02em]">
            Budgeting, together.
          </h2>
          <p className="text-[18px] text-[#cfc4c5] font-normal leading-relaxed max-w-[280px] mx-auto">
            The premium way to sync your finances with your partner.
          </p>
        </motion.div>

        {/* Vision Pro / Apple Glass Action Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="w-full bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[24px] p-6 flex flex-col gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
        >
          {/* Primary Button (Get Started) */}
          <button
            onClick={() => openSheet("magic-link")}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#5E5CE6] to-[#4c4ab3] text-white font-semibold text-[15px] hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(94,92,230,0.15)]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* Secondary Button (Sign In) */}
          <button
            onClick={() => openSheet("email")}
            className="w-full py-4 px-6 rounded-xl border-[0.5px] border-white/10 bg-white/5 text-[#e4e2e4] font-semibold text-[15px] hover:bg-white/10 transition-colors active:scale-[0.98]"
          >
            Sign In
          </button>
        </motion.div>
      </main>

      {/* The Auth Modal Sheet */}
      <AuthSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        mode={authMode} 
      />
    </div>
  );
}
