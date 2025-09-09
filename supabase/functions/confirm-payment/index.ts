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
    const { paymentIntentId } = await req.json();
    
    if (!paymentIntentId) {
      throw new Error("Missing payment intent ID");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verify payment status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error("Payment not completed");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { artworkId, artistId, buyerId } = paymentIntent.metadata;
    const amount = paymentIntent.amount / 100; // Convert from cents

    // Update transaction status
    const { error: updateError } = await supabaseClient
      .from('transactions')
      .update({ status: 'completed' })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (updateError) {
      console.error('Transaction update error:', updateError);
    }

    // Record sale
    const { data: sale, error: saleError } = await supabaseClient
      .from('sales')
      .insert({
        artwork_id: artworkId,
        artist_id: artistId,
        buyer_id: buyerId,
        amount,
        status: 'completed'
      })
      .select()
      .single();

    if (saleError) {
      console.error('Sale recording error:', saleError);
    }

    // Create notification for artist
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: artistId,
        title: 'New Sale!',
        message: `Your artwork has been sold for $${amount}`,
        type: 'success',
        metadata: {
          saleId: sale?.id,
          artworkId,
          amount
        }
      });

    // Create notification for buyer
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: buyerId,
        title: 'Purchase Confirmed',
        message: `Your purchase of $${amount} has been confirmed`,
        type: 'success',
        metadata: {
          saleId: sale?.id,
          artworkId,
          amount
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        saleId: sale?.id,
        message: 'Payment confirmed and sale recorded'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});