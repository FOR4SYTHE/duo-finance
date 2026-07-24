"use client";

import { motion } from "framer-motion";
import { useChildCareStore } from "@/store/useChildCareStore";
import { ChildCareOnboarding } from "@/components/childcare/ChildCareOnboarding";
import { ChildCareDashboard } from "@/components/childcare/ChildCareDashboard";

export default function ChildCarePage() {
  const { hasCompletedOnboarding } = useChildCareStore();

  if (!hasCompletedOnboarding) {
    return <ChildCareOnboarding />;
  }

  return (
    <main className="w-full h-full flex flex-col p-5">
      {/* Background ambient gradient (softer for dashboard) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[30%] bg-[#A855F7] rounded-full mix-blend-screen filter blur-[120px] opacity-10" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#3B82F6] rounded-full mix-blend-screen filter blur-[100px] opacity-5" />
      </div>

      <ChildCareDashboard />
    </main>
  );
}
