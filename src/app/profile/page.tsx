"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BorderBeam } from "border-beam";
import { ThinkingOrb } from "thinking-orbs";
import { ChevronLeft, Copy, QrCode, ShieldCheck, ChevronRight, Settings, LogOut, CheckCircle2, Users, CreditCard, Bell, Camera, ShoppingCart, AlertTriangle, Trash2, Pencil, MoreHorizontal, Activity } from "lucide-react";
import { PremiumIcon } from "@/components/ui/PremiumStarIcon";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";
import { processAndCompressImage, getCroppedAvatar } from "@/utils/imageUpload";
import { useSpendStore } from "@/store/useSpendStore";
import { PartnerProfileSheet } from "@/components/profile/PartnerProfileSheet";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { primaryCurrency, setPrimaryCurrency, exchangeRate } = useCurrencyStore();
  const { primarySymbol, secondarySymbol } = useDualCurrency();
  const { user: authUser, partner: authPartner, isInitializing, householdId, updateUser } = useAuthStore();
  const spendEntries = useSpendStore(state => state.entries);
  
  const [showSignOutPrompt, setShowSignOutPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditNameSheetOpen, setIsEditNameSheetOpen] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [isPartnerSheetOpen, setIsPartnerSheetOpen] = useState(false);

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

  const handleSaveName = async () => {
    if (!editNameValue.trim() || !authUser?.id) return;
    setIsSavingName(true);
    try {
        await supabase.from('profiles').update({ display_name: editNameValue.trim() }).eq('id', authUser.id);
        updateUser({ name: editNameValue.trim() });
        setIsEditNameSheetOpen(false);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSavingName(false);
    }
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
        className="relative shrink-0 bg-[#0A0A0C] rounded-b-[44px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] border-b border-white/5 z-20 overflow-hidden flex flex-col justify-end min-h-[480px] pb-8 pt-14 px-6"
      >
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#0A0A0C]">
          {profileImage ? (
            <img 
              src={profileImage} 
              className="absolute top-0 left-0 right-0 w-full h-[85%] object-cover" 
              style={{ 
                WebkitMaskImage: 'radial-gradient(ellipse 140% 100% at 50% 0%, black 80%, transparent 100%)', 
                maskImage: 'radial-gradient(ellipse 140% 100% at 50% 0%, black 80%, transparent 100%)' 
              }}
            />
          ) : (
            <div 
              className="w-full h-full bg-gradient-to-br from-[#1C1C1E] to-[#0A0A0C] flex items-center justify-center"
              style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
            >
               <span className="text-white/5 text-[150px] font-bold select-none">{authUser?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          )}
        </div>

        {/* Top Navigation Row */}
        <div className="absolute top-14 left-6 right-6 flex items-center justify-between z-30">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors border-[0.5px] border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
          >
            <ChevronLeft className="w-6 h-6 pr-0.5" />
          </button>
          
          <div className="flex gap-2 relative">
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (profileImage) setShowAvatarMenu(!showAvatarMenu);
                  else fileInputRef.current?.click();
                }}
                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors border-[0.5px] border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
              >
                <Camera className="w-4 h-4" />
              </button>
              
              <AnimatePresence>
                {showAvatarMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowAvatarMenu(false); }} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-12 right-0 w-36 bg-[#1C1C1E]/90 backdrop-blur-xl border-[0.5px] border-white/10 rounded-xl p-1.5 shadow-2xl flex flex-col z-50 overflow-hidden"
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

            <div 
              onClick={() => document.getElementById('settings-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer bg-black/40 backdrop-blur-md rounded-full border-[0.5px] border-white/10 shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            >
               <Settings className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Name and Email at Top */}
        <div className="absolute top-28 left-0 right-0 z-20 flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-[32px] md:text-[40px] leading-none font-extrabold text-white tracking-tight drop-shadow-lg">
              {isInitializing ? (
                <div className="w-48 h-10 bg-white/10 animate-pulse rounded-lg" />
              ) : (
                <>{authUser?.name || 'You'}</>
              )}
            </h1>
            {!isInitializing && (
              <button 
                onClick={() => {
                  setEditNameValue(authUser?.name || '');
                  setIsEditNameSheetOpen(true);
                }}
                className="w-6 h-6 rounded-full bg-black/20 backdrop-blur-md border-[0.5px] border-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all shadow-md"
              >
                <Pencil className="w-3 h-3 text-white/70" />
              </button>
            )}
          </div>
          <div className="min-h-[20px] flex items-center justify-center">
            {isInitializing ? (
              <div className="w-32 h-4 bg-white/10 animate-pulse rounded-md" />
            ) : (
              <p className="text-[13px] text-white/50 font-medium tracking-wide drop-shadow-md">
                 {authUser?.email ? `@${authUser.email.split('@')[0]}` : '@user'}
              </p>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

        {/* The Editor Overlay (Only shown when editing) */}
        {isEditingAvatar && (
           <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md touch-none">
              <div className="relative flex flex-col items-center">
                 <div
                   className="w-[300px] h-[300px] rounded-[40px] overflow-hidden cursor-grab active:cursor-grabbing border border-white/20 shadow-[0_32px_64px_rgba(0,0,0,0.8)] relative"
                   onPointerDown={(e) => {
                     isDraggingRef.current = true;
                     dragStart.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
                     e.currentTarget.setPointerCapture(e.pointerId);
                   }}
                   onPointerMove={(e) => {
                     if (isDraggingRef.current) {
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
                    {profileImage && (
                       <img 
                         src={profileImage} 
                         ref={imgRef} 
                         className="w-full h-full object-cover pointer-events-none will-change-transform"
                         style={{ transform: `scale(${imageZoom}) translate(${imagePan.x / imageZoom}px, ${imagePan.y / imageZoom}px)` }} 
                       />
                    )}
                 </div>

                 <div className="mt-8 bg-[#1C1C1E] border-[0.5px] border-white/10 rounded-2xl p-4 w-64 shadow-2xl">
                   <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center mb-3">Adjust Photo</div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] text-white/50">-</span>
                      <input 
                        type="range" min="1" max="3" step="0.01" 
                        value={imageZoom} 
                        onChange={e => setImageZoom(parseFloat(e.target.value))} 
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-grab" 
                      />
                      <span className="text-[12px] text-white/50">+</span>
                   </div>
                   <div className="text-[10px] text-white/30 text-center mb-4">Drag image to reposition</div>
                   <div className="flex gap-2">
                     <button 
                       disabled={isSavingAvatar}
                       onClick={() => setIsEditingAvatar(false)} 
                       className="flex-1 py-2.5 bg-white/10 text-white rounded-xl text-[13px] font-bold hover:bg-white/20 active:scale-95 transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       disabled={isSavingAvatar}
                       onClick={async () => {
                         if (!profileImage || !authUser?.id) return;
                         setIsSavingAvatar(true);
                         try {
                           const adjustPan = { x: imagePan.x * (92/300), y: imagePan.y * (92/300) };
                           const finalAvatar = await getCroppedAvatar(profileImage, imageZoom, adjustPan);
                           await supabase.from('profiles').update({ avatar_url: finalAvatar }).eq('id', authUser.id);
                           updateUser({ avatar: finalAvatar });
                           setProfileImage(finalAvatar);
                           setImageZoom(1);
                           setImagePan({ x: 0, y: 0 });
                           panRef.current = { x: 0, y: 0 };
                         } catch (err) {
                           console.error('Failed to save avatar:', err);
                         } finally {
                           setIsSavingAvatar(false);
                           setIsEditingAvatar(false);
                         }
                       }} 
                       className="flex-1 py-2.5 bg-white text-black rounded-xl text-[13px] font-bold hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
                     >
                       {isSavingAvatar ? 'Saving…' : 'Done'}
                     </button>
                   </div>
                 </div>
              </div>
           </div>
        )}

        <div 
          onClick={() => { if (authPartner) setIsPartnerSheetOpen(true) }}
          className={`relative z-10 flex items-center justify-between mt-auto w-[calc(100%+20px)] -ml-[10px] p-2.5 rounded-[22px] transition-all duration-300 cursor-pointer group ${authPartner ? 'hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] shadow-sm hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)]' : ''}`}
        >
          {authPartner ? (
            <>
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-[0.5px] border-white/20 shadow-md bg-black/20 flex items-center justify-center">
                  {authPartner.avatar ? (
                    <img src={authPartner.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-[#1C2C24] to-[#0A1A12] flex items-center justify-center">
                      <span className="text-emerald-400 font-bold text-[16px]">{authPartner.name?.[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white text-[15px] font-bold drop-shadow-md group-hover:text-white/90 transition-colors">{authPartner.name?.split(' ')[0] || 'Partner'}</span>
                  <span className="text-white/50 text-[11px] font-medium drop-shadow-md group-hover:text-white/70 transition-colors tracking-wide">Partner</span>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-white group-hover:bg-white/90 active:scale-95 rounded-full flex items-center gap-2 transition-all shadow-lg text-black">
                <span className="text-[18px] font-light leading-none">+</span>
                <span className="text-[14px] font-medium tracking-wide">view</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3.5 opacity-50 px-2">
               <div className="w-12 h-12 rounded-full overflow-hidden border-[0.5px] border-white/20 shadow-md bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white/30 font-bold text-[16px]">?</span>
               </div>
               <div className="flex flex-col text-left">
                 <span className="text-white text-[15px] font-bold drop-shadow-md">No Partner</span>
                 <span className="text-white/50 text-[11px] font-medium drop-shadow-md tracking-wide">Invite below</span>
               </div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="px-6 pt-10 pb-32 z-10 flex flex-col shrink-0">

        {/* Household & Partner Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h3 className="text-white/30 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 px-2">Household & Partner</h3>
          
          <div className="flex overflow-x-auto gap-3 pb-4 px-2 -mx-2 snap-x hide-scrollbar mb-4">
            {/* 1. Partner Card */}
            <div 
              onClick={() => authPartner ? setIsPartnerSheetOpen(true) : null}
              className="w-[140px] h-[155px] shrink-0 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl snap-start cursor-pointer hover:bg-[#2C2C2E] transition-colors"
            >
               <div className="w-full bg-white rounded-[24px] p-3 flex flex-col items-start justify-between h-[80px]">
                 {authPartner ? (
                   <>
                     <div className="flex -space-x-2.5">
                       <div className="w-8 h-8 rounded-full border-[1.5px] border-white overflow-hidden bg-black/10 z-10 relative">
                         {profileImage ? (
                           <img src={profileImage} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full bg-[#1C1C1E] flex items-center justify-center">
                              <span className="text-white/70 font-bold text-[12px]">{authUser?.name?.[0]?.toUpperCase() || 'U'}</span>
                            </div>
                         )}
                       </div>
                       <div className="w-8 h-8 rounded-full border-[1.5px] border-white overflow-hidden bg-black/10 z-20 relative">
                         {authPartner.avatar ? (
                           <img src={authPartner.avatar} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full bg-[#1C1C1E] flex items-center justify-center">
                              <span className="text-[#30D158] font-bold text-[12px]">{authPartner.name?.[0]?.toUpperCase() || 'P'}</span>
                            </div>
                         )}
                       </div>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-black font-bold text-[15px] leading-none truncate max-w-[100px] mb-0.5">{authPartner.name?.split(' ')[0] || 'Partner'}</span>
                       <span className="text-black/50 text-[9px] font-bold uppercase tracking-wider leading-none">Partner</span>
                     </div>
                   </>
                 ) : (
                   <>
                     <span className="text-black font-bold text-[24px] leading-tight mt-0.5">{householdId ? '1' : '0'}</span>
                     <span className="text-black/50 text-[10px] font-bold uppercase tracking-wider">Members</span>
                   </>
                 )}
               </div>
               
               <div className="px-2 pb-2 pt-1 flex justify-between items-end">
                 <span className="text-white/50 text-[10px] font-semibold leading-tight">Shared<br/>Account</span>
                 <div className="w-8 h-8 rounded-full bg-[#0A84FF] flex items-center justify-center shadow-none">
                   <Users className="text-white w-4 h-4" />
                 </div>
               </div>
            </div>

            {/* 2. Logs Card */}
            <div className="w-[140px] h-[155px] shrink-0 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl snap-start">
               <div className="w-full bg-[#2C2C2E] rounded-[24px] p-3 flex flex-col items-start justify-between h-[80px]">
                 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-white font-bold text-[20px] leading-none mb-1">{spendEntries.length}</span>
                   <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Logs</span>
                 </div>
               </div>
               
               <div className="px-2 pb-2 pt-1 flex justify-between items-end">
                 <span className="text-white/50 text-[10px] font-semibold leading-tight">Monthly<br/>Entries</span>
                 <div className="w-8 h-8 rounded-full bg-[#FF9F0A] flex items-center justify-center shadow-none">
                   <ChevronRight className="text-black w-4 h-4" />
                 </div>
               </div>
            </div>

            {/* 3. Status Card */}
            <div className="w-[140px] h-[155px] shrink-0 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl snap-start">
               <div className="w-full bg-white rounded-[24px] p-3 flex flex-col items-start justify-between h-[80px]">
                 <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#30D158] shadow-none" />
                    <span className="text-black font-bold text-[15px] leading-none tracking-tight">Active</span>
                 </div>
                 <span className="text-black/50 text-[10px] font-bold uppercase tracking-wider">Status</span>
               </div>
               
               <div className="px-2 pb-2 pt-1 flex justify-between items-end">
                 <span className="text-white/50 text-[10px] font-semibold leading-tight">Household<br/>Admin</span>
                 <div className="w-8 h-8 rounded-full bg-[#30D158] flex items-center justify-center shadow-none">
                   <ShieldCheck className="text-black w-4 h-4" />
                 </div>
               </div>
            </div>

            {/* 4. Joined Card */}
            <div className="w-[140px] h-[155px] shrink-0 bg-[#1C1C1E] rounded-[32px] flex flex-col justify-between p-2 shadow-xl snap-start">
               <div className="w-full bg-[#2C2C2E] rounded-[24px] p-3 flex flex-col items-start justify-between h-[80px]">
                 <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <PremiumIcon className="w-3 h-3 text-white" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-white font-bold text-[20px] leading-none mb-1">2026</span>
                   <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Joined</span>
                 </div>
               </div>
               
               <div className="px-2 pb-2 pt-1 flex justify-between items-end">
                 <span className="text-white/50 text-[10px] font-semibold leading-tight">Member<br/>Since</span>
                 <div className="w-8 h-8 rounded-full bg-[#BF5AF2] flex items-center justify-center shadow-none">
                   <CheckCircle2 className="text-white w-4 h-4" />
                 </div>
               </div>
            </div>

          </div>

          <div className="flex flex-col gap-4 mb-10">
            {!authPartner && (
              <div className="w-full flex flex-col items-center gap-2 mb-2">
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
                      className="w-full flex flex-col items-center justify-center"
                    >
                      <motion.button 
                        onClick={() => setJoinStep('input')}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="group flex items-center justify-center gap-1.5 py-3 px-6 bg-[#1C1C1E] hover:bg-[#2C2C2F] border-[0.5px] border-white/10 rounded-full shadow-md transition-colors duration-300 w-full"
                      >
                        <span className="text-white/50 group-hover:text-white/70 text-[13px] font-medium tracking-wide transition-colors">
                          Have an invite code?
                        </span>
                        <span className="text-white/90 group-hover:text-white text-[13px] font-bold tracking-wide transition-colors">
                          Join Partner
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <BorderBeam size="line" colorVariant="mono">
              <div className="w-full bg-[#0A0A0C] rounded-[28px] p-5 border-[0.5px] border-white/5 flex items-center justify-between shadow-[0_16px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                <div className="flex flex-col relative z-10">
                  <span className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-bold mb-1">Household Invite Code</span>
                  <span className="text-white font-mono text-[22px] tracking-[0.15em] font-medium opacity-90">{mockInviteCode}</span>
                </div>
                <button onClick={handleCopyCode} className="w-12 h-12 relative z-10 bg-[#1C1C1E] hover:bg-white/10 rounded-full border-[0.5px] border-white/5 flex items-center justify-center transition-colors shadow-sm">
                  {copied ? <CheckCircle2 className="w-5 h-5 text-[#30D158]" /> : <Copy className="w-5 h-5 text-white/60" />}
                </button>
              </div>
            </BorderBeam>
          </div>
        </motion.div>

        {/* Currency Preferences */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
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
                <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center border-[0.5px] border-white/5">
                  <PremiumIcon className="w-4 h-4 text-white/70" />
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
            className="w-full p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors group active:bg-white/[0.05]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center transition-colors border-[0.5px] border-white/5">
                  <LogOut className="w-4 h-4 text-[#FF453A]" />
                </div>
                <span className="text-[#FF453A] font-medium text-[16px] tracking-tight">Sign Out</span>
              </div>
            </button>
          </div>
        </motion.div>



      </div>
      
      {/* Edit Name Sheet */}
      <AnimatePresence>
        {isEditNameSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => setIsEditNameSheetOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C] border-t border-white/10 rounded-t-[32px] p-6 z-[201] shadow-[0_-16px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <h3 className="text-[20px] font-semibold text-white tracking-tight mb-2">Edit Display Name</h3>
              <p className="text-white/40 text-[14px] mb-6">This is your personal name, visible to you and your partner.</p>
              
              <div className="bg-[#1C1C1E] border-[0.5px] border-white/10 rounded-[16px] p-1.5 mb-6 shadow-inner">
                <input 
                  type="text" 
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-transparent text-white text-[16px] px-4 py-3 outline-none placeholder:text-white/20 font-medium"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditNameSheetOpen(false)}
                  className="flex-1 py-4 rounded-[16px] bg-[#1C1C1E] text-white/80 font-semibold text-[15px] hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveName}
                  disabled={isSavingName || !editNameValue.trim()}
                  className="flex-1 py-4 rounded-[16px] bg-white text-black font-semibold text-[15px] hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {isSavingName ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Partner Profile Sheet Overlay */}
      <PartnerProfileSheet 
        isOpen={isPartnerSheetOpen}
        onClose={() => setIsPartnerSheetOpen(false)}
        partner={authPartner}
        householdId={householdId}
      />

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
