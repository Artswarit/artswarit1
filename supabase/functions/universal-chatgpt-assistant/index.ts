

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

async function fetchGemini(payload: any) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
  
  console.log("[edge] Sending payload to Gemini:", JSON.stringify(payload));
  const geminiRes = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await geminiRes.json();
  console.log("[edge] Gemini response:", JSON.stringify(data));
  return { status: geminiRes.status, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GOOGLE_GEMINI_API_KEY) {
    console.error("[edge] GOOGLE_GEMINI_API_KEY not set.");
    return new Response(JSON.stringify({ error: "GOOGLE_GEMINI_API_KEY not set" }), { status: 500, headers: corsHeaders });
  }

  try {
    const { messages, userRole, location } = await req.json();
    const rolePrompts: Record<string, string> = {
      artist: "You are the Artswarit assistant for artists. Guide users about uploading, managing artworks, updating profile, earning, projects, and answering queries about the artist dashboard.",
      client: "You are the Artswarit assistant for clients. Guide users about searching artists, starting projects, messaging, and answering queries about the client dashboard.",
      admin: "You are the Artswarit assistant for admins. Guide users about platform moderation, approving artists/artworks, managing platform data, etc.",
      general: "You are the Artswarit universal assistant. You help users across different tasks, features, and sections of the Artswarit platform."
    };
    const contextPrompt = rolePrompts[userRole] || rolePrompts.general;
    const fullSystemPrompt = contextPrompt + ` User is currently at: ${location}.`;

    // Gemini requires conversation history to start with a user message and have alternating roles.
    // 1. Find the first user message.
    const firstUserMessageIndex = messages.findIndex((msg: { role: string }) => msg.role === 'user');
    
    if (firstUserMessageIndex === -1) {
      return new Response(JSON.stringify({ error: "No user message found in the history." }), { status: 400, headers: corsHeaders });
    }

    // 2. Take only the part of conversation starting from the first user.
    const conversationMessages = messages.slice(firstUserMessageIndex);

    // 3. Merge consecutive messages from the same role.
    const geminiContents: { role: string, parts: { text: string }[] }[] = [];
    if (conversationMessages.length > 0) {
        let lastContent = {
            role: conversationMessages[0].role === 'assistant' ? 'model' : 'user',
            parts: [{ text: conversationMessages[0].content }]
        };

        for (let i = 1; i < conversationMessages.length; i++) {
            const currentRole = conversationMessages[i].role === 'assistant' ? 'model' : 'user';
            if (currentRole === lastContent.role) {
                lastContent.parts[0].text += `\n${conversationMessages[i].content}`;
            } else {
                geminiContents.push(lastContent);
                lastContent = { role: currentRole, parts: [{ text: conversationMessages[i].content }] };
            }
        }
        geminiContents.push(lastContent);
    }
    
    const payload = {
      contents: geminiContents,
      systemInstruction: {
        parts: [{ text: fullSystemPrompt }]
      },
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 300,
      },
    };

    // Issue the request (with one fallback retry)
    let geminiResult = await fetchGemini(payload);
    if (geminiResult.status !== 200) {
      console.warn("[edge] Gemini primary call failed, retrying once...");
      geminiResult = await fetchGemini(payload);
    }
    const { data } = geminiResult;

    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!answer) {
      const errorMessage = data?.error?.message || JSON.stringify(data);
      console.error("[edge] No answer returned from Gemini. (Full data follows)", errorMessage);
      return new Response(
        JSON.stringify({ 
          error: "Gemini Diagnostic Output: " + errorMessage
        }),
        { status: 502, headers: corsHeaders }
      );
    }
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[edge] Caught error:", e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), { status: 500, headers: corsHeaders });
  }
});

