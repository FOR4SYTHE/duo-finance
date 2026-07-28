import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronRight, X } from "lucide-react";
import { useBillsStore } from "@/store/useBillsStore";

interface DueTodayBannerProps {
  onTap: () => void;
}

export function DueTodayBanner({ onTap }: DueTodayBannerProps) {
  const { bills } = useBillsStore();
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
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="mb-4"
      >
        <div 
          onClick={onTap}
          className="relative overflow-hidden rounded-[20px] bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 p-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
          {/* Subtle glow background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF9F0A]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#FF9F0A]/20 flex items-center justify-center border border-[#FF9F0A]/30">
              <AlertCircle className="w-5 h-5 text-[#FF9F0A]" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-medium text-[15px] tracking-tight">
                {dueBills.length} Bill{dueBills.length > 1 ? 's' : ''} Due Today
              </h3>
              <p className="text-[#FF9F0A] font-semibold text-sm mt-0.5 flex items-center gap-1.5">
                Total: ₱{totalDue.toLocaleString()}
              </p>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors mr-1"
            >
              <X className="w-4 h-4" />
            </button>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
