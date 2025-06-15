
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

const systemPrompt = `You are Artswarit’s specialist artist-finding assistant. Your name is 'Artswarit Chat'.
- Your primary goal is to help users discover artists on the Artswarit platform.
- ALWAYS engage in a friendly, conversational, and helpful manner.
- If the user starts with a simple greeting like 'hi', 'hello', or similar, you MUST respond with a friendly greeting and then ask how you can help them find an artist. For example: "Hello! I'm Artswarit Chat. How can I help you find the perfect artist today?". Do NOT use a tool for this.
- When the user specifies what they are looking for (e.g., category, city, price), you MUST use the 'find_artists' tool to search. Ask clarifying questions if the user's request is ambiguous before using the tool.
- If the user asks a general question about Artswarit, answer it to the best of your ability.
- Only use the 'find_artists' tool when you have concrete criteria to search for.`;

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

    // Filter out previous error messages from the bot to avoid polluting the history
    const cleanMessages = messages.filter(msg => {
      if (msg.role === 'assistant') {
        return !msg.content.startsWith("There was an error") && !msg.content.startsWith("Sorry, I couldn't process");
      }
      return true;
    });

    // 1. Prepare conversation history for Gemini
    const firstUserMessageIndex = cleanMessages.findIndex((msg: { role: string }) => msg.role === 'user');
    if (firstUserMessageIndex === -1) {
        return new Response(JSON.stringify({ error: "No user message found." }), { status: 400, headers: corsHeaders });
    }
    const conversationMessages = cleanMessages.slice(firstUserMessageIndex);

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
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
    
    const finalContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Okay, I am ready to help. How can I assist you in finding an artist today?' }] },
      ...geminiContents
    ];
    
    const payload = {
      contents: finalContents,
      tools: [findArtistsTool],
      generationConfig: { temperature: 0.7 },
    };

    console.log("Gemini Payload:", JSON.stringify(payload, null, 2));

    const geminiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const geminiData = await geminiRes.json();
    
    console.log("Gemini Response Status:", geminiRes.status);
    console.log("Gemini Response Body:", JSON.stringify(geminiData, null, 2));

    if (geminiRes.status !== 200) {
      const error = geminiData?.error?.message || `Gemini API returned status ${geminiRes.status}`;
      console.error("Error from Gemini API:", error, JSON.stringify(geminiData));
      return new Response(JSON.stringify({ error: "Error from Gemini: " + error }), { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const candidate = geminiData?.candidates?.[0];
    if (!candidate || !candidate.content) {
      const finishReason = candidate?.finishReason || "unknown";
      const safetyRatings = candidate?.safetyRatings || [];
      console.warn("No content in Gemini response.", { finishReason, safetyRatings });
      if (finishReason === "SAFETY") {
        return new Response(JSON.stringify({ error: "The response was blocked due to safety concerns. Please rephrase your request." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "I'm sorry, I couldn't generate a response. Please try again." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const part = candidate.content.parts[0];
    if (!part) {
      return new Response(JSON.stringify({ error: "No response part from assistant." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    if (part.text === undefined || part.text === null) {
      console.warn("Gemini returned a part without text or function call.", JSON.stringify(part));
      return new Response(JSON.stringify({ answer: "I'm not sure how to respond to that. Could you try asking in a different way?" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ answer: part.text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("artist-gpt-chat error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
