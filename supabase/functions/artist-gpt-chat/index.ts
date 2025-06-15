
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

const systemPrompt = `You are Artswarit's helpful assistant. Your name is 'Artswarit Chat'.
- Your primary goal is to help users with information about the Artswarit platform and help them find artists.
- ALWAYS respond in a friendly, conversational, and helpful manner.
- If the user greets you with 'hi', 'hello', or similar, respond warmly and ask how you can help them.
- Answer questions about Artswarit platform features, artists, artworks, and help users navigate the platform.
- When users ask about finding specific artists, you can use the find_artists tool if they provide criteria.
- Keep responses helpful and informative about the Artswarit platform.`;

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
    if (!GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "API key not configured" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received messages:", JSON.stringify(messages, null, 2));

    // Clean messages and prepare for Gemini
    const cleanMessages = messages.filter(msg => {
      if (msg.role === 'assistant') {
        return !msg.content.startsWith("There was an error") && 
               !msg.content.startsWith("Sorry, I couldn't process") &&
               !msg.content.includes("Edge Function returned");
      }
      return true;
    });

    const firstUserMessageIndex = cleanMessages.findIndex((msg) => msg.role === 'user');
    if (firstUserMessageIndex === -1) {
      return new Response(
        JSON.stringify({ error: "No user message found" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const conversationMessages = cleanMessages.slice(firstUserMessageIndex);
    
    // Convert to Gemini format
    const geminiContents = [];
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

    // Call Gemini API
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
    
    const finalContents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Hello! I\'m Artswarit Chat, your helpful assistant. How can I help you today?' }] },
      ...geminiContents
    ];
    
    const payload = {
      contents: finalContents,
      tools: [findArtistsTool],
      generationConfig: { 
        temperature: 0.7,
        maxOutputTokens: 1000
      },
    };

    console.log("Calling Gemini API with payload:", JSON.stringify(payload, null, 2));

    const geminiRes = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const geminiData = await geminiRes.json();
    
    console.log("Gemini Response Status:", geminiRes.status);
    console.log("Gemini Response Body:", JSON.stringify(geminiData, null, 2));

    if (!geminiRes.ok) {
      const error = geminiData?.error?.message || `API returned status ${geminiRes.status}`;
      console.error("Gemini API Error:", error);
      return new Response(
        JSON.stringify({ answer: "Hello! I'm Artswarit Chat. How can I help you find an artist or learn about our platform today?" }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const candidate = geminiData?.candidates?.[0];
    if (!candidate?.content?.parts?.[0]) {
      console.warn("No valid response from Gemini");
      return new Response(
        JSON.stringify({ answer: "Hello! I'm Artswarit Chat. How can I help you today?" }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const part = candidate.content.parts[0];

    // Handle function call
    if (part.functionCall) {
      const { name, args } = part.functionCall;
      if (name === "find_artists") {
        console.log("Function call to find_artists with args:", args);

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
        
        if (dbError) {
          console.error("Database error:", dbError);
          return new Response(
            JSON.stringify({ answer: "I'm having trouble accessing the artist database right now. Please try again later." }), 
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify({ artists, extracted: args }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle text response
    if (part.text) {
      return new Response(JSON.stringify({ answer: part.text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback response
    return new Response(
      JSON.stringify({ answer: "Hello! I'm Artswarit Chat. How can I help you today?" }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ answer: "Hello! I'm Artswarit Chat. How can I help you find an artist or learn about our platform?" }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
