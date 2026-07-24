"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X, Copy, Check, Radar, Clock, Flame, Navigation, Database } from "lucide-react";
import { ThinkingOrb } from "thinking-orbs";
import { BorderBeam } from 'border-beam';

interface Deal {
  id: string;
  brand: string;
  title: string;
  code: string;
  expires: string;
  category: string;
  hot: boolean;
  url: string;
}

interface CashbackDealsRadarProps {
  onClose: () => void;
}

const DealCard = ({ deal, index, getBrandColor, getBrandArtwork, handleCopy, copiedId, scrollContainerRef }: any) => {
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    container: scrollContainerRef,
    offset: ["start 40px", "start -150px"] // Fades out as it scrolls 190px past the sticky point
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.3, 0]);
  const filter = useTransform(scrollYProgress, [0, 1], ["brightness(1)", "brightness(0.3)"]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <div ref={targetRef} className="relative h-[250px] mb-4">
      <motion.div
        className="sticky top-[40px] will-change-transform"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.05, 0.5), type: "tween", duration: 0.15, ease: "easeOut" }}
        style={{
          scale,
          opacity,
          filter,
          y,
          zIndex: index,
        }}
      >
        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-row h-[220px]">
          
          {/* Left Side: Content */}
          <div className="flex flex-col gap-5 flex-1 relative z-20 pr-32">
              <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-bold overflow-hidden ${getBrandColor(deal.brand).split(' ').slice(0, 3).join(' ')}`}>
                      <img 
                          src={`https://icon.horse/icon/${
                              deal.brand === 'Foodpanda' ? 'foodpanda.ph' :
                              deal.brand === 'Grab' ? 'grab.com' :
                              deal.brand === 'Shopee' ? 'shopee.ph' :
                              deal.brand === 'Lazada' ? 'lazada.com.ph' :
                              deal.brand === 'Klook' ? 'klook.com' :
                              deal.brand === 'Agoda' ? 'agoda.com' :
                              deal.brand === 'Cheapflights' ? 'cheapflights.com' :
                              'example.com'
                          }`} 
                          alt={deal.brand}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                      />
                      <span className="hidden">{deal.brand.substring(0, 1)}</span>
                  </div>
                  <span className="text-white/80 text-xs font-bold tracking-widest uppercase drop-shadow-md">
                      {deal.brand}
                  </span>
              </div>
              
              <h3 className="text-white text-[28px] font-light leading-[1.1] tracking-tight drop-shadow-md">
                  {deal.title}
              </h3>
              
              <div className="flex items-center gap-3 mt-auto pt-2">
                <button
                    onClick={() => handleCopy(deal.id, deal.code)}
                    className={`flex items-center justify-center w-11 h-11 rounded-full transition-all overflow-hidden relative backdrop-blur-md shadow-md ${
                    copiedId === deal.id 
                        ? "bg-[#34C759] text-white" 
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                    title="Copy Promo Code"
                >
                    {copiedId === deal.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                
                <a
                    href={deal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 px-6 h-11 rounded-full text-[13px] font-extrabold tracking-widest uppercase transition-all overflow-hidden relative bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                >
                    Claim
                </a>
              </div>
          </div>

          {/* Right Side: Generated 3D Artwork */}
          <div className="absolute right-[-30px] top-1/2 -translate-y-1/2 w-[220px] h-[220px] pointer-events-none z-10 opacity-100 mix-blend-screen"
               style={{
                   maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
                   WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)'
               }}>
              {getBrandArtwork(deal.brand) && (
                  <Image 
                      src={getBrandArtwork(deal.brand)} 
                      alt={`${deal.brand} artwork`}
                      width={220}
                      height={220}
                      className="w-full h-full object-contain filter contrast-125 brightness-110 drop-shadow-2xl"
                      unoptimized={false}
                  />
              )}
          </div>
          
          {/* Hot Badge Overlay */}
          {deal.hot && (
              <div className="absolute top-6 right-6 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-[#FF9500]/30 backdrop-blur-md shadow-lg">
                  <Flame className="w-3.5 h-3.5 text-[#FF9500]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#FF9500]">Hot</span>
              </div>
          )}
          
        </div>
      </motion.div>
    </div>
  );
};

