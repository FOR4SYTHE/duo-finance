"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EducationTab } from "./EducationTab";
import { HealthTab } from "./HealthTab";

export function ChildCareTabs() {
  const [activeTab, setActiveTab] = useState<"education" | "health">("education");

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Selector */}
      <div className="bg-[#1A1A1A] p-1 rounded-2xl flex relative border border-white/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)]">
        <button
          onClick={() => setActiveTab("education")}
          className={`flex-1 py-2.5 text-sm font-semibold z-10 transition-colors ${activeTab === "education" ? "text-white" : "text-white/50"}`}
        >
          Education & Camp
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`flex-1 py-2.5 text-sm font-semibold z-10 transition-colors ${activeTab === "health" ? "text-white" : "text-white/50"}`}
        >
          Health & Essentials
        </button>

        {/* Animated Background Pill */}
        <motion.div
          layoutId="childcare-active-tab"
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-xl border border-white/10 shadow-sm"
          initial={false}
          animate={{ x: activeTab === "education" ? 0 : "100%" }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        />
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === "education" ? (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EducationTab />
            </motion.div>
          ) : (
            <motion.div
              key="health"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <HealthTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
