import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Web Crypto API for signature verification
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const data = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    if (!razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Auth user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      artworkId,
    } = await req.json();

    // Verify signature
    const isValid = await verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayKeySecret
    );

    if (!isValid) {
      throw new Error("Invalid payment signature");
    }

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabaseClient
      .from("artworks")
      .select("id, price, artist_id")
      .eq("id", artworkId)
      .single();

    if (artworkError || !artwork) {
      throw new Error("Artwork not found");
    }

    // Record the unlock in artwork_unlocks table
    const { error: unlockError } = await supabaseAdmin
      .from("artwork_unlocks")
      .insert({
        artwork_id: artworkId,
        user_id: user.id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: artwork.price,
      });

    if (unlockError) {
      console.error("Failed to record unlock:", unlockError);
      throw new Error("Failed to record artwork unlock");
    }

    // Create notification for artist
    await supabaseAdmin.from("notifications").insert({
      user_id: artwork.artist_id,
      type: "artwork_sold",
      title: "Artwork Sold!",
      message: `Your artwork was purchased for ₹${artwork.price}`,
      metadata: {
        artwork_id: artworkId,
        buyer_id: user.id,
        amount: artwork.price,
      },
    });

    console.log("Artwork unlock verified:", { artworkId, userId: user.id, paymentId: razorpay_payment_id });

    return new Response(
      JSON.stringify({
        success: true,
        artworkId,
        message: "Payment verified and artwork unlocked!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Artwork verification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
