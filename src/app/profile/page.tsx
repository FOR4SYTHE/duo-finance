"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";
import { ThinkingOrb } from "thinking-orbs";
import { ChevronLeft, Copy, QrCode, ShieldCheck, ChevronRight, Settings, LogOut, CheckCircle2, Users, CreditCard, Bell, Camera, ShoppingCart, Sparkles, AlertTriangle, Trash2, Pencil, MoreHorizontal } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { processAndCompressImage, getCroppedAvatar } from "@/utils/imageUpload";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { primaryCurrency, setPrimaryCurrency, exchangeRate } = useCurrencyStore();
  const { primarySymbol, secondarySymbol } = useDualCurrency();
  const { user: authUser, partner: authPartner, isInitializing, householdId, updateUser } = useAuthStore();
  
  const [showSignOutPrompt, setShowSignOutPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const [household, setHousehold] = useState<any>(null);

  const [joinStep, setJoinStep] = useState<'idle' | 'input' | 'verifying' | 'matched' | 'welcome'>('idle');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePan, setImagePan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await processAndCompressImage(file);
        setProfileImage(dataUrl);
        setImageZoom(1);
        setImagePan({ x: 0, y: 0 });
        panRef.current = { x: 0, y: 0 };
        setIsEditingAvatar(true);
      } catch (err) {
        console.error("Failed to process image", err);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    if (authUser?.avatar) {
      setProfileImage(authUser.avatar);
    }
  }, [authUser?.avatar]);

  useEffect(() => {
    async function loadHousehold() {
      if (householdId) {
        const { data: h } = await supabase.from('households').select('*').eq('id', householdId).single();
        if (h) setHousehold(h);
      }
    }
    loadHousehold();
  }, [householdId, supabase]);

  const mockInviteCode = household?.invite_code || "------";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mockInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinClick = () => {
    setJoinStep('verifying');
    setTimeout(() => {
      setJoinStep('matched');
    }, 2500);
    setTimeout(() => {
      setJoinStep('welcome');
    }, 5500);
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-full bg-[#000000] text-white font-sans selection:bg-white/10 flex flex-col relative pb-4">
      
      {/* Subtle ambient gradient — zero GPU cost replacement for WebGL shader */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(0,80,40,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_70%_60%,rgba(0,60,30,0.08),transparent_70%)]" />
      </div>

      {/* Top Dynamic Island / Header Block */}
      <motion.div 
        layout
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        className="relative shrink-0 bg-[#0A0A0C] rounded-b-[44px] pb-10 pt-14 px-6 shadow-[0_24px_48px_rgba(0,0,0,0.8)] border-b border-white/5 z-20 overflow-hidden"
      >
        {/* Inner ambient light */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-0" />
        
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-sm border-[0.5px] border-white/5"
          >
            <ChevronLeft className="w-6 h-6 pr-0.5" />
          </button>
          <div 
            onClick={() => document.getElementById('settings-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer bg-white/5 rounded-full border-[0.5px] border-white/5"
          >
             <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Interconnected Avatars & Info */}
        <div className="flex flex-col items-center justify-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="w-[92px] h-[92px] rounded-full bg-gradient-to-b from-[#2A2A2C] to-[#1A1A1C] border-[0.5px] border-white/20 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.1)] overflow-hidden relative cursor-pointer group touch-none"
                onClick={(e) => {
                  if (!isEditingAvatar) fileInputRef.current?.click();
                }}
                onPointerDown={(e) => {
                   if (isEditingAvatar) {
                     isDraggingRef.current = true;
                     dragStart.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
                     e.currentTarget.setPointerCapture(e.pointerId);
                   }
                }}
                onPointerMove={(e) => {
                   if (isDraggingRef.current && isEditingAvatar) {
                     const nx = e.clientX - dragStart.current.x;
                     const ny = e.clientY - dragStart.current.y;
                     panRef.current = { x: nx, y: ny };
                     if (imgRef.current) {
                       imgRef.current.style.transform = `scale(${imageZoom}) translate(${nx / imageZoom}px, ${ny / imageZoom}px)`;
                     }
                   }
                }}
                onPointerUp={(e) => {
                   isDraggingRef.current = false;
                   setImagePan({ ...panRef.current });
                   e.currentTarget.releasePointerCapture(e.pointerId);
                }}
              >
                {profileImage ? (
                  <img 
                    ref={imgRef}
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover pointer-events-none will-change-transform" 
                    style={{ transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)` }}
                  />
                ) : (
                  <span className="text-white text-[34px] font-medium tracking-tight drop-shadow-md group-hover:scale-110 transition-transform">
                    {isInitializing ? "" : (authUser?.name?.[0]?.toUpperCase() || 'U')}
                  </span>
                )}
                {!isEditingAvatar && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />}
              </div>
              
              {authPartner && !isEditingAvatar && (
                <motion.div 
                  className="absolute -top-1 -right-2 z-20 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="relative">
                    <div className="w-[42px] h-[42px] rounded-full border-[2.5px] border-[#0A0A0C] shadow-[0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden z-10 relative bg-gradient-to-b from-[#1C2C24] to-[#0A1A12]">
                       {authPartner?.avatar ? (
                         <img src={authPartner.avatar} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-emerald-400 font-bold text-[16px] select-none">{authPartner?.name?.[0]?.toUpperCase() || 'P'}</span>
                       )}
                    </div>
                    {/* Static positioned dots — no infinite Framer Motion floats */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-gradient-to-br from-[#30D158] to-[#1E8F3C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] border-[1px] border-[#0A0A0C]" />
                    <div className="absolute top-1 -left-3 w-2 h-2 rounded-full bg-gradient-to-br from-[#30D158] to-[#1E8F3C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] border-[1px] border-[#0A0A0C]" />
                    <div className="absolute -bottom-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#30D158] to-[#1E8F3C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] border-[1px] border-[#0A0A0C]" />
                    <div className="absolute bottom-2 -right-2.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#30D158] to-[#1E8F3C] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] border-[1px] border-[#0A0A0C]" />
                  </div>
                </motion.div>
              )}
              
              {/* Avatar action buttons — Edit / Change / Delete */}
              {!isEditingAvatar && profileImage && (
                <div className="absolute bottom-0 left-[-5px] z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowAvatarMenu(!showAvatarMenu); }}
                    className="w-8 h-8 bg-[#1C1C1E] rounded-full border-[0.5px] border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg cursor-pointer relative"
                  >
                    <MoreHorizontal className="w-4 h-4 text-white/80" />
                  </button>
                  
                  <AnimatePresence>
                    {showAvatarMenu && (
                      <>
                        {/* Invisible backdrop to close menu */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={(e) => { e.stopPropagation(); setShowAvatarMenu(false); }} 
                        />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-10 left-0 w-36 bg-[#1C1C1E] border-[0.5px] border-white/10 rounded-xl p-1.5 shadow-2xl flex flex-col z-50 overflow-hidden"
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowAvatarMenu(false); setIsEditingAvatar(true); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4 text-white/60" />
                            <span>Adjust</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowAvatarMenu(false); fileInputRef.current?.click(); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Camera className="w-4 h-4 text-white/60" />
                            <span>Change</span>
                          </button>
                          <div className="w-full h-px bg-white/5 my-1" />
                          <button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              setShowAvatarMenu(false);
                              setProfileImage(null);
                              updateUser({ avatar: undefined });
                              if (authUser?.id) {
                                await supabase.from('profiles').update({ avatar_url: null }).eq('id', authUser.id);
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400/80" />
                            <span>Remove</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Upload button when no avatar exists */}
              {!isEditingAvatar && !profileImage && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-[-5px] w-8 h-8 bg-[#1C1C1E] rounded-full border-[0.5px] border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg z-20 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-white/80" />
                </div>
              )}

              {isEditingAvatar && (
                <div className="absolute top-[100px] bg-[#1C1C1E] border-[0.5px] border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-3 z-50 w-48 animate-in fade-in zoom-in-95 duration-200">
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
                    disabled={isSavingAvatar}
                    onClick={async () => {
                      if (!profileImage || !authUser?.id) return;
                      setIsSavingAvatar(true);
                      try {
                        // Bake the crop/zoom into a new data URL
                        const finalAvatar = await getCroppedAvatar(profileImage, imageZoom, imagePan);
                        
                        // Save to DB FIRST — this is the source of truth
                        await supabase.from('profiles').update({ avatar_url: finalAvatar }).eq('id', authUser.id);
                        
                        // Then update Zustand + local state
                        updateUser({ avatar: finalAvatar });
                        setProfileImage(finalAvatar);
                        
                        // Reset sliders
                        setImageZoom(1);
                        setImagePan({ x: 0, y: 0 });
                        panRef.current = { x: 0, y: 0 };
                      } catch (err) {
                        console.error('Failed to save avatar:', err);
                      } finally {
                        setIsSavingAvatar(false);
                        // Close editor LAST — only after everything succeeded
                        setIsEditingAvatar(false);
                      }
                    }} 
                    className="w-full py-2 bg-white text-black rounded-xl text-[13px] font-bold hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSavingAvatar ? 'Saving…' : 'Done'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-[24px] font-semibold text-white tracking-tight drop-shadow-md mb-1 min-h-[32px] flex items-center">
            {isInitializing ? (
              <div className="w-32 h-6 bg-white/10 animate-pulse rounded-md" />
            ) : (
              <>{authUser?.name || 'You'} {authPartner ? `& ${authPartner.name}` : ''}</>
            )}
          </h2>
          <div className="mb-7 min-h-[20px] flex items-center justify-center">
            {isInitializing ? (
              <div className="w-48 h-4 bg-white/10 animate-pulse rounded-md" />
            ) : (
              <p className="text-[14px] text-white/50 font-medium">{authUser?.email || 'user@example.com'}</p>
            )}
          </div>
          
          {authPartner ? (
            <div className="flex flex-col items-center gap-4">
              <div className="px-4 py-2 bg-[#0A0A0C] border border-[#30D158]/20 rounded-full flex items-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)]">
                <div className="relative flex items-center justify-center">
                   <div className="absolute w-4 h-4 bg-[#30D158]/20 rounded-full blur-[3px]" />
                   <div className="relative w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                </div>
                <span className="text-[#30D158] font-bold text-[10px] tracking-[0.12em] uppercase pt-[1px]">Partnership Active</span>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[280px] flex flex-col gap-2 items-center">
              <AnimatePresence mode="popLayout">
                {joinStep === 'input' || joinStep === 'verifying' ? (
                  <motion.div 
                    key="input-state"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full flex flex-col gap-2"
                  >
                    <BorderBeam size="line" colorVariant="colorful">
                      <div className="w-full bg-[#121214] rounded-[20px] p-1.5 border-[0.5px] border-white/10 flex items-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <input 
                          type="text" 
                          placeholder="ENTER 6-DIGIT CODE" 
                          className="bg-transparent flex-1 text-white font-mono text-[14px] px-3 outline-none placeholder:text-white/20 tracking-widest uppercase"
                          maxLength={6}
                          disabled={joinStep === 'verifying'}
                        />
                        <button 
                          onClick={handleJoinClick}
                          disabled={joinStep === 'verifying'}
                          className="relative px-5 py-2 bg-[#232325] rounded-[12px] text-white/90 font-medium text-[13px] hover:bg-[#2C2C2F] active:scale-95 transition-all overflow-hidden flex items-center justify-center min-w-[64px] h-[34px]"
                        >
                          <AnimatePresence mode="wait">
                            {joinStep === 'verifying' ? (
                              <motion.div key="orb" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
                                 <ThinkingOrb state="working" size={20} />
                              </motion.div>
                            ) : (
                              <motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                Join
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </BorderBeam>
                    <button 
                      onClick={() => setJoinStep('idle')}
                      className="text-white/40 text-[11px] font-medium tracking-wide hover:text-white/70 transition-colors py-1"
                      disabled={joinStep === 'verifying'}
                    >
                      Cancel
                    </button>
                  </motion.div>
                ) : joinStep === 'matched' ? (
                  <motion.div 
                    key="matched-state"
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center w-full py-4"
                  >
                    <motion.div 
                      initial={{ width: 48, height: 48, borderRadius: 24, opacity: 0 }}
                      animate={{ width: 200, height: 48, borderRadius: 24, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.35, duration: 0.7 }}
                      className="bg-black flex items-center justify-start overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                    >
                       <div className="w-[50px] h-[48px] flex-shrink-0 flex items-center justify-center">
                          <motion.svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#30D158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                         className="text-[#30D158] text-[12px] font-bold tracking-[0.12em] whitespace-nowrap"
                       >
                         PARTNER FOUND
                       </motion.span>
                    </motion.div>
                  </motion.div>
                ) : joinStep === 'welcome' ? null : (
                  <motion.div 
                    key="idle-state"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full flex flex-col gap-2"
                  >
                    <BorderBeam size="line" colorVariant="colorful">
                      <div className="w-full bg-[#121214] rounded-[20px] p-3 border-[0.5px] border-white/5 flex items-center justify-between shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col pl-3">
                            <span className="text-white/40 text-[9px] uppercase tracking-[0.1em] font-bold mb-0.5">Household Code</span>
                            <span className="text-white font-mono text-[16px] tracking-[0.15em] font-medium opacity-90">{mockInviteCode}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleCopyCode} className="w-11 h-11 bg-[#1C1C1E] hover:bg-white/10 rounded-xl border-[0.5px] border-white/5 flex items-center justify-center transition-colors shadow-sm">
                            {copied ? <CheckCircle2 className="w-5 h-5 text-[#30D158]" /> : <Copy className="w-5 h-5 text-white/60" />}
                          </button>
                        </div>
                      </div>
                    </BorderBeam>
                    <motion.button 
                      onClick={() => setJoinStep('input')}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="group mt-2 flex items-center justify-center gap-1.5 py-2.5 px-5 bg-[#1C1C1E]/40 hover:bg-[#1C1C1E]/80 border-[0.5px] border-white/10 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-colors duration-300"
                    >
                      <span className="text-white/50 group-hover:text-white/70 text-[11px] font-medium tracking-wide transition-colors">
                        Have an invite code?
                      </span>
                      <span className="text-white/90 group-hover:text-white text-[11px] font-bold tracking-wide transition-colors">
                        Join Partner
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      <div className="px-6 pt-10 pb-32 z-10 flex flex-col shrink-0">

        {/* Currency Preferences */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Primary Currency</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-full p-1.5 mb-3 flex relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-[#2A2A2C] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-[0.5px] border-white/5" 
                style={{ left: primaryCurrency === 'PHP' ? '6px' : '50%' }} 
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
            <p className="text-white/20 text-[11px] font-medium tracking-wide">Live Rate: {primarySymbol}1.00 = {secondarySymbol}{exchangeRate.toFixed(3)} (Auto-updated)</p>
          </div>
        </motion.div>

        {/* Household Sharing Guide */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
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
                <p className="text-white/40 text-[12px] leading-relaxed">Both partners share full visibility of all household totals and logged expenses.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* App Settings */}
        <motion.div 
          id="settings-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Settings & Security</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden mb-12 shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            <button 
              onClick={() => router.push('/profile/biometrics')}
              className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200 active:bg-white/[0.05] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <ShieldCheck className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Biometrics & PIN</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            <button 
              onClick={() => router.push('/profile/notifications')}
              className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200 active:bg-white/[0.05] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Bell className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            <button 
              onClick={() => router.push('/profile/subscriptions')}
              className="w-full p-5 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200 active:bg-white/[0.05] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <CreditCard className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Subscriptions</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
            <button 
              onClick={() => router.push('/profile/preferences')}
              className="w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-200 active:bg-white/[0.05] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border-[0.5px] border-white/5">
                  <Settings className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">App Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-white/10" />
            </button>
          </div>

          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Onboarding</h3>
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden mb-12 shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            <button 
              onClick={() => alert("Tour coming soon!")}
              className="w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-all duration-200 active:bg-white/[0.05] active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border-[0.5px] border-emerald-500/20">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-white/90 font-medium text-[16px] tracking-tight">Take a Tour</span>
              </div>
              <div className="px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold text-white/70">
                 Start
              </div>
            </button>
          </div>
            
          <div className="bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] overflow-hidden mb-32 shadow-[0_16px_32px_rgba(0,0,0,0.4)]">
            <button 
            onClick={() => setShowSignOutPrompt(true)}
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



      </div>
      
      {/* Full Screen Welcome Overlay */}
      <AnimatePresence>
        {joinStep === 'welcome' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95"
          >
            {/* SVG Filter for Metaballs */}
            <svg width="0" height="0" className="absolute hidden">
              <filter id="gooey-effect">
                <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
              </filter>
            </svg>

            <div className="relative w-full max-w-md flex flex-col items-center justify-center p-8">
              
              {/* Gooey Avatars Container */}
              <div className="relative w-full h-40 flex items-center justify-center mb-10">
                 
                 {/* Background Gooey Layer */}
                 <div className="absolute inset-0 flex items-center justify-center" style={{ filter: 'url(#gooey-effect)' }}>
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
                      className="absolute w-[86px] h-[86px] rounded-full overflow-hidden border-2 border-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#1c1c1e] flex items-center justify-center"
                      initial={{ x: -120, scale: 0.8, y: 0 }}
                      animate={{ x: -60, scale: 1, y: 0 }}
                      transition={{
                        x: { duration: 1.2, type: "spring", bounce: 0.4 },
                        scale: { duration: 1.2, type: "spring", bounce: 0.4 },
                      }}
                    >
                      {profileImage ? (
                        <img src={profileImage} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-3xl font-bold select-none">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </motion.div>
                    <motion.div 
                      className="absolute w-[86px] h-[86px] rounded-full overflow-hidden border-2 border-[#111] shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-[#1c2c24] flex items-center justify-center"
                      initial={{ x: 120, scale: 0.8, y: 0 }}
                      animate={{ x: 60, scale: 1, y: 0 }}
                      transition={{
                        x: { duration: 1.2, type: "spring", bounce: 0.4, delay: 0.1 },
                        scale: { duration: 1.2, type: "spring", bounce: 0.4, delay: 0.1 },
                      }}
                    >
                      {partner?.avatar ? (
                        <img src={partner.avatar} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-emerald-400 text-3xl font-bold select-none">{partner?.name?.[0]?.toUpperCase() || 'P'}</span>
                      )}
                    </motion.div>
                 </div>
              </div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                className="text-white text-3xl font-medium tracking-tight mb-3 text-center"
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
                onClick={() => {
                  joinHousehold("8K9P2X");
                  setJoinStep('idle');
                }}
                className="w-full max-w-[320px] mx-auto py-3.5 bg-[#D1D1D3] text-[#111111] rounded-full font-semibold text-[15px] hover:bg-[#E5E5E5] active:scale-[0.97] transition-all flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_20px_rgba(0,0,0,0.4)]"
              >
                Start Budgeting Together
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
      `}</style>

      {/* Custom Sign Out Modal */}
      <AnimatePresence>
        {showSignOutPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOutPrompt(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="relative w-full max-w-sm bg-[#1C1C1E] rounded-[32px] p-6 shadow-2xl border border-white/10 flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#FF453A]/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-[#FF453A]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Sign Out</h2>
              <p className="text-white/60 text-[15px] leading-relaxed mb-8">
                Are you sure you want to sign out of Duo? You will need to log back in to view your household.
              </p>
              
              <div className="w-full flex gap-3">
                <button 
                  onClick={() => setShowSignOutPrompt(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white font-semibold transition-colors active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/welcome');
                  }}
                  className="flex-1 py-4 bg-[#FF453A] hover:bg-[#FF453A]/90 rounded-2xl text-white font-semibold shadow-[0_4px_12px_rgba(255,69,58,0.3)] transition-colors active:scale-[0.98]"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
