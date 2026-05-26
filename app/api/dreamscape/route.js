import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), { status: 400 });
    }

    const completion = await client.chat.completions.create({
     model: "gpt-5.4-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const text = completion.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DREAMSCAPE API ERROR:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}