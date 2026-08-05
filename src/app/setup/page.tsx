"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight, CheckCircle2, Loader2, Link2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { WelcomeShader } from "@/components/auth/WelcomeShader";
import { BorderBeam } from "border-beam";
import { ThinkingOrb } from "thinking-orbs";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { WelcomeTourModal } from "@/components/tour/WelcomeTourModal";

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [profile, setProfile] = useState<any>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  const [step, setStep] = useState<"choose" | "join">("choose");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Join Animation states: 'input' | 'verifying' | 'matched' | 'welcome'
  const [joinStep, setJoinStep] = useState<"input" | "verifying" | "matched" | "welcome">("input");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/welcome");
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        if (data.household_id) {
          window.location.href = "/";
        }
      }
    }
    loadProfile();
  }, [router, supabase]);

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    let successInsert = false;
    for (let i = 0; i < 5; i++) {
      const newCode = generateInviteCode();
      const { data: newHouseholdId, error } = await supabase.rpc('create_household', { invite_code_input: newCode });
      
      if (!error && newHouseholdId) {
        successInsert = true;
        break;
      }
    }

    setIsLoading(false);
    if (!successInsert) {
      setErrorMsg("Failed to generate a unique invite code. Please try again.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length < 6) return;
    setErrorMsg(null);
    
    setJoinStep("verifying");
    
    const { data: joined, error } = await supabase.rpc('join_household', { invite_code_input: inviteCode });
    
    if (error || !joined) {
      setJoinStep("input");
      setErrorMsg("Invalid or missing invite code. Please try again.");
      return;
    }

    const { data: currentProfile } = await supabase.from('profiles').select('household_id').eq('id', profile?.id).single();
    if (currentProfile?.household_id) {
       const { data: partners } = await supabase
        .from('profiles')
        .select('*')
        .eq('household_id', currentProfile.household_id)
        .neq('id', profile?.id)
        .limit(1);
       if (partners && partners.length > 0) {
         setPartnerProfile(partners[0]);
       }
    }

    setJoinStep("matched");

    setTimeout(() => {
      setJoinStep("welcome");
    }, 1400);
  };

  const handleFinishJoin = async () => {
    await useAuthStore.getState().initialize();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col w-full fixed inset-0 z-50 overflow-hidden bg-[#000000] selection:bg-white/10 font-sans">
      {/* Background WebGL Shader */}
      <WelcomeShader />

      <div className="relative z-10 w-full h-full flex flex-col items-center overflow-y-auto no-scrollbar pt-[8dvh] pb-[6dvh] px-6">
        
        {/* Top Header - Chrome Logo with Shine Animation */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
          }}
          transition={{ 
            opacity: { duration: 0.8 },
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-[5dvh]"
        >
          <h2 className="text-[20px] text-white font-semibold mb-1">
            Welcome, {profile?.display_name || "Friend"}
          </h2>
          <p className="text-[15px] text-[#cfc4c5] font-medium">
            Let's configure your household.
          </p>
        </motion.div>

        {/* The Main Card */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-[380px] bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] rounded-[16px] p-3 mb-4 flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-[380px]">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="setup-content"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex flex-col gap-4"
              >
                {step === "choose" ? (
                  <motion.div
                    key="choose-cards"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-4"
                  >
                    {/* Create Household Card */}
                    <button
                      onClick={handleCreate}
                      disabled={isLoading}
                      className="w-full bg-[#1c1c1e]/90 border-[0.5px] border-white/10 rounded-[28px] p-5 flex items-center gap-5 hover:bg-[#2c2c2e] transition-all group shadow-[0_24px_48px_rgba(0,0,0,0.5)] text-left active:scale-[0.98]"
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
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full bg-[#1c1c1e]/90 border-[0.5px] border-white/10 rounded-[28px] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center min-h-[220px]"
                  >
                    <AnimatePresence mode="popLayout">
                      {joinStep === "matched" ? (
                        <motion.div 
                          key="matched-state"
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-center w-full py-8"
                        >
                          <motion.div 
                            initial={{ width: 48, height: 48, borderRadius: 24, opacity: 0 }}
                            animate={{ width: 220, height: 52, borderRadius: 26, opacity: 1 }}
                            transition={{ type: "spring", bounce: 0.35, duration: 0.7 }}
                            className="bg-black border border-emerald-500/30 flex items-center justify-start overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
                          >
                             <div className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center pl-1">
                                <motion.svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  {/* Face ID Broken Square (Apple Style) */}
                                  <motion.path d="M8 3H5a2 2 0 0 0-2 2v3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
                                  <motion.path d="M16 3h3a2 2 0 0 1 2 2v3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
                                  <motion.path d="M8 21H5a2 2 0 0 1-2-2v-3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
                                  <motion.path d="M16 21h3a2 2 0 0 0 2-2v-3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }} />
                                  {/* Face Center */}
                                  <motion.path d="M8.5 10h.01M15.5 10h.01" strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring", bounce: 0.6 }} />
                                  <motion.path d="M9 14c1 1.5 3 1.5 4 0" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.3 }} />
                                  <motion.path d="M12 10v1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.55, duration: 0.2 }} />
                                </motion.svg>
                             </div>
                             <motion.span 
                               initial={{ opacity: 0, x: -5 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.45, duration: 0.4 }}
                               className="text-[#30D158] text-[13px] font-bold tracking-[0.14em] whitespace-nowrap"
                             >
                               PARTNER FOUND
                             </motion.span>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.form 
                          key="input-form"
                          onSubmit={handleJoin} 
                          className="w-full space-y-6"
                        >
                          <div className="space-y-3">
                            <label className="text-[13px] font-bold text-white/40 tracking-[0.1em] uppercase ml-1">
                              Invite Code
                            </label>
                            
                            <BorderBeam size={joinStep === "verifying" ? "line" : "pulse-inner"} colorVariant={joinStep === "verifying" ? "colorful" : "mono"}>
                              <div className="relative w-full">
                                <input
                                  type="text"
                                  placeholder="E.G. A3K9P2"
                                  value={inviteCode}
                                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                  maxLength={6}
                                  disabled={joinStep === "verifying"}
                                  className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] py-4 px-5 text-[#e4e2e4] placeholder-white/20 text-center tracking-[0.25em] font-mono text-[20px] outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all uppercase"
                                />
                              </div>
                            </BorderBeam>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            <button
                              type="submit"
                              disabled={joinStep === "verifying" || inviteCode.length < 6}
                              className="w-full h-[56px] bg-[#111111] border border-white/10 text-white rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]"
                            >
                              {joinStep === "verifying" ? (
                                <div className="flex items-center gap-3">
                                  <ThinkingOrb state="working" size={20} />
                                  <span className="text-[#30D158] font-bold tracking-wider">VERIFYING CODE...</span>
                                </div>
                              ) : (
                                "JOIN HOUSEHOLD"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setStep("choose")}
                              disabled={joinStep === "verifying"}
                              className="w-full h-[56px] bg-transparent text-white/50 rounded-[16px] font-medium text-[15px] flex items-center justify-center hover:text-white hover:bg-white/[0.03] transition-all active:scale-[0.98]"
                            >
                              Back
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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

      {/* Full Screen Connected Welcome Overlay */}
      <AnimatePresence>
        {joinStep === "welcome" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl"
          >
            {/* SVG Filter for Metaballs */}
            <svg width="0" height="0" className="absolute hidden">
              <filter id="gooey-effect-setup">
                <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
              </filter>
            </svg>

            <div className="relative w-full max-w-md flex flex-col items-center justify-center p-8">
              
              {/* Gooey Avatars Container */}
              <div className="relative w-full h-40 flex items-center justify-center mb-10">
                 
                 {/* Background Gooey Layer */}
                 <div className="absolute inset-0 flex items-center justify-center" style={{ filter: 'url(#gooey-effect-setup)' }}>
                   <motion.div 
                     className="absolute w-[96px] h-[96px] rounded-full bg-[#068562]"
                     initial={{ x: -120, y: 0 }}
                     animate={{ x: -60, y: [0, -8, 0] }}
                     transition={{
                       x: { duration: 1.2, type: "spring", bounce: 0.4 },
                     }}
                   />
                   <motion.div 
                     className="absolute w-[96px] h-[96px] rounded-full bg-[#068562]"
                     initial={{ x: 120, y: 0 }}
                     animate={{ x: 60, y: [0, 8, 0] }}
                     transition={{
                       x: { duration: 1.2, type: "spring", bounce: 0.4, delay: 0.1 },
                     }}
                   />
                   <motion.div 
                     className="absolute h-[50px] bg-[#013F4A]"
                     initial={{ width: 0, opacity: 0, y: 0 }}
                     animate={{ width: 120, opacity: 1, y: 0 }}
                     transition={{
                       width: { duration: 1.0, delay: 0.2, type: "spring" },
                       opacity: { duration: 1.0, delay: 0.2 },
                     }}
                   />
                 </div>

                 {/* Foreground Avatars (Sharp) */}
                 <div className="absolute inset-0 flex items-center justify-center z-10">
                   <motion.div 
                     className="absolute w-[86px] h-[86px] rounded-full overflow-hidden border-[2px] border-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#1c1c1e] flex items-center justify-center"
                     initial={{ x: -120, scale: 0.8, y: 0 }}
                     animate={{ x: -60, scale: 1, y: 0 }}
                     transition={{
                        x: { duration: 1.2, type: "spring", bounce: 0.4 },
                        scale: { duration: 1.2, type: "spring", bounce: 0.4 },
                     }}
                   >
                     {profile?.avatar_url ? (
                       <img src={profile.avatar_url} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-white text-3xl font-bold select-none">{profile?.display_name?.[0]?.toUpperCase() || 'U'}</span>
                     )}
                   </motion.div>
                   <motion.div 
                     className="absolute w-[86px] h-[86px] rounded-full overflow-hidden border-[2px] border-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#1c2c24] flex items-center justify-center"
                     initial={{ x: 120, scale: 0.8, y: 0 }}
                     animate={{ x: 60, scale: 1, y: 0 }}
                     transition={{
                        x: { duration: 1.2, type: "spring", bounce: 0.4, delay: 0.1 },
                        scale: { duration: 1.2, type: "spring", bounce: 0.4, delay: 0.1 },
                     }}
                   >
                     {partnerProfile?.avatar_url ? (
                       <img src={partnerProfile.avatar_url} className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-emerald-400 text-3xl font-bold select-none">{partnerProfile?.display_name?.[0]?.toUpperCase() || 'P'}</span>
                     )}
                   </motion.div>
                 </div>
              </div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="text-[#ffffff] text-3xl font-medium tracking-tight mb-3 text-center"
              >
                You're connected.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                className="text-white/50 text-[15px] text-center mb-12"
              >
                Your shared Duo Household is now active.
              </motion.p>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.5, type: "spring", bounce: 0.4 }}
                onClick={handleFinishJoin}
                className="w-full max-w-[320px] mx-auto py-3.5 bg-[#D1D1D3] text-[#111111] rounded-full font-semibold text-[15px] hover:bg-[#E5E5E5] active:scale-[0.97] transition-all flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.4)]"
              >
                Start Budgeting Together
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* One-Time Welcome Tour — self-managed via localStorage */}
      <WelcomeTourModal />
    </div>
  );
}
