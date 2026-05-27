"use client";

import { useState, useEffect, useRef } from "react";
import QuantumScene from "./QuantumScene";

const TYPE_CONFIG = {
  academic: { label: "ACADEMIC",  color: "text-blue-400",   border: "border-blue-500/30",   bg: "bg-blue-500/5",   bar: "bg-blue-400"   },
  official: { label: "OFFICIAL",  color: "text-green-400",  border: "border-green-500/30",  bg: "bg-green-500/5",  bar: "bg-green-400"  },
  news:     { label: "NEWS",      color: "text-amber-400",  border: "border-amber-500/30",  bg: "bg-amber-500/5",  bar: "bg-amber-400"  },
  wiki:     { label: "WIKI",      color: "text-slate-300",  border: "border-slate-500/25",  bg: "bg-slate-500/5",  bar: "bg-slate-400"  },
  opinion:  { label: "OPINION",   color: "text-orange-400", border: "border-orange-500/25", bg: "bg-orange-500/5", bar: "bg-orange-400" },
  community:{ label: "COMMUNITY", color: "text-purple-400", border: "border-purple-500/25", bg: "bg-purple-500/5", bar: "bg-purple-400" },
  web:      { label: "WEB",       color: "text-slate-400",  border: "border-white/10",      bg: "bg-white/3",      bar: "bg-slate-500"  },
};

