import { ChevronDown, Home, Zap, ShoppingBag, Plus } from "lucide-react";

export default function BudgetPage() {
  return (
    <div className="flex flex-col w-full h-full px-6 pt-12 pb-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-20">
        <h1 className="text-3xl text-white font-light tracking-tight">Budget</h1>
        <div className="flex items-center gap-2 bg-white/[0.04] backdrop-blur-md px-4 py-2 rounded-full border border-white/[0.05]">
          <span className="text-xs font-semibold text-white/70 tracking-widest uppercase">Monthly</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/50" />
        </div>
      </div>

      {/* Move-in Cost Estimator (Premium Segmented Card) */}
      <div className="w-full rounded-[32px] p-6 mb-8 bg-white/[0.02] border border-white/[0.03] relative z-20 group">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col">
            <span className="text-white font-medium">Relocation Estimator</span>
            <span className="text-white/50 text-xs tracking-wide">Plan initial setup costs</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4">
            <span className="text-white/70 text-sm">Adults</span>
            <div className="flex items-center gap-4">
              <button className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/50">-</button>
              <span className="text-white font-medium">2</span>
              <button className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-white">+</button>
            </div>
          </div>
          <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4">
            <span className="text-white/70 text-sm">Target Area</span>
            <div className="flex items-center gap-2 text-white">
              <span className="font-medium text-sm">Makati / BGC</span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </div>
          </div>
          
          <button className="w-full mt-2 h-14 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.05] text-white font-medium transition-all text-sm">
            Calculate Estimate
          </button>
        </div>
      </div>

      {/* Categories Mock */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Target Allocations</h2>
          <button className="w-6 h-6 rounded-full bg-white/[0.1] flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-[#30D158]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Rent</span>
              <span className="text-white/50 text-xs tracking-wide">Makati Condo</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱18,000</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">≈ R4,800</span>
          </div>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8A33D]/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#E8A33D]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Groceries</span>
              <span className="text-white/50 text-xs tracking-wide">Food & Supplies</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱9,000</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">≈ R2,400</span>
          </div>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#0A84FF]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#0A84FF]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Utilities</span>
              <span className="text-white/50 text-xs tracking-wide">Power & Internet</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱3,500</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">≈ R930</span>
          </div>
        </div>
      </div>
    </div>
  );
}
