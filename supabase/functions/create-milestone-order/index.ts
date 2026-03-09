import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')?.trim();
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')?.trim();
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
      console.error('Missing or invalid Authorization header');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      console.error('Auth verify error:', claimsError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.user.id;
    
    // Robust JSON parsing
    let milestoneId;
    try {
      const body = await req.json();
      milestoneId = body.milestoneId;
    } catch (_e) {
      console.error('JSON parse error:', _e);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid request body' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!milestoneId) {
      console.error('Missing milestoneId in request');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Milestone ID is required' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Creating order for milestone: ${milestoneId}, user: ${userId}`);

    // Fetch milestone with project details
    const { data: milestone, error: milestoneError } = await supabase
      .from('project_milestones')
      .select(`
        *,
        project:projects(*)
      `)
      .eq('id', milestoneId)
      .maybeSingle();

    if (milestoneError || !milestone) {
      console.error('Milestone fetch error:', milestoneError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Milestone not found' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate: Only project client can pay
    if (milestone.project.client_id !== userId) {
      console.error('User is not the client:', userId, milestone.project.client_id);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Only the project client can initiate payment' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate: Milestone must be in WAITING_FUNDS state (escrow mode)
    if (milestone.status !== 'WAITING_FUNDS') {
      console.error('Milestone not in WAITING_FUNDS state:', milestone.status);
      return new Response(JSON.stringify({ 
        success: false,
        error: `Funding only allowed when milestone is waiting for funds. Current status: ${milestone.status}` 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for existing successful payment
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('milestone_id', milestoneId)
      .eq('status', 'success')
      .maybeSingle();

    if (existingPayment) {
      console.error('Milestone already paid:', milestoneId);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'This milestone has already been paid' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
    
    // Calculate amounts
    const storedCurrency = milestone.project.currency || 'USD';
    const amountBase = Number(milestone.amount);
    const USD_TO_INR_RATE = 83.5; 
    
    let amountINR: number;
    let amountUSD: number;

    if (storedCurrency === 'INR') {
      amountINR = amountBase;
      amountUSD = amountINR / USD_TO_INR_RATE;
    } else {
      amountUSD = amountBase;
      amountINR = Math.round(amountUSD * USD_TO_INR_RATE * 100) / 100;
    }
    
    const platformFee = Math.round(amountUSD * commissionRate * 100) / 100;
    const artistPayout = Math.round((amountUSD - platformFee) * 100) / 100;
    const amountInPaise = Math.round(amountINR * 100);

    // Check for required environment variables
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay keys');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Payment gateway configuration missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        currency: 'INR',
        receipt: `ms_${milestoneId.slice(0, 8)}`,
        notes: {
          milestone_id: milestoneId,
          project_id: milestone.project_id,
          client_id: userId,
          artist_id: milestone.project.artist_id,
          amount_usd: amountUSD, 
          amount_inr: amountINR,
          stored_currency: storedCurrency,
          platform_fee_usd: platformFee,
          artist_payout_usd: artistPayout,
          is_pro_artist: isProArtist,
          commission_rate: commissionRate,
          usd_to_inr_rate: USD_TO_INR_RATE,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}));
      console.error('Razorpay order creation failed:', errorData);
      return new Response(JSON.stringify({ 
        success: false,
        error: errorData.error?.description || 'Failed to create payment order',
        details: errorData 
      }), {
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const order = await orderResponse.json();

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        milestone_id: milestoneId,
        project_id: milestone.project_id,
        client_id: userId,
        artist_id: milestone.project.artist_id,
        amount: amountBase,
        platform_fee: platformFee,
        artist_payout: artistPayout,
        currency: storedCurrency,
        razorpay_order_id: order.id,
        status: 'pending',
      });

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError);
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      amountINR: amountINR,
      amountUSD: amountUSD,
      currency: 'INR',
      baseCurrency: 'USD',
      keyId: RAZORPAY_KEY_ID,
      milestoneId,
      projectId: milestone.project_id,
      isProArtist,
      platformFee,
      artistPayout,
      exchangeRate: USD_TO_INR_RATE,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Global error in create-milestone-order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