function Favicon({ domain }) {
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt="" className="w-4 h-4 rounded-sm shrink-0"
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

function LoadingState({ query }) {
  const [step, setStep] = useState(0);
  const steps = ["Scanning the real-time web…", "Extracting intelligence…", "Analysing source credibility…", "Building your universe…"];
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border border-slate-600/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-2 rounded-full border border-slate-500/40 animate-spin" style={{ borderTopColor: "rgba(148,163,184,0.9)", animationDuration: "1.5s" }} />
        <div className="absolute inset-5 rounded-full border border-slate-600/30 animate-spin" style={{ borderTopColor: "rgba(100,116,139,0.7)", animationDuration: "1s", animationDirection: "reverse" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-400/60 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm tracking-[0.3em] uppercase text-slate-200">{steps[step]}</p>
        <p className="text-xs tracking-[0.2em] uppercase text-slate-600">{query}</p>
      </div>
      <style>{`@keyframes scan{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}

function ResultCard({ result, index }) {
  const [visible, setVisible] = useState(false);
  const cfg = TYPE_CONFIG[result.type] || TYPE_CONFIG.web;
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 70);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onClick={() => window.open(result.url, "_blank", "noopener,noreferrer")}
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(14px)", transition: "opacity 0.35s ease, transform 0.35s ease", cursor: "pointer" }}
      className={`group relative flex flex-col gap-2 p-4 rounded-xl border ${cfg.border} ${cfg.bg} bg-black/60 backdrop-blur hover:brightness-125 transition-all duration-200`}
    >
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${cfg.bar} opacity-60`} />
      <div className="flex items-center gap-2 pl-2">
        <Favicon domain={result.domain} />
        <span className="text-[9px] text-slate-500 tracking-wide truncate flex-1">{result.domain}</span>
        <span className={`text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.color} shrink-0`}>{cfg.label}</span>
        <span className="text-[9px] text-slate-600 shrink-0">{result.score}%</span>
        <span className="text-slate-700 group-hover:text-slate-300 transition-colors shrink-0">↗</span>
      </div>
      <h3 className="text-[15px] text-white group-hover:text-white transition-colors leading-snug pl-2">{result.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover:text-slate-400 transition-colors pl-2">{result.snippet}</p>
      <div className="pl-2 flex items-center gap-2">
        <div className="flex-1 h-px bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full ${cfg.bar} opacity-40`} style={{ width: `${result.score}%`, transition: "width 1s ease" }} />
        </div>
        <span className="text-[8px] text-slate-700 tracking-wide">CREDIBILITY</span>
      </div>
    </div>
  );
}

// ── Ask Quantum ───────────────────────────────────────────────────────
function AskQuantum({ query, sources }) {
  const [question, setQuestion]   = useState("");
  const [answer, setAnswer]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [history, setHistory]     = useState([]);
  const bottomRef                 = useRef(null);

  const ask = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    setLoading(true);
    setHistory((h) => [...h, { role: "user", content: q }]);
    try {
      const res = await fetch("/api/quantum", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, query, sources }),
      });
      const json = await res.json();
      setHistory((h) => [...h, { role: "quantum", content: json.answer || "No answer found." }]);
    } catch {
      setHistory((h) => [...h, { role: "quantum", content: "Intelligence unavailable. Try again." }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  return (
    <div className="flex flex-col border border-white/8 rounded-2xl bg-black/50 backdrop-blur overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-white/2">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        <span className="text-[11px] tracking-[0.42em] uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
  Ask Quantum
</span>
        <span className="ml-auto text-[9px] tracking-[0.2em] uppercase text-slate-400">
  Powered by real sources
</span>
      </div>

      {/* Chat history */}
      {history.length > 0 && (
        <div className="max-h-64 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {history.map((msg, i) => (
            <div key={i} className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <span className="text-[8px] tracking-[0.3em] uppercase text-slate-700">
                {msg.role === "user" ? "YOU" : "QUANTUM"}
              </span>
              <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed max-w-[92%]${
                msg.role === "user"
                  ? "bg-white/8 text-slate-200 border border-white/10"
                  : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <span className="text-[8px] tracking-[0.3em] uppercase text-slate-700">QUANTUM</span>
              <div className="flex gap-1">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && (
        <div className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {[
              "Which source is most reliable?",
              "Give me a quick summary",
              "What should I know first?",
              "Any warnings about this topic?",
            ].map((s) => (
              <button
                key={s}
                onClick={() => { setQuestion(s); }}
                className="px-4 py-2 border border-white/10 rounded-full text-xs text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-white/6">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder={`Ask anything about "${query}"…`}
         className="flex-1 bg-transparent outline-none text-sm text-slate-100  placeholder:text-slate-700 tracking-wide"
        />
        <button
          onClick={ask}
          disabled={!question.trim() || loading}
          className="px-4 py-2 border border-white/20 text-white text-[10px] shadow-[0_0_12px_rgba(255,255,255,0.12)] tracking-[0.25em] uppercase rounded-full hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        >
          ASK
        </button>
      </div>
    </div>
  );
}

// ── Intel panel ───────────────────────────────────────────────────────
function IntelPanel({ intel }) {
  if (!intel) return null;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-3 border-b border-white/6">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
        <span className="text-[9px] tracking-[0.45em] uppercase text-slate-400">Quantum Intel</span>
      </div>

      {intel.keyInsight && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5">
          <div className="text-[8px] tracking-[0.35em] uppercase text-blue-400/70">Key Insight</div>
          <p className="text-xs text-slate-200 leading-relaxed">{intel.keyInsight}</p>
        </div>
      )}

      {intel.hiddenAngle && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="text-[8px] tracking-[0.35em] uppercase text-amber-400/70">What Google Won't Show</div>
          <p className="text-xs text-slate-200 leading-relaxed">{intel.hiddenAngle}</p>
        </div>
      )}

      {intel.futureImplication && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
          <div className="text-[8px] tracking-[0.35em] uppercase text-purple-400/70">Future Implication</div>
          <p className="text-xs text-slate-200 leading-relaxed">{intel.futureImplication}</p>
        </div>
      )}

      {intel.credibilityNote && intel.credibilityNote !== "null" && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="text-[8px] tracking-[0.35em] uppercase text-red-400/70">⚠ Credibility Note</div>
          <p className="text-xs text-slate-300 leading-relaxed">{intel.credibilityNote}</p>
        </div>
      )}

      {intel.connections?.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[8px] tracking-[0.35em] uppercase text-slate-600">Hidden Connections</div>
          {intel.connections.map((c, i) => (
            <div key={i} className="flex flex-col gap-1 p-3 rounded-xl border border-white/6 bg-white/2">
              <span className="text-[9px] tracking-[0.2em] uppercase text-slate-300">{c.topic}</span>
              <span className="text-[10px] text-slate-500 leading-relaxed">{c.reason}</span>
            </div>
          ))}
        </div>
      )}

      {intel.funFact && (
        <div className="p-3 rounded-xl border border-white/6 bg-white/2">
          <div className="text-[8px] tracking-[0.35em] uppercase text-slate-600 mb-1">Did You Know</div>
          <p className="text-[10px] text-slate-400 leading-relaxed">{intel.funFact}</p>
        </div>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function QuantumMode({ initialQuery, onExit }) {
  const [query, setQuery]       = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [phase, setPhase]       = useState("loading");
  const [data, setData]         = useState(null);
  const [error, setError]       = useState(null);

  const search = async (q) => {
    setQuery(q);
    setInputVal(q);
    setPhase("loading");
    setData(null);
    setError(null);
    try {
      const res = await fetch("/api/quantum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
      setPhase("results");
    } catch (e) {
      setError("Search failed. Check your connection.");
      setPhase("error");
    }
  };

  useEffect(() => { search(initialQuery); }, []);

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-black text-white">

      <div className="absolute inset-0">
        <QuantumScene query={query} />
      </div>

      <div className="relative z-20 h-full flex flex-col">

        {/* Header */}
        <header className="h-14 flex items-center gap-3 px-4 md:px-6 bg-black/70 backdrop-blur border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-5 h-5 rounded-full border border-slate-500/60 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </div>
            <span className="text-[10px] tracking-[0.4em] uppercase text-slate-500 hidden md:block">QUANTUM</span>
          </div>

          <div className="flex-1 flex items-center gap-3 px-4 py-2 rounded-xl border border-white/12 bg-white/4 hover:border-white/20 focus-within:border-slate-400/50 focus-within:shadow-[0_0_25px_rgba(148,163,184,0.07)] transition-all duration-300 max-w-2xl">
            <svg className="text-slate-600 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inputVal.trim() && search(inputVal.trim())}
              className="flex-1 bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-600 tracking-wide"
              placeholder="Search anything…"
            />
            {inputVal.trim() && inputVal !== query && (
              <button
                onClick={() => search(inputVal.trim())}
                className="shrink-0 px-3 py-1 border border-white/20 text-slate-300 text-[9px] tracking-[0.25em] uppercase rounded-full hover:bg-white/8 transition-all duration-200"
              >
                SEARCH
              </button>
            )}
          </div>

          <button onClick={onExit} className="shrink-0 text-xs tracking-[0.25em] uppercase text-slate-600 hover:text-slate-200 transition-colors">
            ← EXIT
          </button>
        </header>

        {phase === "loading" && <LoadingState query={query} />}

        {phase === "error" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-red-400 tracking-[0.2em] uppercase">{error}</p>
              <button onClick={() => search(query)} className="px-6 py-2 border border-white/15 text-slate-300 text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/5 transition-all">RETRY</button>
            </div>
          </div>
        )}

        {phase === "results" && data && (
          <div className="flex-1 flex overflow-hidden">

            {/* LEFT — results + Ask Quantum */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 flex flex-col gap-4">

              {/* AI Summary */}
              {data.intel?.summary && (
                <div className="pb-4 border-b border-white/6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-[9px] tracking-[0.4em] uppercase text-slate-500">AI Overview</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{data.intel.summary}</p>
                </div>
              )}

              {/* Answer box */}
              {data.answerBox && (
                <div className="p-4 rounded-xl border border-slate-400/20 bg-slate-400/5">
                  <div className="text-[9px] tracking-[0.4em] uppercase text-slate-500 mb-2">Direct Answer</div>
                  <p className="text-sm text-slate-200 leading-relaxed">{data.answerBox}</p>
                </div>
              )}

              {/* Results count */}
              <div className="flex items-center gap-3">
                <span className="text-[9px] tracking-[0.3em] uppercase text-slate-700">{data.organic?.length || 0} sources found</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Results */}
              <div className="flex flex-col gap-2.5">
                {data.organic?.map((result, i) => (
                  <ResultCard key={i} result={result} index={i} />
                ))}
              </div>

              {/* ── ASK QUANTUM — the wow factor ── */}
              {data.organic?.length > 0 && (
                <div className="mt-2">
                  <AskQuantum query={query} sources={data.organic} />
                </div>
              )}

              {/* Related */}
              {data.relatedSearches?.length > 0 && (
                <div className="flex flex-col gap-3 mt-1">
                  <div className="text-[9px] tracking-[0.4em] uppercase text-slate-700">Related searches</div>
                  <div className="flex flex-wrap gap-2">
                    {data.relatedSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => search(s)}
                        className="px-3 py-1.5 border border-white/8 rounded-full text-xs text-slate-500 hover:text-white hover:border-slate-400/30 hover:bg-white/5 transition-all duration-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-6" />
            </div>

            {/* RIGHT — Quantum Intel */}
            <div className="w-72 xl:w-80 shrink-0 border-l border-white/8 overflow-y-auto px-4 py-5 hidden md:block bg-black/40 backdrop-blur">
              <IntelPanel intel={data.intel} />

              {/* Knowledge graph */}
              {data.knowledgeGraph && (
                <div className="mt-4 p-3 rounded-xl border border-white/8 bg-white/2 flex flex-col gap-2">
                  <div className="text-[8px] tracking-[0.35em] uppercase text-slate-600">Quick Facts</div>
                  {data.knowledgeGraph.title && <p className="text-sm text-slate-200">{data.knowledgeGraph.title}</p>}
                  {data.knowledgeGraph.type && <p className="text-[9px] text-slate-600 uppercase tracking-wide">{data.knowledgeGraph.type}</p>}
                  {data.knowledgeGraph.description && <p className="text-xs text-slate-400 leading-relaxed">{data.knowledgeGraph.description}</p>}
                </div>
              )}

              {/* Universe label at bottom */}
              <div className="mt-6 flex flex-col items-center gap-1 py-4 border-t border-white/6 pointer-events-none select-none">
                <div className="text-[8px] tracking-[0.45em] uppercase text-slate-800">Live Universe</div>
                <p className="text-[9px] text-slate-700 tracking-[0.2em] uppercase text-center">{query}</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}