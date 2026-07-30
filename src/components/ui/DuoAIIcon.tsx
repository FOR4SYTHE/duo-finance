"use client";

import { motion, Variants } from "framer-motion";

const pillPath = "M 0 -1.2 C 1.375 -1.2, 2.5 -0.66, 2.5 0 C 2.5 0.66, 1.375 1.2, 0 1.2 C -1.375 1.2, -2.5 0.66, -2.5 0 C -2.5 -0.66, -1.375 -1.2, 0 -1.2 Z";
const starPath = "M 0 -2.5 C 0 -0.5, 0.5 0, 2.5 0 C 0.5 0, 0 0.5, 0 2.5 C 0 0.5, -0.5 0, -2.5 0 C -0.5 0, 0 -0.5, 0 -2.5 Z";

const spinUpVariants: Variants = {
  idle: {
    rotate: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  },
  hover: {
    rotate: 90,
    transition: { type: "tween", ease: "easeOut", duration: 0.6 }
  },
  pressed: {
    rotate: 180,
    scale: 0.9,
    transition: { type: "spring", stiffness: 200, damping: 20 }
  },
  "star-idle": {
    rotate: 0,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  }
};

const ambientVariants: Variants = {
  idle: {
    rotate: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
  hover: {
    rotate: 360,
    transition: {
      rotate: {
        repeat: Infinity,
        ease: "linear",
        duration: 24
      }
    }
  },
  pressed: {
    rotate: 360,
    transition: {
      rotate: {
        repeat: Infinity,
        ease: "linear",
        duration: 24
      }
    }
  },
  "star-idle": {
    rotate: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

const pathVariants: Variants = {
  idle: {
    d: pillPath,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  },
  hover: {
    d: starPath,
    transition: { type: "spring", stiffness: 80, damping: 20 }
  },
  pressed: {
    d: starPath,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  },
  "star-idle": {
    d: starPath,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  }
};

import { useId } from "react";

// (Keep existing code above) ...

export function DuoAIIcon({ className, forceState }: { className?: string, forceState?: "idle" | "hover" | "pressed" | "star-idle" }) {
  const angles = [0, 60, 120, 180, 240, 300];
  const uniqueId = useId();
  const gradientId = `chromatic-metal-${uniqueId}`;
  const maskId = `metal-mask-${uniqueId}`;

  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="idle"
      animate={forceState || "idle"}
      whileHover={!forceState ? "hover" : undefined}
      whileTap={!forceState ? "pressed" : undefined}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradientId} x1="-10" y1="-10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="15%" stopColor="#7DD3FC" />
          <stop offset="30%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FDE047" />
          <stop offset="85%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        <mask id={maskId}>
          <g transform="translate(12, 12) scale(1.6)">
            <motion.g variants={spinUpVariants}>
              <motion.g variants={ambientVariants}>
                {angles.map((angle, i) => (
                  <g key={i} transform={`rotate(${angle}) translate(0, -7)`}>
                    <motion.path
                      variants={pathVariants}
                      fill="white"
                    />
                  </g>
                ))}
              </motion.g>
            </motion.g>
          </g>
        </mask>
      </defs>

      {/* The visible liquid metal surface */}
      <rect
        x="-12"
        y="-12"
        width="48"
        height="48"
        fill={`url(#${gradientId})`}
        mask={`url(#${maskId})`}
      />
    </motion.svg>
  );
}
