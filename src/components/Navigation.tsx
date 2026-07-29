"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Home, Calculator, Wallet, PiggyBank, ShoppingBag, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartifyStore } from "@/store/useCartifyStore";
import { MetalFx } from "metal-fx";

export function Navigation() {
  const pathname = usePathname();
  const { isActive } = useCartifyStore();
  const navRef = useRef<HTMLDivElement>(null);

  const isCartifyTripActive = pathname === '/cartify' && isActive;
  
  // Hide bottom nav on specific routes
  const hiddenPaths = ['/welcome', '/login', '/signup', '/setup', '/profile', '/insurance'];
  const isHiddenRoute = isCartifyTripActive || 
                        pathname.startsWith('/childcare') || 
                        hiddenPaths.some(p => pathname.startsWith(p));

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Calc", href: "/calculator", icon: Calculator },
    { name: "Budget", href: "/budget", icon: Wallet },
    { name: "Jar", href: "/jar", icon: PiggyBank },
    { name: "Cartify", href: "/cartify", icon: ShoppingBag },
  ];

  const glassContainerStyles = "relative overflow-hidden rounded-[32px] bg-white/[0.01] backdrop-blur-[48px] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.5),0_16px_40px_rgba(0,0,0,0.8)]";
  const glassHighlightStyles = "absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-black/[0.3] pointer-events-none";

  return (
    <AnimatePresence>
      {!isHiddenRoute && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-6 left-4 right-4 z-50 will-change-transform flex items-center justify-center gap-3"
        >
          {/* Main Navigation Capsule */}
          <div ref={navRef} className={`flex-1 max-w-[340px] p-2 flex items-center justify-between ${glassContainerStyles}`}>
            {/* Specular Highlight Gloss */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.3] to-transparent" />
            <div className={glassHighlightStyles} />
            
            <div className="flex flex-1 justify-around items-center gap-1 relative z-10">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;

                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className="relative flex flex-col items-center justify-center w-[48px] h-[48px] rounded-[24px] transition-all group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-white/[0.12] rounded-[24px] border border-white/[0.1] shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-center">
                      <Icon
                        className={`w-6 h-6 transition-colors duration-300 ${
                          isActive ? "text-white drop-shadow-sm" : "text-white/40 group-hover:text-white/70"
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* AI Corner Pill (Separated) */}
          <MetalFx preset="chromatic" variant="circle" strength={0.85} reflectionTargets={[navRef]}>
            <button
              disabled
              className="w-[64px] h-[64px] flex-shrink-0 flex flex-col items-center justify-center group transition-all opacity-80 cursor-not-allowed hover:opacity-100 relative overflow-hidden rounded-[32px] bg-[#0a0a0a]"
            >
              <div className="relative z-10 flex items-center justify-center">
                <Brain
                  className="w-6 h-6 text-amber-300 transition-transform group-hover:scale-105"
                  strokeWidth={2}
                />
              </div>
            </button>
          </MetalFx>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
