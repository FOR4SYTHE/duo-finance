"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calculator, Wallet, PiggyBank, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartifyStore } from "@/store/useCartifyStore";
import { DuoAIIcon } from "@/components/ui/DuoAIIcon";
import { useRef } from "react";

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

  return (
    <AnimatePresence>
      {!isHiddenRoute && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-6 left-4 right-4 z-50 flex items-center justify-center gap-3"
        >
          {/* Main Navigation Capsule — solid dark glass, no backdrop-blur */}
          <div ref={navRef} className="flex-1 max-w-[340px] p-2 flex items-center justify-between relative overflow-hidden rounded-[32px] bg-[#0A0A0A]/95 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.5),0_16px_40px_rgba(0,0,0,0.8)]">
            {/* Specular Highlight Gloss */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.25] to-transparent" />
            {/* Inner gradient for glass depth — no blur needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/[0.2] pointer-events-none" />
            
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
                        className="absolute inset-0 bg-white/[0.12] rounded-[24px] border border-white/[0.1] shadow-[0_2px_10px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
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

          {/* AI Corner Pill — pure CSS chromatic gradient, no MetalFx WebGL */}
          <Link
            href="/ai"
            className="w-[64px] h-[64px] flex-shrink-0 flex flex-col items-center justify-center group transition-all relative overflow-hidden rounded-[32px] bg-[#0a0a0a] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(0,0,0,0.5),0_16px_40px_rgba(0,0,0,0.8)]"
          >
            {/* CSS chromatic sheen — replaces WebGL MetalFx shader */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'conic-gradient(from 180deg at 50% 50%, #aae8ff 0deg, #c5fe9e 60deg, #f7888d 120deg, #fffdc3 180deg, #007cff 240deg, #c084fc 300deg, #aae8ff 360deg)',
                }}
              />
              {/* Inner dark overlay for depth */}
              <div className="absolute inset-[1px] rounded-[31px] bg-[#0a0a0a]/85" />
            </div>
            {/* Top gloss line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent z-10" />
            <div className="relative z-10 flex items-center justify-center">
              <DuoAIIcon
                className={`w-6 h-6 transition-transform group-hover:scale-105 ${pathname === '/ai' ? 'text-amber-300' : 'text-amber-300/80'}`}
              />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
