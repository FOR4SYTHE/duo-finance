"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, X, AlertCircle, ArrowRight, ImageIcon, Sparkles } from 'lucide-react';
import { useDualCurrency } from '@/hooks/useDualCurrency';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';
import { useAIChatStore } from '@/store/useAIChatStore';

interface ScannedItem {
    name: string;
    brand: string | null;
    category: string;
    description: string;
}

interface Listing {
    name: string;
    price_php: number;
    source: string;
    url: string;
    description: string;
}

export function AIScannerView() {
    const [imageStr, setImageStr] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [identifiedItem, setIdentifiedItem] = useState<ScannedItem | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const { getSecondaryValue, primarySymbol, secondarySymbol } = useDualCurrency();
    const { setActiveTab, setScannerExpanded, setScannerHasResults, startNewChat, addUserMessage, startAssistantMessage, setPendingScanContext } = useAIChatStore();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);
        setIdentifiedItem(null);
        setListings([]);
        setIsScanning(true);
        setScannerHasResults(false);
        setIsSheetExpanded(false);
        setScannerExpanded(false);

        try {
            // Read file as base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                setImageStr(base64data);
                
                // Extract base64 part and mimeType
                const mimeType = base64data.split(';')[0].split(':')[1];
                const base64Image = base64data.split(',')[1];

                try {
                    const response = await fetch('/api/ai/scan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64Image, mimeType })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to scan image');
                    }

                    const data = await response.json();
                    setIdentifiedItem(data.item);
                    setListings(data.listings || []);
                    setScannerHasResults(true);
                } catch (err: any) {
                    setError(err.message || 'Error communicating with AI server.');
                } finally {
                    setIsScanning(false);
                }
            };
        } catch (err: any) {
            setError('Failed to process image file.');
            setIsScanning(false);
        }
    };

    const handleReset = () => {
        setImageStr(null);
        setIdentifiedItem(null);
        setListings([]);
        setError(null);
        setIsSheetExpanded(false);
        setScannerExpanded(false);
        setScannerHasResults(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="absolute inset-0 bg-[#050505] overflow-hidden flex flex-col z-40">
            
            {/* Hidden File Input (Always in DOM) */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileChange}
            />
            <input 
                type="file" 
                ref={galleryInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />

            {/* Error Banner overlaying the top */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-20 left-4 right-4 z-50"
                    >
                        <div className="bg-[#1C1C1E]/95 backdrop-blur-xl border border-red-500/20 rounded-[20px] p-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-sm mx-auto">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[13px] font-medium text-white/90 leading-snug">{error}</p>
                            </div>
                            <button onClick={() => setError(null)} className="p-2 -mr-2 text-white/40 hover:text-white/80 transition-colors rounded-full hover:bg-white/5 active:scale-95">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Viewfinder Empty State */}
            <AnimatePresence>
                {!imageStr && !isScanning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex flex-col items-center justify-center"
                    >
                        {/* Simulating dark sleek camera background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1C1E] via-[#0A0A0A] to-[#050505]" />
                        
                        {/* Static Center Reticle with Instruction inside */}
                        <div className="relative w-72 h-72 flex items-center justify-center z-10 pointer-events-none">
                            {/* Reticle Brackets */}
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-white/80 rounded-tl-[24px]" />
                            <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-white/80 rounded-tr-[24px]" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-white/80 rounded-bl-[24px]" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-white/80 rounded-br-[24px]" />

                            {/* Instructional Pill in Center */}
                            <div className="bg-[#1C1C1E] border border-white/[0.08] px-6 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                                <span className="text-[13px] font-medium text-white/90 tracking-wide">Find a product or barcode</span>
                            </div>
                        </div>

                        {/* Bottom Actions Row */}
                        <div className="absolute bottom-12 left-0 w-full px-8 flex items-center justify-between z-10">
                            {/* Gallery Upload (Replacing old X button) */}
                            <button 
                                onClick={() => galleryInputRef.current?.click()}
                                className="w-14 h-14 rounded-full bg-[#1C1C1E] border border-white/[0.05] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2C2C2E] transition-colors shadow-lg"
                                title="Upload Photo"
                            >
                                <ImageIcon className="w-6 h-6" />
                            </button>
                            
                            {/* Primary Capture Button */}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-[84px] h-[84px] rounded-full bg-[#1C1C1E] border-[3px] border-white/80 text-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-transform shrink-0"
                            >
                                <DuoAIIcon forceState="star-idle" className="w-10 h-10" />
                            </button>

                            {/* Flashlight */}
                            <button className="w-14 h-14 rounded-full bg-[#1C1C1E] border border-white/[0.05] flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2C2C2E] transition-colors shadow-lg">
                                <Zap className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scanning & Results States */}
            <AnimatePresence>
                {imageStr && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col"
                    >
                        {/* Scanned Image Background (Clickable to reset) */}
                        <div 
                            className="absolute inset-0 z-0 bg-black cursor-pointer"
                            onClick={!isScanning ? handleReset : undefined}
                        >
                            <img 
                                src={imageStr} 
                                alt="Scanned" 
                                className={`w-full h-full object-cover transition-all duration-700 ${!isScanning ? 'opacity-30 blur-sm scale-105' : 'opacity-80 scale-100'}`} 
                            />
                            {/* Dark gradient overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent pointer-events-none" />
                        </div>

                        {/* Scanning Animation State */}
                        {isScanning && (
                            <div className="absolute inset-0 z-10">
                                {/* CSS-Only High-Performance Scanning Line */}
                                <div className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_30px_rgba(255,255,255,1)] animate-[scan_2.5s_linear_infinite]" />
                                
                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#1C1C1E] border border-white/[0.08] px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                                    <DuoAIIcon className="w-5 h-5 text-white animate-spin" />
                                    <span className="text-[14px] font-medium text-white tracking-wide">Analyzing item...</span>
                                </div>
                            </div>
                        )}

                        {/* Results Bottom Sheet */}
                        {identifiedItem && !isScanning && (
                            <motion.div 
                                drag="y"
                                dragConstraints={{ top: 0, bottom: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(e, info) => {
                                    if (info.offset.y < -50) {
                                        setIsSheetExpanded(true); // Dragged up
                                        setScannerExpanded(true);
                                    }
                                    if (info.offset.y > 50) {
                                        setIsSheetExpanded(false); // Dragged down
                                        setScannerExpanded(false);
                                    }
                                }}
                                initial={{ y: '100%' }}
                                animate={{ y: isSheetExpanded ? '0%' : '45vh' }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className={`absolute top-0 left-0 w-full h-full bg-[#1C1C1E] shadow-[0_-10px_50px_rgba(0,0,0,0.5)] z-20 flex flex-col transition-all duration-300 ${isSheetExpanded ? 'rounded-none' : 'rounded-t-[32px]'}`}
                            >
                                {/* Drag Indicator */}
                                <div className="w-full flex justify-center py-4 shrink-0 cursor-grab active:cursor-grabbing">
                                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                                </div>

                                <div className="px-6 pb-8 overflow-y-auto no-scrollbar flex-1 flex flex-col">
                                    {/* Item Header */}
                                    <div className="mb-6">
                                        {identifiedItem.brand && (
                                            <span className="text-xs font-bold tracking-[0.15em] uppercase text-white/40 mb-2 block">
                                                {identifiedItem.brand}
                                            </span>
                                        )}
                                        <h3 className="text-3xl font-semibold text-white leading-tight mb-3">
                                            {identifiedItem.name}
                                        </h3>
                                        <p className="text-[15px] text-white/60 leading-relaxed">
                                            {identifiedItem.description}
                                        </p>
                                    </div>

                                    {/* Price Listings */}
                                    <div className="mb-6 flex-1">
                                        <h4 className="text-[11px] font-bold text-white/40 mb-3 uppercase tracking-wider">Available Prices</h4>
                                        {listings.length === 0 ? (
                                            <div className="text-center py-8 bg-[#0A0A0A] rounded-[24px] border border-white/[0.05]">
                                                <p className="text-[14px] text-white/40">No online listings found for this item.</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {listings.map((listing, i) => {
                                                    const numericPrice = typeof listing.price_php === 'number' 
                                                        ? listing.price_php 
                                                        : (parseFloat(String(listing.price_php || '0').replace(/,/g, '')) || 0);
                                                        
                                                    return (
                                                        <a 
                                                            key={i} 
                                                            href={listing.url} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="bg-gradient-to-br from-[#222224] to-[#151515] p-4 rounded-[20px] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.2)] hover:border-white/[0.15] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group flex items-center justify-between"
                                                        >
                                                            <div className="flex-1 pr-4">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <span className="text-[10px] font-bold text-[#E5E5EA] bg-white/[0.08] px-2.5 py-1 rounded-full uppercase tracking-widest shadow-inner">
                                                                        {listing.source}
                                                                    </span>
                                                                </div>
                                                                <h5 className="text-[14px] font-medium text-white/90 line-clamp-1 group-hover:text-white transition-colors">
                                                                    {listing.name}
                                                                </h5>
                                                            </div>
                                                            <div className="flex flex-col items-end shrink-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl font-bold text-white tracking-tight">
                                                                        {primarySymbol}{numericPrice.toLocaleString()}
                                                                    </span>
                                                                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors group-hover:translate-x-1 duration-300" />
                                                                </div>
                                                                <span className="text-[12px] text-white/50 font-medium tracking-wide">
                                                                    {secondarySymbol}{getSecondaryValue(numericPrice).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons & Transparency */}
                                    <div className="mt-4 pt-4 border-t border-white/[0.05] flex flex-col gap-3">
                                        <button 
                                            onClick={() => {
                                                // Set scan context for AIChatView to pick up
                                                setPendingScanContext({
                                                    itemName: identifiedItem?.name || 'Unknown Item',
                                                    brand: identifiedItem?.brand || null,
                                                    description: identifiedItem?.description || '',
                                                    listings: listings.map(l => ({ name: l.name, price_php: l.price_php, source: l.source, url: l.url }))
                                                });
                                                // Create a new chat tagged as scan
                                                startNewChat();
                                                setActiveTab('chat');
                                            }}
                                            className="w-full py-4 bg-[#F5F5F7] text-[#1D1D1F] font-semibold tracking-wide rounded-[20px] shadow-[0_4px_20px_rgba(255,255,255,0.08)] hover:bg-white hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2.5"
                                        >
                                            <DuoAIIcon forceState="star-idle" className="w-[18px] h-[18px]" />
                                            Ask DUO AI about this
                                        </button>

                                        <button 
                                            onClick={handleReset}
                                            className="w-full py-4 bg-[#1C1C1E] border border-white/[0.08] hover:border-white/20 hover:bg-[#2C2C2E] text-white font-medium tracking-wide rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-[0.98]"
                                        >
                                            Scan Another Item
                                        </button>
                                        
                                        <div className="text-center pb-6">
                                            <p className="text-[11px] text-white/30 leading-relaxed max-w-[280px] mx-auto">
                                                Prices are aggregated from online retailers via web search. Availability and physical store pricing may vary.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
