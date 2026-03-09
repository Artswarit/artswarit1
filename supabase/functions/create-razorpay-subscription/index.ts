import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Razorpay Plan ID for Pro Artist subscription (₹499/month)
const RAZORPAY_PLAN_ID = "plan_SBNXU9zdnFGWgY";
const RAZORPAY_SUBSCRIPTION_LINK = "https://rzp.io/rzp/JgMbYCOw";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Auth user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data?.user;
    if (!user?.email) throw new Error("User not found or missing email");

    // Get user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const body = await req.json().catch(() => ({}));
    const { use_link = true } = body;

    // Option 1: Use pre-created subscription link (simplest approach)
    if (use_link) {
      // Store pending subscription info for webhook to process
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Check if already subscribed
      const { data: existingSub } = await supabaseAdmin
        .from("subscribers")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (existingSub) {
        return new Response(
          JSON.stringify({ error: "You already have an active subscription" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Return the pre-created subscription link
      return new Response(
        JSON.stringify({ 
          url: RAZORPAY_SUBSCRIPTION_LINK,
          method: "link",
          user_id: user.id,
          email: user.email
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Option 2: Create subscription via API (requires more setup)
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    // Create a subscription
    const subscriptionResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: RAZORPAY_PLAN_ID,
        total_count: 12, // 12 billing cycles
        quantity: 1,
        customer_notify: 1,
        notes: {
          user_id: user.id,
          email: user.email,
          name: profile?.full_name || "Artist"
        }
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      console.error("Razorpay subscription error:", errorData);
      throw new Error(errorData.error?.description || "Failed to create subscription");
    }

    const subscription = await subscriptionResponse.json();
    // console.log("Created Razorpay subscription:", subscription.id);

    // Return short URL or checkout link
    return new Response(
      JSON.stringify({ 
        subscription_id: subscription.id,
        short_url: subscription.short_url,
        status: subscription.status,
        method: "api"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Subscription error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
