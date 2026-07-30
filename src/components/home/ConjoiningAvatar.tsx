"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

interface ConjoiningAvatarProps {
  onTap: () => void;
}

export function ConjoiningAvatar({ onTap }: ConjoiningAvatarProps) {
  const { user, partner } = useAuthStore();
  const isShared = !!partner;

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onTap}
      className="relative flex items-center justify-center focus:outline-none touch-none"
    >
      {isShared ? (
        <div className="relative w-[76px] h-[44px] flex items-center justify-center">
          <svg width="0" height="0" className="absolute hidden">
            <filter id="gooey-effect-avatar">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            </filter>
          </svg>

          {/* Background Gooey Layer */}
          <div className="absolute inset-0 flex items-center justify-center z-0" style={{ filter: 'url(#gooey-effect-avatar)' }}>
            <div className="absolute left-[-2px] top-[-2px] w-[48px] h-[48px] rounded-full bg-[#068562]" />
            <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full bg-[#068562]" />
            <div className="absolute w-[36px] h-[24px] bg-[#013F4A] top-1/2 -translate-y-1/2" />
          </div>

          {/* Foreground Sharp Avatars */}
          <div className="absolute inset-0 z-10">
            {/* Left Avatar (User) - BIGGER */}
            <div
              className="absolute left-0 top-0 w-[44px] h-[44px] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden bg-[#1c1c1e] flex items-center justify-center"
            >
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white/60 font-medium text-lg">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Right Avatar (Partner) - SMALLER */}
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[28px] h-[28px] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden bg-[#1c2c24] flex items-center justify-center"
            >
              {partner?.avatar ? (
                <img src={partner.avatar} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#30D158] font-bold text-xs">
                  {partner?.name?.[0]?.toUpperCase() || "P"}
                </span>
              )}
            </div>
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
