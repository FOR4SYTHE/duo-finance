import { Plus, Settings2, PiggyBank } from "lucide-react";

export default function SpendJarPage() {
  return (
    <div className="flex flex-col w-full h-full px-6 pt-12 pb-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-20">
        <h1 className="text-3xl text-white font-light tracking-tight">Spend Jar</h1>
        <button className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors">
          <Settings2 className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Hero Jar Progress (Apple Fitness-style thick ring) */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center py-10 mb-8">
        
        {/* SVG Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle 
              cx="50" cy="50" r="42" 
              fill="transparent" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="8"
            />
            {/* Progress Fill */}
            <circle 
              cx="50" cy="50" r="42" 
              fill="transparent" 
              stroke="#E8A33D" 
              strokeWidth="8" 
              strokeLinecap="round"
              strokeDasharray="264"
              strokeDashoffset="75" /* ~70% filled */
              className="drop-shadow-[0_0_12px_rgba(232,163,61,0.6)]"
            />
          </svg>
          
          {/* Inner Content */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2">Spent this month</span>
            <span className="text-4xl font-light text-white tracking-tight mb-1">₱22,500</span>
            <span className="text-white/60 font-medium tracking-wide text-sm mb-4">≈ R6,000</span>
            <div className="bg-[#E8A33D]/20 px-3 py-1 rounded-full border border-[#E8A33D]/30">
              <span className="text-[#E8A33D] text-[10px] uppercase tracking-widest font-bold">70% of Budget</span>
            </div>
          </div>
        </div>
        
      </div>

      {/* Quick Add Log Button */}
      <div className="relative z-20 w-full mb-8">
        <button className="w-full h-[68px] rounded-full bg-white text-black font-semibold text-lg tracking-wide flex items-center justify-center gap-3 hover:bg-gray-100 active:scale-[0.98] transition-all duration-300 group">
          <Plus className="w-6 h-6" strokeWidth={2.5} />
          <span>Quick Log Spend</span>
        </button>
      </div>

      {/* Recent Entries Mock */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2 px-1">Recent Drops</h2>
        
        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
              <span className="text-white text-lg">🍔</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Din Tai Fung</span>
              <span className="text-white/50 text-xs tracking-wide">Food • Today, 1:30 PM</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱1,450</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">R386</span>
          </div>
        </div>

        <div className="w-full bg-white/[0.02] border border-white/[0.03] rounded-[24px] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center">
              <span className="text-white text-lg">🚖</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Grab Ride</span>
              <span className="text-white/50 text-xs tracking-wide">Transport • Yesterday</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-white font-medium">₱350</span>
            <span className="text-white/40 text-[10px] uppercase tracking-wider">R93</span>
          </div>
        </div>
      </div>
    </div>
  );
}
