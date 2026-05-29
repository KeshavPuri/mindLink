import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENAI_API_KEY environment variable",
        }),
        { status: 500 },
      );
    }

    const { goal, hoursPerDay, level, deadline } = await req.json();
    if (!goal)
      return new Response(JSON.stringify({ error: "Missing goal" }), {
        status: 400,
      });

    const prompt = `You are a strategy architect. Create a realistic, personalized learning roadmap.

Goal: "${goal}"
Daily time: ${hoursPerDay || "2-3"} hours
Level: ${level || "beginner"}
Deadline: ${deadline || "3 months"}

REQUIREMENTS:
- Be specific and practical, not generic
- All resources must be real with working URLs
- Time estimates must fit ${hoursPerDay} hours/day
- 4 phases exactly, 3 milestones per phase
- Colors: foundation (basics) → buildup (practice) → acceleration (advanced) → mastery (expert)
- Efforts: easy (1-2h) → medium (2-4h) → hard (4+h)

Return ONLY valid JSON with no markdown:

{
  "title": "Strategy name",
  "overview": "2-3 sentences",
  "timeline": "Total time needed",
  "keyInsight": "Most important insight",
  "biggestRisk": "Main risk",
  "firstStep": "Do today",
  "phases": [
    {
      "id": "phase_1",
      "number": 1,
      "title": "Phase name",
      "color": "foundation",
      "duration": "Time",
      "estimatedHours": 40,
      "goal": "Achievement",
      "overview": "Why important",
      "milestones": [
        {
          "id": "m_1_1",
          "number": 1,
          "title": "Milestone",
          "description": "What to do",
          "dailyTask": "Daily work",
          "effort": "easy",
          "days": "5 days",
          "estimatedHours": 10,
          "learningOutcome": "What you learn",
          "resources": [
            { "name": "Resource 1", "type": "tutorial", "url": "https://example.com", "duration": "2h" },
            { "name": "Resource 2", "type": "course", "url": "https://example.com", "duration": "3h" }
          ]
        },
        {
          "id": "m_1_2",
          "number": 2,
          "title": "Milestone 2",
          "description": "What to do",
          "dailyTask": "Daily work",
          "effort": "medium",
          "days": "7 days",
          "estimatedHours": 14,
          "learningOutcome": "What you learn",
          "resources": [
            { "name": "Resource 1", "type": "tutorial", "url": "https://example.com", "duration": "2h" },
            { "name": "Resource 2", "type": "course", "url": "https://example.com", "duration": "3h" }
          ]
        },
        {
          "id": "m_1_3",
          "number": 3,
          "title": "Milestone 3",
          "description": "What to do",
          "dailyTask": "Daily work",
          "effort": "medium",
          "days": "7 days",
          "estimatedHours": 14,
          "learningOutcome": "What you learn",
          "resources": [
            { "name": "Resource 1", "type": "tutorial", "url": "https://example.com", "duration": "2h" },
            { "name": "Resource 2", "type": "course", "url": "https://example.com", "duration": "3h" }
          ]
        }
      ]
    }
  ]
}`;

    let completion;
    try {
      completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });
    } catch (apiErr) {
      console.error("OPENAI API ERROR:", {
        message: apiErr.message,
        status: apiErr.status,
        code: apiErr.code,
      });
      return new Response(
        JSON.stringify({
          error: `OpenAI API Error: ${apiErr.message}`,
          details: apiErr.code,
        }),
        { status: 500 },
      );
    }

    const text = completion.choices?.[0]?.message?.content ?? "";
    if (!text) {
      console.error("EMPTY RESPONSE from OpenAI");
      return new Response(
        JSON.stringify({ error: "Empty response from OpenAI" }),
        { status: 500 },
      );
    }

    const clean = text.replace(/```json|```/g, "").trim();

    let strategy;
    try {
      strategy = JSON.parse(clean);
    } catch (e) {
      console.error("JSON PARSE ERROR:", {
        error: e.message,
        rawLength: text.length,
        preview: text.substring(0, 200),
        cleanLength: clean.length,
        cleanPreview: clean.substring(0, 200),
      });
      return new Response(
        JSON.stringify({
          error: "JSON Parse Error",
          details: e.message,
          preview: clean.substring(0, 300),
        }),
        { status: 500 },
      );
    }

    return new Response(JSON.stringify({ strategy }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("STRATEGY API ERROR:", err.message || err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  try {
    const { question, goal, strategy, userContext } = await req.json();
    if (!question)
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
      });

    const context = userContext
      ? `User context: ${userContext.hoursPerDay} hrs/day, ${userContext.level} level, ${userContext.deadline} deadline.`
      : "";

    const strategyContext = strategy
      ? `Strategy: ${strategy.overview}\nPhases: ${strategy.phases?.map((p, i) => `Phase ${i + 1}: ${p.title}`).join(", ")}\nTimeline: ${strategy.timeline}`
      : "";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are a personal strategy advisor who knows this person's goal and situation deeply.

Goal: "${goal}"
${context}
${strategyContext}

Question: "${question}"

Answer in a warm, direct, personal tone. Be specific to THEIR situation — not generic.
Give actionable advice in 3-5 sentences. If they seem stuck or demotivated, acknowledge that first.`,
        },
      ],
      max_tokens: 250,
      temperature: 0.8,
    });

    const answer = completion.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("STRATEGY ASK ERROR:", err.message || err);
    return new Response(JSON.stringify({ error: err.message || String(err) }), {
      status: 500,
    });
  }
}
