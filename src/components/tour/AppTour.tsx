"use client";

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Home,
  Calculator,
  Wallet,
  PiggyBank,
  ShoppingBag,
  Users,
  Shield,
  StickyNote,
} from "lucide-react";
import { DuoAIIcon } from "@/components/ui/DuoAIIcon";

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourSlide {
  icon: any;
  isCustomIcon?: boolean;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  features: string[];
}

const TOUR_SLIDES: TourSlide[] = [
  {
    icon: Users,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Built for Two",
    description:
      "One household. Two people. Everything syncs in real-time — budgets, spending, shopping trips, insurance, and notes. What one person logs, both see instantly.",
    features: [
      "Real-time sync across both accounts",
      "Every amount in PHP and ZAR, always",
      "Shared privacy with individual control",
    ],
  },
  {
    icon: StickyNote,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Stay Connected",
    description:
      "More than money. Leave your partner a note — a thought, a photo, a reminder — and they'll see it the moment they open the app. Nudge them when you're thinking of them.",
    features: [
      "Colored sticky notes with photo attachments",
      "Emoji reactions that sync instantly",
      "One-tap nudge sends a real-time ping",
    ],
  },
  {
    icon: Home,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Your Dashboard",
    description:
      "Your household's financial pulse — one screen. The hero card tells you exactly where you stand this month. Quick actions put every tool one tap away.",
    features: [
      "Monthly budget health at a glance",
      "Bills calendar with due-today alerts",
      "Daily financial wisdom & cashback radar",
    ],
  },
  {
    icon: Calculator,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Dual Currency Calculator",
    description:
      "Think in one currency, see both. Every calculation instantly shows the converted amount — no switching, no guessing. Then confirm it straight into your Spend Jar.",
    features: [
      "Live PHP ↔ ZAR on every keystroke",
      "Full calculator with all operations",
      "Confirm to instantly log the expense",
    ],
  },
  {
    icon: Wallet,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Shared Budget",
    description:
      "Set one household target that both of you track against. Break it into categories, pick a visual theme, and watch the budget bar shift from green to red as you spend.",
    features: [
      "Categories with percentage allocation",
      "Weekly or monthly period switching",
      "Smart tools & visual budget skins",
    ],
  },
  {
    icon: PiggyBank,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Spend Jar",
    description:
      "The heart of your daily tracking. Every peso or rand you spend gets logged here with a single tap. The jar's color tells you how you're doing — green means safe, red means slow down.",
    features: [
      "One-tap quick log with categories",
      "Green → Orange → Red budget warnings",
      "Swipe to delete, weekly & monthly views",
    ],
  },
  {
    icon: ShoppingBag,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Cartify",
    description:
      "Start a shopping trip before you leave. Add items as you shop, watch the running total in both currencies, and end the trip to save a complete record. Pause mid-shop and pick up later.",
    features: [
      "Live running total while you shop",
      "Pause, resume, and save trip history",
      "Schedule future trips with reminders",
    ],
  },
  {
    icon: Shield,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "Insurance Hub",
    description:
      "Track every active policy, log medical visits, and see exactly what's covered vs. what you're paying out-of-pocket. File claims, resolve them later, and Duo auto-deducts from your Spend Jar.",
    features: [
      "Policy management & benefits reader",
      "Medical log with claim tracking",
      "Auto-syncs out-of-pocket to Spend Jar",
    ],
  },
  {
    icon: null,
    isCustomIcon: true,
    iconColor: "#FFFFFF",
    iconBg: "linear-gradient(145deg, #2C2C2E 0%, #1C1C1E 100%)",
    title: "DUO AI",
    description:
      "Your personal financial brain — powered by Gemini with live Google Search grounding. Ask it anything about your budget, scan products with your camera, or explore plugins built to save you money.",
    features: [
      "Grounded AI chat with streaming answers",
      "Shopping scanner with price comparison",
      "Plugins: Receipt Vault, Dream Board, Relocation Hub, Exchange Alerts & Scratchpad",
    ],
  },
];

