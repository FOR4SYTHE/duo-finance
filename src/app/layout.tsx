import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import "./globals.css";
import { Hanken_Grotesk } from "next/font/google";

const geistSans = {
  variable: "font-sans",
};

const geistMono = {
  variable: "font-mono",
};

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duo Finance",
  description: "Personal finance app for couple relocation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-hanken">
        <main className="min-h-[100dvh] w-full bg-[#050505] flex flex-col font-hanken relative">
          
          {/* 
            Responsive App Canvas 
            Fluid width on mobile with safe-area padding.
            Sensible centered column on desktop.
          */}
          <div className="w-full max-w-xl mx-auto h-[100dvh] bg-[#000000] shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden ring-0 z-10 border-x border-white/[0.02]">
            
            {/* The App Itself */}
            <div className="w-full h-full flex flex-col overflow-y-auto no-scrollbar pb-[100px]">
                {children}
            </div>

            {/* Global Bottom Navigation */}
            <Navigation />
          </div>
        </main>
      </body>
    </html>
  );
}
