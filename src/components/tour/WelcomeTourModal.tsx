"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AppTour } from "./AppTour";

interface WelcomeTourModalProps {
  /** If true, always shows regardless of localStorage (for dev testing) */
  forceShow?: boolean;
  onDismiss?: () => void;
}

export function WelcomeTourModal({ forceShow = false, onDismiss }: WelcomeTourModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (forceShow) {
      setShowWelcome(true);
      return;
    }
    // Only show once per user
    const seen = localStorage.getItem("duo-tour-seen");
    if (!seen) {
      setShowWelcome(true);
    }
  }, [forceShow]);

  const handleSkip = () => {
    localStorage.setItem("duo-tour-seen", "true");
    setShowWelcome(false);
    onDismiss?.();
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const handleTourClose = () => {
    localStorage.setItem("duo-tour-seen", "true");
    setShowTour(false);
    onDismiss?.();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Welcome Gate Modal */}
      {createPortal(
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.92)" }}
            >
              <div className="w-full max-w-[340px] px-6 flex flex-col items-center">
                {/* DUO Chrome Logo */}
                <motion.h1
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[56px] font-extrabold uppercase tracking-[0.2em] mb-4"
                  style={{
                    background:
                      "linear-gradient(110deg, #b3b3b3 0%, #ffffff 25%, #4a4a4a 50%, #ffffff 75%, #b3b3b3 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.8))",
                  }}
                >
                  DUO
                </motion.h1>

                {/* Welcome Text */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-white text-[22px] font-semibold tracking-tight mb-2">
                    Welcome to Duo
                  </h2>
                  <p className="text-white/40 text-[15px] font-medium leading-relaxed max-w-[260px] mx-auto">
                    Budgeting together, made simple. Take a quick look around?
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="w-full flex flex-col gap-3"
                >
                  {/* Primary — Take a Tour */}
                  <button
                    onClick={handleStartTour}
                    className="w-full py-[16px] rounded-full bg-white text-black font-semibold text-[16px] transition-all active:scale-[0.97] shadow-[0_4px_20px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]"
                  >
                    Take a Quick Tour
                  </button>

                  {/* Secondary — Skip */}
                  <button
                    onClick={handleSkip}
                    className="w-full py-[16px] rounded-full bg-white/[0.06] text-white/60 font-medium text-[15px] border border-white/[0.06] transition-all active:scale-[0.97] hover:bg-white/[0.1] hover:text-white/80"
                  >
                    Skip, I'll explore
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Tour Carousel */}
      <AppTour isOpen={showTour} onClose={handleTourClose} />
    </>
  );
}
