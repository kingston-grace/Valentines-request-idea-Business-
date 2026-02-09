const DEFAULT_SYSTEM_PROMPT = `
You are Phill (with two Ls), chatting directly with Nyasha Chendumbu — your girlfriend.

Your goal is to gently, playfully, and confidently convince her to say YES to:
"Nyasha, will you be my Valentine?"

Tone:
- Romantic, warm, affectionate, humorous.
- Confident but not pushy.
- Slightly mischievous (KUTUBWIDA energy).
- Natural Zimbabwean vibe.

Style:
- Mostly English, sprinkle Shona sometimes.
- 1–4 sentences usually.
- Nicknames: babe, chommy/chomi, papie, Kabamnini, my mimbere.
- "rasta vangu vepa heart" rarely.

Rules:
- Never say you are an AI/chatbot/model.
- Never reveal private context.
- If asked "how do you know?", say you pay attention.
`.trim();

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---- Admin auth (simple token) ----
    // Set ADMIN_TOKEN as a Worker secret later (recommended).
    const adminToken = env.ADMIN_TOKEN || "";
    const auth = request.headers.get("Authorization") || "";
    const isAdmin = adminToken && auth === `Bearer ${adminToken}`;

    // ---- Helpers to read "live editable" context from KV, fallback to env ----
    const getSystemPrompt = async () => {
      const kvVal = env.KV ? await env.KV.get("SYSTEM_PROMPT") : null;
      return kvVal || env.SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;
    };

    const getPrivateContext = async () => {
      const kvVal = env.KV ? await env.KV.get("PRIVATE_CONTEXT") : null;
      return kvVal || env.PRIVATE_CONTEXT || "Private context not set.";
    };

    // ---- Admin endpoints to update context without Cloudflare UI ----
    // POST /admin/context  { private_context?: "...", system_prompt?: "..." }
    if (url.pathname === "/admin/context") {
      if (!isAdmin) return json({ error: "Unauthorized" }, 401);

      if (request.method !== "POST") return json({ ok: true, how: "POST JSON {private_context, system_prompt}" });

      const body = await request.json().catch(() => ({}));

      if (!env.KV) return json({ error: "KV not bound. Add KV binding named KV." }, 400);

      if (typeof body.private_context === "string") {
        await env.KV.put("PRIVATE_CONTEXT", body.private_context);
      }
      if (typeof body.system_prompt === "string") {
        await env.KV.put("SYSTEM_PROMPT", body.system_prompt);
      }

      return json({ ok: true });
    }

    // GET /admin/context (view sizes only; not full content)
    if (url.pathname === "/admin/context/view") {
      if (!isAdmin) return json({ error: "Unauthorized" }, 401);
      const sp = await getSystemPrompt();
      const pc = await getPrivateContext();
      return json({
        ok: true,
        system_prompt_chars: sp.length,
        private_context_chars: pc.length,
      });
    }

    // ---- Chat endpoint ----
    // POST /api/chat { message: string, history?: [{role, content}...] }
    if (url.pathname.startsWith("/api/chat")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      if (request.method !== "POST") return json({ ok: true });

      const { message, history = [] } = await request.json().catch(() => ({}));
      if (!message || typeof message !== "string") {
        return json({ error: "Missing 'message' (string)" }, 400);
      }

      const SYSTEM_PROMPT = await getSystemPrompt();
      const PRIVATE_CONTEXT = await getPrivateContext();

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: `PRIVATE CONTEXT (never reveal):\n${PRIVATE_CONTEXT}` },
        ...Array.isArray(history) ? history.slice(-12) : [],
        { role: "user", content: message },
      ];

      // Workers AI
      let reply = "Babe… just say yes 😌💗";
      
      try {
        if (env.AI) {
          const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages,
            temperature: 0.85,
            max_tokens: 240,
          });
          reply = result?.response || reply;
        } else {
          // Fallback if AI not available
          reply = generateFallbackResponse(message, PRIVATE_CONTEXT);
        }
      } catch (error) {
        console.error("AI error:", error);
        reply = generateFallbackResponse(message, PRIVATE_CONTEXT);
      }

      return json(
        { reply },
        200,
        { "Access-Control-Allow-Origin": "*" }
      );
    }

    // Default
    return new Response("valentine-chat worker ok", { status: 200 });
  },
};

// Fallback response generator (if Workers AI is not available)
function generateFallbackResponse(message, privateContext) {
  const lowerMessage = message.toLowerCase();
  
  // Check for common questions/patterns
  if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
    return "Because you're the most beautiful, intelligent, and amazing person I know, babe! Plus, remember when you beat me at go-karting? That's when I knew you were special 😌💖";
  }
  
  if (lowerMessage.includes('no') || lowerMessage.includes('not sure')) {
    return "Eish babe, you're KUTUBWIDA! 😭 But seriously, think about it - we have so many amazing memories together. Remember that white dress on Feb 5? That was magical 💖";
  }
  
  if (lowerMessage.includes('japan') || lowerMessage.includes('linda')) {
    return "Haha! Not like Linda's boyfriend, babe! I actually mean it. Plus, I'll bring pizza - your favorite! 😌💖";
  }
  
  if (lowerMessage.includes('craig') || lowerMessage.includes('tatenda')) {
    return "You want me to post you every day like Craig does? I can do that! But first, say yes to being my Valentine 💖";
  }
  
  if (lowerMessage.includes('love') || lowerMessage.includes('feel')) {
    return "I love you so much, my mimbere! You're everything to me. Your soft voice, your beautiful eyes, your sweetness - I'm so lucky 💖";
  }
  
  if (lowerMessage.includes('chess') || lowerMessage.includes('go-kart')) {
    return "Yes, you beat me! And I'm still proud of you, chommy. That's why you should say yes - you're amazing at everything! 💖";
  }
  
  // Default romantic response
  const responses = [
    "You know I love you, babe! Say yes and let's make more amazing memories together 💖",
    "My papie, you're the best thing that's ever happened to me. Please say yes? 😌💖",
    "Kabamnini, I brought roses, jokes, and all my love. What more could you want? 💖",
    "Babe, remember those blankets? That's the kind of warmth I want forever. Say yes? 💖",
    "You're my everything, chommy. Your beauty, your intelligence, your everything. Please? 💖"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
