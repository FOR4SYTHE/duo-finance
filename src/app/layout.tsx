import type { Metadata, Viewport } from "next";
import { Navigation } from "@/components/Navigation";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";
import { Hanken_Grotesk, Gloria_Hallelujah } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { GlobalToaster } from "@/components/ui/GlobalToaster";

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

const gloria = Gloria_Hallelujah({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gloria",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DUO Finance",
  description: "Budgeting, together. Build better money habits with the person who matters most.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DUO",
  },
  formatDetection: {
    telephone: false,
  },
};

import { AppLockScreen } from "@/components/security/AppLockScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hankenGrotesk.variable} ${gloria.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-hanken">
        <AuthProvider>
          <ServiceWorkerRegister />
          <AppLockScreen />
          <main className="min-h-[100dvh] w-full bg-[#050505] flex flex-col font-hanken relative print:bg-white print:min-h-0 print:h-auto print:block">
            
            {/* 
              Responsive App Canvas 
              Fluid width on mobile with safe-area padding.
              Sensible centered column on desktop.
            */}
            <div className="w-full max-w-xl mx-auto h-[100dvh] bg-[#000000] shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden ring-0 z-10 border-x border-white/[0.02] print:max-w-none print:w-full print:h-auto print:bg-white print:shadow-none print:border-none print:overflow-visible print:block">
              
              {/* The App Itself */}
              <div className="w-full h-full flex flex-col overflow-y-auto no-scrollbar pb-[100px] print:overflow-visible print:pb-0 print:h-auto">
                  {children}
              </div>

              {/* Global Bottom Navigation */}
              <Navigation />
              
              {/* Global Realtime Toaster */}
              <GlobalToaster />
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