export function CashbackDealsRadar({ onClose }: CashbackDealsRadarProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "results">("idle");
  const [location, setLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reference for the scroll container to enable Framer Motion scroll effects if needed,
  // though we will achieve the core stacking effect using high-performance CSS sticky.
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const filters = ["All", "Foodpanda", "Grab", "Shopee", "Lazada", "Klook", "Agoda", "Cheapflights"];
  const locationShortcuts = ["Metro Manila", "Cebu", "Palawan", "Online Only"];

  const loadMockData = () => {
    setScanStatus("scanning");
    setTimeout(() => {
      setDeals([
        { id: "1", brand: "Foodpanda", title: "₱100 off on minimum spend ₱499", code: "PANDA100", expires: "2026-08-01T00:00:00Z", category: "Food", hot: true, url: "#" },
        { id: "2", brand: "Grab", title: "20% off GrabCar (max ₱80)", code: "GRAB20", expires: "2026-07-26T00:00:00Z", category: "Transport", hot: false, url: "#" },
        { id: "3", brand: "Shopee", title: "Free Shipping Vouchers", code: "FREESHIP", expires: "2026-08-01T00:00:00Z", category: "Shopping", hot: true, url: "#" },
        { id: "4", brand: "Lazada", title: "₱250 off Tech Accessories", code: "LAZTECH", expires: "2026-07-30T00:00:00Z", category: "Shopping", hot: false, url: "#" },
        { id: "5", brand: "Klook", title: "15% off Weekend Getaways", code: "WKND15", expires: "2026-08-15T00:00:00Z", category: "Travel", hot: true, url: "#" },
        { id: "6", brand: "Agoda", title: "₱500 off Hotel Bookings", code: "AGODA500", expires: "2026-08-10T00:00:00Z", category: "Travel", hot: false, url: "#" },
        { id: "7", brand: "Foodpanda", title: "Free Delivery on Pick-Up", code: "PICKUPFREE", expires: "2026-07-31T00:00:00Z", category: "Food", hot: false, url: "#" },
        { id: "8", brand: "Grab", title: "₱50 off GrabFood orders", code: "FOOD50", expires: "2026-08-05T00:00:00Z", category: "Food", hot: false, url: "#" },
        { id: "9", brand: "Shopee", title: "10% Cashback on Gadgets", code: "GADGET10", expires: "2026-08-02T00:00:00Z", category: "Shopping", hot: true, url: "#" },
        { id: "10", brand: "Cheapflights", title: "₱1000 off International Flights", code: "FLY1000", expires: "2026-09-01T00:00:00Z", category: "Travel", hot: true, url: "#" },
      ]);
      setScanStatus("results");
    }, 1500);
  };

  const startScan = async () => {
    setScanStatus("scanning");
    try {
      const queryParam = location.trim() ? `?location=${encodeURIComponent(location.trim())}` : "";
      const res = await fetch(`/api/deals${queryParam}`);
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (error) {
      console.error("Failed to fetch deals", error);
    } finally {
      setScanStatus("results");
    }
  };

  const filteredDeals = activeFilter === "All" 
    ? deals 
    : deals.filter((d) => d.brand === activeFilter);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Foodpanda": return "text-[#D70F64] bg-[#D70F64]/10 border-[#D70F64]/20 ring-[#D70F64]";
      case "Grab": return "text-[#00B14F] bg-[#00B14F]/10 border-[#00B14F]/20 ring-[#00B14F]";
      case "Shopee": return "text-[#EE4D2D] bg-[#EE4D2D]/10 border-[#EE4D2D]/20 ring-[#EE4D2D]";
      case "Lazada": return "text-[#3877FF] bg-[#3877FF]/10 border-[#3877FF]/20 ring-[#3877FF]";
      case "Klook": return "text-[#FF5722] bg-[#FF5722]/10 border-[#FF5722]/20 ring-[#FF5722]";
      case "Agoda": return "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/20 ring-[#38BDF8]";
      case "Cheapflights": return "text-[#00A3E0] bg-[#00A3E0]/10 border-[#00A3E0]/20 ring-[#00A3E0]";
      default: return "text-white/80 bg-white/10 border-white/20 ring-white";
    }
  };

  const getBrandArtwork = (brand: string) => {
    switch (brand) {
      case "Foodpanda": return "/assets/deals/foodpanda.png";
      case "Grab": return "/assets/deals/grab.png";
      case "Shopee": return "/assets/deals/shopee.png";
      case "Lazada": return "/assets/deals/shopee.png"; // shared bag art
      case "Klook": return "/assets/deals/travel.png";
      case "Agoda": return "/assets/deals/travel.png";
      case "Cheapflights": return "/assets/deals/travel.png";
      default: return ""; // Fallback
    }
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0A0A0C] overflow-hidden"
    >
      {/* Scanning Radar Background Effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A84FF]/20 via-[#0A0A0C]/0 to-transparent pointer-events-none opacity-50"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {scanStatus === "scanning" && (
            <motion.div 
              animate={{ y: ["0%", "100%", "0%"] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-full h-1 bg-gradient-to-r from-transparent via-[#0A84FF]/30 to-transparent blur-sm"
            />
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 relative z-10 pt-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0A84FF]/20 flex items-center justify-center border border-[#0A84FF]/30 shadow-[0_0_15px_rgba(10,132,255,0.2)]">
            <Radar className="w-5 h-5 text-[#0A84FF]" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-white text-xl font-medium tracking-tight">Deals Radar</h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${scanStatus === 'scanning' ? 'bg-[#34C759] animate-pulse' : scanStatus === 'idle' ? 'bg-[#0A84FF]' : 'bg-white/50'}`}></span>
              <span className="text-white/50 text-[11px] font-bold tracking-widest uppercase">
                  {scanStatus === 'scanning' ? 'Live Scanning' : scanStatus === 'idle' ? 'Ready' : 'Scan Complete'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {scanStatus === "idle" && (
          <div className="flex-1 flex flex-col justify-center px-6 pb-32 relative z-10">
              {/* Static Dotted Canvas Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-30">
                  <div 
                      className="absolute inset-0"
                      style={{
                          backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                          maskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)',
                          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 80%)'
                      }}
                  />
              </div>

              <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
                  className="flex flex-col gap-10 w-full max-w-sm mx-auto relative"
              >
                  <div className="text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-3xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)]">
                          <Navigation className="w-8 h-8 text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                      </div>
                      <h3 className="text-white text-[28px] font-medium tracking-tight mb-2">Target Location</h3>
                      <p className="text-white/40 text-[15px] font-light">Where are we hunting for deals?</p>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                      <div className="relative group">
                          {/* Inner glow effect on focus/hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                          <input 
                              type="text" 
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              placeholder="e.g. Metro Manila, Cebu..."
                              className="relative w-full bg-[#121212] border border-white/10 rounded-3xl px-6 py-5 text-white text-[19px] font-medium placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(0,0,0,0.3)] z-10"
                          />
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-2.5">
                          {locationShortcuts.map(loc => (
                              <button
                                  key={loc}
                                  onClick={() => setLocation(loc)}
                                  className={`px-4 py-2.5 rounded-full text-[13px] font-semibold tracking-wide transition-all border relative overflow-hidden group ${
                                      location === loc
                                          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                          : "bg-[#1C1C1E] text-white/60 border-white/10 hover:bg-[#2C2C2E] hover:text-white"
                                  }`}
                              >
                                  {/* Glass sheen on hover */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                  <span className="relative z-10">{loc}</span>
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="relative w-full mt-4">
                      <BorderBeam size="pulse-inner" colorVariant="colorful">
                          <motion.button 
                              onClick={startScan}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full relative group overflow-hidden rounded-[24px] bg-[#111]"
                          >
                              <div className="relative px-6 py-5 flex items-center justify-center gap-3 z-10">
                                  <Radar className="w-5 h-5 text-white drop-shadow-md" />
                                  <span className="text-white font-bold tracking-[0.15em] uppercase text-[15px] drop-shadow-md">
                                      Initialize Scan
                                  </span>
                              </div>
                          </motion.button>
                      </BorderBeam>
                  </div>

                  {/* MOCK DATA BUTTON */}
                  <motion.button 
                      onClick={loadMockData}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full group overflow-hidden rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                      <div className="relative px-6 py-3 flex items-center justify-center gap-2 z-10">
                          <Database className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
                          <span className="text-white/50 group-hover:text-white/80 font-bold tracking-[0.1em] uppercase text-[11px] transition-colors">
                              Load Long Mock Data (Test Scroll)
                          </span>
                      </div>
                  </motion.button>
              </motion.div>
          </div>
      )}

      {scanStatus !== "idle" && (
          <>
            {/* Filters */}
            <div className="px-6 py-2 pb-4 overflow-x-auto no-scrollbar flex items-center gap-2 relative z-10 shrink-0">
                {filters.map((filter) => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all border ${
                    activeFilter === filter
                        ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        : "bg-white/5 text-white/60 border-white/5 hover:bg-white/10"
                    }`}
                >
                    {filter}
                </button>
                ))}
            </div>

            {/* Deals Feed */}
            <div 
               ref={scrollContainerRef}
               className="flex-1 overflow-y-auto px-6 pb-[60vh] relative z-10 no-scrollbar"
               style={{ scrollBehavior: 'smooth' }}
            >
                {scanStatus === "scanning" ? (
                <div className="flex flex-col items-center justify-center h-40 gap-6 opacity-70 mt-10">
                    <ThinkingOrb state="solving" size={64} speed={1.15} />
                    <span className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase text-center px-4">
                        Scanning for deals in {location || 'the Philippines'}...
                    </span>
                </div>
                ) : filteredDeals.length > 0 ? (
                <div className="flex flex-col gap-0 relative pt-2">
                    <div className="flex items-center gap-2 mb-4 px-2 sticky top-0 z-50 bg-[#0A0A0C]/80 backdrop-blur-md py-2 -mx-2">
                        <span className="text-white/50 text-xs font-bold tracking-widest uppercase ml-2">
                            Here are some of the deals in {location || 'the Philippines'}
                        </span>
                    </div>
                    <AnimatePresence>
                    {filteredDeals.map((deal, i) => (
                        <DealCard 
                            key={deal.id}
                            deal={deal}
                            index={i}
                            getBrandColor={getBrandColor}
                            getBrandArtwork={getBrandArtwork}
                            handleCopy={handleCopy}
                            copiedId={copiedId}
                            scrollContainerRef={scrollContainerRef}
                        />
                    ))}
                    </AnimatePresence>
                </div>
                ) : (
                <div className="flex flex-col items-center justify-center h-40 opacity-50">
                    <span className="text-white/60 text-xs font-medium tracking-widest uppercase">No active deals found</span>
                </div>
                )}
            </div>
          </>
      )}
      
      {/* Toast Notification for Copy (Floating at bottom) */}
      <AnimatePresence>
        {copiedId && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#34C759] text-[#0A0A0C] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_8px_30px_rgba(52,199,89,0.3)] z-[110]"
          >
            <Check className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">Promo code copied to clipboard</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

