"use client";

import Link from "next/link";
import { Bell, Calculator, PiggyBank, ShoppingCart, ScanLine, ArrowRight, PieChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full px-6 pt-12 pb-8">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-20">
        <div className="flex flex-col">
          <span className="text-white/50 text-sm font-medium tracking-wider uppercase mb-1">Welcome back</span>
          <h1 className="text-2xl text-white font-light tracking-tight">Alex & Sam</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors">
          <Bell className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Hero Card: Budget Health (Richer Color Moment) */}
      <div className="relative z-20 w-full rounded-[32px] p-6 mb-8 overflow-hidden shadow-[0_20px_40px_rgba(48,209,88,0.15)] group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#30D158]/20 to-[#30D158]/5 pointer-events-none" />
        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl pointer-events-none border border-white/10 rounded-[32px]" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-white/80 font-medium tracking-wide">Monthly Budget</span>
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]" />
              <span className="text-xs font-semibold text-[#30D158] tracking-widest uppercase">On Track</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-light text-white tracking-tight">₱14,250</span>
              <span className="text-sm text-white/50 font-medium">left</span>
            </div>
            <span className="text-white/60 font-medium tracking-wide">≈ R3,800 left</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/30 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-[#30D158] rounded-full w-[65%]" />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex justify-between items-start mb-10 relative z-20 px-2">
        <Link href="/calculator" className="flex flex-col items-center gap-3 group">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <Calculator className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">Calculate</span>
        </Link>
        <Link href="/jar" className="flex flex-col items-center gap-3 group">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <PiggyBank className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">Log Spend</span>
        </Link>
        <Link href="/cartify" className="flex flex-col items-center gap-3 group">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">Start Trip</span>
        </Link>
        <div className="flex flex-col items-center gap-3 opacity-40 cursor-not-allowed relative">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/[0.02] flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">Scan</span>
          <div className="absolute -top-2 -right-2 bg-black px-1.5 py-0.5 rounded text-[8px] text-white/80 border border-white/10 uppercase tracking-widest">Soon</div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-2 px-1">Modules</h2>
        
        <Link href="/budget" className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8A33D]/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#E8A33D]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Budgeting</span>
              <span className="text-white/50 text-xs tracking-wide">Plan monthly targets</span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>

        <Link href="/jar" className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[#30D158]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Spend Jar</span>
              <span className="text-white/50 text-xs tracking-wide">Log everyday expenses</span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>

        <Link href="/cartify" className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0654B]/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#F0654B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Cartify</span>
              <span className="text-white/50 text-xs tracking-wide">Live shopping tracker</span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>
      </div>

    </div>
  );
}

function ChevronRightIcon() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 group-hover:text-white/80 group-hover:bg-white/10 transition-all">
      <ArrowRight className="w-4 h-4" />
    </div>
  );
}