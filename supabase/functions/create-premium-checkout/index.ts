import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

// CORS settings
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body
    const { plan } = await req.json();
    if (!plan) throw new Error("Missing required 'plan' parameter");

    // Auth user (using Supabase anon key for context)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data?.user;
    if (!user?.email) throw new Error("Supabase user not found or missing email");

    // Set up Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Find or create customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    // NEW PLAN CONFIG: Pro Artist only at ₹499/month (49900 paise)
    // Keeping monthly as the only option since the new model is simpler
    const planConfigs: Record<string, { price: number; name: string; interval?: "month" | "year"; id: string }> = {
      pro: {
        price: 49900, // ₹499 in paise
        name: "Pro Artist",
        interval: "month",
        id: "artswarit-pro-artist"
      },
      // Keep old plans for backward compatibility
      monthly: {
        price: 49900,
        name: "Pro Artist Monthly",
        interval: "month",
        id: "artswarit-pro-monthly"
      },
      yearly: {
        price: 499900, // ₹4999 (save ~17%)
        name: "Pro Artist Yearly",
        interval: "year",
        id: "artswarit-pro-yearly"
      }
    };

    const config = planConfigs[plan];
    if (!config) throw new Error("Invalid plan. Valid options: pro, monthly, yearly");

    const lineItem = {
      price_data: {
        currency: "inr",
        product_data: {
          name: config.name,
          description: "0% platform fees • Unlimited portfolio • Verified badge • Priority ranking"
        },
        unit_amount: config.price,
        recurring: config.interval ? { interval: config.interval } : undefined
      },
      quantity: 1
    };

    // Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId ? user.email : undefined,
      line_items: [lineItem],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/artist-dashboard?premium=success&plan=${plan}`,
      cancel_url: `${req.headers.get("origin")}/artist-dashboard?premium=cancel`,
      metadata: {
        user_id: user.id,
        plan,
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
