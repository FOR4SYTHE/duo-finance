"use client";

export function WelcomeShader() {
  return (
    <div className="absolute inset-0 z-0 bg-[#000]">
      {/* Subtle ambient gradient — zero GPU cost replacement for WebGL shader */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_40%,rgba(0,80,40,0.18),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_70%_60%,rgba(0,60,30,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/30 via-transparent to-[#0A0A0B]/90" />
    </div>
  );
}
