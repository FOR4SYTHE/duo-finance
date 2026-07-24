"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EducationTab } from "./EducationTab";
import { HealthTab } from "./HealthTab";

export function ChildCareTabs() {
  const [activeTab, setActiveTab] = useState<"education" | "health">("education");

  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Tab Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab("education")}
          className={`flex-1 py-3.5 text-[13px] font-bold rounded-full transition-all ${
            activeTab === "education" 
              ? "bg-[#FF7B54] text-white shadow-[0_4px_16px_rgba(255,123,84,0.3)]" 
              : "bg-[#B9E0F2]/10 text-white/60 border border-white/5 hover:bg-[#B9E0F2]/20 hover:text-white"
          }`}
        >
          Education & Camp
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`flex-1 py-3.5 text-[13px] font-bold rounded-full transition-all ${
            activeTab === "health" 
              ? "bg-[#FF7B54] text-white shadow-[0_4px_16px_rgba(255,123,84,0.3)]" 
              : "bg-[#B9E0F2]/10 text-white/60 border border-white/5 hover:bg-[#B9E0F2]/20 hover:text-white"
          }`}
        >
          Health & Essentials
        </button>
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
