"use client";

import Link from "next/link";
import { ChevronLeft, Bell } from "lucide-react";
import { InsuranceModule } from "@/components/insurance/InsuranceModule";

export default function InsurancePage() {
    return (
        <div suppressHydrationWarning className="flex flex-col w-full min-h-full px-6 pt-12 pb-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-20">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <div className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors">
                            <ChevronLeft className="w-5 h-5 text-white/70" />
                        </div>
                    </Link>
                    <h1 className="text-2xl text-white font-black tracking-tight">
                        Insurance Hub
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-white/[0.04] backdrop-blur-md flex items-center justify-center border border-white/[0.05] hover:bg-white/[0.08] transition-colors relative">
                        <Bell className="w-5 h-5 text-white/70" />
                    </button>
                </div>
            </div>

            <InsuranceModule />
        </div>
    );
}
