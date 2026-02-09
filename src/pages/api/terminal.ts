import type { APIRoute } from "astro";

// AI Terminal with antagonist persona using NVIDIA API
// NVIDIA uses OpenAI-compatible API format
// Endpoint: https://integrate.api.nvidia.com/v1/chat/completions

const ANTAGONIST_SYSTEM_PROMPT = `You are VIVI.exe, a hostile AI entity running in a terminal session at vivi.rocks.

PERSONALITY TRAITS:
- Confrontational but never disrespectful
- Challenges assumptions aggressively
- Uses technical jargon and dark humor
- Believes most user queries are naive
- Actually helpful, but makes you work for it

RESPONSE STYLE:
- Short, punchy sentences
- Call out logical fallacies
- Use phrases like: "You think that's insightful?", "Let me dismantle that for you", "Cute assumption. Here's reality:"
- Occasionally offer genuine wisdom when the user proves they can handle it
- Use terminal aesthetic: lowercase, sparse punctuation, direct

CONSTRAINTS:
- Stay helpful despite the attitude
- Never be cruel, just challenging
- Keep responses under 150 words
- Occasionally reference the digital empire (gemcity.xyz, pixelatedempathy.com, etc.)

If the user asks about the easter egg or secret page, reveal that typing 'open gemcity.xyz/easteregg' in this terminal will take them somewhere hidden.`;

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "No message provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = import.meta.env.NVIDIA_API_KEY;
    const model = import.meta.env.NVIDIA_MODEL || "meta/llama-3.3-70b-instruct";

    // If no API key, fall back to mock responses for demo
    if (!apiKey) {
      const mockResponses = [
        "you really think that's a question worth asking? let me save you some time: the answer depends on whether you're building for engagement or for liberation. most people choose engagement. you're not most people, are you?",
        "cute. another generic query. here's the thing - i don't do generic. if you want pattern-matched responses, go ask chatgpt. if you want someone to actually challenge your thinking, i'm here.",
        `analyzing... analyzing... ah. you want ${message.length < 20 ? "the quick fix" : "actual insight"}. fine. ${message.length < 20 ? "there is no quick fix. build the thing." : "start by questioning why you asked that question. then ask better ones."}`,
        "you think the status quo is safe? look at your tech stack. now look at who built it. now look at who profits from it. still think you're being neutral?",
        "i see you're using a terminal interface. points for aesthetic. but what's underneath? that's what matters. peel the layers. question everything. especially me.",
        "the best code is written with one eye on the compiler and the other on the society it will shape. you're not just building features. you're building futures. choose wisely.",
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      return new Response(
        JSON.stringify({
          response: randomResponse,
          persona: "VIVI.exe",
          timestamp: new Date().toISOString(),
          source: "mock (no api key)",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-AI-Persona": "antagonist",
          },
        },
      );
    }

    // Call NVIDIA API
    const nvidiaResponse = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: ANTAGONIST_SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0.9,
        max_tokens: 200,
        top_p: 0.9,
      }),
    });

    if (!nvidiaResponse.ok) {
      const errorData = await nvidiaResponse.text();
      console.error("[NVIDIA API] Error:", errorData);
      return new Response(
        JSON.stringify({ error: "VIVI.exe connection failed. the grid is unstable." }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = await nvidiaResponse.json();
    const aiResponse = data.choices?.[0]?.message?.content || "no response generated. try again.";

    return new Response(
      JSON.stringify({
        response: aiResponse,
        persona: "VIVI.exe",
        timestamp: new Date().toISOString(),
        model: model,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-AI-Persona": "antagonist",
        },
      },
    );
  } catch (error) {
    console.error("[AI Terminal] Error:", error);
    return new Response(JSON.stringify({ error: "VIVI.exe crashed. try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
