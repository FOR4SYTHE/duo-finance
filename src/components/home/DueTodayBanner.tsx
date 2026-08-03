import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronRight, X } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";
import { useDualCurrency } from "@/hooks/useDualCurrency";
import { formatCurrency } from "@/lib/format";

interface DueTodayBannerProps {
  onTap: () => void;
}

export function DueTodayBanner({ onTap }: DueTodayBannerProps) {
  const bills = useBillsStore((state) => state.bills);
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  const dueBills = bills.filter(b => {
    if (b.isPaid) return false;
    if (!b.reminderEnabled) return false;
    const clampedDueDay = Math.min(b.dueDay, daysInMonth);
    return clampedDueDay <= currentDay;
  });

  if (!mounted || !isVisible || dueBills.length === 0) return null;

  const totalDue = dueBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0, marginBottom: 0 }}
        transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
        className="mb-4"
      >
        <div 
          onClick={onTap}
          className="relative overflow-hidden rounded-[32px] bg-[#0A0A0C] border border-white/5 p-3 px-4 cursor-pointer active:scale-[0.98] transition-all shadow-lg group"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            {/* Ringing Bell Icon */}
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8A33D]/10 flex items-center justify-center border border-[#E8A33D]/20 shadow-lg relative">
              <div className="absolute inset-0 rounded-full bg-[#E8A33D]/10 animate-pulse blur-sm" />
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 3, ease: "easeInOut" }}
              >
                <Bell className="w-4 h-4 text-[#E8A33D] relative z-10" />
              </motion.div>
            </div>
            
            <div className="flex-1 pr-2">
              <h3 className="text-white font-medium text-[15px] tracking-tight">
                {dueBills.length} Bill{dueBills.length > 1 ? 's' : ''} Due Today
              </h3>
              <p className="text-white/60 font-medium text-[13px] mt-0.5 flex items-baseline gap-1.5">
                Total: <span className="text-[#E8A33D] font-bold">{primarySymbol}{formatCurrency(getPrimaryValue(totalDue))}</span> <span className="text-[#E8A33D]/50 font-medium text-[10px] tracking-tight">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(totalDue))}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
