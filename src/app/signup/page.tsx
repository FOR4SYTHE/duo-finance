"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WelcomeShader } from "@/components/auth/WelcomeShader";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || password !== confirmPassword) return;
    
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    // For now we just use the login function to mock auth
    login(email);
    setIsLoading(false);
    router.push("/setup");
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

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-[17px] text-[#cfc4c5] font-medium mb-[6dvh]"
        >
          Create your shared space
        </motion.p>

        {/* The Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-[380px] bg-[#1c1c1e]/40 backdrop-blur-2xl border-[0.5px] border-white/10 rounded-[28px] p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <div>
              <input
                type="text"
                placeholder="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] py-4 px-5 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[16px]"
              />
            </div>

            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] py-4 px-5 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[16px]"
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
                className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] py-4 pl-5 pr-12 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[16px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-white/[0.04] border border-white/10 rounded-[16px] py-4 pl-5 pr-12 text-[#e4e2e4] placeholder-white/30 outline-none focus:bg-white/[0.06] focus:border-white/30 focus:ring-4 focus:ring-white/[0.02] transition-all font-medium text-[16px]"
              />
            </div>

            <div className="pt-2" />

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password || password !== confirmPassword}
              className="w-full h-[56px] bg-[#111111] border border-white/10 text-white rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIGN UP"}
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
              className="w-full h-[56px] bg-white/[0.03] border border-white/10 text-[#e4e2e4] rounded-[16px] font-medium text-[16px] flex items-center justify-center gap-3 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

            {/* Magic Link Button */}
            <button
              type="button"
              className="w-full h-[56px] bg-transparent border border-white/5 text-[#cfc4c5] rounded-[16px] font-medium text-[16px] flex items-center justify-center gap-3 hover:bg-white/[0.03] transition-all active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="chromeGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b3b3b3" />
                    <stop offset="30%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#8a8a8a" />
                    <stop offset="70%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#b3b3b3" />
                  </linearGradient>
                </defs>
                <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" stroke="url(#chromeGradientSignup)" />
                <circle cx="16.5" cy="7.5" r=".5" fill="url(#chromeGradientSignup)" stroke="none" />
              </svg>
              Continue with Magic Link
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-8 mb-4"
        >
          <button 
            onClick={() => router.push("/login")}
            className="text-[14px] text-white/50 font-medium hover:text-white/80 transition-colors"
          >
            Already have an account? <span className="text-[#5E5CE6] font-semibold">SIGN IN</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
