"use client";

import { useState, useEffect, useRef } from "react";
import StrategyScene from "./StrategyScene";
import StrategyTreeView from "./StrategyTreeView";

// ── Onboarding — ask user before generating ──────────────────────────
function OnboardingScreen({ goal, onConfirm }) {
  const [step, setStep]           = useState(0);
  const [hoursPerDay, setHours]   = useState(null);
  const [level, setLevel]         = useState(null);
  const [deadline, setDeadline]   = useState(null);

  const questions = [
    {
      key: "hours",
      label: "How much time can you dedicate daily?",
      sub: "Be honest — this shapes every task in your plan",
      options: [
        { label: "30–60 min", value: "30-60 minutes" },
        { label: "1–2 hours", value: "1-2 hours" },
        { label: "2–4 hours", value: "2-4 hours" },
        { label: "4+ hours", value: "4+ hours" },
      ],
    },
    {
      key: "level",
      label: "What's your current level?",
      sub: "This decides where your strategy starts",
      options: [
        { label: "Complete beginner", value: "complete beginner" },
        { label: "Some experience",   value: "some experience" },
        { label: "Intermediate",      value: "intermediate" },
        { label: "Advanced",          value: "advanced" },
      ],
    },
    {
      key: "deadline",
      label: "When do you want this done?",
      sub: "Realistic timelines lead to real results",
      options: [
        { label: "1 month",   value: "1 month" },
        { label: "3 months",  value: "3 months" },
        { label: "6 months",  value: "6 months" },
        { label: "1 year",    value: "1 year" },
      ],
    },
  ];

  const current = questions[step];

  const handleSelect = (value) => {
    if (step === 0) setHours(value);
    if (step === 1) setLevel(value);
    if (step === 2) {
      setDeadline(value);
      onConfirm({ hoursPerDay: hoursPerDay, level, deadline: value });
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">

      {/* Goal display */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-xs tracking-[0.4em] uppercase text-emerald-400/50">Your Goal</div>
        <h2 className="text-xl md:text-2xl font-light tracking-[0.15em] uppercase text-emerald-100 max-w-xl">
          {goal}
        </h2>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {questions.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? "bg-emerald-400 w-6" : i < step ? "bg-emerald-600" : "bg-white/15"}`} />
        ))}
      </div>

      {/* Question */}
      <div className="flex flex-col items-center gap-3 text-center max-w-lg">
        <h3 className="text-lg md:text-xl tracking-[0.1em] text-white font-light">
          {current.label}
        </h3>
        <p className="text-sm text-slate-500 tracking-wide">{current.sub}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {current.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="px-5 py-4 border border-emerald-400/30 text-emerald-200 text-sm tracking-[0.15em] uppercase rounded-xl bg-black/60 backdrop-blur hover:bg-emerald-500/10 hover:border-emerald-400/70 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 text-center"
          >
            {opt.label}
          </button>
        ))}
      </div>

    </div>
  );
}

// ── Loading ──────────────────────────────────────────────────────────
function LoadingState({ goal }) {
  const [step, setStep] = useState(0);
  const steps = ["Personalising your plan…", "Mapping phases…", "Building milestones…", "Finding resources…", "Generating 3D roadmap…"];
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border border-emerald-600/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-2 rounded-full border border-emerald-500/40 animate-spin" style={{ borderTopColor: "rgba(16,185,129,0.9)", animationDuration: "1.5s" }} />
        <div className="absolute inset-5 rounded-full border border-emerald-600/30 animate-spin" style={{ borderTopColor: "rgba(5,150,105,0.7)", animationDuration: "1s", animationDirection: "reverse" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-400/60 animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-base tracking-[0.3em] uppercase text-emerald-200">{steps[step]}</p>
        <p className="text-sm tracking-[0.2em] uppercase text-slate-600">{goal}</p>
      </div>
    </div>
  );
}

// ── Color utilities ─────────────────────────────────────────────────
const PHASE_COLORS = {
  foundation: { name: "Foundation", color: "blue" },
  buildup: { name: "Build Up", color: "purple" },
  acceleration: { name: "Acceleration", color: "yellow" },
  mastery: { name: "Mastery", color: "emerald" },
};

const EFFORT_COLORS = {
  easy: { name: "Easy", emoji: "⚡", color: "green" },
  medium: { name: "Medium", emoji: "⚙️", color: "yellow" },
  hard: { name: "Hard", emoji: "💪", color: "red" },
};

function getColorClasses(type, value) {
  if (type === "phase") {
    const color = value === "blue" ? "blue" : value === "purple" ? "purple" : value === "yellow" ? "yellow" : "emerald";
    return {
      bg: `bg-${color}-500/10`,
      border: `border-${color}-500/40`,
      text: `text-${color}-400`,
      badge: `bg-${color}-500/20 text-${color}-300`,
    };
  }
  if (type === "effort") {
    const color = value === "easy" ? "green" : value === "hard" ? "red" : "yellow";
    return {
      bg: `bg-${color}-500/10`,
      border: `border-${color}-500/40`,
      text: `text-${color}-400`,
      badge: `bg-${color}-500/20 text-${color}-300 border-${color}-500/60`,
    };
  }
}

// ── Node detail panel ────────────────────────────────────────────────
function NodeDetailPanel({ node, completedNodes, onToggleComplete, onClose }) {
  if (!node) return null;
  const isPhase     = node.nodeType === "phase";
  const isCompleted = completedNodes.includes(node.id);
  const phaseColor = PHASE_COLORS[node.color];
  const effortInfo = EFFORT_COLORS[node.effort];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl z-50 flex flex-col bg-gradient-to-br from-slate-900/95 to-black/95 border-l border-white/10 overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-900/30">
          <div className="flex flex-col gap-3 flex-1 pr-4">
            {/* Type badge */}
            {isPhase && phaseColor && (
              <div className="flex items-center gap-2">
                <span className={`text-[10px] tracking-[0.4em] uppercase font-bold px-2.5 py-1 rounded-full border bg-${phaseColor.color}-500/20 text-${phaseColor.color}-300 border-${phaseColor.color}-500/40`}>
                  {phaseColor.name} Phase
                </span>
              </div>
            )}
            {!isPhase && effortInfo && (
              <div className="flex items-center gap-2">
                <span className={`text-xl`}>{effortInfo.emoji}</span>
                <span className={`text-[10px] tracking-[0.4em] uppercase font-bold px-2.5 py-1 rounded-full border bg-${effortInfo.color}-500/20 text-${effortInfo.color}-300 border-${effortInfo.color}-500/40`}>
                  {effortInfo.name} Effort
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl tracking-[0.1em] uppercase font-light text-white">
              {node.title}
            </h2>

            {/* Meta */}
            <div className="flex gap-3 flex-wrap">
              {node.duration && <span className="text-xs text-slate-400 tracking-wide px-2 py-1 bg-white/5 rounded">{node.duration}</span>}
              {node.estimatedHours && <span className="text-xs text-slate-400 tracking-wide px-2 py-1 bg-white/5 rounded">~{node.estimatedHours} hours</span>}
              {node.days && <span className="text-xs text-slate-400 tracking-wide px-2 py-1 bg-white/5 rounded">{node.days}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none mt-1 transition-colors">✕</button>
        </div>

        <div className="flex flex-col gap-6 p-6 flex-1 overflow-y-auto">

          {/* Phase-specific sections */}
          {isPhase && node.assumption && (
            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-blue-400/60 mb-2">Key Assumption</div>
              <p className="text-sm text-blue-100 leading-relaxed">{node.assumption}</p>
            </div>
          )}

          {/* Milestone-specific sections */}
          {!isPhase && node.learningOutcome && (
            <div className="p-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-cyan-400/60 mb-2">What You'll Learn</div>
              <p className="text-sm text-cyan-100 leading-relaxed">{node.learningOutcome}</p>
            </div>
          )}

          {/* Goal / Overview */}
          {isPhase && node.goal && (
            <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-emerald-400/60 mb-2">Phase Goal</div>
              <p className="text-base text-emerald-100 leading-relaxed font-light">{node.goal}</p>
            </div>
          )}

          {/* Description / Overview */}
          {node.description || node.overview ? (
            <div>
              <div className="text-[9px] tracking-[0.35em] uppercase text-slate-400 mb-2">Overview</div>
              <p className="text-sm text-slate-300 leading-relaxed">{node.description || node.overview}</p>
            </div>
          ) : null}

          {/* Daily task — milestones */}
          {!isPhase && node.dailyTask && (
            <div className="p-4 rounded-lg border border-teal-500/20 bg-teal-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-teal-400/60 mb-2">Daily Task</div>
              <p className="text-sm text-teal-100 leading-relaxed">{node.dailyTask}</p>
            </div>
          )}

          {/* Tangible Output */}
          {!isPhase && node.tangibleOutput && (
            <div className="p-4 rounded-lg border border-orange-500/20 bg-orange-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-orange-400/60 mb-2">What You Build</div>
              <p className="text-sm text-orange-100 leading-relaxed">{node.tangibleOutput}</p>
            </div>
          )}

          {/* Week focus / Phase focus */}
          {isPhase && node.weekFocus && (
            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-blue-400/60 mb-2">Weekly Focus</div>
              <p className="text-sm text-blue-100 leading-relaxed">{node.weekFocus}</p>
            </div>
          )}

          {/* Phase checkpoint / Success sign */}
          {isPhase && node.phaseCheckpoint && (
            <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-emerald-400/60 mb-2">✓ How to Know You're Done</div>
              <p className="text-sm text-emerald-100 leading-relaxed">{node.phaseCheckpoint}</p>
            </div>
          )}

          {isPhase && node.successSign && (
            <div className="p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-emerald-400/60 mb-2">✓ Phase Complete When</div>
              <p className="text-sm text-emerald-100 leading-relaxed">{node.successSign}</p>
            </div>
          )}

          {/* Next milestone requirement */}
          {!isPhase && node.nextMilestoneRequirement && (
            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-amber-400/60 mb-2">Before Next Step</div>
              <p className="text-sm text-amber-100 leading-relaxed">{node.nextMilestoneRequirement}</p>
            </div>
          )}

          {/* Milestones list — phases */}
          {isPhase && node.milestones?.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[0.35em] uppercase text-slate-400 mb-3">Milestones in this Phase</div>
              <div className="flex flex-col gap-2">
                {node.milestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/2 hover:bg-white/4 transition-colors">
                    <div className="w-6 h-6 rounded-full border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] text-emerald-400">{m.number}</span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm text-slate-200 font-medium">{m.title}</span>
                      <span className="text-xs text-slate-500">{m.days}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {node.resources?.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[0.35em] uppercase text-emerald-400/60 mb-3">📚 Learning Resources</div>
              <div className="flex flex-col gap-2">
                {node.resources.map((r, i) => (
                  <a
                    key={i}
                    href={r.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-200 group-hover:text-white transition-colors font-medium">
                        {r.name}
                      </span>
                      <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">↗</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[9px] text-slate-600 uppercase tracking-wide px-2 py-0.5 bg-white/5 rounded">
                        {r.type}
                      </span>
                      {r.duration && (
                        <span className="text-[9px] text-slate-600">{r.duration}</span>
                      )}
                    </div>
                    {r.why && (
                      <p className="text-[9px] text-slate-400 italic">{r.why}</p>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {node.tips?.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[0.35em] uppercase text-yellow-400/60 mb-3">💡 Pro Tips</div>
              <div className="flex flex-col gap-2">
                {node.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-yellow-500/15 bg-yellow-500/5">
                    <span className="text-yellow-400 text-sm mt-0.5 shrink-0">•</span>
                    <span className="text-sm text-slate-300">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistake */}
          {node.commonMistake && (
            <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-red-400/60 mb-2">⚠ Common Pitfall</div>
              <p className="text-sm text-red-200 leading-relaxed">{node.commonMistake}</p>
            </div>
          )}

          {/* Risks */}
          {node.risks?.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[0.35em] uppercase text-red-400/60 mb-3">Watch Out For</div>
              <div className="flex flex-col gap-2">
                {node.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-red-500/15 bg-red-500/5">
                    <span className="text-red-400 text-sm mt-0.5">⚠</span>
                    <span className="text-sm text-slate-300 leading-relaxed">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expected Challenges */}
          {node.expectedChallenges?.length > 0 && (
            <div>
              <div className="text-[9px] tracking-[0.35em] uppercase text-orange-400/60 mb-3">Expected Challenges</div>
              <div className="flex flex-col gap-2">
                {node.expectedChallenges.map((challenge, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg border border-orange-500/15 bg-orange-500/5">
                    <span className="text-orange-400 text-sm mt-0.5">⚡</span>
                    <span className="text-sm text-slate-300">{challenge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mitigation */}
          {node.mitigation && (
            <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <div className="text-[9px] tracking-[0.35em] uppercase text-blue-400/60 mb-2">How to Handle Setbacks</div>
              <p className="text-sm text-blue-100 leading-relaxed">{node.mitigation}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isPhase && (
          <div className="mt-auto p-6 border-t border-white/10 bg-gradient-to-t from-black/40 to-black/0">
            <button
              onClick={() => onToggleComplete(node.id)}
              className={`w-full py-3 px-4 border rounded-lg text-sm tracking-[0.25em] uppercase font-medium transition-all duration-300 ${
                isCompleted
                  ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
                  : "border-white/20 text-slate-300 bg-white/5 hover:bg-white/10"
              }`}
            >
              {isCompleted ? "✓ COMPLETED" : "MARK COMPLETE"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Ask Strategy AI ──────────────────────────────────────────────────
function AskStrategy({ goal, strategy, userContext }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState([]);
  const [isMinimized, setIsMinimized] = useState(true);
  const bottomRef               = useRef(null);

  const ask = async (q) => {
    const text = (q || question).trim();
    if (!text || loading) return;
    setQuestion("");
    setIsMinimized(false);
    setLoading(true);
    setHistory((h) => [...h, { role: "user", content: text }]);
    try {
      const res = await fetch("/api/strategy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, goal, strategy, userContext }),
      });
      const json = await res.json();
      setHistory((h) => [...h, { role: "ai", content: json.answer || "No answer found." }]);
    } catch {
      setHistory((h) => [...h, { role: "ai", content: "Unable to respond. Try again." }]);
    }
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const quickPrompts = [
    "What should I do today?",
    "I'm stuck, help me",
    "Biggest challenge?",
    "Weekly schedule?",
    "Miss a day — what now?",
    "Am I on track?",
  ];

  return (
    <div className={`border-t border-white/10 bg-gradient-to-t from-slate-900/80 to-black/60 backdrop-blur transition-all duration-300 flex flex-col ${
      isMinimized ? "h-16" : "h-96"
    }`}>

      {/* Header / Minimize Button */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse" />
          <span className="text-sm tracking-[0.35em] uppercase text-blue-300 font-bold">Strategy Coach 🎯</span>
          <span className="text-xs text-slate-500 tracking-wide">{history.length} messages</span>
        </div>
        <div className="flex items-center gap-3">
          {!isMinimized && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="px-3 py-1 text-xs border border-slate-500/40 text-slate-400 hover:text-slate-200 hover:border-slate-400/60 rounded transition-all"
            >
              Minimize
            </button>
          )}
          <span className={`text-xl transition-transform ${isMinimized ? "" : "rotate-180"}`}>
            ▼
          </span>
        </div>
      </button>

      {/* Chat area */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4 bg-black/30">
            {history.length === 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500 tracking-wide mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((p) => (
                    <button key={p} onClick={() => ask(p)}
                      className="px-3 py-2 text-xs border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-100 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all bg-blue-500/5">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 ${
                    msg.role === "user"
                      ? "bg-slate-700 text-slate-300"
                      : "bg-gradient-to-br from-blue-500 to-blue-700 text-white"
                  }`}>
                    {msg.role === "user" ? "You" : "🎯"}
                  </div>

                  {/* Message */}
                  <div className={`px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600/40 text-blue-100 border border-blue-500/30"
                      : "bg-slate-700/40 text-slate-100 border border-slate-600/30"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm shrink-0">
                    🎯
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-slate-700/40 border border-slate-600/30">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="flex items-end gap-3 px-6 py-3 border-t border-slate-600/30 bg-black/50">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask about your strategy…"
              className="flex-1 bg-slate-800/50 outline-none text-sm text-slate-100 placeholder:text-slate-500 tracking-wide px-4 py-3 rounded-lg border border-slate-600/40 focus:border-blue-500/60 transition-colors"
            />
            <button 
              onClick={() => ask()} 
              disabled={!question.trim() || loading}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs tracking-[0.25em] uppercase rounded-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function StrategyMode({ initialGoal, onExit }) {
  const [screen, setScreen]         = useState("onboarding");
  const [userContext, setContext]    = useState(null);
  const [strategy, setStrategy]     = useState(null);
  const [error, setError]           = useState(null);
  const [selectedNode, setSelected] = useState(null);
  const [completedNodes, setDone]   = useState([]);
  const [hoveredId, setHovered]     = useState(null);
  const [viewMode, setViewMode]     = useState("split"); // "split", "tree", or "3d"

  const generate = async (ctx) => {
    setContext(ctx);
    setScreen("loading");
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: initialGoal, ...ctx }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setStrategy(json.strategy);
      setScreen("ready");
    } catch (e) {
      setError("Strategy generation failed. Check your connection.");
      setScreen("error");
    }
  };

  const toggleComplete = (id) => {
    setDone((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const total = strategy?.phases?.reduce((a, p) => a + (p.milestones?.length || 0), 0) || 0;
  const done  = completedNodes.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#010a04] text-white flex flex-col">

      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 md:px-8 bg-black/70 backdrop-blur border-b border-emerald-400/15 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-emerald-300 uppercase tracking-[0.35em] text-xs md:text-sm">STRATEGY MODE</span>
            <span className="text-slate-500 tracking-[0.1em] text-[10px] truncate max-w-[200px] md:max-w-lg">
              {initialGoal}
            </span>
          </div>

          {/* Progress — only when ready */}
          {screen === "ready" && (
            <div className="hidden md:flex items-center gap-3 ml-6">
              <div className="w-32 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-emerald-400">{pct}%</span>
              <span className="text-xs text-slate-600">{done}/{total} done</span>
            </div>
          )}
        </div>

        <button onClick={onExit} className="text-xs tracking-[0.25em] uppercase text-slate-500 hover:text-emerald-300 transition-colors">
          ← EXIT
        </button>
      </header>

      {/* Onboarding */}
      {screen === "onboarding" && (
        <OnboardingScreen goal={initialGoal} onConfirm={generate} />
      )}

      {/* Loading */}
      {screen === "loading" && <LoadingState goal={initialGoal} />}

      {/* Error */}
      {screen === "error" && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-red-400 tracking-[0.2em] uppercase">{error}</p>
            <button onClick={() => generate(userContext)}
              className="px-6 py-2.5 border border-white/15 text-slate-300 text-xs tracking-[0.25em] uppercase rounded-full hover:bg-white/5 transition-all">
              RETRY
            </button>
          </div>
        </div>
      )}

      {/* Ready */}
      {screen === "ready" && strategy && (
        <>
          {/* Overview strip */}
          <div className="flex gap-3 px-6 py-4 border-b border-white/10 bg-gradient-to-r from-slate-800/30 to-black/20 backdrop-blur shrink-0 flex-wrap">
            <div className="flex-1 min-w-fit p-4 rounded-lg border border-slate-600/40 bg-slate-700/10">
              <div className="text-[8px] tracking-[0.35em] uppercase text-slate-400 mb-1.5 font-semibold">📋 Overview</div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{strategy.overview}</p>
            </div>
            <div className="flex-1 min-w-fit p-4 rounded-lg border border-blue-500/30 bg-blue-500/8">
              <div className="text-[8px] tracking-[0.35em] uppercase text-blue-400 mb-1.5 font-semibold">🎯 Start Today</div>
              <p className="text-xs text-blue-200 leading-relaxed line-clamp-3">{strategy.firstStep}</p>
            </div>
            <div className="flex-1 min-w-fit p-4 rounded-lg border border-amber-500/30 bg-amber-500/8">
              <div className="text-[8px] tracking-[0.35em] uppercase text-amber-400 mb-1.5 font-semibold">⚡ Timeline</div>
              <p className="text-xs text-amber-200 leading-relaxed">{strategy.timeline}</p>
            </div>
            <div className="flex-1 min-w-fit p-4 rounded-lg border border-red-500/30 bg-red-500/8">
              <div className="text-[8px] tracking-[0.35em] uppercase text-red-400 mb-1.5 font-semibold">⚠️ Biggest Risk</div>
              <p className="text-xs text-red-200 leading-relaxed line-clamp-3">{strategy.biggestRisk}</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex overflow-hidden flex-col">

            {/* View mode toggle */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-black/40 shrink-0">
              <span className="text-[8px] tracking-[0.35em] uppercase text-slate-600 mr-2">Visualization:</span>
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  viewMode === "split"
                    ? "bg-blue-500/20 border-blue-500/60 text-blue-300"
                    : "border-white/20 text-slate-400 hover:text-slate-300"
                }`}
              >
                📊 Split View
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  viewMode === "tree"
                    ? "bg-blue-500/20 border-blue-500/60 text-blue-300"
                    : "border-white/20 text-slate-400 hover:text-slate-300"
                }`}
              >
                🌳 Tree Only
              </button>
              <button
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  viewMode === "3d"
                    ? "bg-blue-500/20 border-blue-500/60 text-blue-300"
                    : "border-white/20 text-slate-400 hover:text-slate-300"
                }`}
              >
                🎯 3D View
              </button>
            </div>

            {/* Split view or single views */}
            <div className="flex-1 flex overflow-hidden" style={{ marginRight: selectedNode ? "50%" : "0", transition: "margin-right 200ms ease" }}>
              {/* Tree View */}
              {(viewMode === "split" || viewMode === "tree") && (
                <div className={`flex flex-col border-r border-white/10 bg-black/40 ${viewMode === "split" ? "flex-1" : "w-full"}`}>
                  <StrategyTreeView
                    strategy={strategy}
                    selectedNode={selectedNode}
                    completedNodes={completedNodes}
                    hoveredId={hoveredId}
                    onSelectNode={setSelected}
                    onHoverNode={setHovered}
                  />
                </div>
              )}

              {/* 3D Scene */}
              {(viewMode === "split" || viewMode === "3d") && (
                <div className={`flex-1 relative ${viewMode === "split" ? "flex-1" : "w-full"}`}>
                  <StrategyScene
                    strategy={strategy}
                    selectedNode={selectedNode}
                    completedNodes={completedNodes}
                    hoveredId={hoveredId}
                    onSelectNode={setSelected}
                    onHoverNode={setHovered}
                  />
                  {viewMode === "3d" && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.3em] uppercase text-emerald-400/25 pointer-events-none select-none">
                      Click any node · Drag to rotate · Scroll to zoom
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ask AI — bottom */}
          <AskStrategy goal={initialGoal} strategy={strategy} userContext={userContext} />
        </>
      )}

      {/* Node detail panel - with proper positioning */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: selectedNode ? "auto" : "none", zIndex: 100 }}>
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            completedNodes={completedNodes}
            onToggleComplete={toggleComplete}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

    </main>
  );
}