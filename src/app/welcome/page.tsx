"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { WelcomeShader } from "@/components/auth/WelcomeShader";
import { BorderBeam } from "border-beam";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function WelcomePage() {
  const router = useRouter();
  const { isAuthenticated, householdId, isInitializing } = useAuthStore();

  // If Google Auth Implicit Flow parses the URL hash in the background, 
  // automatically redirect them to their destination so they aren't stuck on the Welcome page.
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      if (householdId) {
        window.location.href = "/";
      } else {
        window.location.href = "/setup";
      }
    }
  }, [isAuthenticated, householdId, isInitializing]);

  return (
    <div className="flex flex-col w-full fixed inset-0 z-50 overflow-hidden bg-[#000000] selection:bg-white/10 font-sans">
      
      {/* Background WebGL Shader (Green Orbs) */}
      <WelcomeShader />

      {/* Top Header - Chrome Logo with Shine Animation */}
      <header className="relative z-10 w-full flex justify-center pt-[12dvh]">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
          }}
          transition={{ 
            opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
          }}
          className="text-[48px] font-extrabold uppercase tracking-[0.2em] relative"
          style={{
            // Premium Chrome/Metal 3D Text Effect with a sweeping shine
            background: "linear-gradient(110deg, #b3b3b3 0%, #ffffff 25%, #4a4a4a 50%, #ffffff 75%, #b3b3b3 100%)",
            backgroundSize: "200% auto",
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
      <main className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center justify-end flex-grow pb-[8dvh] px-6">
        
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
          <p className="text-[17px] text-[#cfc4c5] font-medium mb-[6dvh] max-w-[280px] leading-relaxed">
            Build better money habits with the person who matters most.
          </p>
        </motion.div>

        {/* Action Buttons (No outer container) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="w-full flex flex-col gap-4"
        >
          {/* Primary Button (Get Started) - Dark Glass with BorderBeam */}
          <BorderBeam 
            size="pulse-inner" 
            colorVariant="sunset" 
            style={{ "--beam-hue-base": "150deg" } as React.CSSProperties}
          >
            <button
              onClick={() => router.push("/signup")}
              className="w-full h-[56px] rounded-[18px] bg-[#1c1c1e]/60 backdrop-blur-xl text-[#e4e2e4] font-semibold text-[17px] hover:bg-[#2c2c2e]/80 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 border border-white/[0.08]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </BorderBeam>
          
          {/* Secondary Button (Sign In) - Clean Dark Glass */}
          <button
            onClick={() => router.push("/login")}
            className="w-full h-[56px] rounded-[18px] bg-[#1c1c1e]/40 backdrop-blur-xl text-[#cfc4c5] font-medium text-[16px] hover:bg-[#2c2c2e]/60 transition-colors active:scale-[0.98] border border-white/[0.05]"
          >
            Sign In
          </button>
        </motion.div>
      </main>
    </div>
  );
}
