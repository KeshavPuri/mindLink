// ── Emotion → visual style mapping ──────────────────────────────────
export const EMOTION_STYLES = {
  hopeful: {
    border: "border-amber-400/60",
    text: "text-amber-300",
    glow: "hover:shadow-[0_0_25px_rgba(251,191,36,0.4)]",
    dot: "bg-amber-400",
    label: "HOPEFUL",
    drawerAccent: "text-amber-300",
    drawerBorder: "border-amber-400/30",
  },
  ambitious: {
    border: "border-purple-400/60",
    text: "text-purple-300",
    glow: "hover:shadow-[0_0_25px_rgba(167,139,250,0.4)]",
    dot: "bg-purple-400",
    label: "AMBITIOUS",
    drawerAccent: "text-purple-300",
    drawerBorder: "border-purple-400/30",
  },
  peaceful: {
    border: "border-teal-400/60",
    text: "text-teal-300",
    glow: "hover:shadow-[0_0_25px_rgba(45,212,191,0.4)]",
    dot: "bg-teal-400",
    label: "PEACEFUL",
    drawerAccent: "text-teal-300",
    drawerBorder: "border-teal-400/30",
  },
  chaotic: {
    border: "border-orange-400/60",
    text: "text-orange-300",
    glow: "hover:shadow-[0_0_25px_rgba(251,146,60,0.4)]",
    dot: "bg-orange-400",
    label: "CHAOTIC",
    drawerAccent: "text-orange-300",
    drawerBorder: "border-orange-400/30",
  },
  dystopian: {
    border: "border-red-400/60",
    text: "text-red-300",
    glow: "hover:shadow-[0_0_25px_rgba(248,113,113,0.4)]",
    dot: "bg-red-400",
    label: "DYSTOPIAN",
    drawerAccent: "text-red-300",
    drawerBorder: "border-red-400/30",
  },
  dangerous: {
    border: "border-red-600/60",
    text: "text-red-400",
    glow: "hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]",
    dot: "bg-red-600",
    label: "DANGEROUS",
    drawerAccent: "text-red-400",
    drawerBorder: "border-red-600/30",
  },
};

// ── Prompt: first simulation ─────────────────────────────────────────
export function buildInitialPrompt(scenario) {
  return `You are a future simulation engine. Analyze this scenario and generate exactly 3 possible future branches.

Return ONLY valid JSON. No markdown. No explanation. No backticks. Just raw JSON.

{
  "branches": [
    {
      "id": "1",
      "title": "Short future title (max 5 words)",
      "description": "2 sentence vivid summary of this future path.",
      "detail": "4 to 5 sentence rich and immersive description of how this future unfolds, what daily life looks like, and how the person feels living in it.",
      "timeline": "e.g. Within 2 years / By 2030 / Over a decade",
      "keyConsequence": "The single most important thing that changes in this future. One punchy sentence.",
      "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
      "risks": ["Risk 1", "Risk 2", "Risk 3"],
      "probability": "e.g. Likely if you act boldly / Possible with the right conditions / Rare but achievable",
      "emotion": "one of: hopeful | ambitious | peaceful | chaotic | dystopian | dangerous",
      "risk": "one of: low | medium | high",
      "theme": "one of: space | cyberpunk | biology | peaceful | war"
    }
  ],
  "followUp": {
    "question": "A short follow-up question to refine which future fits the user best",
    "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
  }
}

Scenario: "${scenario}"`;
}

