"use client";

import { useChildCareStore } from "@/store/useChildCareStore";
import { ChildProfileHeader } from "@/components/childcare/ChildProfileHeader";
import { ChildCareTabs } from "@/components/childcare/ChildCareTabs";
import { AIRefreshButton } from "@/components/childcare/AIRefreshButton";
import { motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

export function ChildCareDashboard() {
  const { isUpdatingAI, hasCompletedOnboarding, updateProfile } = useChildCareStore();

  const handleEditProfile = () => {
    // Restart the onboarding flow to edit data
    useChildCareStore.setState({ hasCompletedOnboarding: false });
  };

  return (
    <div className="relative z-10 w-full flex flex-col gap-6 pt-12">
      
      {/* Exit Button */}
      <Link 
        href="/"
        className="absolute top-0 right-0 w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors z-50"
      >
        <X className="w-5 h-5" />
      </Link>



      {/* Header (Context Engine) */}
      <ChildProfileHeader />

      {/* Content Tabs */}
      <ChildCareTabs />

      {/* AI Refresh Action */}
      <div className="mt-8 mb-6">
        <AIRefreshButton />
      </div>

      {/* AI Loading Overlay */}
      {isUpdatingAI && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 bg-[#1A1A1A] p-8 rounded-[32px] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-12 h-12 border-4 border-t-[#A855F7] border-r-[#3B82F6] border-b-[#EC4899] border-l-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-white">Gemini is scanning Malolos...</p>
              <p className="text-sm text-white/50 mt-1">Fetching 2026 tuition & rates</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
