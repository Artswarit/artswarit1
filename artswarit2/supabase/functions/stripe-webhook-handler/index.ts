import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing Stripe configuration')
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', errMessage)
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Verified webhook event:', event.type)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const paymentIntentId = session.payment_intent || session.id

      // Update transaction status to success
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'success' })
        .eq('stripe_payment_intent_id', paymentIntentId)

      if (updateError) {
        console.error('Transaction update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update transaction' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Get transaction details
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*, artworks(*)')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (transaction) {
        // Update artwork status (no longer for sale)
        await supabase
          .from('artworks')
          .update({ 
            price: null,
            status: 'archived'
          })
          .eq('id', transaction.artwork_id)

        // Create notifications
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: transaction.seller_id,
              type: 'sale',
              title: 'Artwork Sold!',
              message: `Your artwork "${transaction.artworks.title}" has been sold for $${transaction.amount}`,
              metadata: { transaction_id: transaction.id }
            },
            {
              user_id: transaction.buyer_id,
              type: 'purchase',
              title: 'Purchase Confirmed',
              message: `You have successfully purchased "${transaction.artworks.title}"`,
              metadata: { transaction_id: transaction.id }
            }
          ])
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})