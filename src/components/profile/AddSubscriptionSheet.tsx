"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Music, Dumbbell, Smartphone, ChevronRight, Plus } from "lucide-react";
import { useSubscriptionsStore } from "@/store/useSubscriptionsStore";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { formatCurrency } from "@/lib/format";
import { triggerHaptic } from "@/lib/haptics";

const PRESETS = [
  { name: "Netflix Premium", icon: Play },
  { name: "Spotify Duo", icon: Music },
  { name: "Anytime Fitness", icon: Dumbbell },
  { name: "Globe Postpaid", icon: Smartphone },
  { name: "Custom", icon: Plus }
];

export function AddSubscriptionSheet({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addSubscription } = useSubscriptionsStore();
  const { primaryCurrency } = useCurrencyStore();
  const [step, setStep] = useState<"preset" | "amount">("preset");
  const [selectedPreset, setSelectedPreset] = useState<any>(null);
  const [customName, setCustomName] = useState("");
  const [amountStr, setAmountStr] = useState("0");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectPreset = (preset: any) => {
    triggerHaptic('light');
    setSelectedPreset(preset);
    setStep("amount");
  };

  const handleKey = (key: string) => {
    triggerHaptic('light');
    if (key === "delete") {
      setAmountStr(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    } else {
      setAmountStr(prev => prev === "0" ? key : prev + key);
    }
  };

  const handleSave = () => {
    triggerHaptic('medium');
    const amount = parseFloat(amountStr);
    if (amount > 0) {
      addSubscription({
        id: Math.random().toString(36).substr(2, 9),
        name: selectedPreset.name === "Custom" ? (customName || "New Service") : selectedPreset.name,
        amount,
        cycle: 'Monthly'
      });
      onClose();
      // reset after close
      setTimeout(() => {
        setStep("preset");
        setAmountStr("0");
        setCustomName("");
      }, 300);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex flex-col justify-end pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          {/* Sheet */}
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="w-full bg-[#1C1C1E] rounded-t-[32px] pointer-events-auto border-t border-white/10 flex flex-col relative z-10"
            style={{ maxHeight: "90dvh" }}
          >
            {/* Grabber */}
            <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <h2 className="text-xl font-semibold text-white tracking-tight">Add Subscription</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
              {step === "preset" && (
                <div className="flex flex-col gap-3 mt-4">
                  <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-white/30 mb-2">Select Service</h3>
                  {PRESETS.map(preset => (
                    <button 
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className="w-full bg-[#0A0A0C] border-[0.5px] border-white/10 p-4 rounded-[20px] flex items-center justify-between hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <preset.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white font-medium">{preset.name}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20" />
                    </button>
                  ))}
                </div>
              )}

              {step === "amount" && (
                <div className="flex flex-col items-center mt-6">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border-[0.5px] border-white/10 shadow-lg">
                    <selectedPreset.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {selectedPreset?.name === "Custom" ? (
                    <input 
                      type="text"
                      placeholder="Service Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="bg-transparent border-b border-white/20 text-center text-white text-xl font-medium focus:outline-none mb-8 pb-1 w-2/3"
                      autoFocus
                    />
                  ) : (
                    <h3 className="text-white text-xl font-medium tracking-tight mb-8">{selectedPreset?.name}</h3>
                  )}

                  <div className="flex flex-col items-center justify-center bg-[#0A0A0C] border-[0.5px] border-white/10 rounded-[32px] w-full py-6 mb-8 shadow-inner">
                    <span className="text-white/40 text-[12px] font-bold tracking-[0.2em] uppercase mb-2">Monthly Cost</span>
                    <span className="text-[42px] font-medium text-white tracking-tight">
                      {primaryCurrency === "PHP" ? "₱" : "R"} {formatCurrency(parseFloat(amountStr), "", "", 2)}
                    </span>
                  </div>

                  {/* Numpad */}
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full px-4 mb-8">
                    {[1,2,3,4,5,6,7,8,9].map((num) => (
                      <button 
                        key={num}
                        onClick={() => handleKey(num.toString())}
                        className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-normal bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-[0.9] transition-all mx-auto border-[0.5px] border-white/5"
                      >
                        {num}
                      </button>
                    ))}
                    <div className="flex items-center justify-center">
                      <button onClick={() => setStep("preset")} className="text-[13px] font-bold text-white/30 uppercase tracking-widest active:scale-95">Back</button>
                    </div>
                    <button 
                      onClick={() => handleKey('0')}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-normal bg-white/5 hover:bg-white/10 active:bg-white/20 active:scale-[0.9] transition-all mx-auto border-[0.5px] border-white/5"
                    >
                      0
                    </button>
                    <div className="flex items-center justify-center">
                      <button 
                        onClick={() => handleKey("delete")}
                        className="text-[13px] font-bold text-white/50 uppercase tracking-widest active:scale-95 h-16 w-16 flex items-center justify-center"
                      >
                        Del
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={parseFloat(amountStr) === 0 || (selectedPreset?.name === "Custom" && !customName)}
                    className="w-full max-w-[280px] py-4 bg-[#30D158] text-[#111] font-bold text-[16px] rounded-full active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-[0_4px_20px_rgba(48,209,88,0.3)]"
                  >
                    Add Subscription
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
