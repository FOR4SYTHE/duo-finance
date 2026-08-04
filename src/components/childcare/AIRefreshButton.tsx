"use client";

// NOTE: The AI grounding/caching logic in useChildCareStore.mockTriggerAIUpdate
// and /api/ai/schools/route.ts is fully intact. To re-enable this button,
// restore the onClick={mockTriggerAIUpdate} handler and remove the disabled state.

export function AIRefreshButton() {
  return (
    <div
      className="w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 
        bg-white/[0.02] border border-white/[0.02] opacity-40 select-none cursor-not-allowed"
    >
      <div className="px-1.5 py-0.5 rounded bg-white/10 flex items-center justify-center">
        <span className="text-[9px] font-black uppercase tracking-wider text-white/50">AI</span>
      </div>
      <span className="text-white/50">AI Reports</span>
      <div className="px-1.5 py-0.5 rounded bg-white/10 flex items-center justify-center">
        <span className="text-[9px] font-bold text-white/50 uppercase tracking-wider">Coming Soon</span>
      </div>
    </div>
  );
}
