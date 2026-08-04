"use client";

import { motion } from "framer-motion";
import { useChildCareStore } from "@/store/useChildCareStore";
import { useEffect } from "react";
import { ChildCareOnboarding } from "@/components/childcare/ChildCareOnboarding";
import { ChildCareDashboard } from "@/components/childcare/ChildCareDashboard";

export default function ChildCarePage() {
  const { hasCompletedOnboarding, loadHouseholdChildCare } = useChildCareStore();

  useEffect(() => {
    loadHouseholdChildCare();
  }, [loadHouseholdChildCare]);

  if (!hasCompletedOnboarding) {
    return <ChildCareOnboarding />;
  }

  return (
    <main className="w-full h-full flex flex-col p-5">
      {/* Background ambient gradient (softer for dashboard) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#A855F7]/10 to-transparent" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3B82F6]/5 to-transparent" />
      </div>

      <ChildCareDashboard />
    </main>
  );
}
