"use client";

import Link from "next/link";
import {
  Bell,
  Calculator,
  PiggyBank,
  ShoppingCart,
  ScanLine,
  ArrowRight,
  PieChart,
} from "lucide-react";
import { MonthlyReportCard } from "@/components/home/MonthlyReportCard";
import { BillsCalendarCard } from "@/components/home/BillsCalendarCard";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-full px-6 pt-12 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-20">
        <div className="flex flex-col">
          <span className="text-white/40 text-[11px] font-medium tracking-[0.2em] uppercase mb-1">
            Welcome back
          </span>
          <h1 className="text-2xl text-white font-light tracking-tight">
            Sam & Jon
          </h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors">
          <Bell className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Monthly Report Hero Card (photo-backed, budget overlaid) */}
      <MonthlyReportCard />

      {/* Bills Calendar Card */}
      <BillsCalendarCard />

      {/* Quick Actions Row */}
      <div className="flex justify-between items-start mb-8 relative z-20 px-2">
        <Link
          href="/calculator"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <Calculator className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Calculate
          </span>
        </Link>
        <Link
          href="/jar"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <PiggyBank className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Log Spend
          </span>
        </Link>
        <Link
          href="/cartify"
          className="flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-all group-active:scale-95">
            <ShoppingCart className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Start Trip
          </span>
        </Link>
        <div className="flex flex-col items-center gap-3 opacity-40 cursor-not-allowed relative">
          <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/[0.02] flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-white/60 tracking-wide">
            Scan
          </span>
          <div className="absolute -top-2 -right-2 bg-black px-1.5 py-0.5 rounded text-[8px] text-white/80 border border-white/10 uppercase tracking-widest">
            Soon
          </div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="flex flex-col gap-4 relative z-20 flex-1">
        <h2 className="text-white/40 text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 px-1">
          Modules
        </h2>

        <Link
          href="/budget"
          className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#E8A33D]/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-[#E8A33D]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Budgeting</span>
              <span className="text-white/50 text-xs tracking-wide">
                Plan monthly targets
              </span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>

        <Link
          href="/jar"
          className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#30D158]/10 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-[#30D158]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Spend Jar</span>
              <span className="text-white/50 text-xs tracking-wide">
                Log everyday expenses
              </span>
            </div>
          </div>
          <ChevronRightIcon />
        </Link>

        <Link
          href="/cartify"
          className="w-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.03] rounded-[24px] p-5 flex items-center justify-between transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0654B]/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-[#F0654B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium mb-0.5">Cartify</span>
              <span className="text-white/50 text-xs tracking-wide">
                Live shopping tracker
              </span>
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