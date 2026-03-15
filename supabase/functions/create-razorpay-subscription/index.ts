import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Razorpay configuration is handled inside the serve function to support environment variables correctly.

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_SUBSCRIPTION_LINK = "https://rzp.io/rzp/JgMbYCOw";
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")?.trim();
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")?.trim();
    const RAZORPAY_PLAN_ID = Deno.env.get("RAZORPAY_PLAN_ID")?.trim() || "plan_SBNXU9zdnFGWgY";
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Missing Razorpay keys");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Razorpay credentials not configured in environment variables" 
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 200 
      });
    }

    // Auth user
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 401 
      });
    }

    // Extract token more robustly
    const token = authHeader.replace(/^Bearer\s+/i, "");
    
    // Create client with auth header for better compatibility
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: authData, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authData?.user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 401 
      });
    }
    
    const user = authData.user;
    if (!user?.email) throw new Error("User misses email");

    // Check if already subscribed using admin client for bypass RLS
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existingSub } = await supabaseAdmin
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (existingSub) {
      return new Response(
        JSON.stringify({ success: false, error: "You already have an active subscription" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get user profile for metadata
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const body = await req.json().catch(() => ({}));
    const { plan = 'monthly', use_link = false } = body;

    // Option 1: Use pre-created subscription link
    if (use_link) {
      return new Response(
        JSON.stringify({ 
          success: true,
          url: RAZORPAY_SUBSCRIPTION_LINK,
          method: "link",
          user_id: user.id,
          email: user.email
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Option 2: Create subscription via API
    try {
      console.log(`Attempting to create Razorpay subscription for user ${user.id} with plan ${RAZORPAY_PLAN_ID}`);
      
      const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      
      const subscriptionResponse = await fetch("https://api.razorpay.com/v1/subscriptions", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: RAZORPAY_PLAN_ID,
          total_count: plan === 'yearly' ? 1 : 12,
          quantity: 1,
          customer_notify: 1,
          notes: {
            user_id: user.id,
            email: user.email,
            name: profile?.full_name || "Artist"
          }
        }),
      });

      if (subscriptionResponse.ok) {
        const subscription = await subscriptionResponse.json();
        return new Response(
          JSON.stringify({ 
            success: true,
            subscriptionId: subscription.id,
            keyId: razorpayKeyId,
            short_url: subscription.short_url,
            status: subscription.status,
            method: "api"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        const errorData = await subscriptionResponse.json();
        console.warn("Razorpay API creation failed, falling back to link:", errorData);
        // Fallback to link if API creation fails (e.g. invalid plan ID)
        return new Response(
          JSON.stringify({ 
            success: true,
            url: RAZORPAY_SUBSCRIPTION_LINK,
            method: "link",
            user_id: user.id,
            email: user.email,
            fallback: true,
            api_error: errorData.error?.description
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    } catch (apiError) {
      console.error("Critical API error, falling back to link:", apiError);
      return new Response(
        JSON.stringify({ 
          success: true,
          url: RAZORPAY_SUBSCRIPTION_LINK,
          method: "link",
          user_id: user.id,
          email: user.email,
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

  } catch (error) {
    console.error("Subscription error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
