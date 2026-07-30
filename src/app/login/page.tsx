"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WelcomeShader } from "@/components/auth/WelcomeShader";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "magic_link" | "magic_link_sent">("password");
  const [otpCode, setOtpCode] = useState("");

  const handleInitiateMagicLink = () => {
    if (email) {
      handleSendMagicLink();
    } else {
      setAuthMode("magic_link");
    }
  };

  const handleSendMagicLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthMode("magic_link_sent");
    }, 600);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    login(email);
    setIsLoading(false);
    router.push("/setup");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    login(email);
    setIsLoading(false);
    router.push("/setup");
  };

  return (
    <div className="flex flex-col w-full fixed inset-0 z-50 overflow-hidden bg-[#000000] selection:bg-white/10 font-sans">
      {/* Background WebGL Shader */}
      <WelcomeShader />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-5">
        
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[15px] sm:text-[17px] text-[#cfc4c5] font-medium mb-4 sm:mb-6"
        >
          {authMode === "magic_link_sent" 
            ? "Check your inbox" 
            : authMode === "magic_link" 
              ? "Sign in without a password"
              : "Sign in to your shared space"}
        </motion.p>

        {/* The Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px] bg-[#1c1c1e]/90 border-[0.5px] border-white/10 rounded-[28px] p-5 sm:p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        >
          {authMode === "magic_link_sent" ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-white">
                ✉️
              </div>
              <div>
                <p className="text-[14px] text-white/70">
                  We sent a 6-digit code & link to:
                </p>
                <p className="text-[15px] text-white font-semibold mt-0.5">
                  {email || "your email"}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full tracking-[0.3em] text-center bg-white/[0.04] border border-white/10 rounded-[16px] py-4 text-white text-[20px] font-mono placeholder-white/20 outline-none focus:border-white/40 focus:ring-4 focus:ring-white/[0.02] transition-all"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full h-[48px] sm:h-[52px] bg-[#111111] border border-white/10 text-white rounded-[16px] font-semibold text-[15px] sm:text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "VERIFY & SIGN IN"}
              </button>

              <div className="pt-2 flex items-center justify-between text-[13px]">
                <button
                  type="button"
                  onClick={() => setAuthMode("password")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  ← Use password
                </button>
                <button
                  type="button"
                  onClick={handleSendMagicLink}
                  className="text-[#5E5CE6] hover:text-[#7A78FF] transition-colors"
                >
                  Resend code
                </button>
              </div>
            </form>
          ) : authMode === "magic_link" ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4 text-center">
              <div>
                <p className="text-[14px] text-white/70 mb-4 text-left">
                  Enter your email address and we'll send you a magic link to sign in instantly.
                </p>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[14px] sm:rounded-[16px] py-3.5 sm:py-4 px-5 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[15px] sm:text-[16px]"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-[48px] sm:h-[52px] bg-[#111111] border border-white/10 text-white rounded-[16px] font-semibold text-[15px] sm:text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SEND MAGIC LINK"}
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("password")}
                  className="text-[13px] text-white/40 hover:text-white transition-colors"
                >
                  ← Back to password login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
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

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[14px] sm:rounded-[16px] py-3.5 sm:py-4 pl-5 pr-12 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[15px] sm:text-[16px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between pt-1 pb-3">
                <label 
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 cursor-pointer group select-none"
                >
                  <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${rememberMe ? 'bg-white border-white' : 'border-white/20 group-hover:border-white/40 bg-transparent'}`}>
                    {rememberMe && (
                      <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px] text-white/50 font-medium group-hover:text-white/80 transition-colors">Remember me</span>
                </label>
                
                <button 
                  type="button" 
                  onClick={() => router.push("/forgot-password")}
                  className="text-[14px] text-[#5E5CE6] hover:text-[#7A78FF] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-[48px] sm:h-[52px] bg-[#111111] border border-white/10 text-white rounded-[14px] sm:rounded-[16px] font-semibold text-[15px] sm:text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN IN"}
              </button>
              
              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                <span className="text-[13px] text-white/30 font-medium">OR</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={() => { login(email || "google@mock.com"); router.push("/setup"); }}
                className="w-full h-[48px] sm:h-[52px] bg-white/[0.03] border border-white/10 text-[#e4e2e4] rounded-[14px] sm:rounded-[16px] font-medium text-[15px] sm:text-[16px] flex items-center justify-center gap-3 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Magic Link Button */}
              <button
                type="button"
                onClick={handleInitiateMagicLink}
                className="w-full h-[48px] sm:h-[52px] bg-transparent border border-white/5 text-[#cfc4c5] rounded-[14px] sm:rounded-[16px] font-medium text-[15px] sm:text-[16px] flex items-center justify-center gap-3 hover:bg-white/[0.03] transition-all active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="chromeGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#b3b3b3" />
                      <stop offset="30%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#8a8a8a" />
                      <stop offset="70%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#b3b3b3" />
                    </linearGradient>
                  </defs>
                  <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" stroke="url(#chromeGradientLogin)" />
                  <circle cx="16.5" cy="7.5" r=".5" fill="url(#chromeGradientLogin)" stroke="none" />
                </svg>
                Continue with Magic Link
              </button>
            </form>
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
            onClick={() => router.push("/signup")}
            className="text-[14px] text-white/50 font-medium hover:text-white/80 transition-colors"
          >
            Don't have an account? <span className="text-[#5E5CE6] font-semibold">SIGN UP</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
