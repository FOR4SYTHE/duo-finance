import { MoreHorizontal, Plus, ShoppingCart, Activity } from "lucide-react";

export default function CartifyPage() {
  return (
    <div className="flex flex-col w-full h-full px-6 pt-12 pb-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 relative z-20">
        <h1 className="text-3xl text-white font-light tracking-tight">Cartify</h1>
        <button className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors">
          <MoreHorizontal className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Active Trip Hero Card */}
      <div className="relative z-20 w-full rounded-[32px] p-6 mb-8 overflow-hidden bg-black/40 border border-white/[0.05] shadow-[0_0_60px_rgba(255,255,255,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/80 font-medium tracking-wide">SM Supermarket</span>
          </div>
          <div className="flex items-center gap-2 bg-[#30D158]/10 border border-[#30D158]/20 px-3 py-1.5 rounded-full">
            <Activity className="w-3 h-3 text-[#30D158]" />
            <span className="text-xs font-semibold text-[#30D158] tracking-widest uppercase">Live</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 mb-6">
          <span className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-1">Remaining Budget</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-white tracking-tight">₱1,250</span>
          </div>
          <span className="text-white/60 font-medium tracking-wide">≈ R330</span>
        </div>
        
        {/* Heat Map Progress */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#30D158] to-[#E8A33D] rounded-full w-[75%]" />
        </div>
        <div className="flex justify-between items-center mt-3">
          <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Spent: ₱3,750</span>
          <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Total: ₱5,000</span>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase">Scanned Items (12)</h2>
          <span className="text-white/40 text-[10px] uppercase tracking-wider font-bold">Sort: Price ↓</span>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-white/[0.05] flex items-center justify-center text-white/50 font-medium">
              1x
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Ariel Laundry Powder</span>
              <span className="text-white/50 text-xs tracking-wide">Household • 2.5kg</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱480</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">R128</span>
          </div>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-white/[0.05] flex items-center justify-center text-white/50 font-medium">
              2x
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Magnolia Fresh Milk</span>
              <span className="text-white/50 text-xs tracking-wide">Dairy • 1L</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱240</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">R64</span>
          </div>
        </div>
      </div>

      {/* Add Item FAB */}
      <button className="absolute bottom-[90px] right-6 w-[60px] h-[60px] rounded-full bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.2)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40">
        <Plus className="w-8 h-8" strokeWidth={2} />
      </button>

    </div>
  );
}
