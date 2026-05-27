import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { query } = await req.json();
    if (!query) return new Response(JSON.stringify({ error: "Missing query" }), { status: 400 });

    // ── Real Google search via Serper ──
    const serperRes = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 8 }),
    });
    const serperData = await serperRes.json();

    const organic = (serperData.organic || []).slice(0, 8).map((r) => {
      let domain = "";
      try { domain = new URL(r.link).hostname.replace("www.", ""); } catch {}
      return { title: r.title, url: r.link, snippet: r.snippet, domain };
    });

    // ── AI Quantum Intel — the actual edge point ──
    const snippets = organic.map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`).join("\n");

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `You are Quantum — an intelligence engine far beyond a search engine. Analyze this topic deeply.

Topic: "${query}"

Search results available:
${snippets}

Return ONLY valid JSON, no markdown, no backticks:

{
  "summary": "2 sentence compelling overview. Be specific and fascinating.",
  "keyInsight": "The single most important thing to understand about this topic that most people miss. 1-2 sentences. Be bold and specific.",
  "hiddenAngle": "What the mainstream search results are NOT telling you about this topic. A contrarian or deeper perspective. 1-2 sentences.",
  "futureImplication": "Where is this topic heading in the next 5-10 years? What should the user know? 1-2 sentences.",
  "credibilityNote": "A warning or note about the reliability of information on this topic. Are there biases, misinformation, or gaps? 1 sentence. If topic is straightforward, say null.",
  "connections": [
    { "topic": "Connected concept name", "reason": "Why this connects in a surprising way. 1 sentence." },
    { "topic": "Connected concept name", "reason": "Why this connects in a surprising way. 1 sentence." },
    { "topic": "Connected concept name", "reason": "Why this connects in a surprising way. 1 sentence." }
  ],
  "funFact": "One genuinely surprising fact most people don't know."
}`
      }],
      max_tokens: 600,
      temperature: 0.8,
    });

    const aiText = aiRes.choices?.[0]?.message?.content ?? "{}";
    let intel = {};
    try {
      intel = JSON.parse(aiText.replace(/```json|```/g, "").trim());
    } catch { intel = {}; }

    // ── Credibility scoring ──
    const scored = organic.map((r) => {
      const d = r.domain;
      let type = "web";
      let score = 60;
      if (d.includes("wikipedia")) { type = "wiki"; score = 75; }
      else if (d.includes(".edu") || d.includes("scholar") || d.includes("pubmed") || d.includes("arxiv") || d.includes("researchgate")) { type = "academic"; score = 95; }
      else if (d.includes(".gov")) { type = "official"; score = 92; }
      else if (d.includes("bbc") || d.includes("reuters") || d.includes("nytimes") || d.includes("guardian") || d.includes("nature") || d.includes("bloomberg")) { type = "news"; score = 85; }
      else if (d.includes("youtube") || d.includes("reddit") || d.includes("twitter") || d.includes("quora")) { type = "community"; score = 55; }
      else if (d.includes("medium") || d.includes("substack") || d.includes("wordpress")) { type = "opinion"; score = 50; }
      return { ...r, type, score };
    });

    const knowledgeGraph = serperData.knowledgeGraph ? {
      title: serperData.knowledgeGraph.title,
      description: serperData.knowledgeGraph.description,
      type: serperData.knowledgeGraph.type,
    } : null;

    const relatedSearches = (serperData.relatedSearches || []).slice(0, 5).map((r) => r.query);
    const answerBox = serperData.answerBox?.answer || serperData.answerBox?.snippet || null;

    return new Response(JSON.stringify({
      intel,
      organic: scored,
      knowledgeGraph,
      relatedSearches,
      answerBox,
    }), { status: 200, headers: { "Content-Type": "application/json" } });

  } catch (err) {
    console.error("QUANTUM API ERROR:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
  
}
export async function PUT(req) {
  try {
    const { question, query, sources } = await req.json();
    if (!question) return new Response(JSON.stringify({ error: "Missing question" }), { status: 400 });

    const sourcesText = (sources || [])
      .map((s, i) => `Source ${i + 1} [${s.domain}]: ${s.snippet}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `You are Quantum — a precision intelligence engine. Answer this specific question using the sources provided.

Topic context: "${query}"
User question: "${question}"

Available sources:
${sourcesText}

Rules:
- Answer the specific question directly and precisely
- Cite sources using [Source N] notation when relevant
- Be intelligent, not generic
- If sources don't contain the answer, say so honestly
- Keep response under 150 words
- Format: direct answer first, then supporting evidence`
      }],
      max_tokens: 250,
      temperature: 0.6,
    });

    const answer = completion.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("QUANTUM ASK ERROR:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}