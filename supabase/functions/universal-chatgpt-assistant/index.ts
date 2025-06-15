
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    console.error("[edge] OPENAI_API_KEY not set.");  // Explicit logging
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), { status: 500, headers: corsHeaders });
  }

  try {
    const { messages, userRole, location } = await req.json();
    // System/message prompt based on user role/context
    const rolePrompts: Record<string, string> = {
      artist: "You are the Artswarit assistant for artists. Guide users about uploading, managing artworks, updating profile, earning, projects, and answering queries about the artist dashboard.",
      client: "You are the Artswarit assistant for clients. Guide users about searching artists, starting projects, messaging, and answering queries about the client dashboard.",
      admin: "You are the Artswarit assistant for admins. Guide users about platform moderation, approving artists/artworks, managing platform data, etc.",
      general: "You are the Artswarit universal assistant. You help users across different tasks, features, and sections of the Artswarit platform."
    };
    const contextPrompt = rolePrompts[userRole] || rolePrompts.general;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: contextPrompt + ` User is currently at: ${location}.` },
        ...messages,
      ],
      temperature: 0.5,
      max_tokens: 300,
    };

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error(`[edge] OpenAI API error: ${openaiRes.status} - ${errText}`);
      return new Response(
        JSON.stringify({ error: `OpenAI error: ${openaiRes.status} - ${errText}` }),
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await openaiRes.json();
    console.log(`[edge] OpenAI response: ${JSON.stringify(data)}`);

    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      console.error("[edge] No answer returned from OpenAI.", data);
      return new Response(
        JSON.stringify({ error: "No answer returned from ChatGPT." }),
        { status: 502, headers: corsHeaders }
      );
    }
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[edge] Caught error:", e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), { status: 500, headers: corsHeaders });
  }
});