// ── Prompt: evolved simulation ───────────────────────────────────────
export function buildFollowUpPrompt(scenario, history) {
  const historyText = history
    .map((entry, i) => {
      if (entry.type === "branch_selected") return `Step ${i + 1}: User entered future → "${entry.content}"`;
      if (entry.type === "followup_answer") return `Step ${i + 1}: User prioritized → "${entry.content}"`;
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return `You are a future simulation engine running a deep multi-step simulation.

Original scenario: "${scenario}"

The user has made the following journey of decisions so far:
${historyText}

You must remember ALL of this context. The new branches must feel like a natural continuation of this specific journey — not generic futures. Each new branch should reference or build on what came before.

Generate 3 evolved future branches that reflect this full journey.

Return ONLY valid JSON. No markdown. No explanation. No backticks. Same exact format:

{
  "branches": [
    {
      "id": "1",
      "title": "Short future title (max 5 words)",
      "description": "2 sentence vivid summary of this evolved future path.",
      "detail": "4 to 5 sentence rich and immersive description of how this future unfolds, what daily life looks like, and how the person feels living in it.",
      "timeline": "e.g. Within 2 years / By 2030 / Over a decade",
      "keyConsequence": "The single most important thing that changes. One punchy sentence.",
      "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
      "risks": ["Risk 1", "Risk 2", "Risk 3"],
      "probability": "e.g. Likely if you act boldly / Possible with the right conditions / Rare but achievable",
      "emotion": "one of: hopeful | ambitious | peaceful | chaotic | dystopian | dangerous",
      "risk": "one of: low | medium | high",
      "theme": "one of: space | cyberpunk | biology | peaceful | war"
    }
  ],
  "followUp": {
    "question": "Another follow-up question to go even deeper",
    "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
  }
}`;
}

// ── Safe JSON parser with fallback ───────────────────────────────────
export function parseAIResponse(text) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return {
      branches: [
        {
          id: "1",
          title: "Path of Growth",
          description: "You embrace the challenge and grow through difficulty. The journey permanently transforms who you are.",
          detail: "You take the risk and commit fully. The first year is brutal — uncertainty, long hours, moments of doubt. But by year two, the compound effect kicks in. Skills sharpen, networks form, and opportunities arrive that simply don't exist for those who played it safe. You look back and realize the discomfort was the point.",
          timeline: "Within 2–3 years",
          keyConsequence: "Your identity shifts — you become someone who acts despite fear.",
          opportunities: ["Rare high-upside outcomes", "Accelerated skill development", "Expanded network and visibility"],
          risks: ["Financial instability early on", "Burnout from overcommitment", "No guarantee of success"],
          probability: "Likely if you act boldly and stay consistent",
          emotion: "hopeful",
          risk: "medium",
          theme: "space",
        },
        {
          id: "2",
          title: "The Safe Route",
          description: "You choose stability over risk. Life stays comfortable but the question of what could have been lingers.",
          detail: "You take the conventional path and it works — steady income, manageable stress, predictable progress. But in quiet moments, the question surfaces: what if? The safety net becomes a ceiling. You're comfortable but not alive in the way you imagined. Years pass and the gap between your life and your potential quietly widens.",
          timeline: "Immediate and ongoing",
          keyConsequence: "Comfort is secured but curiosity goes unanswered.",
          opportunities: ["Financial stability", "Low stress environment", "Predictable career progression"],
          risks: ["Regret accumulates over time", "Skills plateau without challenge", "Missed window of opportunity"],
          probability: "Certain — this path is always available",
          emotion: "peaceful",
          risk: "low",
          theme: "peaceful",
        },
        {
          id: "3",
          title: "The Uncertain Leap",
          description: "You take the leap into the unknown. Chaos and rare opportunity collide in unpredictable ways.",
          detail: "Everything breaks open the moment you commit. Some things fall apart — relationships strain, finances tighten, plans fail. But in the wreckage, unexpected doors appear. You meet the right person at the wrong time. A failure teaches you something no success could. The future becomes genuinely unwritten, which is terrifying and electric in equal measure.",
          timeline: "Unfolds over 5+ years unpredictably",
          keyConsequence: "You trade certainty for aliveness — and you can never fully go back.",
          opportunities: ["Life-changing black swan events", "Deep self-knowledge", "Unique story and perspective"],
          risks: ["High chance of failure in the short term", "Emotional and financial volatility", "No map — you build the path as you walk"],
          probability: "Rare but transformative if conditions align",
          emotion: "chaotic",
          risk: "high",
          theme: "cyberpunk",
        },
      ],
      followUp: {
        question: "What matters most to you right now?",
        choices: ["Freedom", "Security", "Wealth", "Purpose"],
      },
    };
  }
}

// ── Prompt: final simulation summary ────────────────────────────────
export function buildSummaryPrompt(scenario, history) {
  const journeyText = history
    .map((entry, i) => {
      if (entry.type === "branch_selected") return `Step ${i + 1}: Chose future → "${entry.content}"`;
      if (entry.type === "followup_answer") return `Step ${i + 1}: Prioritised → "${entry.content}"`;
      return "";
    })
    .filter(Boolean)
    .join("\n");

  return `You are a deep future simulation engine generating a final reflection.

Original scenario: "${scenario}"

The user's complete journey through possible futures:
${journeyText}

Based on this specific journey, generate a meaningful personal summary.

Return ONLY valid JSON. No markdown. No backticks.

{
  "title": "A short poetic title for this person's journey (max 6 words)",
  "overview": "3 sentences. What this journey reveals about the person's values, fears, and desires.",
  "pattern": "1 sentence. The hidden pattern in all their choices.",
  "finalReality": "The most likely real-world outcome if they continue on this path. 2 sentences. Be honest, not just positive.",
  "coreValue": "The single most important thing this person is really seeking. One word or short phrase.",
  "advice": "One powerful, honest sentence of advice based on their journey."
}`;
}