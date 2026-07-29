"use client";

import { motion } from "framer-motion";

const pillPath = "M 0 -1.2 C 1.375 -1.2, 2.5 -0.66, 2.5 0 C 2.5 0.66, 1.375 1.2, 0 1.2 C -1.375 1.2, -2.5 0.66, -2.5 0 C -2.5 -0.66, -1.375 -1.2, 0 -1.2 Z";
const starPath = "M 0 -2.5 C 0 -0.5, 0.5 0, 2.5 0 C 0.5 0, 0 0.5, 0 2.5 C 0 0.5, -0.5 0, -2.5 0 C -0.5 0, 0 -0.5, 0 -2.5 Z";

const spinUpVariants = {
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
  }
};

const ambientVariants = {
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
  }
};

const pathVariants = {
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
  }
};

export function DuoAIIcon({ className }: { className?: string }) {
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <motion.svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      initial="idle"
      whileHover="hover"
      whileTap="pressed"
      style={{ overflow: "visible" }}
    >
      <g transform="translate(12, 12) scale(1.6)">
        <motion.g variants={spinUpVariants}>
          <motion.g variants={ambientVariants}>
            {angles.map((angle, i) => (
              <g key={i} transform={`rotate(${angle}) translate(0, -7)`}>
                <motion.path
                  variants={pathVariants}
                  fill="currentColor"
                />
              </g>
            ))}
          </motion.g>
        </motion.g>
      </g>
    </motion.svg>
  );
}
