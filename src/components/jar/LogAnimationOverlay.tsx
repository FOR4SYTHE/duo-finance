"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LogAnimationOverlayProps {
  type: 'happy' | 'worried' | 'scared' | null;
  onComplete: () => void;
}

export function LogAnimationOverlay({ type, onComplete }: LogAnimationOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      // Trigger haptic feedback if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          if (type === 'happy') navigator.vibrate([50, 50, 50]);
          if (type === 'worried') navigator.vibrate([100, 100, 100]);
          if (type === 'scared') navigator.vibrate([200, 100, 200, 100, 200]);
      }

      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Allow exit animation to finish
      }, 1200); // Glow duration
      return () => clearTimeout(timer);
    }
  }, [type, onComplete]);

  // Determine glow color based on animation type
  let glowColor = "rgba(48,209,88,0.3)"; // Green default (safe)
  let coreColor = "rgba(48,209,88,0.1)"; 
  
  if (type === 'worried') {
    glowColor = "rgba(232,163,61,0.3)"; // Amber
    coreColor = "rgba(232,163,61,0.1)";
  } else if (type === 'scared') {
    glowColor = "rgba(255,69,58,0.4)"; // Red
    coreColor = "rgba(255,69,58,0.15)";
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle, transparent 50%, ${coreColor} 75%, ${glowColor} 100%)`,
            boxShadow: `inset 0 0 100px ${glowColor}, inset 0 0 40px ${glowColor}`
          }}
        />
      )}
    </AnimatePresence>
  );
}