export function AppTour({ isOpen, onClose }: AppTourProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Ensure portal target exists
  if (typeof window !== "undefined" && !mounted) {
    setMounted(true);
  }

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOUR_SLIDES.length) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide]
  );

  const handleNext = useCallback(() => {
    if (currentSlide < TOUR_SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onClose();
      setTimeout(() => setCurrentSlide(0), 300);
    }
  }, [currentSlide, goToSlide, onClose]);

  const handlePrev = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold) {
        handleNext();
      } else if (info.offset.x > threshold) {
        handlePrev();
      }
    },
    [handleNext, handlePrev]
  );

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => setCurrentSlide(0), 300);
  }, [onClose]);

  const isLastSlide = currentSlide === TOUR_SLIDES.length - 1;
  const slide = TOUR_SLIDES[currentSlide];

  if (!mounted) return null;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
          style={{ touchAction: "none" }}
        >
          {/* Progress Indicator */}
          <div className="absolute top-[max(env(safe-area-inset-top),16px)] left-0 right-0 px-6 pt-4 z-20 flex items-center gap-1.5">
            {TOUR_SLIDES.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/[0.08]"
              >
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={false}
                  animate={{
                    width: i <= currentSlide ? "100%" : "0%",
                    opacity: i <= currentSlide ? 1 : 0.3,
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            ))}
          </div>

          {/* Skip Button */}
          {!isLastSlide && (
            <button
              onClick={handleClose}
              className="absolute top-[max(env(safe-area-inset-top),16px)] right-6 pt-10 z-20 text-white/40 text-[13px] font-medium tracking-wide hover:text-white/70 transition-colors"
            >
              Skip
            </button>
          )}

          {/* Slide Content */}
          <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 400, damping: 40 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 flex flex-col items-center justify-center px-8 cursor-grab active:cursor-grabbing select-none"
              >
                {/* Icon Container */}
                <div className="relative mb-10 sm:mb-14">
                  <div
                    className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-[28px] sm:rounded-[32px] flex items-center justify-center border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06)]"
                    style={{ background: slide.iconBg }}
                  >
                    {slide.isCustomIcon ? (
                      <DuoAIIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" forceState="star-idle" />
                    ) : (
                      (() => {
                        const Icon = slide.icon;
                        return (
                          <Icon
                            className="w-10 h-10 sm:w-12 sm:h-12"
                            style={{ color: slide.iconColor }}
                            strokeWidth={1.5}
                          />
                        );
                      })()
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-white/[0.03] rounded-full blur-xl" />
                </div>

                {/* Title */}
                <h2 className="text-white text-[26px] sm:text-[28px] font-semibold tracking-tight text-center mb-3 leading-tight">
                  {slide.title}
                </h2>

                {/* Description */}
                <p className="text-white/50 text-[14px] sm:text-[15px] font-medium text-center max-w-[320px] leading-relaxed mb-6 sm:mb-8">
                  {slide.description}
                </p>

                {/* Feature Bullets */}
                <div className="flex flex-col gap-2.5 w-full max-w-[300px]">
                  {slide.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-[5px] h-[5px] rounded-full bg-white/30 mt-[7px] shrink-0" />
                      <span className="text-white/70 text-[13px] sm:text-[14px] font-medium leading-snug">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom CTA */}
          <div className="w-full px-8 pb-[max(env(safe-area-inset-bottom),32px)] pt-4 z-20">
            <button
              onClick={handleNext}
              className="w-full py-[16px] rounded-full font-semibold text-[16px] transition-all active:scale-[0.97] flex items-center justify-center"
              style={{
                background: isLastSlide
                  ? "#FFFFFF"
                  : "rgba(255,255,255,0.08)",
                color: isLastSlide ? "#000000" : "#FFFFFF",
                border: isLastSlide
                  ? "none"
                  : "1px solid rgba(255,255,255,0.06)",
                boxShadow: isLastSlide
                  ? "0 4px 20px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.8)"
                  : "none",
              }}
            >
              {isLastSlide ? "Get Started" : "Continue"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
