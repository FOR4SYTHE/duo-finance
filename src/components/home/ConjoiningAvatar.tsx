"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

interface ConjoiningAvatarProps {
  onTap: () => void;
}

export function ConjoiningAvatar({ onTap }: ConjoiningAvatarProps) {
  const { user, partner } = useAuthStore();
  const isShared = !!partner;

  // Animation values for extremely subtle breathing/floating
  const duration = 10;
  const bounceLeft = { x: [-0.3, 0.3, -0.3], y: [0, 0.2, 0] };
  const bounceRight = { x: [0.3, -0.3, 0.3], y: [0, -0.2, 0] };
  const transitionL: any = { duration, repeat: Infinity, ease: "easeInOut" };
  const transitionR: any = { duration, repeat: Infinity, ease: "easeInOut", delay: 0.1 };

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
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#2A2A2C] to-[#141416] flex items-center justify-center text-white text-[15px] font-bold select-none">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </motion.div>

            {/* Right Avatar (Partner) */}
            <motion.div
              animate={bounceRight}
              transition={transitionR}
              className="absolute right-0 w-[40px] h-[40px] rounded-full border-[2px] border-[#0A0A0C] overflow-hidden bg-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              {partner?.avatar ? (
                <img src={partner.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#1C2C24] to-[#0A1A12] flex items-center justify-center text-emerald-400 text-[15px] font-bold select-none">
                  {partner?.name?.[0]?.toUpperCase() || "P"}
                </div>
              )}
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
