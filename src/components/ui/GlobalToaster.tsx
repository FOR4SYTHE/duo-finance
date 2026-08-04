"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export function GlobalToaster() {
  const [mounted, setMounted] = useState(false);
  const [activeNudge, setActiveNudge] = useState<any>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
    
    if (!user?.id) return;
    const supabase = createClient();

    // Subscribe to new notifications where we are the recipient
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `to_user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new.type === 'nudge') {
            // Show nudge toast
            setActiveNudge(payload.new);
            
            // Try to vibrate if supported
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            
            // Auto dismiss after 4 seconds
            setTimeout(() => {
              setActiveNudge(null);
            }, 4000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {activeNudge && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 16, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none px-4"
        >
          <div className="bg-[#1C1C1E]/90 backdrop-blur-xl border-[0.5px] border-white/20 shadow-[0_32px_64px_rgba(0,0,0,0.8)] rounded-full px-6 py-3.5 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-[14px] leading-tight">
                {activeNudge.message || "Your partner nudged you! 👋"}
              </span>
              <span className="text-white/50 text-[11px] font-medium mt-0.5">
                Just now
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
