"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calculator, LayoutGrid, Wallet, ShoppingBag, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartifyStore } from "@/store/useCartifyStore";

export function Navigation() {
  const pathname = usePathname();
  const { isActive } = useCartifyStore();

  const isCartifyTripActive = pathname === '/cartify' && isActive;
  
  // Hide bottom nav on specific routes
  const hiddenPaths = ['/welcome', '/setup', '/profile'];
  const isHiddenRoute = isCartifyTripActive || 
                        pathname.startsWith('/childcare') || 
                        hiddenPaths.some(p => pathname.startsWith(p));

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Calc", href: "/calculator", icon: Calculator },
    { name: "Budget", href: "/budget", icon: LayoutGrid },
    { name: "Jar", href: "/jar", icon: Wallet },
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
          className="absolute bottom-6 left-4 right-4 z-50 will-change-transform"
        >
          {/* 2026 Apple Liquid Glass Design */}
          <div className="bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden relative">
            {/* Subtle inner highlight to make it feel like glass */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex flex-1 justify-around items-center gap-1">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                const Icon = tab.icon;

                return (
                  <Link
                    key={tab.name}
                    href={tab.href}
                    className="relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-[24px] transition-all group"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-white/[0.12] rounded-[24px] border border-white/[0.08] shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span
                        className={`text-[9px] font-semibold tracking-wide transition-colors duration-300 ${
                          isActive ? "text-white drop-shadow-sm" : "text-white/40 group-hover:text-white/70"
                        }`}
                      >
                        {tab.name}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {/* AI Corner (Soon) */}
              <button
                disabled
                className="relative flex flex-col items-center justify-center w-[52px] h-[52px] rounded-[24px] transition-all group opacity-60 cursor-not-allowed"
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Brain
                    className="w-5 h-5 text-amber-400/70"
                    strokeWidth={2}
                  />
                  <span className="text-[9px] font-semibold tracking-wide text-amber-400/70">
                    AI
                  </span>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
