
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Update: Also extract rating, availability
const extractSystemPrompt = `
You are Artswarit’s assistant. Extract the following details from the user's request as JSON:
{
  "category": "[artist type (e.g., singer, painter, dancer)]",
  "city": "[city or region, e.g., Delhi, Mumbai, Jaipur]",
  "max_price": [number or null],
  "min_rating": [number or null],
  "availability": "[available|busy|null]"
}
- Only extract; do not explain or add info. Price/rating is null if not present. Availability is available or busy (if user said 'available' or 'now').
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
        model: "gpt-4o-mini",
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

    // 2. Query Supabase DB, build up filters
    const { category, city, max_price, min_rating, availability } = extracted;

    let query: string[] = [];
    if (category) query.push(`category=eq.${encodeURIComponent(category)}`);
    if (city) query.push(`city=eq.${encodeURIComponent(city)}`);
    if (max_price !== null && max_price !== undefined) query.push(`price=lte.${max_price}`);
    // Optional rating and availability columns need to exist in artists table
    if (min_rating !== null && min_rating !== undefined) query.push(`rating=gte.${min_rating}`);
    if (availability === "available") query.push(`available=is.true`);
    if (availability === "busy") query.push(`available=is.false`);

    // Fetch only select columns for card
    const sbUrl = Deno.env.get("SUPABASE_URL");
    const sbAnon = Deno.env.get("SUPABASE_ANON_KEY");
    const base = `${sbUrl}/rest/v1/artists`
    const select = "id,name,category,city,price,image_url,profile_url,rating,available"
    let url = `${base}?select=${encodeURIComponent(select)}`;
    if (query.length) url += "&" + query.join("&");
    url += "&limit=3";

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
