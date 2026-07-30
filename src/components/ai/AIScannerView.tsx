"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Loader2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useDualCurrency } from '@/hooks/useDualCurrency';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';

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
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { getSecondaryValue, primarySymbol, secondarySymbol } = useDualCurrency();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state
        setError(null);
        setIdentifiedItem(null);
        setListings([]);
        setIsScanning(true);

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
                    if (data.searchError) {
                        // Optional: we could show a toast that price search failed but vision succeeded
                    }
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
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] overflow-y-auto pb-32">
            
            {/* Header */}
            <div className="p-6 pb-2">
                <h2 className="text-xl font-medium text-white mb-1">Shopping Scanner</h2>
                <p className="text-sm text-white/50">Identify items and compare prices</p>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 py-2"
                    >
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200 leading-snug">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-6 flex flex-col gap-6">
                {/* Initial State / Image Capture */}
                {!imageStr && !isScanning && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center justify-center cursor-pointer group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Camera className="w-7 h-7 text-white/80" />
                        </div>
                        <h3 className="text-base font-medium text-white">Tap to Scan</h3>
                        <p className="text-sm text-white/40 mt-1">Take a photo or upload an image</p>
                    </motion.div>
                )}

                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment" // Suggests camera on mobile
                    onChange={handleFileChange}
                />

                {/* Scanning / Loading State */}
                {imageStr && isScanning && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
                            <img src={imageStr} alt="Scanning" className="w-full h-full object-cover blur-[2px] scale-105" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <DuoAIIcon className="w-12 h-12 text-white animate-pulse" />
                            </div>
                            {/* Scanning line animation */}
                            <motion.div 
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-white/50 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                            />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">Identifying item...</h3>
                        <p className="text-sm text-white/50">Searching for current prices</p>
                    </motion.div>
                )}

                {/* Results State */}
                {identifiedItem && !isScanning && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Identified Item Hero */}
                        <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/[0.05] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <ShoppingBag className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 flex gap-4 items-start">
                                {imageStr && (
                                    <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border border-white/10">
                                        <img src={imageStr} alt="Scanned" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    {identifiedItem.brand && (
                                        <span className="text-xs font-bold tracking-wider uppercase text-white/40 mb-1 block">
                                            {identifiedItem.brand}
                                        </span>
                                    )}
                                    <h3 className="text-2xl font-semibold text-white leading-tight mb-2">
                                        {identifiedItem.name}
                                    </h3>
                                    <p className="text-sm text-white/60 leading-relaxed">
                                        {identifiedItem.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Price Listings */}
                        <div>
                            <h4 className="text-sm font-medium text-white/60 mb-4 px-2 uppercase tracking-wider">Prices Found</h4>
                            {listings.length === 0 ? (
                                <div className="text-center py-8 bg-[#1C1C1E]/50 rounded-2xl border border-dashed border-white/10">
                                    <p className="text-sm text-white/40">No online listings found for this item.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {listings.map((listing, i) => (
                                        <a 
                                            key={i} 
                                            href={listing.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/[0.03] hover:bg-[#2C2C2E] hover:border-white/[0.1] transition-all group flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-amber-100/70 bg-amber-900/30 px-2 py-0.5 rounded-md">
                                                        {listing.source}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/80 transition-colors" />
                                                </div>
                                                <h5 className="text-sm font-medium text-white/90 line-clamp-2 leading-snug mb-3">
                                                    {listing.name}
                                                </h5>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-lg font-semibold text-white">
                                                    {primarySymbol}{listing.price_php.toLocaleString()}
                                                </span>
                                                <span className="text-sm text-white/40">
                                                    {secondarySymbol}{getSecondaryValue(listing.price_php).toFixed(2)}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Transparency Banner */}
                        <div className="text-center px-4 mt-2">
                            <p className="text-xs text-white/30 leading-relaxed">
                                Prices are aggregated from online retailers via web search. Real-time availability and physical store pricing may vary.
                            </p>
                        </div>

                        <button 
                            onClick={handleReset}
                            className="w-full py-4 mt-4 bg-white/[0.05] hover:bg-white/[0.1] text-white font-medium rounded-2xl transition-colors"
                        >
                            Scan Another Item
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
