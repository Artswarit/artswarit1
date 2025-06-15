
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

    // Plan configs: monthly ₹49 (INR), yearly ₹499, lifetime ₹1499
    const planConfigs = {
      monthly: {
        price: 4900, name: "Premium Monthly", interval: "month", id: "artswarit-premium-monthly"
      },
      yearly: {
        price: 49900, name: "Premium Yearly", interval: "year", id: "artswarit-premium-yearly"
      },
      lifetime: {
        price: 149900, name: "Premium Lifetime", interval: undefined, id: "artswarit-premium-lifetime"
      }
    };
    const config = planConfigs[plan];

    if (!config) throw new Error("Invalid plan");

    let lineItem;
    if (plan === "lifetime") {
      lineItem = {
        price_data: {
          currency: "inr",
          product_data: {
            name: config.name,
            description: "Artswarit Premium Lifetime Access"
          },
          unit_amount: config.price
        },
        quantity: 1
      };
    } else {
      lineItem = {
        price_data: {
          currency: "inr",
          product_data: {
            name: config.name,
            description: "Artswarit Premium Subscription"
          },
          unit_amount: config.price,
          recurring: { interval: config.interval }
        },
        quantity: 1
      };
    }

    // Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId ? user.email : undefined,
      line_items: [lineItem],
      mode: plan === "lifetime" ? "payment" : "subscription",
      success_url: `${req.headers.get("origin")}/artist-dashboard?premium=success`,
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
