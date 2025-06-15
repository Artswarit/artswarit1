
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

const extractSystemPrompt = `
You are Artswarit’s assistant. Extract the following details from the user's request and return ONLY a valid JSON object.
{
  "category": "[artist type (e.g., singer, painter, dancer)]",
  "city": "[city or region, e.g., Delhi, Mumbai, Jaipur]",
  "max_price": [number or null],
  "min_rating": [number or null],
  "availability": "[available|busy|null]"
}
- Do not explain or add any text other than the JSON object. Price/rating is null if not present. Availability is 'available' if user mentions 'available' or 'now'.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    if (!GOOGLE_GEMINI_API_KEY) throw new Error("GOOGLE_GEMINI_API_KEY not set");
    const { prompt } = await req.json();

    // 1. Call Google Gemini to extract details
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{
          role: "user",
          parts: [{ text: prompt }]
      }],
      systemInstruction: {
          parts: [{ text: extractSystemPrompt }]
      },
      generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
          maxOutputTokens: 300,
      },
    };

    const geminiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const geminiData = await geminiRes.json();
    
    if (geminiRes.status !== 200) {
      const errorMessage = geminiData?.error?.message || JSON.stringify(geminiData);
      console.error("[artist-gpt-chat] Error from Gemini:", errorMessage);
      return new Response(JSON.stringify({ error: "Error from Gemini assistant: " + errorMessage }), { status: geminiRes.status, headers: corsHeaders });
    }
    
    const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!content) {
      const errorMessage = geminiData?.error?.message || JSON.stringify(geminiData);
      console.error("[artist-gpt-chat] No content returned from Gemini.", errorMessage);
      return new Response(JSON.stringify({ error: "Assistant returned no content. " + errorMessage }), { status: 502, headers: corsHeaders });
    }

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (e) {
      console.error("Could not parse AI response as JSON", content);
      return new Response(JSON.stringify({ error: "Could not parse AI response", ai_content: content }), { status: 500, headers: corsHeaders });
    }

    // DEBUG: Log what was extracted by Gemini
    console.log("Extracted filters:", extracted);

    // 2. Query Supabase DB, build up filters
    const { category, city, max_price, min_rating, availability } = extracted;

    let query: string[] = [];
    if (category) query.push(`category=eq.${encodeURIComponent(category)}`);
    if (city) query.push(`city=eq.${encodeURIComponent(city)}`);
    if (max_price !== null && max_price !== undefined) query.push(`price=lte.${max_price}`);
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

    // DEBUG: Log the API query URL
    console.log("Supabase API request URL:", url);

    const dbRes = await fetch(url, {
      method: "GET",
      headers: {
        "apikey": sbAnon,
        "Authorization": `Bearer ${sbAnon}`,
        "Content-Type": "application/json",
      },
    });

    const artists = await dbRes.json();

    // DEBUG: Log the artists received from DB
    console.log("Artists response from Supabase:", artists);

    return new Response(JSON.stringify({ extracted, artists }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chatbot error", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
