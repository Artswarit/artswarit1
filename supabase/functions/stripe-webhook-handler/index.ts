import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    // In a real implementation, verify the webhook signature here
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // For now, parse the body as JSON
    const event = JSON.parse(body)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
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