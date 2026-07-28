"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WelcomeShader } from "@/components/auth/WelcomeShader";
import { ChevronLeft, Copy, QrCode, ShieldCheck, ChevronRight, Settings, LogOut, CheckCircle2, Users, CreditCard, Bell, Camera, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, partner, householdId, toggleMockPartner, logout } = useAuthStore();
  const { primaryCurrency, setPrimaryCurrency, exchangeRate } = useCurrencyStore();
  const [copied, setCopied] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isJoining, setIsJoining] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
        setIsEditingAvatar(true);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  const mockInviteCode = householdId ? householdId.split('-')[1]?.toUpperCase() || "8K9P2X" : "8K9P2X";

  return (
    <div className="min-h-[100dvh] w-full bg-[#030303] text-white font-sans selection:bg-white/10 flex flex-col relative overflow-y-auto no-scrollbar pb-12">
      
      {/* Background WebGL Shader (Subtle Animating Orbs) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <WelcomeShader />
      </div>
      
      {/* Noise overlay */}
      <div className="fixed inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay" />

      {/* Top Dynamic Island / Header Block */}
      <div className="relative shrink-0 bg-[#0A0A0C] rounded-b-[44px] pb-10 pt-14 px-6 shadow-[0_24px_48px_rgba(0,0,0,0.8)] border-b border-white/5 z-20 overflow-hidden">
        {/* Inner ambient light & noise */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-sm border-[0.5px] border-white/5"
          >
            <ChevronLeft className="w-6 h-6 pr-0.5" />
          </button>
          <div className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-full backdrop-blur-sm border-[0.5px] border-white/5">
             <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Interconnected Avatars & Info */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {/* User Avatar Container */}
            <div className="relative z-10 flex flex-col items-center">
              <div 
                className="w-[92px] h-[92px] rounded-full bg-gradient-to-b from-[#2A2A2C] to-[#1A1A1C] border-[0.5px] border-white/20 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] overflow-hidden relative cursor-pointer group touch-none"
                onClick={(e) => {
                  if (!isEditingAvatar) fileInputRef.current?.click();
                }}
                onPointerDown={(e) => {
                   if (isEditingAvatar) {
                     setIsDragging(true);
                     dragStart.current = { x: e.clientX - imagePan.x, y: e.clientY - imagePan.y };
                     e.currentTarget.setPointerCapture(e.pointerId);
                   }
                }}
                onPointerMove={(e) => {
                   if (isDragging && isEditingAvatar) {
                     setImagePan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
                   }
                }}
                onPointerUp={(e) => {
                   setIsDragging(false);
                   e.currentTarget.releasePointerCapture(e.pointerId);
                }}
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover pointer-events-none" 
                    style={{ transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)` }}
                  />
                ) : (
                  <span className="text-white text-[34px] font-medium tracking-tight drop-shadow-md group-hover:scale-110 transition-transform">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
                {/* Subtle dark overlay on hover */}
                {!isEditingAvatar && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />}
              </div>
              
              {/* Camera Edit Icon */}
              {!isEditingAvatar && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-[-5px] w-8 h-8 bg-[#1C1C1E] rounded-full border-[0.5px] border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg z-20 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-white/80" />
                </div>
              )}

              {/* Editing Controls */}
              {isEditingAvatar && (
                <div className="absolute top-[100px] bg-[#1C1C1E]/95 backdrop-blur-xl border-[0.5px] border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-3 z-50 w-48 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-center">Adjust Photo</div>
                  <div className="flex items-center gap-2">
                     <span className="text-[12px] text-white/50">-</span>
                     <input 
                       type="range" 
                       min="1" 
                       max="3" 
                       step="0.01" 
                       value={imageZoom} 
                       onChange={e => setImageZoom(parseFloat(e.target.value))} 
                       className="flex-1 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-grab" 
                     />
                     <span className="text-[12px] text-white/50">+</span>
                  </div>
                  <div className="text-[9px] text-white/30 text-center -mt-1 mb-1">Drag image to reposition</div>
                  <button 
                    onClick={() => setIsEditingAvatar(false)} 
                    className="w-full py-2 bg-white text-black rounded-xl text-[13px] font-bold hover:bg-white/90 active:scale-95 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Partner Avatar (Overlapping) */}
            {partner && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative z-0 -ml-6 w-[84px] h-[84px] rounded-full bg-gradient-to-b from-[#1C1C1E] to-[#121214] border-[0.5px] border-white/10 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.6)] opacity-95"
              >
                <span className="text-white/80 text-[28px] font-medium tracking-tight">{partner.name[0].toUpperCase()}</span>
              </motion.div>
            )}
          </div>

          <h2 className="text-[24px] font-semibold text-white tracking-tight drop-shadow-md mb-1">
            {user?.name || 'You'} {partner ? `& ${partner.name}` : ''}
          </h2>
          <p className="text-[14px] text-white/50 mb-7 font-medium">{user?.email || 'user@example.com'}</p>
          
          {/* Status / Invite Pill inside the header */}
          {partner ? (
            <div className="px-5 py-2.5 bg-black/40 border-[0.5px] border-[#30D158]/20 rounded-full flex items-center gap-2.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]" />
              <span className="text-[#30D158] font-bold text-[11px] tracking-[0.1em] uppercase">Partnership Active</span>
            </div>
          ) : (
            <div className="w-full max-w-[280px] flex flex-col gap-2 items-center">
              {isJoining ? (
                <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-full bg-black/60 rounded-[20px] p-1.5 border-[0.5px] border-white/10 flex items-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-md focus-within:border-[#30D158]/30 transition-colors">
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      className="bg-transparent flex-1 text-white font-mono text-[14px] px-3 outline-none placeholder:text-white/20 tracking-widest uppercase"
                      maxLength={6}
                    />
                    <button 
                      onClick={() => setIsJoining(false)}
                      className="px-4 py-2.5 bg-white/10 rounded-xl text-white font-medium text-[12px] hover:bg-white/20 transition-colors"
                    >
                      Join
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsJoining(false)}
                    className="text-white/40 text-[11px] font-medium tracking-wide hover:text-white/70 transition-colors py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-full bg-black/40 rounded-[20px] p-3 border-[0.5px] border-white/5 flex items-center justify-between shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-md">
                    <div className="flex flex-col pl-3">
                        <span className="text-white/40 text-[9px] uppercase tracking-[0.1em] font-bold mb-0.5">Household Code</span>
                        <span className="text-white font-mono text-[16px] tracking-[0.15em] font-medium opacity-90">{mockInviteCode}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleCopyCode} className="w-11 h-11 bg-white/5 hover:bg-white/10 rounded-xl border-[0.5px] border-white/5 flex items-center justify-center transition-colors shadow-sm">
                        {copied ? <CheckCircle2 className="w-5 h-5 text-[#30D158]" /> : <Copy className="w-5 h-5 text-white/60" />}
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsJoining(true)}
                    className="text-white/40 text-[11px] font-medium tracking-wide hover:text-white/70 transition-colors py-1"
                  >
                    Have an invite code? Join Partner
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 pt-10 pb-32 z-10 flex flex-col shrink-0">

        {/* Currency Preferences */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Primary Currency</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-full p-1.5 mb-3 flex relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-[#2A2A2C] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-[0.5px] border-white/5" 
                style={{ left: primaryCurrency === 'PHP' ? '6px' : 'calc(50% + 6px)' }} 
            />
            <button 
              onClick={() => setPrimaryCurrency('PHP')}
              className={`flex-1 h-12 flex items-center justify-center z-10 transition-colors duration-300 rounded-full ${primaryCurrency === 'PHP' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              <span className="font-semibold text-[15px] tracking-wide">PHP 🇵🇭</span>
            </button>
            <button 
              onClick={() => setPrimaryCurrency('ZAR')}
              className={`flex-1 h-12 flex items-center justify-center z-10 transition-colors duration-300 rounded-full ${primaryCurrency === 'ZAR' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              <span className="font-semibold text-[15px] tracking-wide">ZAR 🇿🇦</span>
            </button>
          </div>
          
          <div className="flex justify-center mb-10">
            <p className="text-white/20 text-[11px] font-medium tracking-wide">Live Rate: ₱1.00 = R{exchangeRate.toFixed(3)} (Auto-updated)</p>
          </div>
        </motion.div>

        {/* Household Sharing Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Household Guide</h3>
          <div className="flex flex-col gap-3 mb-10">
            {/* Guide Item 1 */}
            <div className="w-full bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[24px] p-5 flex items-center gap-5 relative overflow-hidden group shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-colors duration-500" />
              <div className="w-12 h-12 rounded-full bg-white/5 border-[0.5px] border-white/5 flex items-center justify-center relative z-10 shrink-0">
                 <Users className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex flex-col relative z-10">
                <h4 className="text-white font-medium text-[16px] mb-0.5 tracking-tight">Everything in Sync</h4>
                <p className="text-white/40 text-[12px] leading-relaxed">Spend Jar entries stream to both devices in real-time, instantly.</p>
              </div>
            </div>
            
            {/* Guide Item 2 */}
            <div className="w-full bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[24px] p-5 flex items-center gap-5 relative overflow-hidden group shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-500/20 transition-colors duration-500" />
              <div className="w-12 h-12 rounded-full bg-white/5 border-[0.5px] border-white/5 flex items-center justify-center relative z-10 shrink-0">
                 <ShoppingCart className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex flex-col relative z-10">
                <h4 className="text-white font-medium text-[16px] mb-0.5 tracking-tight">Cartify Together</h4>
                <p className="text-white/40 text-[12px] leading-relaxed">Build a list at home, and watch it update as items are checked off in the store.</p>
              </div>
            </div>

            {/* Guide Item 3 */}
            <div className="w-full bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[24px] p-5 flex items-center gap-5 relative overflow-hidden group shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-purple-500/20 transition-colors duration-500" />
              <div className="w-12 h-12 rounded-full bg-white/5 border-[0.5px] border-white/5 flex items-center justify-center relative z-10 shrink-0">
                 <ShieldCheck className="w-5 h-5 text-white/70" />
              </div>
              <div className="flex flex-col relative z-10">
                <h4 className="text-white font-medium text-[16px] mb-0.5 tracking-tight">Shared Privacy</h4>
                <p className="text-white/40 text-[12px] leading-relaxed">Personal budgets remain completely private while household totals combine.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* App Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Settings & Security</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden mb-12 shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            <button className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-colors active:bg-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <ShieldCheck className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Biometrics & PIN</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            <button className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-colors active:bg-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Bell className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            <button className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-colors active:bg-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <CreditCard className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Subscriptions</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            <button className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-colors active:bg-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Settings className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">App Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            
            <button 
            onClick={() => {
                logout();
                router.push('/welcome');
            }}
            className="w-full p-5 flex items-center justify-between hover:bg-[#FF453A]/5 transition-colors group active:bg-[#FF453A]/10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[#FF453A]/10 flex items-center justify-center transition-colors border-[0.5px] border-white/5 group-hover:border-[#FF453A]/20">
                  <LogOut className="w-4 h-4 text-[#FF453A]/70 group-hover:text-[#FF453A]" />
                </div>
                <span className="text-[#FF453A]/90 font-medium text-[16px] tracking-tight">Sign Out</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Mock Toggle for Demo - Placed subtly at the bottom */}
        <div className="flex justify-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
          <button 
            onClick={toggleMockPartner} 
            className="py-3 px-6 bg-transparent border-[0.5px] border-white/10 rounded-full text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold hover:bg-white/5 hover:text-white/70 transition-colors"
          >
            Toggle Partner UI (Dev)
          </button>
        </div>

      </div>
    </div>
  );
}
