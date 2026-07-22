"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calculator, PieChart, PiggyBank, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartifyStore } from "@/store/useCartifyStore";

export function Navigation() {
  const pathname = usePathname();
  const { isActive } = useCartifyStore();

  const isCartifyTripActive = pathname === '/cartify' && isActive;

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Calc", href: "/calculator", icon: Calculator },
    { name: "Budget", href: "/budget", icon: PieChart },
    { name: "Jar", href: "/jar", icon: PiggyBank },
    { name: "Cartify", href: "/cartify", icon: ShoppingCart },
  ];

  return (
    <AnimatePresence>
      {!isCartifyTripActive && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-6 left-6 right-6 z-50 will-change-transform"
        >
      <div className="bg-white/[0.05] backdrop-blur-lg border border-white/[0.05] rounded-[28px] p-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-[20px] transition-all group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-white/[0.12] rounded-[20px] border border-white/[0.05]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[9px] font-medium tracking-wide transition-colors ${
                    isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                  }`}
                >
                  {tab.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
