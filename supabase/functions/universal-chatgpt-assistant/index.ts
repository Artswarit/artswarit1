
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function fetchOpenAI(payload: any) {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await openaiRes.json();
  return { status: openaiRes.status, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    console.error("[edge] OPENAI_API_KEY not set.");
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not set" }), { status: 500, headers: corsHeaders });
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

    const payload = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: contextPrompt + ` User is currently at: ${location}.` },
        ...messages,
      ],
      temperature: 0.5,
      max_tokens: 300,
    };

    // Issue the request (with one fallback retry)
    let openaiResult = await fetchOpenAI(payload);
    if (!openaiResult.data?.choices?.[0]?.message?.content && openaiResult.status !== 200) {
      // Retry once if output not present or error status
      console.warn("[edge] OpenAI primary call failed, retrying once...");
      openaiResult = await fetchOpenAI(payload);
    }
    const { data } = openaiResult;

    // Diagnostic log for "hello" test prompt (informative, not returned to user unless error)
    if (messages?.length === 1 && messages[0]?.content?.toLowerCase().trim() === "hello") {
      console.log("[edge] Test 'hello' prompt detected.");
    }

    // Response handling
    const answer = data?.choices?.[0]?.message?.content?.trim();
    if (!answer) {
      console.error("[edge] No answer returned from OpenAI.", data);
      return new Response(
        JSON.stringify({ error: "Raw OpenAI API response: " + JSON.stringify(data) }),
        { status: 502, headers: corsHeaders }
      );
    }
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[edge] Caught error:", e);
    return new Response(JSON.stringify({ error: e.message || e.toString() }), { status: 500, headers: corsHeaders });
  }
});
