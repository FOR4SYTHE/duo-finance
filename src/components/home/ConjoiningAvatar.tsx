"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

interface ConjoiningAvatarProps {
  onTap: () => void;
}

export function ConjoiningAvatar({ onTap }: ConjoiningAvatarProps) {
  const { user, partner } = useAuthStore();
  const isShared = !!partner;

  // Animation values for subtle floating
  const duration = 4;
  const bounceLeft = { x: [-1.5, 1.5, -1.5], y: [0, 0.5, 0] };
  const bounceRight = { x: [1.5, -1.5, 1.5], y: [0, -0.5, 0] };
  const transitionL = { duration, repeat: Infinity, ease: "easeInOut" };
  const transitionR = { duration, repeat: Infinity, ease: "easeInOut", delay: 0.1 };

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onTap}
      className="relative flex items-center justify-center focus:outline-none touch-none"
    >
      {isShared ? (
        <div className="relative w-[72px] h-[40px] flex items-center justify-center">
          {/* SVG Filter for subtle Gooey Effect */}
          <svg width="0" height="0" className="absolute hidden">
            <filter id="home-gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            </filter>
          </svg>

          {/* Background Gooey Layer (The Bridge) */}
          <div className="absolute inset-0 flex items-center justify-center z-0" style={{ filter: 'url(#home-gooey)' }}>
            <motion.div
              animate={bounceLeft}
              transition={transitionL}
              className="absolute w-[44px] h-[44px] rounded-full bg-[#183626] left-[-2px]"
            />
            <motion.div
              animate={bounceRight}
              transition={transitionR}
              className="absolute w-[44px] h-[44px] rounded-full bg-[#183626] right-[-2px]"
            />
          </div>

          {/* Foreground Sharp Avatars */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {/* Left Avatar (User) */}
            <motion.div
              animate={bounceLeft}
              transition={transitionL}
              className="absolute left-0 w-[40px] h-[40px] rounded-full border-[2px] border-[#0A0A0C] overflow-hidden bg-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              <img src={"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"} className="w-full h-full object-cover" />
            </motion.div>

            {/* Right Avatar (Partner) */}
            <motion.div
              animate={bounceRight}
              transition={transitionR}
              className="absolute right-0 w-[40px] h-[40px] rounded-full border-[2px] border-[#0A0A0C] overflow-hidden bg-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b from-[#2A2A2C] to-[#1A1A1C] relative overflow-hidden group">
           <div className="absolute inset-0 bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors rounded-full" />
           <span className="text-white/90 text-[15px] font-bold relative z-10">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
           <div className="absolute inset-0 border border-white/10 rounded-full" />
        </div>
      )}
    </motion.button>
  );
}
