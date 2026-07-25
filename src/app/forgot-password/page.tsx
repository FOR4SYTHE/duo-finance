"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WelcomeShader } from "@/components/auth/WelcomeShader";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <div className="flex flex-col w-full fixed inset-0 z-50 overflow-hidden bg-[#000000] selection:bg-white/10 font-sans">
      {/* Background WebGL Shader */}
      <WelcomeShader />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-5">
        
        {/* Top Header - Chrome Logo with Shine Animation */}
        <motion.h1 
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ 
            opacity: 1, 
            y: 0,
            filter: "blur(0px)",
            backgroundPosition: ["0% 50%", "200% 50%"] 
          }}
          transition={{ 
            opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            filter: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear" } 
          }}
          className="text-[32px] sm:text-[40px] font-extrabold uppercase tracking-[0.2em] relative mb-1"
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

        <motion.p 
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] sm:text-[17px] text-[#cfc4c5] font-medium mb-4 sm:mb-6"
        >
          Recover your shared space
        </motion.p>

        {/* The Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px] bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[28px] p-5 sm:p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        >
          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[14px] text-white/60 mb-2 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[14px] sm:rounded-[16px] py-3.5 sm:py-4 px-5 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[15px] sm:text-[16px]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-[48px] sm:h-[52px] bg-[#111111] border border-white/10 text-white rounded-[14px] sm:rounded-[16px] font-semibold text-[15px] sm:text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98] mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SEND RECOVERY LINK"}
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-[18px] text-white font-semibold">Check your email</h3>
              <p className="text-[14px] text-white/60 leading-relaxed">
                We've sent a password recovery link to {email}
              </p>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 sm:mt-8 mb-2"
        >
          <button 
            onClick={() => router.push("/login")}
            className="text-[14px] text-white/50 font-medium hover:text-white/80 transition-colors"
          >
            Back to <span className="text-[#5E5CE6] font-semibold">SIGN IN</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
