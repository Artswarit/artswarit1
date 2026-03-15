import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim();
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract token more robustly
    const token = authHeader.replace(/^Bearer\s+/i, "");
    
    if (!RAZORPAY_KEY_SECRET) {
      console.error('Missing RAZORPAY_KEY_SECRET');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Payment gateway secret missing' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role for database updates
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Create client with auth header for better compatibility
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    let payload;
    try {
      payload = await req.json();
    } catch (_e) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, milestoneId } = payload;

    console.log(`Verifying payment: order=${razorpay_order_id}, payment=${razorpay_payment_id}, milestone=${milestoneId}`);

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const encoder = new TextEncoder();
    const key = encoder.encode(RAZORPAY_KEY_SECRET);
    const data = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch:', expectedSignature, razorpay_signature);
      return new Response(JSON.stringify({ success: false, error: 'Payment verification failed - invalid signature' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, project:projects(*), milestone:project_milestones(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(JSON.stringify({ success: false, error: 'Payment record not found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is the client
    if (payment.client_id !== userId) {
      console.error('User mismatch:', userId, payment.client_id);
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already processed
    if (payment.status === 'success') {
      return new Response(JSON.stringify({ success: true, message: 'Payment already processed' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update payment record
    const { error: updatePaymentError } = await supabaseAdmin
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updatePaymentError) {
      console.error('Failed to update payment:', updatePaymentError);
    }

    // Update milestone status to ACTIVE (funds secured in escrow)
    const { error: updateMilestoneError } = await supabaseAdmin
      .from('project_milestones')
      .update({
        status: 'ACTIVE',
        paid_at: new Date().toISOString(),
        payment_id: razorpay_payment_id,
      })
      .eq('id', milestoneId);

    if (updateMilestoneError) {
      console.error('Failed to update milestone:', updateMilestoneError);
    }

    // Log activity
    await supabaseAdmin.from('project_activity_logs').insert({
      project_id: payment.project_id,
      milestone_id: milestoneId,
      user_id: userId,
      action: 'payment_completed',
      details: {
        amount: payment.amount,
        razorpay_payment_id,
        platform_fee: payment.platform_fee,
        artist_payout: payment.artist_payout,
      },
    });

    // Create notification for artist
    const { error: notifError } = await supabaseAdmin.from('notifications').insert({
      user_id: payment.artist_id,
      type: 'payment',
      title: 'Payment Received!',
      message: `You received $${payment.artist_payout} for milestone "${payment.milestone?.title}"`,
      metadata: {
        milestone_id: milestoneId,
        project_id: payment.project_id,
        amount: payment.artist_payout,
      },
    });
    
    if (notifError) console.error('Notification error:', notifError);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified successfully',
      milestoneId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
