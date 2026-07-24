"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, ArrowRight, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "email" | "magic-link";
}

export function AuthSheet({ isOpen, onClose, mode }: AuthSheetProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();
  
  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Magic Link specific
  const [step, setStep] = useState<"email" | "code">("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      setStep("email");
      setCode(["", "", "", "", "", ""]);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    if (mode === "magic-link") {
      setStep("code");
      setIsLoading(false);
      // Focus first input automatically
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      // Email/Password login
      login(email);
      setIsLoading(false);
      router.push("/setup");
      onClose();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^[0-9]+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Submit if complete
    if (value && index === 5 && newCode.every(v => v !== "")) {
      verifyCode(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move back on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login(email);
    setIsLoading(false);
    router.push("/setup");
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            // Lite, fast tween as mandated in AGENTS.md
            transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-[210] mx-auto max-w-xl w-full bg-[#121212] rounded-t-[36px] shadow-[0_-20px_40px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] border-t border-white/[0.08] overflow-hidden"
          >
            {/* Grabber handle */}
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pb-12 pt-4">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  {mode === "magic-link" ? (
                    <KeyRound className="w-6 h-6 text-amber-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-[#0A84FF]" />
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
                  {mode === "magic-link" 
                    ? step === "email" ? "Sign in with Magic Link" : "Check your email" 
                    : "Sign in with Email"}
                </h2>
                <p className="text-sm font-medium text-white/40">
                  {mode === "magic-link" 
                    ? step === "email" ? "We'll send a 6-digit code to your inbox." : `We sent a code to ${email}`
                    : "Enter your details to securely access your household."}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {(step === "email" || mode === "email") ? (
                    <motion.div 
                      key="email-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Email Input */}
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white/70 transition-colors" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:bg-white/[0.04] focus:border-white/30 transition-all font-medium"
                        />
                      </div>
                      
                      {/* Password Input */}
                      {mode === "email" && (
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-white/70 transition-colors" />
                          <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 outline-none focus:bg-white/[0.04] focus:border-white/30 transition-all font-medium"
                          />
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isLoading || !email || (mode === "email" && !password)}
                        className="w-full h-14 bg-white text-black rounded-2xl font-semibold text-base flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Continue <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  ) : (
                    /* 6-Digit Code Entry */
                    <motion.div 
                      key="code-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-8"
                    >
                      <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                          <input
                            key={index}
                            ref={el => { inputRefs.current[index] = el }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleCodeKeyDown(index, e)}
                            className="w-[14%] aspect-square bg-[#1C1C1E] border border-white/10 rounded-xl text-center text-2xl font-semibold text-white focus:bg-white/[0.04] focus:border-white/50 outline-none transition-all shadow-inner"
                          />
                        ))}
                      </div>
                      
                      <div className="flex flex-col items-center justify-center gap-4">
                        {isLoading ? (
                          <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="text-white/40 hover:text-white/70 text-sm font-medium transition-colors"
                          >
                            Didn't receive it? Resend
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
