"use client";

import { useState, useEffect } from "react";
import DreamscapeScene from "./DreamscapeScene";
import {
  EMOTION_STYLES,
  buildInitialPrompt,
  buildFollowUpPrompt,
  buildSummaryPrompt,
  parseAIResponse,
} from "./engine/dreamscapeEngine";

function FadeIn({ children, deps }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [deps]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
      {children}
    </div>
  );
}

function LoadingDots({ color = "amber", message = "Simulating possible futures…" }) {
  const dotColor = color === "purple" ? "bg-purple-400" : color === "teal" ? "bg-teal-400" : "bg-amber-400";
  const textColor = color === "purple" ? "text-purple-400/60" : color === "teal" ? "text-teal-400/60" : "text-amber-400/60";
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-3 h-3 rounded-full ${dotColor} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
      <p className={`text-sm tracking-[0.3em] uppercase ${textColor}`}>{message}</p>
    </div>
  );
}

function JourneyTrail({ history }) {
  if (!history.length) return null;
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs tracking-[0.3em] uppercase text-slate-500 shrink-0">PATH</span>
        {history.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">›</span>
            <span className={`text-xs tracking-[0.15em] uppercase px-3 py-1 rounded-full border ${entry.type === "branch_selected" ? "border-amber-400/30 text-amber-400/80 bg-amber-400/5" : "border-slate-600/40 text-slate-400 bg-white/3"}`}>
              {entry.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailDrawer({ branch, onClose, onEnter }) {
  const style = EMOTION_STYLES[branch.emotion] || EMOTION_STYLES.hopeful;
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-40 flex flex-col bg-black/95 border-l border-white/10 overflow-y-auto">

        <div className={`flex items-start justify-between p-6 border-b ${style.drawerBorder}`}>
          <div className="flex flex-col gap-2 flex-1 pr-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
              <span className={`text-xs tracking-[0.35em] uppercase ${style.drawerAccent}`}>{style.label}</span>
              <span className="ml-auto text-xs tracking-[0.2em] uppercase text-slate-500">RISK: {branch.risk?.toUpperCase()}</span>
            </div>
            <h2 className={`text-lg tracking-[0.15em] uppercase font-light ${style.drawerAccent}`}>{branch.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-xl leading-none mt-1">✕</button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-3">
            <div className={`flex items-center gap-3 text-sm tracking-[0.2em] uppercase border ${style.drawerBorder} rounded-lg px-4 py-3`}>
              <span className="text-slate-500">TIMELINE</span>
              <span className={`ml-auto ${style.drawerAccent}`}>{branch.timeline || "Varies"}</span>
            </div>
            <div className={`flex items-start gap-3 text-sm border ${style.drawerBorder} rounded-lg px-4 py-3`}>
              <span className="text-slate-500 shrink-0 uppercase tracking-[0.2em]">Probability</span>
              <span className="ml-auto text-slate-300 text-right text-sm leading-relaxed">{branch.probability || "Depends on your choices"}</span>
            </div>
          </div>

          {branch.keyConsequence && (
            <div className={`border ${style.drawerBorder} rounded-xl p-4`}>
              <div className={`text-xs tracking-[0.35em] uppercase ${style.drawerAccent} mb-2`}>Key consequence</div>
              <p className="text-base text-white font-light leading-relaxed">{branch.keyConsequence}</p>
            </div>
          )}

          <div>
            <div className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-3">How this future unfolds</div>
            <p className="text-sm text-slate-300 leading-loose">{branch.detail || branch.description}</p>
          </div>

          {branch.opportunities?.length > 0 && (
            <div>
              <div className="text-xs tracking-[0.35em] uppercase text-teal-400/60 mb-3">Opportunities</div>
              <div className="flex flex-col gap-2">
                {branch.opportunities.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-teal-400 mt-0.5 text-sm">↑</span>
                    <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {branch.risks?.length > 0 && (
            <div>
              <div className="text-xs tracking-[0.35em] uppercase text-red-400/60 mb-3">Risks</div>
              <div className="flex flex-col gap-2">
                {branch.risks.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 text-sm">↓</span>
                    <span className="text-sm text-slate-300 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <button
            onClick={() => { onClose(); onEnter(branch); }}
            className={`w-full py-4 border rounded-xl text-sm tracking-[0.3em] uppercase bg-black/60 backdrop-blur transition-all duration-300 ${style.border} ${style.drawerAccent} hover:bg-white/5`}
          >
            ENTER THIS FUTURE →
          </button>
        </div>
      </div>
    </>
  );
}

function BranchCard({ branch, onSelect, onShowMore }) {
  const style = EMOTION_STYLES[branch.emotion] || EMOTION_STYLES.hopeful;
  return (
    <div className={`flex flex-col gap-4 p-5 rounded-xl border bg-black/65 backdrop-blur transition-all duration-300 w-full ${style.border}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        <span className={`text-xs tracking-[0.3em] uppercase ${style.text}`}>{style.label}</span>
        <span className="ml-auto text-xs tracking-[0.2em] uppercase text-slate-500 shrink-0">RISK: {branch.risk?.toUpperCase()}</span>
      </div>

      <h3 className={`text-base tracking-[0.15em] uppercase font-light ${style.text}`}>{branch.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{branch.description}</p>

      {branch.timeline && (
        <div className="text-xs text-slate-500 tracking-[0.15em] uppercase border border-white/10 rounded-full px-3 py-1 w-fit">
          {branch.timeline}
        </div>
      )}

      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => onShowMore(branch)}
          className="flex-1 py-2.5 border border-white/15 rounded-lg text-xs tracking-[0.2em] uppercase text-slate-400 hover:text-white hover:border-white/30 transition-all duration-200"
        >
          MORE INFO
        </button>
        <button
          onClick={() => onSelect(branch)}
          className={`flex-1 py-2.5 border rounded-lg text-xs tracking-[0.2em] uppercase transition-all duration-200 ${style.border} ${style.text} hover:bg-white/5`}
        >
          ENTER →
        </button>
      </div>
    </div>
  );
}

function FollowUpPanel({ followUp, onChoice }) {
  const [custom, setCustom] = useState("");
  const submitCustom = () => { if (!custom.trim()) return; onChoice(custom.trim()); setCustom(""); };
  return (
    <div className="flex flex-col items-center gap-5 max-w-xl mx-auto px-4 text-center w-full">
      <div className="text-xs tracking-[0.4em] uppercase text-amber-400/50">The universe asks</div>
      <h2 className="text-lg md:text-xl tracking-[0.2em] uppercase text-amber-100">{followUp.question}</h2>

      <div className="flex flex-wrap justify-center gap-3 mt-1">
        {followUp.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => onChoice(choice)}
            className="px-6 py-3 border border-amber-400/50 text-amber-200 text-sm tracking-[0.2em] uppercase rounded-full bg-black/60 backdrop-blur hover:bg-amber-500/10 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all duration-300"
          >
            {choice}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 w-full max-w-sm">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs tracking-[0.25em] uppercase text-slate-500">or write your own</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <div className="flex items-center gap-2 w-full max-w-sm">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitCustom()}
          placeholder="Type your own path…"
          className="flex-1 px-5 py-3 bg-black/70 border border-white/15 rounded-full text-sm text-white placeholder:text-slate-600 placeholder:normal-case outline-none focus:border-amber-400/60 focus:shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all duration-300"
        />
        <button
          onClick={submitCustom}
          disabled={!custom.trim()}
          className="px-5 py-3 border border-amber-400/60 text-amber-300 text-sm tracking-[0.2em] uppercase rounded-full bg-black/60 hover:bg-amber-500/10 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          GO →
        </button>
      </div>
    </div>
  );
}

function SummaryScreen({ summary, history, scenario, onRestart, onExit }) {
  return (
    <div
      className="absolute inset-0 z-10 overflow-y-auto"
      style={{
        opacity: 1,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.85) 100%)",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="min-h-full flex flex-col items-center px-4 py-12 md:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-4 text-center mb-10">
          <div className="text-xs tracking-[0.5em] uppercase text-amber-400/50">
            Simulation Complete
          </div>
          <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase text-amber-100 max-w-3xl leading-tight">
            {summary.title}
          </h1>
          {summary.coreValue && (
            <div className="mt-2 px-8 py-3 border border-amber-400/40 rounded-full text-sm tracking-[0.4em] uppercase text-amber-300 bg-amber-400/5">
              Core value — {summary.coreValue}
            </div>
          )}
        </div>

        {/* ── Main cards ── */}
        <div className="w-full max-w-3xl flex flex-col gap-5">

          {/* What your journey reveals */}
          <div className="border border-white/12 rounded-2xl p-6 md:p-8 bg-black/60 backdrop-blur">
            <div className="text-xs tracking-[0.4em] uppercase text-slate-500 mb-4">
              What your journey reveals
            </div>
            <p className="text-base md:text-lg text-slate-200 leading-loose font-light">
              {summary.overview}
            </p>
          </div>

          {/* Pattern + Reality side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-amber-400/20 rounded-2xl p-6 bg-amber-400/4 backdrop-blur">
              <div className="text-xs tracking-[0.4em] uppercase text-amber-400/60 mb-4">
                Hidden pattern
              </div>
              <p className="text-base text-amber-100/85 leading-relaxed font-light">
                {summary.pattern}
              </p>
            </div>

            <div className="border border-white/12 rounded-2xl p-6 bg-black/50 backdrop-blur">
              <div className="text-xs tracking-[0.4em] uppercase text-slate-500 mb-4">
                Most likely reality
              </div>
              <p className="text-base text-slate-300 leading-relaxed font-light">
                {summary.finalReality}
              </p>
            </div>
          </div>

          {/* Final advice — hero card */}
          <div className="border border-purple-400/30 rounded-2xl p-8 bg-purple-500/5 backdrop-blur">
            <div className="text-xs tracking-[0.4em] uppercase text-purple-400/60 mb-4">
              Final advice
            </div>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed font-light">
              {summary.advice}
            </p>
          </div>

          {/* Journey recap */}
          <div className="border border-white/8 rounded-2xl p-6 md:p-8 bg-black/50 backdrop-blur">
            <div className="text-xs tracking-[0.4em] uppercase text-slate-500 mb-6">
              Your full journey
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-slate-500">
                Started with:{" "}
                <span className="text-slate-200 font-light">"{scenario}"</span>
              </div>
              {history.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-slate-600 text-sm mt-0.5 w-5 shrink-0">{i + 1}.</span>
                  <span className={`text-sm shrink-0 ${entry.type === "branch_selected" ? "text-amber-400/70" : "text-slate-500"}`}>
                    {entry.type === "branch_selected" ? "Entered →" : "Chose →"}
                  </span>
                  <span className={`text-sm leading-relaxed ${entry.type === "branch_selected" ? "text-amber-200" : "text-slate-400"}`}>
                    {entry.content}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 pb-8">
            <button
              onClick={onRestart}
              className="px-10 py-4 border border-white/20 text-slate-300 text-sm tracking-[0.3em] uppercase rounded-full bg-black/60 hover:border-white/40 hover:text-white transition-all duration-300"
            >
              NEW SIMULATION
            </button>
            <button
              onClick={onExit}
              className="px-10 py-4 border border-amber-400/50 text-amber-200 text-sm tracking-[0.3em] uppercase rounded-full bg-black/60 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.35)] transition-all duration-300"
            >
              EXIT DREAMSCAPE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function DreamscapeMode({ initialTopic, onExit }) {
  const [phase, setPhase]               = useState("idle");
  const [branches, setBranches]         = useState([]);
  const [followUp, setFollowUp]         = useState(null);
  const [selectedBranch, setSelected]   = useState(null);
  const [drawerBranch, setDrawerBranch] = useState(null);
  const [emotion, setEmotion]           = useState("default");
  const [history, setHistory]           = useState([]);
  const [summary, setSummary]           = useState(null);
  const [error, setError]               = useState(null);

  const callAI = async (prompt) => {
    const res = await fetch("/api/dreamscape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API error");
    return data.text;
  };

  const simulateFutures = async () => {
    setPhase("generating");
    setError(null);
    try {
      const text = await callAI(buildInitialPrompt(initialTopic));
      const parsed = parseAIResponse(text);
      setBranches(parsed.branches);
      setFollowUp(parsed.followUp);
      setPhase("branches");
    } catch {
      setError("Simulation failed. Check your connection and try again.");
      setPhase("idle");
    }
  };

  const selectBranch = (branch) => {
    setSelected(branch);
    setEmotion(branch.emotion || "default");
    setHistory((prev) => [...prev, { type: "branch_selected", content: branch.title }]);
    setPhase("followup");
  };

  const answerFollowUp = async (choice) => {
    setPhase("evolving");
    setError(null);
    const updatedHistory = [...history, { type: "followup_answer", content: choice }];
    setHistory(updatedHistory);
    try {
      const text = await callAI(buildFollowUpPrompt(initialTopic, updatedHistory));
      const parsed = parseAIResponse(text);
      setBranches(parsed.branches);
      setFollowUp(parsed.followUp);
      setPhase("branches");
    } catch {
      setError("Evolution failed. Try again.");
      setPhase("branches");
    }
  };

  const endSimulation = async () => {
    if (!history.length) return;
    setPhase("summarising");
    try {
      const text = await callAI(buildSummaryPrompt(initialTopic, history));
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setSummary(parsed);
      setPhase("summary");
    } catch {
      setSummary({
        title: "A Journey Through Possibility",
        overview: "Your choices reveal a person navigating between ambition and security, always searching for a path that feels authentic.",
        pattern: "You consistently choose growth over comfort, even when it scares you.",
        finalReality: "The future you're building is unconventional but real. It will require more patience than you expect.",
        coreValue: "Meaning",
        advice: "Stop waiting for certainty — the path only becomes clear by walking it.",
      });
      setPhase("summary");
    }
  };

  const restartSimulation = () => {
    setPhase("idle");
    setHistory([]);
    setEmotion("default");
    setSummary(null);
    setBranches([]);
    setFollowUp(null);
    setSelected(null);
    setError(null);
  };

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-black text-white">

      <div className="absolute inset-0">
        <DreamscapeScene emotion={emotion} />
      </div>

      {drawerBranch && (
        <DetailDrawer
          branch={drawerBranch}
          onClose={() => setDrawerBranch(null)}
          onEnter={(branch) => { setDrawerBranch(null); selectBranch(branch); }}
        />
      )}

      <div className="relative z-20 h-full flex flex-col">

        {/* Top bar */}
        <header className="h-18 flex items-center justify-between px-6 md:px-10 py-4 bg-black/45 backdrop-blur border-b border-amber-400/15 shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-amber-300 uppercase tracking-[0.30em] text-sm md:text-base">DREAMSCAPE</span>
            <span className="text-slate-500 tracking-[0.15em] text-xs uppercase truncate max-w-[200px] md:max-w-lg">
              {initialTopic}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {history.length >= 2 && phase !== "summary" && phase !== "summarising" && (
              <button
                onClick={endSimulation}
                className="px-5 py-2 border border-white/20 text-slate-400 text-xs tracking-[0.25em] uppercase rounded-full bg-black/40 hover:border-amber-400/40 hover:text-amber-300 transition-all duration-300"
              >
                END SIMULATION
              </button>
            )}
            <button
              onClick={onExit}
              className="text-sm tracking-[0.25em] uppercase text-slate-400 hover:text-amber-300 transition-colors"
            >
              ← EXIT
            </button>
          </div>
        </header>

        {/* Center stage */}
       <div className="flex-1 flex flex-col items-center justify-start px-4 py-6 overflow-y-auto">
          {phase === "idle" && (
            <FadeIn deps="idle">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="text-sm tracking-[0.45em] uppercase text-amber-400/40">Scenario loaded</div>
                <h1 className="text-2xl md:text-4xl font-light tracking-[0.2em] uppercase text-amber-100 max-w-2xl">
                  {initialTopic}
                </h1>
                {error && <p className="text-sm text-red-400 tracking-[0.2em] uppercase">{error}</p>}
                <button
                  onClick={simulateFutures}
                  className="mt-4 px-12 py-4 border border-amber-400/70 text-amber-200 text-sm tracking-[0.35em] uppercase rounded-full bg-black/60 backdrop-blur hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300"
                >
                  SIMULATE FUTURES
                </button>
              </div>
            </FadeIn>
          )}

          {phase === "generating" && (
            <FadeIn deps="generating">
              <LoadingDots color="amber" message="Simulating possible futures…" />
            </FadeIn>
          )}

          {phase === "evolving" && (
            <FadeIn deps="evolving">
              <LoadingDots color="purple" message="Evolving your universe…" />
            </FadeIn>
          )}

          {phase === "summarising" && (
            <FadeIn deps="summarising">
              <LoadingDots color="teal" message="Analysing your journey…" />
            </FadeIn>
          )}

          {phase === "branches" && (
            <FadeIn deps={branches}>
              <div className="w-full max-w-5xl flex flex-col gap-4">
                <JourneyTrail history={history} />
                <div className="text-center text-sm tracking-[0.4em] uppercase text-slate-500 mb-2">
                  Choose a possible future
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-1">
                  {branches.map((branch) => (
                    <BranchCard
                      key={branch.id}
                      branch={branch}
                      onSelect={selectBranch}
                      onShowMore={(b) => setDrawerBranch(b)}
                    />
                  ))}
                </div>
                <button
                  onClick={restartSimulation}
                  className="mx-auto mt-3 text-sm tracking-[0.25em] uppercase text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ← START OVER
                </button>
              </div>
            </FadeIn>
          )}

          {phase === "followup" && followUp && (
            <FadeIn deps={followUp}>
              <div className="flex flex-col items-center gap-5 w-full">
                <JourneyTrail history={history} />
                <div className="text-sm tracking-[0.3em] uppercase text-slate-500">
                  You chose: <span className="text-amber-300">{selectedBranch?.title}</span>
                </div>
                <FollowUpPanel followUp={followUp} onChoice={answerFollowUp} />
                <button
                  onClick={() => setPhase("branches")}
                  className="mt-2 text-sm tracking-[0.25em] uppercase text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ← BACK TO FUTURES
                </button>
              </div>
            </FadeIn>
          )}

          {phase === "summary" && summary && (
  <div className="absolute inset-0 z-10">
    <SummaryScreen
      summary={summary}
      history={history}
      scenario={initialTopic}
      onRestart={restartSimulation}
      onExit={onExit}
    />
  </div>
)}

        </div>
      </div>
    </main>
  );
}