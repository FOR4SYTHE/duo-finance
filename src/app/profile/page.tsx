"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Copy, LogOut, ChevronLeft, Users, Shield, Link2, Bell, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, householdId, logout } = useAuthStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      router.push("/welcome");
    }
  }, [user, router]);

  // If not logged in, render nothing while redirecting
  if (!user) {
    return null;
  }

  // Derive a short invite code from the householdId (mock)
  const inviteCode = householdId ? householdId.replace("household-", "").toUpperCase().slice(0, 6) : "NONE";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push("/welcome");
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-4 pt-12 pb-32 relative bg-[#050505] overflow-y-auto no-scrollbar">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <Link href="/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-xl font-semibold text-white tracking-tight">Settings</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex flex-col gap-6 w-full max-w-sm mx-auto">
        
        {/* Profile Card */}
        <div className="bg-[#1C1C1E] rounded-[28px] p-5 flex items-center gap-4 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#BF5AF2] flex items-center justify-center shadow-inner">
            <span className="text-xl font-bold text-white capitalize">{user.name[0]}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-[19px] font-semibold text-white tracking-tight truncate">{user.name}</h2>
            <p className="text-[13px] text-white/50 font-medium truncate">{user.email}</p>
          </div>
        </div>

        {/* Household & Sharing Group */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase ml-4">
            Household Sync
          </h3>
          <div className="bg-[#1C1C1E] rounded-[28px] overflow-hidden border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            
            {/* Status */}
            <div className="p-4 px-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-[15px] font-medium text-white">Partner Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#30D158]">Active</span>
              </div>
            </div>

            {/* Invite Code */}
            <button 
              onClick={handleCopy}
              className="w-full p-4 px-5 flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.05] transition-colors active:bg-white/[0.08]"
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[13px] font-medium text-white/50">Household Invite Code</span>
                <span className="text-[17px] font-semibold text-white tracking-[0.1em] font-mono">{inviteCode}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#30D158]" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-5 h-5 text-white/50" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
          <p className="text-[12px] text-white/40 font-medium ml-4 mt-1 leading-relaxed">
            Share this code with your partner. They can enter it during setup to instantly sync balances, budgets, and grocery lists.
          </p>
        </div>

        {/* Preferences Group */}
        <div className="flex flex-col gap-2 mt-2">
          <h3 className="text-[11px] font-bold text-white/40 tracking-[0.2em] uppercase ml-4">
            Preferences
          </h3>
          <div className="bg-[#1C1C1E] rounded-[28px] overflow-hidden border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] flex flex-col">
            
            <div className="p-4 px-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-[15px] font-medium text-white">Privacy & Security</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-white/20 rotate-180" />
            </div>

            <div className="p-4 px-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-[15px] font-medium text-white">Notifications</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-white/20 rotate-180" />
            </div>
            
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-transparent border border-[#FF453A]/20 text-[#FF453A] rounded-2xl py-4 font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#FF453A]/10 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>

      </div>
    </div>
  );
}
