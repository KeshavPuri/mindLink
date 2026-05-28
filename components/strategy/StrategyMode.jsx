"use client";

export default function StrategyMode({ initialGoal, onExit }) {
  return (
    <main className="h-screen w-screen overflow-hidden relative bg-black text-white flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.07)_0%,_transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-8 bg-black/40 backdrop-blur border-b border-emerald-400/15">
        <div className="flex flex-col gap-0.5">
          <span className="text-emerald-300 uppercase tracking-[0.35em] text-sm">STRATEGY MODE</span>
          <span className="text-slate-500 tracking-[0.15em] text-xs uppercase truncate max-w-xs">{initialGoal}</span>
        </div>
        <button onClick={onExit} className="text-sm tracking-[0.25em] uppercase text-slate-500 hover:text-emerald-300 transition-colors">← EXIT</button>
      </div>
      <div className="flex flex-col items-center gap-5 text-center px-8">
        <div className="text-xs tracking-[0.45em] uppercase text-emerald-500/50">Strategy Mode — Active</div>
        <h1 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-emerald-100 max-w-2xl">{initialGoal}</h1>
        <p className="text-sm text-slate-600 tracking-[0.2em] uppercase">3D command center building in phase 2…</p>
        <div className="mt-4 w-28 h-28 rounded-full border border-emerald-600/30 animate-pulse" />
        <div className="absolute w-44 h-44 rounded-full border border-emerald-700/15 animate-ping" style={{ animationDuration: "3s" }} />
      </div>
    </main>
  );
}