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
    const { artworkId, amount, currency = 'USD' } = await req.json();
    
    if (!artworkId || !amount) {
      throw new Error("Missing required fields: artworkId, amount");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("Authentication failed");

    // Get artwork details
    const { data: artwork, error: artworkError } = await supabaseClient
      .from('artworks')
      .select('*, artist_id, title')
      .eq('id', artworkId)
      .single();

    if (artworkError || !artwork) {
      throw new Error("Artwork not found");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get or create Stripe customer
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    const customers = await stripe.customers.list({ 
      email: profile?.email || user.email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.full_name,
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        artworkId,
        artistId: artwork.artist_id,
        buyerId: user.id,
        artworkTitle: artwork.title
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        from_user_id: user.id,
        to_user_id: artwork.artist_id,
        artwork_id: artworkId,
        type: 'artwork_purchase',
        amount,
        currency,
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        metadata: {
          artwork_title: artwork.title
        }
      });

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});