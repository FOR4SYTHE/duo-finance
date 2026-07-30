"use client";

import React from "react";

/**
 * BorderBeam — animated border glow via CSS @keyframes.
 * 
 * Uses a CSS rotation animation on the compositor thread instead
 * of Framer Motion (which runs on the main JS thread).
 * The element is properly sized (no 300% oversized div).
 */

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
  duration = 8,
  colorFrom = "#FF9F0A",
  colorTo = "transparent",
  borderWidth = 1.5,
}: BorderBeamProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
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
        {/* CSS keyframe rotation — runs on compositor thread, not main JS thread */}
        <div
          className="absolute inset-[-50%]"
          style={{
            background: `conic-gradient(from 90deg at 50% 50%, ${colorTo} 0%, ${colorTo} 50%, ${colorFrom} 100%)`,
            width: "200%",
            height: "200%",
            top: "-50%",
            left: "-50%",
            animation: `border-beam-rotate ${duration}s linear infinite`,
            willChange: "transform",
          }}
        />
      </div>

      {/* Inject the CSS keyframe once — no Framer Motion needed */}
      <style jsx>{`
        @keyframes border-beam-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
