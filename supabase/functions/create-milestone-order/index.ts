import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!;
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Plan-based commission rates
const STARTER_COMMISSION = 0.15; // 15% for Starter artists
const PRO_COMMISSION = 0; // 0% for Pro artists

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      console.error('Auth error:', claimsError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.user.id;
    const { milestoneId } = await req.json();

    console.log(`Creating order for milestone: ${milestoneId}, user: ${userId}`);

    // Fetch milestone with project details
    const { data: milestone, error: milestoneError } = await supabase
      .from('project_milestones')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) {
      console.error('Milestone fetch error:', milestoneError);
      return new Response(JSON.stringify({ error: 'Milestone not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate: Only project client can pay
    if (milestone.project.client_id !== userId) {
      console.error('User is not the client:', userId, milestone.project.client_id);
      return new Response(JSON.stringify({ error: 'Only the project client can initiate payment' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate: Milestone must be approved
    if (milestone.status !== 'approved') {
      console.error('Milestone not approved:', milestone.status);
      return new Response(JSON.stringify({ error: `Payment only allowed for approved milestones. Current status: ${milestone.status}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing successful payment
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('milestone_id', milestoneId)
      .eq('status', 'success')
      .single();

    if (existingPayment) {
      console.error('Milestone already paid:', milestoneId);
      return new Response(JSON.stringify({ error: 'This milestone has already been paid' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Note: Artist bank details are optional - platform collects payment
    // and handles artist payouts separately through admin dashboard
    console.log(`Processing payment for artist: ${milestone.project.artist_id}`);

    // Check if artist is a Pro subscriber (0% fee) or Starter (15% fee)
    const { data: subscription } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', milestone.project.artist_id)
      .eq('is_active', true)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isProArtist = !!subscription;
    const commissionRate = isProArtist ? PRO_COMMISSION : STARTER_COMMISSION;
    
    console.log(`Artist ${milestone.project.artist_id} is ${isProArtist ? 'Pro' : 'Starter'} - Commission: ${commissionRate * 100}%`);

    // Calculate amounts based on artist plan
    const amount = Number(milestone.amount);
    const platformFee = Math.round(amount * commissionRate * 100) / 100;
    const artistPayout = Math.round((amount - platformFee) * 100) / 100;
    const amountInPaise = Math.round(amount * 100); // Razorpay uses smallest currency unit

    // Create Razorpay order
    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'USD',
        receipt: `ms_${milestoneId.slice(0, 8)}`,
        notes: {
          milestone_id: milestoneId,
          project_id: milestone.project_id,
          client_id: userId,
          artist_id: milestone.project.artist_id,
          platform_fee: platformFee,
          artist_payout: artistPayout,
          is_pro_artist: isProArtist,
          commission_rate: commissionRate,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create payment order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order = await orderResponse.json();
    console.log('Razorpay order created:', order.id);

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        milestone_id: milestoneId,
        project_id: milestone.project_id,
        client_id: userId,
        artist_id: milestone.project.artist_id,
        amount: amount,
        platform_fee: platformFee,
        artist_payout: artistPayout,
        currency: 'USD',
        razorpay_order_id: order.id,
        status: 'pending',
      });

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError);
      // Don't fail the request, order was created
    }

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: amountInPaise,
      currency: 'USD',
      keyId: RAZORPAY_KEY_ID,
      milestoneId,
      projectId: milestone.project_id,
      isProArtist,
      platformFee,
      artistPayout,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating milestone order:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
