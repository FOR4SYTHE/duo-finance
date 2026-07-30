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
        <div className="relative w-[72px] h-[40px] flex items-center justify-center">
          {/* 
            Gooey bridge effect via CSS only — no SVG feGaussianBlur filter.
            A dark pill shape behind the overlapping avatars creates
            the "conjoined" look without any per-frame filter re-rasterization.
          */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="absolute w-[70px] h-[36px] rounded-full bg-[#183626] shadow-[0_0_8px_4px_rgba(24,54,38,0.6)]" />
          </div>

          {/* Foreground Sharp Avatars — static positioning, no infinite Framer Motion */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {/* Left Avatar (User) */}
            <div
              className="absolute left-0 w-[40px] h-[40px] rounded-full border-[2px] border-[#0A0A0C] overflow-hidden bg-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              {user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#2A2A2C] to-[#141416] flex items-center justify-center text-white text-[15px] font-bold select-none">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Right Avatar (Partner) */}
            <div
              className="absolute right-0 w-[40px] h-[40px] rounded-full border-[2px] border-[#0A0A0C] overflow-hidden bg-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              {partner?.avatar ? (
                <img src={partner.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-[#1C2C24] to-[#0A1A12] flex items-center justify-center text-emerald-400 text-[15px] font-bold select-none">
                  {partner?.name?.[0]?.toUpperCase() || "P"}
                </div>
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
