import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#fcfcfc] dark:bg-[#050505] flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 transition-colors duration-300">
      <div className="w-full max-w-md space-y-6">
        
        {/* Dynamic Spatial Header */}
        <header className="space-y-1.5 px-4">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Duo
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono uppercase tracking-widest">
            Binational Ledger System
          </p>
        </header>
        
        {/* Apple-Grade Architecture Container Frame */}
        <div className="h-[620px] sm:h-[660px] w-full rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-neutral-200/80 dark:border-neutral-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-center overflow-hidden transition-all duration-300">
           <Calculator />
        </div>

      </div>
    </main>
  );
}

