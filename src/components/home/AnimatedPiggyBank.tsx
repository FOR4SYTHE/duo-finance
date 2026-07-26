"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import { useBudgetStore } from "@/store/useBudgetStore";
import { useSpendStore } from "@/store/useSpendStore";

export function AnimatedPiggyBank() {
  const [coins, setCoins] = useState<{ id: number; tx: number; ty: number; delay: number; duration: number; startX: number; startY: number; peakY: number; state: string; currency: string }[]>([]);

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
    
    const handleSpew = (e: Event) => {
      if (!mounted) return;
      
      const customEvent = e as CustomEvent<{ x: number, y: number }>;
      const originX = customEvent.detail?.x || 40; // Default near top-left ATM icon
      const originY = customEvent.detail?.y || 40;
      
      const state = percentageRef.current >= 85 ? "danger" : percentageRef.current >= 50 ? "warning" : "safe";
      const numCoins = 15;
      
      const newCoins = Array.from({ length: numCoins }).map((_, i) => {
        const isPHP = Math.random() > 0.5;
        
        // Smooth Radial Explosion Physics
        // Spread outward and upward (mostly from -30 to -150 degrees)
        const angle = (Math.random() * 120 + 210) * (Math.PI / 180); 
        // Random distance to travel before fading
        const distance = 80 + Math.random() * 120;
        
        return {
          id: Date.now() + i + Math.random(),
          startX: originX,
          startY: originY,
          tx: originX + Math.cos(angle) * distance,
          ty: originY + Math.sin(angle) * distance + 50, // Slight gravity effect by dropping end Y down
          delay: Math.random() * 0.15, 
          duration: 1.0 + Math.random() * 0.5,
          state: state,
          currency: isPHP ? '₱' : 'R'
        };
      });
      
      setCoins(prev => [...prev.slice(-30), ...newCoins]);
      
      // Cleanup
      setTimeout(() => {
        if (mounted) {
          setCoins(prev => prev.filter(c => !newCoins.find(n => n.id === c.id)));
        }
      }, 2500);
    };

    window.addEventListener('spew-coins', handleSpew);
    return () => { 
      mounted = false; 
      window.removeEventListener('spew-coins', handleSpew);
    };
  }, []);

  return (
    <>
      {/* Dynamic Background Glow based on State */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-colors duration-1000">
        {currentState === "danger" && <div className="absolute inset-0 bg-[#FF453A] blur-3xl animate-pulse" />}
        {currentState === "warning" && <div className="absolute inset-0 bg-[#FF9F0A] blur-3xl" />}
      </div>

      {/* Falling Coins (Layered below text: z-0) */}
      <div className="absolute inset-0 overflow-hidden z-[5] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          {coins.map((coin) => {
            const coinStyles = 
              coin.state === "danger"
                ? { bg: "linear-gradient(135deg, #FF8A8A 0%, #FF453A 40%, #B31209 100%)", border: "#FFC2C2", shadow: "rgba(255, 0, 0, 0.5)", text: "#4A0400" }
                : coin.state === "warning"
                  ? { bg: "linear-gradient(135deg, #FFE4B5 0%, #FF9F0A 40%, #D97706 100%)", border: "#FFE8C2", shadow: "rgba(255, 159, 10, 0.5)", text: "#663C00" }
                  : { bg: "linear-gradient(135deg, #FFF7D6 0%, #FFD700 40%, #F5A623 100%)", border: "#FFE787", shadow: "rgba(200, 130, 0, 0.5)", text: "#A05A00" };

            // Explode outward smoothly and fade
            return (
              <motion.div
                key={coin.id}
                initial={{ 
                  y: coin.startY, 
                  x: coin.startX, 
                  scale: 0.2, 
                  opacity: 0, 
                  rotate: 0 
                }}
                animate={{
                  y: coin.ty,
                  x: coin.tx,
                  scale: 1,
                  opacity: [0, 1, 1, 0],
                  rotate: Math.random() > 0.5 ? 360 : -360
                }}
                transition={{
                  duration: coin.duration,
                  ease: "easeOut",
                  delay: coin.delay
                }}
                className="absolute w-7 h-7 rounded-full flex items-center justify-center -ml-3.5 -mt-3.5 z-20 shadow-lg"
                style={{
                  background: coinStyles.bg,
                  border: `1.5px solid ${coinStyles.border}`,
                  boxShadow: `inset 0 -2px 4px ${coinStyles.shadow}, inset 0 1px 2px rgba(255, 255, 255, 0.9), 0 4px 8px rgba(0,0,0,0.3)`
                }}
              >
                <span className="text-[12px] font-black leading-none drop-shadow-sm mt-[1px]" style={{ color: coinStyles.text }}>{coin.currency}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
}
