"use client";

import { motion } from "framer-motion";

export function ActivityRingsChart({
  segments,
  size = 200,
  strokeWidth = 14,
  gap = 4,
}: {
  segments: { value: number; target: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
}) {
  // Sort descending by value to put the largest spend on the outer rings
  const sorted = [...segments].sort((a, b) => b.value - a.value).slice(0, 4);

  if (sorted.length === 0) {
    const radius = (size - strokeWidth) / 2;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.2)"
          fontSize="12"
          fontWeight="500"
          fontFamily="Inter, sans-serif"
          letterSpacing="0.05em"
        >
          NO DATA
        </text>
      </svg>
    );
  }

  const maxVal = Math.max(...sorted.map((s) => s.value), 1);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {sorted.map((seg, i) => {
          const radius = (size / 2) - (strokeWidth / 2) - (i * (strokeWidth + gap));
          const circumference = 2 * Math.PI * radius;
          
          // Dynamic Scaling: If spending completely blows past the budget (e.g. mock data), 
          // we scale the '100%' mark to be slightly larger than the highest spend. 
          // This ensures the rings act like a comparative chart and don't all just peg at 100%.
          const dynamicMax = maxVal * 1.15;
          const effectiveTarget = Math.max(seg.target, dynamicMax);
          const pct = seg.value / effectiveTarget;
          
          // Cap at 1 (100%) so the ring completes perfectly
          const drawPct = Math.min(pct, 1);
          
          return (
            <g key={seg.label}>
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                opacity={0.15}
              />
              
              {/* Foreground Fill Ring */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (drawPct * circumference) }}
                transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
              />

              {/* Apple Watch style Arrow at the tip */}
              {drawPct > 0 && (
                <motion.g
                  initial={{ rotate: 0 }}
                  animate={{ rotate: drawPct * 360 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
                  style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
                >
                  <path
                    d="M-3,-2.5 L0.5,1.5 L4,-2.5"
                    fill="none"
                    stroke="#111" // Dark premium inset arrow
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform={`translate(${size / 2 + radius}, ${size / 2 - 1})`}
                  />
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
