"use client";

import { motion } from "framer-motion";
import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}

export function BorderBeam({
  className = "",
  size = 200,
  duration = 8,
  colorFrom = "#FF9F0A", // Match the amber color for due today
  colorTo = "transparent",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden ${className}`}
      style={{
        zIndex: 0,
      }}
    >
      <div 
        className="absolute inset-0 rounded-[inherit]"
        style={{
          border: `${borderWidth}px solid transparent`,
          mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "destination-out",
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration,
          }}
          className="absolute inset-[-100%]"
          style={{
            background: `conic-gradient(from 90deg at 50% 50%, ${colorTo} 0%, ${colorTo} 50%, ${colorFrom} 100%)`,
            width: "300%",
            height: "300%",
            top: "-100%",
            left: "-100%",
          }}
        />
      </div>
    </div>
  );
}
