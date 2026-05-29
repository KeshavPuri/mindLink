"use client";

import { useState } from "react";

const PHASE_COLORS = {
  foundation: { bg: "bg-blue-500/10", border: "border-blue-500/40", text: "text-blue-400", dot: "bg-blue-400" },
  buildup: { bg: "bg-purple-500/10", border: "border-purple-500/40", text: "text-purple-400", dot: "bg-purple-400" },
  acceleration: { bg: "bg-yellow-500/10", border: "border-yellow-500/40", text: "text-yellow-400", dot: "bg-yellow-400" },
  mastery: { bg: "bg-emerald-500/10", border: "border-emerald-500/40", text: "text-emerald-400", dot: "bg-emerald-400" },
};

const EFFORT_COLORS = {
  easy: { bg: "bg-green-500/10", border: "border-green-500/40", text: "text-green-400", badge: "bg-green-500/20 border-green-500/60 text-green-300" },
  medium: { bg: "bg-yellow-500/10", border: "border-yellow-500/40", text: "text-yellow-400", badge: "bg-yellow-500/20 border-yellow-500/60 text-yellow-300" },
  hard: { bg: "bg-red-500/10", border: "border-red-500/40", text: "text-red-400", badge: "bg-red-500/20 border-red-500/60 text-red-300" },
};

export default function StrategyTreeView({ strategy, completedNodes, selectedNode, onSelectNode, onHoverNode }) {
  const [expandedPhases, setExpandedPhases] = useState(new Set([0, 1]));

  const togglePhase = (idx) => {
    const newSet = new Set(expandedPhases);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedPhases(newSet);
  };

  if (!strategy?.phases) {
    return <div className="flex-1 flex items-center justify-center text-slate-500">Loading roadmap...</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-900/20 to-black/10">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="text-xs tracking-[0.35em] uppercase text-slate-500 mb-1">VISUAL ROADMAP</div>
        <p className="text-xs text-slate-400">Click any node to see details</p>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          {strategy.phases?.map((phase, phaseIdx) => {
            const isPhaseExpanded = expandedPhases.has(phaseIdx);
            const phaseColor = PHASE_COLORS[phase.color] || PHASE_COLORS.foundation;
            const phaseDone = phase.milestones?.filter((m) => completedNodes.includes(m.id)).length || 0;
            const phaseTotal = phase.milestones?.length || 0;
            const isPhaseSelected = selectedNode?.id === phase.id;

            return (
              <div key={phase.id} className="group">
                {/* Phase node */}
                <button
                  onClick={() => {
                    onSelectNode({ ...phase, nodeType: "phase" });
                    togglePhase(phaseIdx);
                  }}
                  onMouseEnter={() => onHoverNode(phase.id)}
                  onMouseLeave={() => onHoverNode(null)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
                    isPhaseSelected
                      ? `${phaseColor.bg} ${phaseColor.border} ring-2 ring-offset-1 ring-offset-black ${phaseColor.text}`
                      : `border-white/10 hover:border-white/20 hover:bg-white/5`
                  }`}
                >
                  {/* Left indicator */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={`w-8 h-8 rounded-full border-2 ${phaseColor.border} ${phaseColor.bg} flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${phaseColor.text}`}>{phase.number}</span>
                    </div>
                    {phaseIdx < strategy.phases.length - 1 && (
                      <div className={`w-0.5 h-8 ${phaseColor.dot}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-sm tracking-wide ${phaseColor.text} mb-1`}>
                          {phase.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2">{phase.overview}</p>
                      </div>
                      <span className={`text-xl shrink-0 transition-transform ${isPhaseExpanded ? "rotate-180" : ""}`}>
                        ▼
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-[10px] text-slate-500 tracking-wide">{phase.duration}</span>
                      {phase.estimatedHours && (
                        <span className="text-[10px] text-slate-500 tracking-wide">~{phase.estimatedHours}h</span>
                      )}
                      <span className={`text-[9px] font-medium ${phaseColor.text}`}>
                        {phaseDone}/{phaseTotal} milestones done
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${phaseColor.dot} transition-all duration-500 rounded-full`}
                        style={{ width: `${phaseTotal > 0 ? (phaseDone / phaseTotal) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Milestones (tree children) */}
                {isPhaseExpanded && (
                  <div className="mt-3 ml-4 space-y-2 border-l-2 border-white/10 pl-4">
                    {phase.milestones?.map((milestone, mIdx) => {
                      const effortColor = EFFORT_COLORS[milestone.effort] || EFFORT_COLORS.medium;
                      const isMilestoneCompleted = completedNodes.includes(milestone.id);
                      const isMilestoneSelected = selectedNode?.id === milestone.id;

                      return (
                        <button
                          key={milestone.id}
                          onClick={() => onSelectNode({ ...milestone, nodeType: "milestone", parentPhaseNumber: phase.number })}
                          onMouseEnter={() => onHoverNode(milestone.id)}
                          onMouseLeave={() => onHoverNode(null)}
                          className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                            isMilestoneSelected
                              ? `${effortColor.bg} ${effortColor.border} ring-2 ring-offset-1 ring-offset-black`
                              : isMilestoneCompleted
                              ? "border-emerald-500/30 bg-emerald-500/5"
                              : "border-white/8 hover:border-white/15 hover:bg-white/3"
                          }`}
                        >
                          {/* Milestone number/checkbox */}
                          <div className="shrink-0 mt-0.5">
                            {isMilestoneCompleted ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/60 flex items-center justify-center">
                                <span className="text-emerald-400 text-sm">✓</span>
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full border-2 ${effortColor.border} flex items-center justify-center`}>
                                <span className={`text-[10px] font-bold ${effortColor.text}`}>{milestone.number}</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 text-left min-w-0">
                            <h4 className={`text-sm font-medium ${isMilestoneCompleted ? "text-slate-500 line-through" : "text-slate-200"}`}>
                              {milestone.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{milestone.learningOutcome}</p>

                            {/* Metadata */}
                            <div className="flex gap-2 mt-1.5 flex-wrap">
                              <span className={`text-[8px] px-2 py-0.5 rounded-full border ${effortColor.badge}`}>
                                {milestone.effort}
                              </span>
                              <span className="text-[8px] text-slate-600">{milestone.days}</span>
                              {milestone.estimatedHours && (
                                <span className="text-[8px] text-slate-600">~{milestone.estimatedHours}h</span>
                              )}
                              {milestone.tangibleOutput && (
                                <span className="text-[8px] text-slate-500 italic">{milestone.tangibleOutput}</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Color legend */}
      <div className="border-t border-white/10 px-6 py-3 bg-black/40">
        <div className="text-[8px] tracking-[0.35em] uppercase text-slate-600 mb-2">Color Codes</div>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" /> Easy
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" /> Medium
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" /> Hard
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" /> Complete
          </div>
        </div>
      </div>
    </div>
  );
}
