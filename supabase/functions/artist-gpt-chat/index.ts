
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const extractSystemPrompt = `
You are Artswarit’s assistant. Extract the following details from the user's request as a JSON:
{
  "category": "[artist type (e.g., singer, painter, dancer)]",
  "city": "[city or region, e.g., Delhi, Mumbai, Jaipur]",
  "max_price": [number or null]
}
- Only extract; do not explain or add info. Price is null if not present.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not set");
    const { prompt } = await req.json();

    // 1. Call OpenAI to extract details
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // use lower cost, fast model
        messages: [
          { role: "system", content: extractSystemPrompt },
          { role: "user", content: prompt }
        ]
      }),
    });
    const aiData = await aiRes.json();
    const content = aiData?.choices?.[0]?.message?.content?.trim();
    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (e) {
      return new Response(JSON.stringify({ error: "Could not parse AI response", ai_content: content }), { status: 500, headers: corsHeaders });
    }

    // 2. Query Supabase database for artist matches
    const { category, city, max_price } = extracted;
    let query = `category=eq.${encodeURIComponent(category)}&city=eq.${encodeURIComponent(city)}`;
    if (max_price !== null) {
      query += `&price=lte.${max_price}`;
    }
    // TODO: If your project uses a different table or price column, update accordingly
    const sbUrl = Deno.env.get("SUPABASE_URL");
    const sbAnon = Deno.env.get("SUPABASE_ANON_KEY");
    const url = `${sbUrl}/rest/v1/artists?${query}&limit=3`;

    const dbRes = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": sbAnon,
        "Authorization": `Bearer ${sbAnon}`,
        "Content-Type": "application/json",
      },
    });
    const artists = await dbRes.json();

    return new Response(JSON.stringify({ extracted, artists }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
