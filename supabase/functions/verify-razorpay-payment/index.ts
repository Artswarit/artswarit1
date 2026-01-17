import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role for database updates
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Also create a client with user auth for validation
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, milestoneId } = await req.json();

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
      return new Response(JSON.stringify({ error: 'Payment verification failed - invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Signature verified successfully');

    // Fetch payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, project:projects(*), milestone:project_milestones(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(JSON.stringify({ error: 'Payment record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is the client
    if (payment.client_id !== userId) {
      console.error('User mismatch:', userId, payment.client_id);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already processed
    if (payment.status === 'success') {
      console.log('Payment already processed');
      return new Response(JSON.stringify({ success: true, message: 'Payment already processed' }), {
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

    // Update milestone status to paid
    const { error: updateMilestoneError } = await supabaseAdmin
      .from('project_milestones')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_id: razorpay_payment_id,
      })
      .eq('id', milestoneId);

    if (updateMilestoneError) {
      console.error('Failed to update milestone:', updateMilestoneError);
    }

    // Fetch all milestones to find and unlock next one
    const { data: milestones } = await supabaseAdmin
      .from('project_milestones')
      .select('*')
      .eq('project_id', payment.project_id)
      .order('sort_order');

    if (milestones) {
      const currentIndex = milestones.findIndex(m => m.id === milestoneId);
      if (currentIndex !== -1 && currentIndex < milestones.length - 1) {
        const nextMilestone = milestones[currentIndex + 1];
        console.log('Next milestone to unlock:', nextMilestone.id);
        // Next milestone is now unlockable (can be started by artist)
      }
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
    await supabaseAdmin.from('notifications').insert({
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

    console.log('Payment verified and milestone updated successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment verified successfully',
      milestoneId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
