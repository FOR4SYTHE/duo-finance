import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center selection:bg-accent/30 font-sans">

      {/* 
        Responsive App Canvas 
        Mobile: 100% width/height. Desktop: Centered premium panel.
      */}
      <div className="w-full max-w-[480px] min-h-[100dvh] sm:min-h-[850px] sm:max-h-[90dvh] bg-transparent sm:rounded-[3rem] shadow-none flex flex-col relative overflow-hidden ring-0">
        <Calculator />
      </div>

    </main>
  );
}