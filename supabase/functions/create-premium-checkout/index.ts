
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, user_id } = await req.json();
    
    if (!plan || !user_id) {
      throw new Error("Missing required parameters");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      throw new Error("User not found");
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: profile.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Plan configurations
    const planConfigs = {
      premium: {
        price: 99900, // ₹999 in paise
        name: "Premium Plan",
        interval: "month"
      },
      enterprise: {
        price: 299900, // ₹2999 in paise
        name: "Enterprise Plan", 
        interval: "month"
      }
    };

    if (plan === 'manage') {
      // Create customer portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.get("origin")}/artist-dashboard`,
      });

      return new Response(JSON.stringify({ url: portalSession.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const planConfig = planConfigs[plan as keyof typeof planConfigs];
    if (!planConfig) {
      throw new Error("Invalid plan selected");
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : profile.email,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { 
              name: planConfig.name,
              description: "Artswarit Premium Membership"
            },
            unit_amount: planConfig.price,
            recurring: { interval: planConfig.interval as "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/artist-dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/artist-dashboard?canceled=true`,
      metadata: {
        user_id: user_id,
        plan: plan
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
