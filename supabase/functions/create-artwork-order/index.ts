import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    if (!authHeader) {
      throw new Error("Not authenticated");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    const { artworkId } = await req.json();
    
    if (!artworkId) {
      throw new Error("Artwork ID is required");
    }

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabaseClient
      .from("artworks")
      .select("id, title, price, artist_id, metadata")
      .eq("id", artworkId)
      .single();

    if (artworkError || !artwork) {
      throw new Error("Artwork not found");
    }

    if (!artwork.price || artwork.price <= 0) {
      throw new Error("This artwork is not available for purchase");
    }

    // Check if already unlocked
    const { data: existingUnlock } = await supabaseClient
      .from("artwork_unlocks")
      .select("id")
      .eq("artwork_id", artworkId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingUnlock) {
      return new Response(
        JSON.stringify({ error: "You have already unlocked this artwork" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Handle currency logic: if stored as INR, use directly. If USD, convert to INR.
    const metadata = artwork.metadata as { currency?: string } | null;
    const storedCurrency = metadata?.currency ?? 'USD';
    const USD_TO_INR_RATE = 83.5;
    let priceINR: number;
    let priceUSD: number;

    if (storedCurrency === 'INR') {
      priceINR = Number(artwork.price);
      priceUSD = priceINR / USD_TO_INR_RATE;
    } else {
      priceUSD = Number(artwork.price);
      priceINR = priceUSD * USD_TO_INR_RATE;
    }

    // Convert to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(priceINR * 100);
    
    // console.log(`Artwork order (${storedCurrency}): $${priceUSD.toFixed(2)} USD = ₹${priceINR.toFixed(2)} INR = ${amountInPaise} paise`);

    // Create Razorpay order
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        notes: {
          type: "artwork_unlock",
          artwork_id: artworkId,
          user_id: user.id,
          artist_id: artwork.artist_id,
          amount_usd: priceUSD,
          amount_inr: priceINR,
          stored_currency: storedCurrency,
          usd_to_inr_rate: USD_TO_INR_RATE,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error("Razorpay order error:", errorData);
      throw new Error(errorData.error?.description || "Failed to create payment order");
    }

    const order = await orderResponse.json();

    return new Response(
      JSON.stringify({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
        artworkId: artworkId,
        artworkTitle: artwork.title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Artwork order error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
