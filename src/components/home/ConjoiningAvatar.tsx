"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

interface ConjoiningAvatarProps {
  onTap: () => void;
}

export function ConjoiningAvatar({ onTap }: ConjoiningAvatarProps) {
  const { user, partner } = useAuthStore();

  const isShared = !!partner;

  // Basic styling setup
  const baseAvatarStyle = "w-10 h-10 rounded-full flex items-center justify-center border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.3)] bg-gradient-to-b from-[#2A2A2C] to-[#1A1A1C]";

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onTap}
      className="relative flex items-center justify-center focus:outline-none"
    >
      {isShared ? (
        <div className="relative w-16 h-10 flex items-center justify-center">
          {/* Partner Avatar (Back/Left) */}
          <motion.div
            animate={{ 
              x: [-1, 1, -1],
              y: [-0.5, 0.5, -0.5]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute left-0 z-10 ${baseAvatarStyle} overflow-hidden`}
          >
             <div className="absolute inset-0 bg-white/5 opacity-50 mix-blend-overlay"></div>
             <span className="text-white/70 text-sm font-bold">{partner?.name?.[0]?.toUpperCase() || 'P'}</span>
          </motion.div>

          {/* User Avatar (Front/Right) */}
          <motion.div
            animate={{ 
              x: [1, -1, 1],
              y: [0.5, -0.5, 0.5]
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute right-0 z-20 ${baseAvatarStyle} border-l-[0.5px] border-l-black/40 overflow-hidden`}
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
             <span className="text-white font-bold text-sm drop-shadow-md">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </motion.div>

          {/* Connection Pulse Dot */}
          <motion.div
            animate={{ y: [-1.5, 1.5, -1.5], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-30 w-1.5 h-1.5 bg-[#30D158] rounded-full shadow-[0_0_8px_#30D158]"
          />
        </div>
      ) : (
        <div className={`${baseAvatarStyle} relative overflow-hidden group`}>
           <div className="absolute inset-0 bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors rounded-full" />
           <span className="text-white/90 text-sm font-bold relative z-10">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
           <div className="absolute inset-0 border border-white/10 rounded-full" />
        </div>
      )}
    </motion.button>
  );
}
