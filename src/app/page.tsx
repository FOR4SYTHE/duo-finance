import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-[100dvh] w-full bg-panel flex flex-col items-center justify-center font-sans sm:p-6 md:p-12 relative overflow-hidden">
      
      {/* 
        Responsive App Canvas 
        Mobile: 100vw/100dvh, flat. 
        Desktop/Tablet: Centered premium phone-like panel.
      */}
      <div className="w-full h-[100dvh] sm:h-[850px] sm:max-h-[90dvh] sm:max-w-[400px] bg-[#000000] sm:rounded-[48px] sm:shadow-[0_0_80px_rgba(0,0,0,0.8)] sm:border sm:border-white/5 flex flex-col relative overflow-hidden ring-0 z-10">
        
        {/* Ambient Premium Glows (Background) */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[50%] bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />
        
        {/* The App Itself */}
        <div className="relative z-10 w-full h-full flex flex-col">
            <Calculator />
        </div>
      </div>
    </main>
  );
}