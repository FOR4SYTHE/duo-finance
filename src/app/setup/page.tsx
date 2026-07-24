"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight, CheckCircle2, Loader2, Link2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { WelcomeShader } from "@/components/auth/WelcomeShader";

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
    <div className="flex flex-col w-full fixed inset-0 z-50 overflow-hidden bg-[#000000] selection:bg-white/10 font-sans">
      {/* Background WebGL Shader */}
      <WelcomeShader />

      <div className="relative z-10 w-full h-full flex flex-col items-center overflow-y-auto no-scrollbar pt-[8dvh] pb-[6dvh] px-6">
        
        {/* Top Header - Chrome Logo with Shine Animation */}
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            backgroundPosition: ["0% 50%", "200% 50%"] 
          }}
          transition={{ 
            opacity: { duration: 1, ease: "easeOut" },
            y: { duration: 1, ease: "easeOut" },
            backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear" } 
          }}
          className="text-[40px] font-extrabold uppercase tracking-[0.2em] relative mb-2"
          style={{
            background: "linear-gradient(110deg, #b3b3b3 0%, #ffffff 25%, #4a4a4a 50%, #ffffff 75%, #b3b3b3 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.8))",
          }}
        >
          DUO
          <span 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          />
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-center mb-[5dvh]"
        >
          <h2 className="text-[20px] text-white font-semibold mb-1">
            Welcome, {user?.name || "Friend"}
          </h2>
          <p className="text-[15px] text-[#cfc4c5] font-medium">
            Let's configure your household.
          </p>
        </motion.div>

        {/* The Main Card */}
        <div className="w-full max-w-[380px]">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="setup-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flex flex-col gap-4"
              >
                {step === "choose" ? (
                  <motion.div
                    key="choose-cards"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Create Household Card */}
                    <button
                      onClick={handleCreate}
                      disabled={isLoading}
                      className="w-full bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[28px] p-5 flex items-center gap-5 hover:bg-white/[0.06] transition-all group shadow-[0_24px_48px_rgba(0,0,0,0.5)] text-left active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
                        ) : (
                          <Users className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold text-white mb-0.5 tracking-tight">Create Household</h3>
                        <p className="text-[13px] text-white/50 font-medium leading-tight">Start fresh and invite later.</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/80 transition-colors" />
                    </button>

                    {/* Join Partner Card */}
                    <button
                      onClick={() => setStep("join")}
                      disabled={isLoading}
                      className="w-full bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[28px] p-5 flex items-center gap-5 hover:bg-white/[0.06] transition-all group shadow-[0_24px_48px_rgba(0,0,0,0.5)] text-left active:scale-[0.98]"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Link2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[16px] font-semibold text-white mb-0.5 tracking-tight">Join Partner</h3>
                        <p className="text-[13px] text-white/50 font-medium leading-tight">I have a 6-digit invite code.</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/80 transition-colors" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="join-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="w-full bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[28px] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
                  >
                    <form onSubmit={handleJoin} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[13px] font-bold text-white/40 tracking-[0.1em] uppercase ml-1">
                          Invite Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. A3K9P2"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] py-4 px-5 text-[#e4e2e4] placeholder-white/30 text-center tracking-[0.2em] font-mono text-[20px] outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all uppercase"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={isLoading || inviteCode.length < 6}
                          className="w-full h-[56px] bg-[#111111] border border-white/10 text-white rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            "JOIN HOUSEHOLD"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep("choose")}
                          disabled={isLoading}
                          className="w-full h-[56px] bg-transparent text-white/50 rounded-[16px] font-medium text-[15px] flex items-center justify-center hover:text-white hover:bg-white/[0.03] transition-all active:scale-[0.98]"
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
                className="flex flex-col items-center justify-center text-center w-full py-10 bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[28px] shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1, bounce: 0.5 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </motion.div>
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                </div>
                <h2 className="text-[24px] font-semibold text-white tracking-tight mb-2">
                  All Set!
                </h2>
                <p className="text-[15px] text-white/50 font-medium">
                  Taking you to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
