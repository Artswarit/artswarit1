import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");

// Input validation constants
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 50;
const MAX_LOCATION_LENGTH = 200;
const VALID_ROLES = ['artist', 'client', 'admin', 'general'] as const;

// Input validation
interface Message {
  role: string;
  content: string;
}

interface ValidatedInput {
  messages: Message[];
  userRole: string;
  location: string;
}

function validateInput(input: unknown): ValidatedInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid request body');
  }

  const { messages: rawMessages, userRole: rawUserRole, location: rawLocation } = input as Record<string, unknown>;

  // Validate messages
  if (!rawMessages || !Array.isArray(rawMessages)) {
    throw new Error('messages must be an array');
  }

  if (rawMessages.length > MAX_MESSAGES) {
    throw new Error(`Maximum ${MAX_MESSAGES} messages allowed`);
  }

  const messages: Message[] = [];

  for (let i = 0; i < rawMessages.length; i++) {
    const msg = rawMessages[i];
    
    if (!msg || typeof msg !== 'object') {
      throw new Error(`Message at index ${i} is invalid`);
    }

    const { role, content } = msg as Record<string, unknown>;

    if (typeof role !== 'string' || !['user', 'assistant'].includes(role)) {
      throw new Error(`Invalid role at message ${i}`);
    }

    if (typeof content !== 'string') {
      throw new Error(`Invalid content at message ${i}`);
    }

    // Truncate overly long content
    const truncatedContent = content.slice(0, MAX_MESSAGE_LENGTH);
    messages.push({ role, content: truncatedContent });
  }

  // Validate userRole
  let userRole = 'general';
  if (rawUserRole !== undefined && rawUserRole !== null) {
    if (typeof rawUserRole !== 'string') {
      throw new Error('userRole must be a string');
    }
    userRole = VALID_ROLES.includes(rawUserRole as typeof VALID_ROLES[number]) ? rawUserRole : 'general';
  }

  // Validate location
  let location = 'unknown page';
  if (rawLocation !== undefined && rawLocation !== null) {
    if (typeof rawLocation !== 'string') {
      throw new Error('location must be a string');
    }
    location = rawLocation.slice(0, MAX_LOCATION_LENGTH);
  }

  return { messages, userRole, location };
}

async function fetchGemini(payload: any) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`;
  
  console.log("[edge] Sending request to Gemini");
  const geminiRes = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await geminiRes.json();
  console.log("[edge] Gemini response status:", geminiRes.status);
  return { status: geminiRes.status, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GOOGLE_GEMINI_API_KEY) {
    console.error("[edge] GOOGLE_GEMINI_API_KEY not set.");
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), { status: 503, headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let requestBody: unknown;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }), 
        { status: 400, headers: corsHeaders }
      );
    }

    let validated: ValidatedInput;
    try {
      validated = validateInput(requestBody);
    } catch (validationError) {
      console.error("[edge] Input validation failed:", validationError);
      return new Response(
        JSON.stringify({ error: "Invalid request parameters" }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const { messages, userRole, location } = validated;

    const rolePrompts: Record<string, string> = {
      artist: "You are the Artswarit assistant for artists. Guide users about uploading, managing artworks, updating profile, earning, projects, and answering queries about the artist dashboard.",
      client: "You are the Artswarit assistant for clients. Guide users about searching artists, starting projects, messaging, and answering queries about the client dashboard.",
      admin: "You are the Artswarit assistant for admins. Guide users about platform moderation, approving artists/artworks, managing platform data, etc.",
      general: "You are the Artswarit universal assistant. You help users across different tasks, features, and sections of the Artswarit platform."
    };
    const contextPrompt = rolePrompts[userRole] || rolePrompts.general;
    const fullSystemPrompt = contextPrompt + ` User is currently at: ${location}.`;

    // Gemini requires conversation history to start with a user message and have alternating roles.
    const firstUserMessageIndex = messages.findIndex((msg) => msg.role === 'user');
    
    if (firstUserMessageIndex === -1) {
      return new Response(JSON.stringify({ error: "No user message found in the history." }), { status: 400, headers: corsHeaders });
    }

    // Take only the part of conversation starting from the first user.
    const conversationMessages = messages.slice(firstUserMessageIndex);

    // Merge consecutive messages from the same role.
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
      console.error("[edge] No answer returned from Gemini");
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        { status: 502, headers: corsHeaders }
      );
    }
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("[edge] Caught error:", e);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), { status: 500, headers: corsHeaders });
  }
});
