"use client";

/**
 * DuoAIIcon — Static chromatic starburst icon.
 * 
 * Uses a pure SVG with a linear gradient fill and CSS mask.
 * No Framer Motion, no spring physics, no per-frame GPU work.
 * The "idle" state is just a beautiful static icon.
 * Hover/tap effects are handled via CSS transitions only.
 */

const pillPath = "M 0 -1.2 C 1.375 -1.2, 2.5 -0.66, 2.5 0 C 2.5 0.66, 1.375 1.2, 0 1.2 C -1.375 1.2, -2.5 0.66, -2.5 0 C -2.5 -0.66, -1.375 -1.2, 0 -1.2 Z";

export function DuoAIIcon({ className }: { className?: string }) {
  const angles = [0, 60, 120, 180, 240, 300];

  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="chromatic-metal-static" x1="-10" y1="-10" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="15%" stopColor="#7DD3FC" />
          <stop offset="30%" stopColor="#F472B6" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#FDE047" />
          <stop offset="85%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        <mask id="metal-mask-static">
          <g transform="translate(12, 12) scale(1.6)">
            {angles.map((angle, i) => (
              <g key={i} transform={`rotate(${angle}) translate(0, -7)`}>
                <path
                  d={pillPath}
                  fill="white"
                />
              </g>
            ))}
          </g>
        </mask>
      </defs>

      {/* The visible liquid metal surface — static, zero GPU cost */}
      <rect 
        x="-12" 
        y="-12" 
        width="48" 
        height="48" 
        fill="url(#chromatic-metal-static)" 
        mask="url(#metal-mask-static)" 
      />
    </svg>
  );
}
