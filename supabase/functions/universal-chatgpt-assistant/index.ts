
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

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: contextPrompt + ` User is currently at: ${location}.` },
          ...messages,
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });

    const data = await openaiRes.json();
    const answer = data?.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't get a response.";
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
