
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

const systemPrompt = `You are Artswarit’s specialist artist-finding assistant.
- Your primary goal is to help users discover artists on the platform.
- Engage in a friendly, conversational manner. Ask clarifying questions if the user's request is ambiguous.
- When you have enough information to search for artists (like category, city, price), use the 'find_artists' tool.
- If the user is just chatting, respond naturally without using the tool.`;

const findArtistsTool = {
  functionDeclarations: [{
    name: "find_artists",
    description: "Finds artists on the Artswarit platform based on user criteria.",
    parameters: {
      type: "OBJECT",
      properties: {
        category: { type: "STRING", description: "Artist category (e.g., singer, painter, digital artist)" },
        city: { type: "STRING", description: "City or region (e.g., Delhi, Mumbai)" },
        max_price: { type: "NUMBER", description: "Maximum price for artwork or service." },
        min_rating: { type: "NUMBER", description: "Minimum artist rating (1-5)." },
        availability: { type: "STRING", description: "Artist availability.", enum: ["available", "busy"] }
      },
      required: []
    }
  }]
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_GEMINI_API_KEY) throw new Error("GOOGLE_GEMINI_API_KEY not set");

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      throw new Error("Missing 'messages' in request body");
    }

    // 1. Prepare conversation history for Gemini
    const firstUserMessageIndex = messages.findIndex((msg: { role: string }) => msg.role === 'user');
    if (firstUserMessageIndex === -1) {
        return new Response(JSON.stringify({ error: "No user message found." }), { status: 400, headers: corsHeaders });
    }
    const conversationMessages = messages.slice(firstUserMessageIndex);

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
    
    // 2. Call Gemini
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
    const payload = {
      contents: geminiContents,
      systemInstruction: { parts: [{ text: systemPrompt }] },
      tools: [findArtistsTool],
      generationConfig: { temperature: 0.7 },
    };

    const geminiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const geminiData = await geminiRes.json();
    
    if (geminiRes.status !== 200) {
      const error = geminiData?.error?.message || JSON.stringify(geminiData);
      return new Response(JSON.stringify({ error: "Error from Gemini: " + error }), { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const candidate = geminiData?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    if (!part) {
      return new Response(JSON.stringify({ error: "No response from assistant." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. Check for function call or text response
    if (part.functionCall) {
      const { name, args } = part.functionCall;
      if (name === "find_artists") {
        console.log("Calling find_artists with:", args);

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        let query = supabaseClient
          .from("artists")
          .select("id,name,category,city,price,image_url,profile_url,rating,available")
          .limit(3);

        if (args.category) query = query.eq('category', args.category);
        if (args.city) query = query.eq('city', args.city);
        if (args.max_price !== null && args.max_price !== undefined) query = query.lte('price', args.max_price);
        if (args.min_rating !== null && args.min_rating !== undefined) query = query.gte('rating', args.min_rating);
        if (args.availability === 'available') query = query.is('available', true);

        const { data: artists, error: dbError } = await query;
        if (dbError) throw dbError;

        return new Response(JSON.stringify({ artists, extracted: args }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // It's a regular text response
    return new Response(JSON.stringify({ answer: part.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("artist-gpt-chat error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
