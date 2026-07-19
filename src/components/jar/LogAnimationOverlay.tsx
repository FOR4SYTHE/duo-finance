"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown } from "lucide-react";
import { useEffect } from "react";

interface LogAnimationOverlayProps {
    type: 'happy' | 'worried' | 'scared' | null;
    onComplete: () => void;
}

export function LogAnimationOverlay({ type, onComplete }: LogAnimationOverlayProps) {
    useEffect(() => {
        if (type) {
            // Trigger haptic feedback if available
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                if (type === 'happy') navigator.vibrate([50, 50, 50]);
                if (type === 'worried') navigator.vibrate([100, 100, 100]);
                if (type === 'scared') navigator.vibrate([200, 100, 200, 100, 200]);
            }

            const timer = setTimeout(() => {
                onComplete();
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, [type, onComplete]);

    const getIconInfo = () => {
        switch (type) {
            case 'happy':
                return {
                    Icon: Smile,
                    color: '#30D158',
                    bg: 'rgba(48,209,88,0.1)',
                    glow: 'rgba(48,209,88,0.5)',
                    animation: { y: [0, -20, 0], scale: [0.8, 1.2, 1], rotate: [0, -10, 10, 0] },
                    transition: { duration: 0.6, ease: "easeOut" }
                };
            case 'worried':
                return {
                    Icon: Meh,
                    color: '#E8A33D',
                    bg: 'rgba(232,163,61,0.1)',
                    glow: 'rgba(232,163,61,0.5)',
                    animation: { x: [-10, 10, -10, 10, 0], scale: [1, 1.1, 1] },
                    transition: { duration: 0.5, ease: "easeInOut" }
                };
            case 'scared':
                return {
                    Icon: Frown,
                    color: '#FF453A',
                    bg: 'rgba(255,69,58,0.1)',
                    glow: 'rgba(255,69,58,0.6)',
                    animation: { scale: [1, 1.3, 1, 1.3, 1], rotate: [-10, 10, -10, 10, 0] },
                    transition: { duration: 0.6, ease: "easeInOut" }
                };
            default:
                return null;
        }
    };

    const info = getIconInfo();

    return (
        <AnimatePresence>
            {type && info && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ ...info.animation, opacity: 1, scale: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={info.transition as any}
                        className="flex items-center justify-center w-48 h-48 rounded-[48px] border border-white/10"
                        style={{ 
                            backgroundColor: info.bg,
                            boxShadow: `0 0 100px ${info.glow}, inset 0 0 20px ${info.glow}`
                        }}
                    >
                        <info.Icon className="w-24 h-24" strokeWidth={1.5} color={info.color} />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
