"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedPiggyBank() {
  const pigControls = useAnimation();
  const leftPupilControls = useAnimation();
  const rightPupilControls = useAnimation();
  const [coins, setCoins] = useState<{ id: number; tx: number; ty: number; delay: number }[]>([]);

  useEffect(() => {
    let mounted = true;
    
    const runAnimations = async () => {
      // Wait for Framer Motion components to fully mount before calling controls.start()
      await new Promise(r => setTimeout(r, 250));

      while (mounted) {
        try {
          // --- Standby: Look left and right ---
          await Promise.all([
            leftPupilControls.start({ x: -5, transition: { duration: 0.5, ease: "easeInOut" } }),
            rightPupilControls.start({ x: -5, transition: { duration: 0.5, ease: "easeInOut" } })
          ]);
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 2000));
          
          if (!mounted) break;
          await Promise.all([
            leftPupilControls.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } }),
            rightPupilControls.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } })
          ]);
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 1000));
          
          if (!mounted) break;
          await Promise.all([
            leftPupilControls.start({ x: 5, transition: { duration: 0.5, ease: "easeInOut" } }),
            rightPupilControls.start({ x: 5, transition: { duration: 0.5, ease: "easeInOut" } })
          ]);
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 3000));

          if (!mounted) break;
          await Promise.all([
            leftPupilControls.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } }),
            rightPupilControls.start({ x: 0, transition: { duration: 0.4, ease: "easeInOut" } })
          ]);
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 2500));

          // --- Sneeze Animation (Explosion of coins) ---
          if (!mounted) break;
          await pigControls.start({ scaleY: 0.85, scaleX: 1.08, y: 15, transition: { duration: 0.8, ease: "easeInOut" } });
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 200));

          // Sneeze launch
          if (!mounted) break;
          pigControls.start({ scaleY: 1.1, scaleX: 0.95, y: -10, transition: { duration: 0.15, ease: "easeOut" } });
          
          // Spawn a massive fountain of coins
          if (mounted) {
            const newCoins = Array.from({ length: 20 }).map((_, i) => {
              const angle = (Math.random() - 0.5) * Math.PI * 1.2;
              const power = 150 + Math.random() * 200;
              return {
                id: Date.now() + i,
                tx: Math.sin(angle) * power,
                ty: -Math.cos(angle) * power,
                delay: Math.random() * 0.15
              };
            });
            setCoins(prev => [...prev, ...newCoins]);
          }
          
          // Recover
          await new Promise(r => setTimeout(r, 150));
          if (!mounted) break;
          await pigControls.start({ scaleY: 1, scaleX: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 15 } });
          
          // Clean up coins after they fall
          setTimeout(() => {
            if (mounted) setCoins([]);
          }, 3000);

          await new Promise(r => setTimeout(r, 6000));
        } catch {
          // Silently swallow errors from controls.start() on unmounted components
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 500));
        }
      }
    };

    runAnimations();
    return () => { mounted = false; };
  }, [pigControls, leftPupilControls, rightPupilControls]);

  return (
    <>
      {/* Pig SVG (Layered behind text: z-0) */}
      <div className="absolute -bottom-6 left-0 w-full h-[160px] pointer-events-none z-0 flex justify-center items-end overflow-visible">
        <motion.svg
          viewBox="0 0 240 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full max-w-[220px]"
          animate={pigControls}
          style={{ originY: 1, originX: 0.5 }}
        >
          <defs>
            {/* Soft Blurs for that painted, airbrushed look */}
            <filter id="soft-blush" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            
            {/* Painted Gradients */}
            <radialGradient id="bodyGradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFD4DC" />
              <stop offset="70%" stopColor="#FFAEC0" />
              <stop offset="100%" stopColor="#F48BA2" />
            </radialGradient>
            
            <radialGradient id="earGradientLeft" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFD4DC" />
              <stop offset="100%" stopColor="#FFAEC0" />
            </radialGradient>
            
            <radialGradient id="earGradientRight" cx="60%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFD4DC" />
              <stop offset="100%" stopColor="#FFAEC0" />
            </radialGradient>
          </defs>

          {/* --- Ears --- */}
          {/* Left Ear Base */}
          <path d="M45 40 Q20 30 25 70 Q40 80 60 75 Z" fill="url(#earGradientLeft)" />
          {/* Left Ear Inner Shadow (Replaced filter with solid opacity path to avoid clipping artifact) */}
          <path d="M35 55 Q25 45 40 40" stroke="#E07A92" strokeWidth="6" strokeLinecap="round" opacity="0.6" fill="none" />
          
          {/* Right Ear Base */}
          <path d="M195 40 Q220 30 215 70 Q200 80 180 75 Z" fill="url(#earGradientRight)" />
          {/* Right Ear Inner Shadow */}
          <path d="M205 55 Q215 45 200 40" stroke="#E07A92" strokeWidth="6" strokeLinecap="round" opacity="0.6" fill="none" />

          {/* --- Main Body (Squashed Ellipse) --- */}
          <ellipse cx="120" cy="110" rx="90" ry="75" fill="url(#bodyGradient)" />
          
          {/* Highlight on top of head */}
          <path d="M70 45 Q120 30 170 45 Q120 55 70 45 Z" fill="#FFFFFF" opacity="0.25" />

          {/* --- Coin Slot (Moved lower to sit naturally in the head) --- */}
          <path d="M 95 46 Q 120 48 145 46 L 143 51 Q 120 53 97 51 Z" fill="#3A1C1D" />
          <path d="M 96 52 Q 120 54 144 52" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" fill="none" />

          {/* --- Cheeks (Large Soft Airbrushed Blush) --- */}
          <circle cx="65" cy="115" r="24" fill="#FF5E7E" opacity="0.55" filter="url(#soft-blush)" />
          <circle cx="175" cy="115" r="24" fill="#FF5E7E" opacity="0.55" filter="url(#soft-blush)" />

          {/* --- Snout --- */}
          <ellipse cx="120" cy="112" rx="26" ry="18" fill="#FF9AAB" />
          {/* Snout Top Highlight */}
          <ellipse cx="120" cy="102" rx="14" ry="4" fill="#FFFFFF" opacity="0.4" />
          {/* Nostrils */}
          <ellipse cx="112" cy="112" rx="4" ry="7" fill="#B35265" transform="rotate(-5 112 112)" />
          <ellipse cx="128" cy="112" rx="4" ry="7" fill="#B35265" transform="rotate(5 128 112)" />

          {/* --- Eyes (Cute Black Dots) --- */}
          <g>
            {/* Left Pupil */}
            <motion.g animate={leftPupilControls}>
              <circle cx="85" cy="95" r="7.5" fill="#291515" />
            </motion.g>

            {/* Right Pupil */}
            <motion.g animate={rightPupilControls}>
              <circle cx="155" cy="95" r="7.5" fill="#291515" />
            </motion.g>
          </g>

          {/* --- Little Cute Paws --- */}
          {/* Left Paw */}
          <path d="M40 160 Q30 135 55 135 Q75 135 70 160 Z" fill="#FFAEC0" />
          {/* Left Paw Crease */}
          <path d="M45 145 Q55 135 65 145" stroke="#E07A92" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
          
          {/* Right Paw */}
          <path d="M200 160 Q210 135 185 135 Q165 135 170 160 Z" fill="#FFAEC0" />
          {/* Right Paw Crease */}
          <path d="M195 145 Q185 135 175 145" stroke="#E07A92" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />

        </motion.svg>
      </div>

      {/* Coin Fountain (Layered above text: z-50) */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 overflow-visible z-50 pointer-events-none">
        {coins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ y: -110, x: 0, scale: 0.1, opacity: 1, rotate: 0 }}
            animate={{
              y: [-110, coin.ty - 110, 250], // Start at hole, shoot way up, fall past the bottom
              x: [0, coin.tx * 0.8, coin.tx * 1.5], // Explode outward widely
              scale: [0.1, 1.2, 0.9],
              opacity: [1, 1, 1, 0],
              rotate: [0, 360, 1080]
            }}
            transition={{
              duration: 1.8, // Slightly longer fall
              times: [0, 0.3, 0.8, 1], // Wait to fade until very end
              ease: ["easeOut", "easeIn"],
              delay: coin.delay
            }}
            className="absolute w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "linear-gradient(135deg, #FFF7D6 0%, #FFD700 40%, #F5A623 100%)",
              border: "1.5px solid #FFE787",
              boxShadow: "inset 0 -3px 6px rgba(200, 130, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.9), 0 6px 12px rgba(0,0,0,0.25)"
            }}
          >
            <span className="text-[#A05A00] text-[13px] font-black leading-none drop-shadow-sm mt-[1px]">₱</span>
          </motion.div>
        ))}
      </div>
    </>
  );
}
