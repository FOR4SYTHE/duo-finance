"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";

export function AnimatedPiggyBank() {
  const [coins, setCoins] = useState<{ id: number; tx: number; ty: number; delay: number; duration: number; startX: number; state: string; currency: string }[]>([]);

  // Get Spend Jar state
  const { config } = useBudgetStore();
  const { entries } = useSpendStore();
  
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

  useEffect(() => {
    let mounted = true;
    
    const runAnimations = async () => {
      // Wait for Framer Motion components to fully mount
      await new Promise(r => setTimeout(r, 250));

      while (mounted) {
        try {
          const state = percentageRef.current >= 85 ? "danger" : percentageRef.current >= 50 ? "warning" : "safe";
          const spent = totalSpentRef.current;
          
          if (spent > 0) {
            let numCoins = 0;
            let intervalTime = 3000;
            
            if (state === "safe") {
              numCoins = 1;
              intervalTime = 3500;
            } else if (state === "warning") {
              numCoins = 3;
              intervalTime = 2500;
            } else {
              numCoins = 8; // Raining harder if danger
              intervalTime = 1500;
            }
            
            if (mounted) {
              const newCoins = Array.from({ length: numCoins }).map((_, i) => {
                const startX = (Math.random() - 0.5) * 160; // Spread across width (card is small)
                const isPHP = Math.random() > 0.5;
                return {
                  id: Date.now() + i + Math.random(),
                  tx: startX + (Math.random() - 0.5) * 40,
                  ty: 200, // fall all the way down
                  startX: startX, 
                  delay: Math.random() * 0.8, 
                  duration: 2.5 + Math.random() * 2,
                  state: state,
                  currency: isPHP ? '₱' : 'R'
                };
              });
              
              setCoins(prev => [...prev.slice(-20), ...newCoins]); // Keep a max to avoid lag
              
              // Clean up old coins smoothly
              setTimeout(() => {
                if (mounted) {
                  setCoins(prev => prev.filter(c => !newCoins.find(n => n.id === c.id)));
                }
              }, 6000);
            }
            
            await new Promise(r => setTimeout(r, intervalTime));
          } else {
             await new Promise(r => setTimeout(r, 1000));
          }
        } catch {
          if (!mounted) break;
          await new Promise(r => setTimeout(r, 500));
        }
      }
    };

    runAnimations();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      {/* Dynamic Background Glow based on State */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-colors duration-1000">
        {currentState === "danger" && <div className="absolute inset-0 bg-[#FF453A] blur-3xl animate-pulse" />}
        {currentState === "warning" && <div className="absolute inset-0 bg-[#FF9F0A] blur-3xl" />}
      </div>

      {/* Falling Coins (Layered below text: z-0) */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          {coins.map((coin) => {
            const coinStyles = 
              coin.state === "danger"
                ? { bg: "linear-gradient(135deg, #FF8A8A 0%, #FF453A 40%, #B31209 100%)", border: "#FFC2C2", shadow: "rgba(255, 0, 0, 0.5)", text: "#4A0400" }
                : coin.state === "warning"
                  ? { bg: "linear-gradient(135deg, #FFE4B5 0%, #FF9F0A 40%, #D97706 100%)", border: "#FFE8C2", shadow: "rgba(255, 159, 10, 0.5)", text: "#663C00" }
                  : { bg: "linear-gradient(135deg, #FFF7D6 0%, #FFD700 40%, #F5A623 100%)", border: "#FFE787", shadow: "rgba(200, 130, 0, 0.5)", text: "#A05A00" };

            return (
              <motion.div
                key={coin.id}
                initial={{ y: -50, x: coin.startX, scale: 0.6, opacity: 0, rotate: 0 }}
                animate={{
                  y: coin.ty,
                  x: coin.tx,
                  opacity: [0, 1, 1, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: coin.duration,
                  ease: "linear",
                  delay: coin.delay
                }}
                className="absolute top-0 left-1/2 w-8 h-8 rounded-full flex items-center justify-center -translate-x-1/2"
                style={{
                  background: coinStyles.bg,
                  border: `1.5px solid ${coinStyles.border}`,
                  boxShadow: `inset 0 -2px 4px ${coinStyles.shadow}, inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 4px 8px rgba(0,0,0,0.15)`
                }}
              >
                <span className="text-[14px] font-black leading-none drop-shadow-sm mt-[1px]" style={{ color: coinStyles.text }}>{coin.currency}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
