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
  const { bills } = useBillsStore();
  const { primarySymbol, secondarySymbol, getPrimaryValue, getSecondaryValue } = useDualCurrency();
  const [isVisible, setIsVisible] = useState(true);
  const [dueBills, setDueBills] = useState<typeof bills>([]);

  useEffect(() => {
    const today = new Date().getDate();
    const due = bills.filter(b => b.dueDay === today);
    setDueBills(due);
  }, [bills]);

  if (!isVisible || dueBills.length === 0) return null;

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
            <div className="w-10 h-10 shrink-0 rounded-full bg-black flex items-center justify-center border border-[#FF9F0A]/20 shadow-[0_0_12px_rgba(255,159,10,0.1)] relative">
              <div className="absolute inset-0 rounded-full bg-[#FF9F0A]/10 animate-pulse blur-sm" />
              <motion.div
                animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 3, ease: "easeInOut" }}
              >
                <Bell className="w-4 h-4 text-[#FF9F0A] relative z-10" />
              </motion.div>
            </div>
            
            <div className="flex-1 pr-2">
              <h3 className="text-white font-medium text-[15px] tracking-tight">
                {dueBills.length} Bill{dueBills.length > 1 ? 's' : ''} Due Today
              </h3>
              <p className="text-[#FF9F0A] font-bold text-[13px] mt-0.5 flex items-baseline gap-1.5 drop-shadow-[0_0_8px_rgba(255,159,10,0.3)]">
                Total: {primarySymbol}{formatCurrency(getPrimaryValue(totalDue))} <span className="text-[#FF9F0A]/50 font-semibold text-[10px] tracking-tight drop-shadow-none">≈ {secondarySymbol}{formatCurrency(getSecondaryValue(totalDue))}</span>
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
