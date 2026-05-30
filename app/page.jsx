"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MindScene from "@/components/three/MindScene";
import WormholeScene from "@/components/three/WormholeScene";
import DustOverlay from "@/components/ui/DustOverlay";
import NeuralMode from "@/components/neural/NeuralMode";
import DreamscapeMode from "@/components/dreamscape/DreamscapeMode";
import QuantumMode from "@/components/quantum/QuantumMode";
import StrategyMode from "@/components/strategy/StrategyMode";
import SoundControls from "@/components/ui/SoundControls";
import { initSounds, playSound, playAmbient, stopAmbient, loadPreferences } from "@/lib/soundEngine";
export default function HomePage() {
  const [user, setUser]                                     = useState(null);
  const [authChecked, setAuthChecked]                       = useState(false);
  const [activeMode, setActiveMode]                         = useState(null);
  const [pendingNeuralTopic, setPendingNeuralTopic]         = useState("");
  const [pendingDreamscapeTopic, setPendingDreamscapeTopic] = useState("");
  const [pendingQuantumQuery, setPendingQuantumQuery]       = useState("");
  const [pendingStrategyGoal, setPendingStrategyGoal]       = useState("");
  const [pendingNeuralSnapshot, setPendingNeuralSnapshot]   = useState(null);
  const [neuralHistory, setNeuralHistory]                   = useState([]);
useEffect(() => {
  loadPreferences();
  initSounds();
}, []);

useEffect(() => {
  if (user && !activeMode) {
    playAmbient("/sounds/ambient.mp3");
  } else if (activeMode) {
    stopAmbient();
  }
}, [user, activeMode]);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(!error && data?.user ? data.user : null);
      setAuthChecked(true);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveMode(null);
  };

  if (!authChecked) {
    return (
      <main className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-slate-400">
          Booting MindLink…
        </span>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="h-screen w-screen overflow-hidden relative">
        <div className="absolute inset-0"><WormholeScene /></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full backdrop-blur-[1px] px-4">
          <h1 className="text-white text-3xl md:text-4xl font-light tracking-[0.25em] drop-shadow-xl mb-4 text-center">
            MINDLINK ACCESS GATE
          </h1>
          <p className="text-[11px] md:text-xs text-pink-100/80 tracking-[0.22em] uppercase text-center max-w-xl">
            Neural interface • Knowledge portals • AI-driven maps
          </p>
          <div className="mt-6 flex flex-col gap-2 items-center text-[10px] md:text-xs tracking-[0.2em] uppercase">
            <span className="login-chip"><span className="login-chip-dot" />Real-time 3D neural maps</span>
            <span className="login-chip"><span className="login-chip-dot" />Dreamscape future simulation</span>
            <span className="login-chip"><span className="login-chip-dot" />Quantum AI search engine</span>
          </div>
          <button
            onClick={handleLogin}
            className="mt-8 px-12 py-4 text-xs md:text-sm tracking-[0.25em] uppercase border border-pink-400/70 text-pink-200 rounded-xl backdrop-blur bg-black/50 hover:bg-pink-500/10 hover:shadow-[0_0_35px_rgba(255,0,255,0.7)] transition-all duration-300"
          >
            LOGIN WITH GOOGLE
          </button>
          <p className="mt-5 text-[10px] md:text-xs text-pink-200/70 tracking-[0.25em] uppercase text-center">
            Hover the tags above to preview what MindLink unlocks.
          </p>
        </div>
      </main>
    );
  }

  // ── Full screens ─────────────────────────────────────────────────
  if (activeMode === "NEURAL_GRAPH") {
    return (
      <NeuralMode
        initialTopic={pendingNeuralTopic}
        initialSnapshot={pendingNeuralSnapshot}
        onExit={() => { setActiveMode(null); setPendingNeuralTopic(""); setPendingNeuralSnapshot(null); }}
        onSave={(snapshot) => setNeuralHistory((prev) => [snapshot, ...prev])}
      />
    );
  }

  if (activeMode === "DREAMSCAPE_GRAPH") {
    return (
      <DreamscapeMode
        initialTopic={pendingDreamscapeTopic}
        onExit={() => { setActiveMode(null); setPendingDreamscapeTopic(""); }}
      />
    );
  }

  if (activeMode === "QUANTUM_GRAPH") {
    return (
      <QuantumMode
        initialQuery={pendingQuantumQuery}
        onExit={() => { setActiveMode(null); setPendingQuantumQuery(""); }}
      />
    );
  }

  if (activeMode === "STRATEGY_GRAPH") {
    return (
      <StrategyMode
        initialGoal={pendingStrategyGoal}
        onExit={() => { setActiveMode(null); setPendingStrategyGoal(""); }}
      />
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  const neuralInit     = activeMode === "NEURAL_INIT";
  const dreamscapeInit = activeMode === "DREAMSCAPE_INIT";
  const strategyInit   = activeMode === "STRATEGY_INIT";
  const anyInit        = neuralInit || dreamscapeInit || strategyInit;

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-black text-white">
      <div className="absolute inset-0 opacity-[0.96]">
        <MindScene mode="HERO" focus={anyInit} />
      </div>
      <DustOverlay />

      <div className="relative z-20 h-full flex flex-col">

        {/* NAVBAR */}
        {!anyInit && (
          <header className="h-20 flex items-center justify-between px-8 md:px-10 bg-black/55 backdrop-blur border-b border-white/15">
            <div className="flex flex-col gap-1">
              <span className="text-pink-300 uppercase tracking-[0.30em] text-sm md:text-base">
                MINDLINK INTERFACE
              </span>
              <span className="text-slate-300 tracking-[0.20em] text-xs md:text-sm uppercase">
                AI NEURAL • DREAMSCAPE • QUANTUM • STRATEGY
              </span>
            </div>
            <SoundControls />
            <div className="flex items-center gap-6">
              <span className="text-xs md:text-sm tracking-[0.15em] text-slate-200">
                {user.user_metadata?.name || user.email}
              </span>
              <button
               onClick={() => { playSound("exit"); handleLogout(); }}
                className="text-xs md:text-sm text-red-300 hover:text-red-500 tracking-[0.25em] uppercase"
              >
                LOGOUT
              </button>
            </div>
          </header>
        )}

        {/* BODY */}
        {!anyInit && (
          <section className="flex flex-1">

            {/* LEFT HISTORY */}
            <aside className="w-64 md:w-72 border-r border-white/12 bg-black/35 backdrop-blur-sm px-4 py-5">
              <h3 className="text-pink-300 text-sm md:text-base tracking-[0.25em] uppercase mb-3">
                HISTORY
              </h3>
              {neuralHistory.length === 0 ? (
                <p className="text-xs md:text-sm text-slate-300/85 leading-relaxed">
                  Every neural path and strategy you build will appear here with timestamp and topic trail.
                </p>
              ) : (
                <div className="space-y-2 text-[11px] md:text-xs text-slate-200/90">
                  {neuralHistory.map((h) => (
                    <button
                      key={h.id}
                      className="w-full text-left px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => {
                        setPendingNeuralTopic(h.topic);
                        setPendingNeuralSnapshot(h);
                        setActiveMode("NEURAL_GRAPH");
                      }}
                    >
                      <div className="tracking-[0.18em] uppercase">{h.topic}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(h.savedAt).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            {/* CENTER */}
            <div className="flex-1 flex flex-col items-center justify-between py-10 md:py-14 px-4 md:px-10">

              {/* TOP TITLE */}
              <div className="mt-2 text-center select-none">
                <div className="text-[13px] md:text-[50px] tracking-[0.35em] text-pink-200 uppercase">
                  Welcome to the future of
                </div>
                <div className="mt-2 text-[23px] md:text-[50px] tracking-[0.4em] text-white font-light uppercase drop-shadow-xl">
                  Searching
                </div>
              </div>

              {/* QUANTUM SEARCH BAR */}
              <QuantumSearchBar
                onSearch={(query) => {
                  setPendingQuantumQuery(query);
                  setActiveMode("QUANTUM_GRAPH");
                }}
              />

              <div className="text-[10px] md:text-sm text-white tracking-[0.2em] uppercase text-center max-w-xl select-none drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
                Or explore through a specific mode below
              </div>

              {/* MODE BUTTONS */}
              <div className="pb-4 md:pb-8 flex flex-col items-center gap-3 select-none">
                <div className="flex flex-col sm:flex-row gap-6 md:gap-8">

                  {/* NEURAL */}
                  <button
                   onClick={() => { playSound("enter"); setActiveMode("NEURAL_INIT"); }}
                    className={`px-8 py-4 text-[10px] md:text-sm border rounded-xl tracking-[0.40em] uppercase bg-black/55 backdrop-blur transition-all duration-300
                    ${activeMode === "NEURAL_INIT" || activeMode === "NEURAL_GRAPH"
                      ? "border-cyan-400 text-cyan-200 shadow-[0_0_35px_rgba(0,255,255,0.5)] bg-cyan-500/10"
                      : "border-cyan-300/70 text-cyan-200 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(0,255,255,0.3)]"
                    }`}
                  >
                    NEURAL MODE
                  </button>

                  {/* DREAMSCAPE */}
                  <button
                    onClick={() => { playSound("enter"); setActiveMode("DREAMSCAPE_INIT"); }}
                    className={`px-8 py-4 text-[10px] md:text-sm border rounded-xl tracking-[0.40em] uppercase bg-black/55 backdrop-blur transition-all duration-300
                    ${activeMode === "DREAMSCAPE_INIT" || activeMode === "DREAMSCAPE_GRAPH"
                      ? "border-amber-400 text-amber-200 shadow-[0_0_35px_rgba(251,191,36,0.55)] bg-amber-500/10"
                      : "border-amber-300/70 text-amber-200 hover:bg-amber-400/10 hover:shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                    }`}
                  >
                    DREAMSCAPE
                  </button>

                  {/* STRATEGY */}
                  <button
                    onClick={() => { playSound("enter"); setActiveMode("STRATEGY_INIT"); }}
                    className={`px-8 py-4 text-[10px] md:text-sm border rounded-xl tracking-[0.40em] uppercase bg-black/55 backdrop-blur transition-all duration-300
                    ${activeMode === "STRATEGY_INIT" || activeMode === "STRATEGY_GRAPH"
                      ? "border-emerald-400 text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.55)] bg-emerald-500/10"
                      : "border-emerald-300/70 text-emerald-200 hover:bg-emerald-400/10 hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                    }`}
                  >
                    STRATEGY
                  </button>

                </div>
              </div>
            </div>
          </section>
        )}

        {/* INIT OVERLAYS */}
        {neuralInit && (
          <NeuralInitOverlay
            onCancel={() => { setActiveMode(null); setPendingNeuralTopic(""); }}
            onConfirm={(topic) => { setPendingNeuralTopic(topic); setPendingNeuralSnapshot(null); setActiveMode("NEURAL_GRAPH"); }}
          />
        )}
        {dreamscapeInit && (
          <DreamscapeInitOverlay
            onCancel={() => { setActiveMode(null); setPendingDreamscapeTopic(""); }}
            onConfirm={(topic) => { setPendingDreamscapeTopic(topic); setActiveMode("DREAMSCAPE_GRAPH"); }}
          />
        )}
        {strategyInit && (
          <StrategyInitOverlay
            onCancel={() => { setActiveMode(null); setPendingStrategyGoal(""); }}
            onConfirm={(goal) => { setPendingStrategyGoal(goal); setActiveMode("STRATEGY_GRAPH"); }}
          />
        )}

      </div>
    </main>
  );
}

// ── Quantum Search Bar ────────────────────────────────────────────────
function QuantumSearchBar({ onSearch }) {
  const [query, setQuery]     = useState("");
  const [focused, setFocused] = useState(false);
  const submit = () => { if (query.trim()) onSearch(query.trim()); };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4 select-none">
      <div className={`text-xs md:text-sm tracking-[0.45em] uppercase transition-all duration-500 ${focused ? "text-emerald-300" : "text-slate-400"}`}>
        Quantum Intelligence Search
      </div>
      <div className={`relative w-full transition-all duration-500 ${focused ? "scale-[1.02]" : "scale-100"}`}>
        {focused && (
          <>
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-400/40 to-emerald-500/0 blur-md pointer-events-none animate-pulse" />
            <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-teal-500/0 via-emerald-300/20 to-teal-500/0 blur-xl pointer-events-none" />
          </>
        )}
        <div className={`relative flex items-center gap-4 px-6 py-5 rounded-2xl border bg-black/60 backdrop-blur-md transition-all duration-500
          ${focused
            ? "border-emerald-400/70 shadow-[0_0_45px_rgba(52,211,153,0.25)]"
            : "border-emerald-500/25 shadow-[0_0_15px_rgba(52,211,153,0.06)]"
          }`}>
          <svg className={`shrink-0 transition-all duration-300 ${focused ? "text-emerald-300" : "text-slate-500"}`}
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search the universe… Black Holes, AI, Consciousness"
            className="flex-1 bg-transparent outline-none text-base md:text-lg text-white placeholder:text-slate-600 tracking-wide caret-emerald-400"
          />
          {query.trim() && (
            <button
              onMouseDown={(e) => { e.preventDefault(); submit(); }}
              className="shrink-0 px-5 py-2 border border-emerald-400/60 text-emerald-200 text-xs tracking-[0.3em] uppercase rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-300/80 transition-all duration-200"
            >
              SEARCH
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {["Black Holes", "Quantum Computing", "Future of AI", "Climate Change"].map((s) => (
          <button key={s} onMouseDown={(e) => { e.preventDefault(); onSearch(s); }}
            className="px-4 py-1.5 border border-pink-300/50 rounded-full text-xs text-white tracking-[0.15em] uppercase bg-pink-500/10 hover:border-pink-200 hover:bg-pink-500/20 transition-all duration-200 backdrop-blur-sm">
            {s}
          </button>
        ))}
      </div>
      <p className="text-xs text-white tracking-[0.2em] uppercase text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]">
        Press Enter or click a suggestion to explore
      </p>
    </div>
  );
}

// ── NeuralInitOverlay ─────────────────────────────────────────────────
function NeuralInitOverlay({ onCancel, onConfirm }) {
  const [topic, setTopic] = useState("");
  const start = () => { if (!topic.trim()) return; onConfirm(topic.trim()); };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm z-30">
      <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-slate-300">Initialize Subject</div>
      <input autoFocus value={topic} onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder="TYPE A TOPIC…  (e.g. React Hooks)"
        className="px-6 py-3 w-[300px] md:w-[420px] bg-black/80 border border-cyan-300/70 text-center text-xs md:text-sm tracking-[0.2em] uppercase rounded-full outline-none focus:border-cyan-400 focus:shadow-[0_0_25px_rgba(34,211,238,0.7)] transition"
      />
      <button onClick={start} className="mt-2 px-10 py-3 border border-pink-400/80 text-pink-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-pink-500/10 hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition">
        ENTER NEURAL SPACE
      </button>
      <p className="mt-3 text-[10px] text-slate-300 tracking-[0.2em] uppercase text-center max-w-md">
        Left click a node to expand. Right click to inspect.
      </p>
      <button onClick={onCancel} className="mt-4 text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-slate-200">CANCEL</button>
    </div>
  );
}

// ── DreamscapeInitOverlay ─────────────────────────────────────────────
function DreamscapeInitOverlay({ onCancel, onConfirm }) {
  const [topic, setTopic] = useState("");
  const start = () => { if (!topic.trim()) return; onConfirm(topic.trim()); };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/65 backdrop-blur-sm z-30">
      <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-amber-300/70">Initialize Scenario</div>
      <h2 className="text-[11px] md:text-sm tracking-[0.25em] uppercase text-slate-300 text-center max-w-sm">
        What decision or possibility do you want to explore?
      </h2>
      <input autoFocus value={topic} onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder='e.g. "Should I move abroad?"'
        className="px-6 py-3 w-[300px] md:w-[480px] bg-black/80 border border-amber-300/70 text-center text-xs md:text-sm tracking-[0.15em] rounded-full outline-none focus:border-amber-400 focus:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition text-white placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal"
      />
      <div className="flex flex-col items-center gap-1 text-[9px] md:text-[10px] text-slate-500 tracking-[0.15em] uppercase">
        <span>Try: "Should I become a trader?" • "What if AI replaces teachers?"</span>
        <span>"Should I leave college?" • "What if India goes fully AI-driven?"</span>
      </div>
      <button onClick={start} className="mt-2 px-10 py-3 border border-amber-400/80 text-amber-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.7)] transition">
        ENTER DREAMSCAPE
      </button>
      <button onClick={onCancel} className="mt-4 text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-slate-200">CANCEL</button>
    </div>
  );
}

// ── StrategyInitOverlay ───────────────────────────────────────────────
function StrategyInitOverlay({ onCancel, onConfirm }) {
  const [goal, setGoal] = useState("");
  const start = () => { if (!goal.trim()) return; onConfirm(goal.trim()); };
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/65 backdrop-blur-sm z-30">
      <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-emerald-300/70">
        Initialize Strategy
      </div>
      <h2 className="text-[11px] md:text-sm tracking-[0.25em] uppercase text-slate-300 text-center max-w-sm">
        What goal do you want to build a strategy for?
      </h2>
      <input autoFocus value={goal} onChange={(e) => setGoal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder='e.g. "Launch my SaaS in 90 days"'
        className="px-6 py-3 w-[300px] md:w-[500px] bg-black/80 border border-emerald-300/70 text-center text-xs md:text-sm tracking-[0.15em] rounded-full outline-none focus:border-emerald-400 focus:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition text-white placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal"
      />
      <div className="flex flex-col items-center gap-1 text-[9px] md:text-[10px] text-slate-500 tracking-[0.15em] uppercase">
        <span>Try: "Crack SSC CHSL in 6 months" • "Grow YouTube to 10k subscribers"</span>
        <span>"Build a trading strategy" • "Launch a clothing brand from zero"</span>
      </div>
      <button onClick={start} className="mt-2 px-10 py-3 border border-emerald-400/80 text-emerald-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition">
        ENTER STRATEGY SPACE
      </button>
      <button onClick={onCancel} className="mt-4 text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-slate-200">CANCEL</button>
    </div>
  );
}