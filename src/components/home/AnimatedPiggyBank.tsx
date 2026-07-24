"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";

export function AnimatedPiggyBank() {
  const pigControls = useAnimation();
  const [coins, setCoins] = useState<{ id: number; tx: number; ty: number; delay: number; isCurtain?: boolean; startX?: number; endX?: number; state: string }[]>([]);

  // Get Spend Jar state
  const { config } = useBudgetStore();
  const { entries } = useSpendStore();
  
  // Ref to hold the latest percentage so the animation loop doesn't need to re-run on every state change
  const percentageRef = useRef(0);
  const totalSpentRef = useRef(0);

  useEffect(() => {
    const totalSpent = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const allowedSpend = config.targetAmount * ((config.jarAllowedPercentage || 20) / 100);
    const percentage = allowedSpend > 0 ? Math.min((totalSpent / allowedSpend) * 100, 100) : 0;
    percentageRef.current = percentage;
    totalSpentRef.current = totalSpent;
  }, [entries, config.targetAmount, config.jarAllowedPercentage]);

  // Determine current visual state
  const currentState = useMemo(() => {
    if (percentageRef.current >= 85) return "danger";
    if (percentageRef.current >= 50) return "warning";
    return "safe";
  }, [percentageRef.current]);

  const imageSrc = `/mascot/difu-${currentState}-1.webp`;

  useEffect(() => {
    let mounted = true;
    
    const runAnimations = async () => {
      // Wait for Framer Motion components to fully mount
      await new Promise(r => setTimeout(r, 250));

      while (mounted) {
        try {
          const state = percentageRef.current >= 85 ? "danger" : percentageRef.current >= 50 ? "warning" : "safe";

          // --- Idle Breathing based on state ---
          if (state === "safe") {
            await pigControls.start({ y: [0, -3, 0], transition: { duration: 4, ease: "easeInOut", repeat: 2 } });
          } else if (state === "warning") {
            await pigControls.start({ y: [0, -1.5, 0], transition: { duration: 2, ease: "easeInOut", repeat: 4 } });
          } else {
            // Danger: nervous shaking (subtle)
            await pigControls.start({ x: [-1, 1, -1, 1, 0], y: [0, -0.5, 0, -0.5, 0], transition: { duration: 0.5, repeat: 10 } });
          }

          if (!mounted) break;
          await new Promise(r => setTimeout(r, 1000));

          // --- "Pop" Animation (Shooting coins) ---
          if (!mounted) break;
          // Compress down
          await pigControls.start({ scaleY: 0.9, scaleX: 1.05, y: 10, transition: { duration: 0.4, ease: "easeInOut" } });
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 100));

          // Launch up
          if (!mounted) break;
          pigControls.start({ scaleY: 1.05, scaleX: 0.95, y: -15, transition: { duration: 0.15, ease: "easeOut" } });
          
          // Spawn coins based on spend zone
          if (mounted) {
            const perc = percentageRef.current;
            const spent = totalSpentRef.current;
            
            let numCoins = 0;
            let isCurtain = false;
            let coinState = "safe";

            if (spent === 0) {
              numCoins = 0;
            } else if (perc < 50) {
              numCoins = 3; 
              coinState = "safe";
            } else if (perc >= 50 && perc < 85) {
              numCoins = 8; 
              coinState = "warning";
            } else {
              numCoins = 30; // Red zone - Full curtain/rain
              isCurtain = true;
              coinState = "danger";
            }

            if (numCoins > 0) {
              const newCoins = Array.from({ length: numCoins }).map((_, i) => {
                if (isCurtain) {
                  // Curtain effect: falling from the top edge, spread across width
                  const sx = (Math.random() - 0.5) * 280;
                  return {
                    id: Date.now() + i,
                    tx: 0,
                    ty: 300, // fall distance
                    startX: sx, 
                    endX: sx + (Math.random() - 0.5) * 30,
                    delay: Math.random() * 0.4, 
                    isCurtain: true,
                    state: coinState
                  };
                } else {
                  // Standard fountain explosion
                  const angle = (Math.random() - 0.5) * Math.PI * 1.2;
                  const power = 100 + Math.random() * 150;
                  return {
                    id: Date.now() + i,
                    tx: Math.sin(angle) * power,
                    ty: -Math.cos(angle) * power,
                    delay: Math.random() * 0.15,
                    isCurtain: false,
                    state: coinState
                  };
                }
              });
              setCoins(prev => [...prev, ...newCoins]);
            }
          }
          
          // Recover bounce
          await new Promise(r => setTimeout(r, 150));
          if (!mounted) break;
          await pigControls.start({ scaleY: 1, scaleX: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 15 } });
          
          // Clean up coins after they fall
          setTimeout(() => {
            if (mounted) setCoins([]);
          }, 3000);

          await new Promise(r => setTimeout(r, 4000));
        } catch {
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 500));
        }
      }
    };

    runAnimations();
    return () => { mounted = false; };
  }, [pigControls]);

  return (
    <>
      {/* Dynamic Background Glow based on State */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-colors duration-1000">
        {currentState === "danger" && <div className="absolute inset-0 bg-[#FF453A] blur-3xl animate-pulse" />}
        {currentState === "warning" && <div className="absolute inset-0 bg-[#FF9F0A] blur-3xl" />}
      </div>

      {/* Dufi Mascot (Layered behind text: z-0) */}
      <div className="absolute -bottom-2 left-0 w-full h-[180px] pointer-events-none z-0 flex justify-center items-end overflow-visible">
        <motion.div
          animate={pigControls}
          style={{ originY: 1, originX: 0.5 }}
          className="relative w-full h-full max-w-[200px]"
        >
          <Image
            src={imageSrc}
            alt="Dufi Mascot"
            fill
            className="object-contain object-bottom drop-shadow-2xl"
            priority
          />
        </motion.div>
      </div>

      {/* Coin Fountain (Layered above text: z-50) */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-0 h-0 overflow-visible z-50 pointer-events-none">
        {coins.map((coin) => {
          // Dynamic coin styling based on danger state
          const coinStyles = 
            coin.state === "danger"
              ? { bg: "linear-gradient(135deg, #FF8A8A 0%, #FF453A 40%, #B31209 100%)", border: "#FFC2C2", shadow: "rgba(255, 0, 0, 0.5)", text: "#4A0400" }
              : coin.state === "warning"
                ? { bg: "linear-gradient(135deg, #FFE4B5 0%, #FF9F0A 40%, #D97706 100%)", border: "#FFE8C2", shadow: "rgba(255, 159, 10, 0.5)", text: "#663C00" }
                : { bg: "linear-gradient(135deg, #FFF7D6 0%, #FFD700 40%, #F5A623 100%)", border: "#FFE787", shadow: "rgba(200, 130, 0, 0.5)", text: "#A05A00" };

          return (
            <motion.div
              key={coin.id}
              initial={{ y: -110, x: 0, scale: 0.1, opacity: 1, rotate: 0 }}
              animate={
                coin.isCurtain
                  ? {
                      y: [-110, -350, 250],
                      x: [0, coin.startX || 0, coin.endX || 0],
                      scale: [0.1, 1.2, 0.9],
                      opacity: [1, 1, 1, 0],
                      rotate: [0, 360, 1080]
                    }
                  : {
                      y: [-110, coin.ty - 110, 250],
                      x: [0, coin.tx * 0.8, coin.tx * 1.5],
                      scale: [0.1, 1.2, 0.9],
                      opacity: [1, 1, 1, 0],
                      rotate: [0, 360, 1080]
                    }
              }
              transition={{
                duration: coin.isCurtain ? 2.5 : 1.8,
                times: coin.isCurtain ? [0, 0.25, 1] : [0, 0.3, 0.8, 1],
                ease: ["easeOut", "easeIn"],
                delay: coin.delay
              }}
              className="absolute w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
              style={{
                background: coinStyles.bg,
                border: `1.5px solid ${coinStyles.border}`,
                boxShadow: `inset 0 -3px 6px ${coinStyles.shadow}, inset 0 2px 4px rgba(255, 255, 255, 0.9), 0 6px 12px rgba(0,0,0,0.25)`
              }}
            >
              <span className="text-[13px] font-black leading-none drop-shadow-sm mt-[1px]" style={{ color: coinStyles.text }}>₱</span>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
