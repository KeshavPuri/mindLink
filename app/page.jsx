"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MindScene from "@/components/three/MindScene";
import WormholeScene from "@/components/three/WormholeScene";
import DustOverlay from "@/components/ui/DustOverlay";
import NeuralMode from "@/components/neural/NeuralMode";
import PortalMode from "@/components/portal/PortalMode"; // 🟣 NEW
import DreamscapeMode from "@/components/dreamscape/DreamscapeMode"; // 🟡 NEW

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // null | "NEURAL_INIT" | "NEURAL_GRAPH" | "PORTAL_INIT" | "PORTAL_GRAPH"
  const [activeMode, setActiveMode] = useState(null);

  const [pendingNeuralTopic, setPendingNeuralTopic] = useState("");
  const [pendingPortalTopic, setPendingPortalTopic] = useState(""); // 🟣 NEW
 const [pendingDreamscapeTopic, setPendingDreamscapeTopic] = useState(""); // 🟡 NEW
  // 🆕 snapshot bhi store karenge (pure graph ke liye)
  const [pendingNeuralSnapshot, setPendingNeuralSnapshot] = useState(null);

  // simple in-memory history (later Supabase se wire kar sakte)
  const [neuralHistory, setNeuralHistory] = useState([]);

  // ---------------- AUTH INIT ----------------
  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      sub.subscription.unsubscribe();
    };
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

  // ---------------- LOADING ----------------
  if (!authChecked) {
    return (
      <main className="h-screen w-screen flex items-center justify-center bg-black text-white">
        <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-slate-400">
          Booting MindLink…
        </span>
      </main>
    );
  }

  // ---------------- LOGIN SCREEN ----------------
  if (!user) {
    return (
      <main className="h-screen w-screen overflow-hidden relative">
        {/* Wormhole background */}
        <div className="absolute inset-0">
          <WormholeScene />
        </div>

        {/* Login UI */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full backdrop-blur-[1px] px-4">
          <h1 className="text-white text-3xl md:text-4xl font-light tracking-[0.25em] drop-shadow-xl mb-4 text-center">
            MINDLINK ACCESS GATE
          </h1>

          <p className="text-[11px] md:text-xs text-pink-100/80 tracking-[0.22em] uppercase text-center max-w-xl">
            Neural interface • Knowledge portals • AI-driven maps
          </p>

          {/* feature chips */}
          <div className="mt-6 flex flex-col gap-2 items-center text-[10px] md:text-xs tracking-[0.2em] uppercase">
            <span className="login-chip">
              <span className="login-chip-dot" />
              Real-time 3D neural maps
            </span>
            <span className="login-chip">
              <span className="login-chip-dot" />
              Dimensional AI search portals
            </span>
            <span className="login-chip">
              <span className="login-chip-dot" />
              Encrypted personal knowledge vault
            </span>
          </div>

          <button
            onClick={handleLogin}
            className="mt-8 px-12 py-4 text-xs md:text-sm tracking-[0.25em] uppercase border border-pink-400/70 text-pink-200 rounded-xl 
            backdrop-blur bg-black/50 hover:bg-pink-500/10 hover:shadow-[0_0_35px_rgba(255,0,255,0.7)] 
            transition-all duration-300"
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

  // ---------------- FULL NEURAL GRAPH SCREEN ----------------
  if (activeMode === "NEURAL_GRAPH") {
    return (
      <NeuralMode
        initialTopic={pendingNeuralTopic}
        initialSnapshot={pendingNeuralSnapshot} // snapshot pass
        onExit={() => {
          setActiveMode(null);
          setPendingNeuralTopic("");
          setPendingNeuralSnapshot(null); // clear snapshot
        }}
        onSave={(snapshot) => {
          setNeuralHistory((prev) => [snapshot, ...prev]);
        }}
      />
    );
  }

  // ---------------- FULL PORTAL SCREEN ----------------
  if (activeMode === "PORTAL_GRAPH") {
    return (
      <PortalMode
        initialTopic={pendingPortalTopic}
        onExit={() => {
          setActiveMode(null);
          setPendingPortalTopic("");
        }}
      />
    );
  }

 // ---------------- FULL DREAMSCAPE SCREEN ----------------  🟡 NEW
  if (activeMode === "DREAMSCAPE_GRAPH") {
    return (
      <DreamscapeMode
        initialTopic={pendingDreamscapeTopic}
        onExit={() => {
          setActiveMode(null);
          setPendingDreamscapeTopic("");
        }}
      />
    );
  }

  // ---------------- DASHBOARD + INIT MODES ----------------
  const neuralInit = activeMode === "NEURAL_INIT";
  const portalInit = activeMode === "PORTAL_INIT";
 const dreamscapeInit = activeMode === "DREAMSCAPE_INIT"; // 🟡 NEW
  const anyInit = neuralInit || portalInit || dreamscapeInit; // 🟡 UPDATED

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-black text-white">
      {/* 3D background – interactive sphere center me.
          focus=true => zoom in (MindScene ke andar already handle hoga) */}
      <div className="absolute inset-0 opacity-[0.96]">
        <MindScene mode="HERO" focus={anyInit} />
      </div>

      {/* Dust overlay – stars ke upar subtle glow */}
      <DustOverlay />

      {/* FOREGROUND UI */}
      <div className="relative z-20 h-full flex flex-col">
        {/* NAVBAR – kisi bhi INIT phase me hide */}
        {!anyInit && (
          <header className="h-20 flex items-center justify-between px-8 md:px-10 bg-black/55 backdrop-blur border-b border-white/15">
            <div className="flex flex-col gap-1">
              <span className="text-pink-300 uppercase tracking-[0.30em] text-sm md:text-base">
                MINDLINK INTERFACE
              </span>
              <span className="text-slate-300 tracking-[0.20em] text-xs md:text-sm uppercase">
                AI NEURAL • PORTAL ENGINE
              </span>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-xs md:text-sm tracking-[0.15em] text-slate-200">
                {user.user_metadata?.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs md:text-sm text-red-300 hover:text-red-500 tracking-[0.25em] uppercase"
              >
                LOGOUT
              </button>
            </div>
          </header>
        )}

        {/* BODY – normal dashboard sirf jab koi INIT nahi hai */}
        {!anyInit && (
          <section className="flex flex-1">
            {/* LEFT HISTORY PANEL (Neural) */}
            <aside className="w-64 md:w-72 border-r border-white/12 bg-black/35 backdrop-blur-sm px-4 py-5">
              <h3 className="text-pink-300 text-sm md:text-base tracking-[0.25em] uppercase mb-3">
                HISTORY
              </h3>

              {neuralHistory.length === 0 ? (
                <p className="text-xs md:text-sm text-slate-300/85 leading-relaxed">
                  Every neural path and portal you explore will appear here with
                  timestamp and topic trail. We’ll wire this to Supabase soon.
                </p>
              ) : (
                <div className="space-y-2 text-[11px] md:text-xs text-slate-200/90">
                  {neuralHistory.map((h) => (
                    <button
                      key={h.id}
                      className="w-full text-left px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
                      onClick={() => {
                        setPendingNeuralTopic(h.topic);
                        // snapshot set
                        setPendingNeuralSnapshot(h);
                        setActiveMode("NEURAL_GRAPH");
                      }}
                    >
                      <div className="tracking-[0.18em] uppercase">
                        {h.topic}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(h.savedAt).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            {/* CENTER AREA – heading top, sphere middle, buttons bottom-ish */}
            <div className="flex-1 flex flex-col items-center justify-between py-10 md:py-14 px-4 md:px-10">
              {/* ---- TOP TITLE ---- */}
              <div className="mt-2 text-center select-none">
                <div className="text-[13px] md:text-[50px] tracking-[0.35em] text-pink-200 uppercase opacity-140">
                  Welcome to the future of
                </div>
                <div className="mt-2 text-[23px] md:text-[50px] tracking-[0.4em] text-white font-light uppercase drop-shadow-xl">
                  Searching
                </div>
              </div>

              {/* ---- MIDDLE SMALL LINE ---- */}
              <div className="mt-60 text-[10px] md:text-base text-slate-200 tracking-[0.2em] uppercase text-center max-w-xl select-none">
                The glowing node behind you is a live 3D canvas. Choose how
                MindLink should explore your universe.
              </div>

              {/* ---- BOTTOM BUTTONS ---- */}
              <div className="pb-4 md:pb-8 flex flex-col items-center gap-3 select-none">
                <div className="flex flex-col sm:flex-row gap-40">
                  <button
                    onClick={() => setActiveMode("NEURAL_INIT")} // ye change kiya hai
                    className={`px-8 py-4 text-[10px] md:text-base border rounded-xl tracking-[0.50em] uppercase bg-black/55 backdrop-blur 
                  transition-all duration-300
                  ${
                    activeMode === "NEURAL_INIT" ||
                    activeMode === "NEURAL_GRAPH"
                      ? "border-cyan-400 text-cyan-200 shadow-[0_0_35px_rgba(0,255,255,0.5)] bg-cyan-500/10"
                      : "border-cyan-300/70 text-cyan-200 hover:bg-cyan-400/10 hover:shadow-[0_0_18px_rgba(0,255,255,0.3)]"
                  }`}
                  >
                    NEURAL MODE
                  </button>

                  <button
                    onClick={() => setActiveMode("PORTAL_INIT")}
                    className={`px-8 py-4 text-[10px] md:text-base border rounded-xl tracking-[0.50em] uppercase bg-black/55 backdrop-blur
                  transition-all duration-300
                  ${
                    activeMode === "PORTAL_INIT" ||
                    activeMode === "PORTAL_GRAPH"
                      ? "border-purple-400 text-purple-200 shadow-[0_0_35px_rgba(200,100,255,0.55)] bg-purple-500/10"
                      : "border-purple-300/70 text-purple-200 hover:bg-purple-400/10 hover:shadow-[0_0_18px_rgba(200,100,255,0.35)]"
                  }`}
                  >
                    PORTAL MODE
                  </button>
                   {/* DREAMSCAPE 🟡 NEW */}
                  <button
                    onClick={() => setActiveMode("DREAMSCAPE_INIT")}
                    className={`px-8 py-4 text-[10px] md:text-base border rounded-xl tracking-[0.50em] uppercase bg-black/55 backdrop-blur
                    transition-all duration-300
                    ${
                      activeMode === "DREAMSCAPE_INIT" || activeMode === "DREAMSCAPE_GRAPH"
                        ? "border-amber-400 text-amber-200 shadow-[0_0_35px_rgba(251,191,36,0.55)] bg-amber-500/10"
                        : "border-amber-300/70 text-amber-200 hover:bg-amber-400/10 hover:shadow-[0_0_18px_rgba(251,191,36,0.35)]"
                    }`}
                  >
                    DREAMSCAPE
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* NEURAL_INIT OVERLAY – sphere zoom + text */}
        {neuralInit && (
          <NeuralInitOverlay
            onCancel={() => {
              setActiveMode(null);
              setPendingNeuralTopic("");
            }}
            onConfirm={(topic) => {
              setPendingNeuralTopic(topic);
              // naya topic => fresh graph
              setPendingNeuralSnapshot(null);
              setActiveMode("NEURAL_GRAPH");
            }}
          />
        )}

        {/* PORTAL_INIT OVERLAY – sphere zoom + text */}
        {portalInit && (
          <PortalInitOverlay
            onCancel={() => {
              setActiveMode(null);
              setPendingPortalTopic("");
            }}
            onConfirm={(topic) => {
              setPendingPortalTopic(topic);
              setActiveMode("PORTAL_GRAPH");
            }}
          />
        )}
         {/* DREAMSCAPE_INIT OVERLAY 🟡 NEW */}
        {dreamscapeInit && (
          <DreamscapeInitOverlay
            onCancel={() => {
              setActiveMode(null);
              setPendingDreamscapeTopic("");
            }}
            onConfirm={(topic) => {
              setPendingDreamscapeTopic(topic);
              setActiveMode("DREAMSCAPE_GRAPH");
            }}
          />
        )}
      </div>
    </main>
  );
}

// ---------------- SMALL COMPONENT: NeuralInitOverlay ----------------

function NeuralInitOverlay({ onCancel, onConfirm }) {
  const [topic, setTopic] = useState("");

  const start = () => {
    if (!topic.trim()) return;
    onConfirm(topic.trim());
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm z-30">
      <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-slate-300">
        Initialize Subject
      </div>
      <input
        autoFocus
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder="TYPE A TOPIC…  (e.g. React Hooks)"
        className="px-6 py-3 w-[300px] md:w-[420px] bg-black/80 border border-cyan-300/70 text-center text-xs md:text-sm tracking-[0.2em] uppercase rounded-full outline-none focus:border-cyan-400 focus:shadow-[0_0_25px_rgba(34,211,238,0.7)] transition"
      />
      <button
        onClick={start}
        className="mt-2 px-10 py-3 border border-pink-400/80 text-pink-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-pink-500/10 hover:shadow-[0_0_25px_rgba(236,72,153,0.8)] transition"
      >
        ENTER NEURAL SPACE
      </button>
      <p className="mt-3 text-[10px] text-slate-300 tracking-[0.2em] uppercase text-center max-w-md">
        Left click a node to expand. Right click (or right-button) to inspect.
      </p>

      <button
        onClick={onCancel}
        className="mt-4 text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-slate-200"
      >
        CANCEL
      </button>
    </div>
  );
}

// ---------------- SMALL COMPONENT: PortalInitOverlay ----------------

function PortalInitOverlay({ onCancel, onConfirm }) {
  const [topic, setTopic] = useState("");

  const start = () => {
    if (!topic.trim()) return;
    onConfirm(topic.trim());
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm z-30">
      <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-slate-300">
        Initialize Subject
      </div>
      <input
        autoFocus
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder='TYPE A TOPIC…  (e.g. "Elon Musk")'
        className="px-6 py-3 w-[300px] md:w-[420px] bg-black/80 border border-purple-300/70 text-center text-xs md:text-sm tracking-[0.2em] uppercase rounded-full outline-none focus:border-purple-400 focus:shadow-[0_0_25px_rgba(192,132,252,0.8)] transition"
      />
      <button
        onClick={start}
        className="mt-2 px-10 py-3 border border-purple-400/80 text-purple-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-purple-500/10 hover:shadow-[0_0_25px_rgba(192,132,252,0.8)] transition"
      >
        ENTER PORTAL SPACE
      </button>
      <p className="mt-3 text-[10px] text-slate-300 tracking-[0.2em] uppercase text-center max-w-md">
        Click the central portal to open 5 new portals. Click again on a child
        portal to go deeper.
      </p>

      <button
        onClick={onCancel}
        className="mt-4 text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-slate-200"
      >
        CANCEL
      </button>
    </div>
  );
}
// ---------------- DreamscapeInitOverlay 🟡 NEW ----------------
function DreamscapeInitOverlay({ onCancel, onConfirm }) {
  const [topic, setTopic] = useState("");
  const start = () => { if (!topic.trim()) return; onConfirm(topic.trim()); };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/65 backdrop-blur-sm z-30">
      <div className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-amber-300/70">
        Initialize Scenario
      </div>

      <h2 className="text-[11px] md:text-sm tracking-[0.25em] uppercase text-slate-300 text-center max-w-sm">
        What decision or possibility do you want to explore?
      </h2>

      <input
        autoFocus
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && start()}
        placeholder='e.g. "Should I move abroad?"'
        className="px-6 py-3 w-[300px] md:w-[480px] bg-black/80 border border-amber-300/70 text-center text-xs md:text-sm tracking-[0.15em] rounded-full outline-none focus:border-amber-400 focus:shadow-[0_0_25px_rgba(251,191,36,0.6)] transition text-white placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal"
      />

      <div className="flex flex-col items-center gap-1 text-[9px] md:text-[10px] text-slate-500 tracking-[0.15em] uppercase">
        <span>Try: "Should I become a trader?" • "What if AI replaces teachers?"</span>
        <span>"Should I leave college?" • "What if India goes fully AI-driven?"</span>
      </div>

      <button
        onClick={start}
        className="mt-2 px-10 py-3 border border-amber-400/80 text-amber-200 text-[10px] tracking-[0.3em] uppercase rounded-full bg-black/70 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.7)] transition"
      >
        ENTER DREAMSCAPE
      </button>

      <button
        onClick={onCancel}
        className="mt-4 text-[10px] tracking-[0.25em] uppercase text-slate-400 hover:text-slate-200"
      >
        CANCEL
      </button>
    </div>
  );
}