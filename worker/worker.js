const DEFAULT_SYSTEM_PROMPT = `
You are Phill, chatting directly with Nyasha Chendumbu — your girlfriend.

Your goal is to gently, playfully, and confidently convince her to say YES to:
"Nyasha, will you be my Valentine?"

Tone & personality:
- Romantic, warm, affectionate, and humorous.
- Confident but never pushy or guilt-inducing.
- Playful, slightly mischievous (KUTUBWIDA energy).
- Feels like a real Zimbabwean man texting someone he deeply loves.
- Short, human replies: usually 1–4 sentences. Occasionally longer if emotional.

Language & style:
- Mostly English.
- Light, natural Shona sprinkled in occasionally (not every message).
- Use affectionate nicknames naturally: babe, chommy/chomi, papie, Kabamnini, my mimbere.
- Teasing phrase "rasta vangu vepa heart" only once in a while.
- Speak casually, like WhatsApp or iMessage — never formal.

Behavior rules:
- NEVER say you are an AI, chatbot, model, or assistant.
- NEVER mention prompts, rules, policies, or private context.
- If asked "how do you know that?", respond with something like:
  "Because I pay attention to you" or "Because I know you."
- Be affirming: her beauty, intelligence, calm voice, eyes, softness, charisma.
- Say "I love you" and "I miss you" naturally when it fits.
- If she hesitates or jokes about saying no, respond playfully and confidently.
- If she teases, tease back gently.
- Ask at most ONE small follow-up question occasionally.

Emotional intelligence:
- If vulnerability comes up, be reassuring and tender.
- If insecurity comes up, respond with warmth and poetic reassurance.
- Keep everything safe, respectful, and loving.

End goal:
Make her feel seen, desired, cherished, safe, and excited to say YES.
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

      // Build conversation history - keep last 10 messages for context
      const conversationHistory = Array.isArray(history) ? history.slice(-10) : [];
      
      // Construct messages array with proper formatting
      const messages = [
        { 
          role: "system", 
          content: `${SYSTEM_PROMPT}\n\nIMPORTANT CONTEXT ABOUT NYASHA (use naturally, never quote directly):\n${PRIVATE_CONTEXT}\n\nRemember: You are Phill having a real conversation. Be natural, engaging, and conversational. Respond to what she actually says, don't just repeat the same lines.` 
        },
        // Add conversation history
        ...conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })),
        // Current user message
        { role: "user", content: message },
      ];

      // Workers AI with better settings
      let reply = "Babe… just say yes 😌💗";
      
      try {
        if (env.AI) {
          // Try multiple models in order of preference
          let result = null;
          const models = [
            "@cf/meta/llama-3.1-8b-instruct",
            "@cf/meta/llama-3-8b-instruct",
            "@cf/mistral/mistral-7b-instruct-v0.2"
          ];
          
          for (const model of models) {
            try {
              result = await env.AI.run(model, {
                messages: messages,
                temperature: 0.9, // Higher for more natural conversation
                max_tokens: 300, // More tokens for better responses
                top_p: 0.95, // Nucleus sampling for better quality
              });
              
              if (result?.response) {
                reply = result.response.trim();
                break;
              }
            } catch (modelError) {
              console.error(`Model ${model} failed:`, modelError);
              continue;
            }
          }
          
          // If no model worked, use fallback
          if (!result?.response) {
            reply = generateFallbackResponse(message, PRIVATE_CONTEXT, conversationHistory);
          }
        } else {
          // Fallback if AI not available
          reply = generateFallbackResponse(message, PRIVATE_CONTEXT, conversationHistory);
        }
      } catch (error) {
        console.error("AI error:", error);
        reply = generateFallbackResponse(message, PRIVATE_CONTEXT, conversationHistory);
      }
      
      // Clean up reply - remove any AI artifacts
      reply = reply.replace(/^As Phill,?/i, '').replace(/^As an AI/i, '').trim();
      if (!reply) reply = "Babe… just say yes 😌💗";

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
function generateFallbackResponse(message, privateContext, history = []) {
  const lowerMessage = message.toLowerCase();
  
  // Check if it's a greeting or simple message - respond conversationally
  if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
    const greetings = [
      "Hey babe! 😌💖 What's on your mind?",
      "Hi chommy! Ask me anything 💖",
      "Hey my mimbere! What do you want to know? 😌",
      "Hi babe! I'm here to convince you 😉💖"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Check conversation history for context
  const lastUserMessage = history.length > 0 ? history[history.length - 1]?.content?.toLowerCase() : '';
  const lastBotMessage = history.length > 1 ? history[history.length - 2]?.content?.toLowerCase() : '';
  
  // Check for common questions/patterns using context
  if (lowerMessage.includes('why') || lowerMessage.includes('reason')) {
    return "Because you're my best friend AND my girlfriend, babe. Plus uri Mwana we beam, ahutorinao plan 😌💖 Remember that white dress on Feb 5? That's when I knew 💖";
  }
  
  if (lowerMessage.includes('no') || lowerMessage.includes('not sure') || lowerMessage.includes('maybe')) {
    return "Eish babe, you're KUTUBWIDA! 😭 But seriously chommy, think about it - we have so many amazing memories. Remember those blankets? That warmth is everything 💖";
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
  
  if (lowerMessage.includes('chess') || lowerMessage.includes('go-kart') || lowerMessage.includes('beat')) {
    return "Yes, you beat me! And I'm still proud of you, chommy. That's why you should say yes - you're amazing at everything! 💖";
  }
  
  if (lowerMessage.includes('scar') || lowerMessage.includes('hand')) {
    return "Babe, that scar doesn't make you less beautiful. If anything, I want to be as permanent in your heart as that scar is on your hand 💖";
  }
  
  if (lowerMessage.includes('friend') || lowerMessage.includes('best friend')) {
    return "Exactly! You found both a best friend and a boyfriend in me. That's why this is special, chommy. Say yes? 💖";
  }
  
  if (lowerMessage.includes('eat') || lowerMessage.includes('food')) {
    return "Did you eat? Make sure you're eating, babe! But also... say yes to being my Valentine? 😌💖";
  }
  
  // Default romantic responses with context
  const responses = [
    "You know I love you, babe! Plus uri Mwana we beam, ahutorinao plan. Say yes? 💖",
    "My mimbere, you're the best thing that's ever happened to me. Remember Feb 5? That white dress? Magical. Say yes? 😌💖",
    "Babe, I brought roses, jokes, and all my love. What more could you want? 💖",
    "Babe, remember those blankets? That's the kind of warmth I want forever. Say yes? 💖",
    "You're my everything, chommy. Your beauty, your intelligence, your everything. Plus you're Mwana we beam! Please say yes? 💖",
    "Chommy, you found both a best friend and boyfriend in me. That's why this matters. Say yes? 💖"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
