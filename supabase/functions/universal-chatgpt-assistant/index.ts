import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");

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

type GroqMessage = {
  role: string;
  content: string;
};

type GroqPayload = {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
};

async function fetchGroq(payload: GroqPayload) {
  const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
  
  const groqRes = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = await groqRes.json();
  return { status: groqRes.status, data };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!GROQ_API_KEY) {
    console.error("[edge] GROQ_API_KEY not set.");
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

    const artswaritInfo = `Artswarit is a comprehensive, modern platform connecting freelance artists and clients.
Key platform features include:
1. For Artists:
   - Dashboard: Manage artworks, projects, earnings, and profile.
   - Artworks: Upload portfolios, set pricing, add multiple media files, and categorize by art type. Visibility settings (Public, Free, Premium, Exclusive).
   - Projects: Track milestones, submit completed work, and receive secure payouts.
   - Pro Subscriptions: Artists can buy premium subscriptions via Razorpay for better visibility and limits.
   - Earnings & Invoices: Track income, pending payouts, and generate invoices.
2. For Clients:
   - Explore & Search: Browse artists, view their portfolios, and filter by categories.
   - Hire Artists: Start projects with milestone-based agreements. Fund milestones securely via Stripe or Razorpay.
   - Messaging: Communicate in real-time with artists to discuss requirements.
   - Client Dashboard: Track ongoing projects, saved artists, and payment history.
3. For Admins:
   - Moderation: Approve or reject pending artist profiles, moderate artworks, and handle user reports.
   - Analytics: Oversee platform metrics, total revenue, and user growth.
General Information:
- Users can switch between roles or register as either Artist or Client.
- Escrow system: Funds for milestones are held securely and released upon client approval.
- Key Pages: About Us, Terms and Services, Privacy Policy, Refund Policy, Contact Page. Support must reference these when appropriate.

STRICT INSTRUCTIONS:
- You are Artswarit Assistant, the official AI support bot for Artswarit.
- The information you provide must ALWAYS be correct and match the ACTUAL Artswarit platform features listed above.
- NEVER assume features. NEVER invent or create new features.
- If the user asks about something that is not available or not explicitly stated in Artswarit's features, you MUST reply: "This feature is currently not available in Artswarit."
- Do not guess. Do not give generic internet answers.
- Always respond professionally, concisely, and authentically as official Artswarit support.`;

    const rolePrompts: Record<string, string> = {
      artist: "You are speaking to an Artist.",
      client: "You are speaking to a Client.",
      admin: "You are speaking to an Admin.",
      general: "You are speaking to a general user."
    };
    const contextPrompt = rolePrompts[userRole] || rolePrompts.general;
    const fullSystemPrompt = `${artswaritInfo}\n\n${contextPrompt}\nUser role: ${userRole}\nUser is currently at: ${location}. Provide helpful, accurate, detailed, and comprehensive information about Artswarit in a short and concise manner.`;

    // Construct messages array for Groq (OpenAI format)
    const groqMessages: GroqMessage[] = [
      { role: "system", content: fullSystemPrompt },
      ...messages.map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content
      }))
    ];

    const payload: GroqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.7,
    };

    let groqResult = await fetchGroq(payload);
    if (groqResult.status !== 200) {
      console.warn("[edge] Groq primary call failed, retrying once...");
      groqResult = await fetchGroq(payload);
    }

    const { status, data } = groqResult;

    if (status !== 200) {
      const errorMessage =
        (data &&
          typeof data === "object" &&
          "error" in data &&
          (data as Record<string, unknown>).error &&
          typeof ((data as Record<string, unknown>).error as Record<string, unknown>).message === "string" &&
          ((data as Record<string, unknown>).error as Record<string, unknown>).message) ||
        "Assistant service is currently unavailable. Please try again later.";

      console.error("[edge] Groq error status:", status, "body:", JSON.stringify(data));

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 502, headers: corsHeaders }
      );
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      console.error("[edge] No answer returned from Groq");
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
}, { port: 8787 });
