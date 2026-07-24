"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, ArrowRight, Home, CheckCircle2, Loader2, Link2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const { user, createHousehold, joinHousehold, householdId } = useAuthStore();
  
  const [step, setStep] = useState<"choose" | "join">("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (householdId) {
      router.push("/");
    }
  }, [householdId, router]);

  if (householdId) {
    return null;
  }

  const handleCreate = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    createHousehold();
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length < 6) return;
    
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    joinHousehold(inviteCode);
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-6 py-12 relative bg-[#050505]">
      
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full relative z-10">
        
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="setup-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full flex flex-col gap-6"
            >
              <div className="mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <Home className="w-6 h-6 text-[#BF5AF2]" />
                </div>
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                  Welcome, {user?.name || "Friend"}
                </h1>
                <p className="text-[15px] text-white/50 font-medium">
                  Let's get your household set up so you can start tracking together.
                </p>
              </div>

              {step === "choose" ? (
                <motion.div
                  key="choose-cards"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleCreate}
                    disabled={isLoading}
                    className="w-full bg-[#1C1C1E] border border-white/10 rounded-[28px] p-5 flex items-center gap-5 hover:bg-[#2C2C2E] transition-all group shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                      ) : (
                        <Users className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[17px] font-semibold text-white mb-0.5 tracking-tight">Create Household</h3>
                      <p className="text-[13px] text-white/40 font-medium leading-tight">Start fresh and invite your partner later.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                  </button>

                  <button
                    onClick={() => setStep("join")}
                    disabled={isLoading}
                    className="w-full bg-[#1C1C1E] border border-white/10 rounded-[28px] p-5 flex items-center gap-5 hover:bg-[#2C2C2E] transition-all group shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0A84FF]/10 flex items-center justify-center flex-shrink-0 border border-[#0A84FF]/20 shadow-inner">
                      <Link2 className="w-5 h-5 text-[#0A84FF]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[17px] font-semibold text-white mb-0.5 tracking-tight">Join Partner</h3>
                      <p className="text-[13px] text-white/40 font-medium leading-tight">I have a 6-digit invite code.</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="join-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <form onSubmit={handleJoin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 tracking-[0.1em] uppercase ml-1">
                        Invite Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. A3K9P2"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-white/30 text-center tracking-[0.2em] font-mono text-xl outline-none focus:bg-white/[0.04] focus:border-white/30 transition-all uppercase"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button
                        type="submit"
                        disabled={isLoading || inviteCode.length < 6}
                        className="w-full h-14 bg-white text-black rounded-2xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Join Household"
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep("choose")}
                        disabled={isLoading}
                        className="w-full h-14 bg-transparent text-white/50 rounded-2xl font-semibold text-[15px] flex items-center justify-center hover:text-white hover:bg-white/[0.04] transition-all"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center w-full"
            >
              <div className="w-20 h-20 rounded-full bg-[#30D158]/10 border border-[#30D158]/20 flex items-center justify-center mb-6 relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-10 h-10 text-[#30D158]" />
                </motion.div>
                <div className="absolute inset-0 bg-[#30D158]/20 blur-xl rounded-full" />
              </div>
              <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
                All Set!
              </h2>
              <p className="text-white/50 font-medium">
                Taking you to your dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
