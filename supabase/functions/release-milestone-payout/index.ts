import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// RazorpayX credentials (separate from Checkout keys)
const RAZORPAYX_KEY_ID = Deno.env.get('RAZORPAYX_KEY_ID')!;
const RAZORPAYX_KEY_SECRET = Deno.env.get('RAZORPAYX_KEY_SECRET')!;
const RAZORPAYX_ACCOUNT_NUMBER = Deno.env.get('RAZORPAYX_ACCOUNT_NUMBER')!;

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Platform fee: 15% as per escrow model
const PLATFORM_FEE_RATE = 0.15;

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

    // User-scoped client for auth validation
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service-role client for privileged updates
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
    const { milestoneId } = await req.json();

    if (!milestoneId) {
      return new Response(JSON.stringify({ error: 'milestoneId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch milestone with project & artist info
    const { data: milestone, error: milestoneError } = await supabaseAdmin
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

    // Only the project client can release payout
    if (milestone.project.client_id !== userId) {
      console.error('User is not the client:', userId, milestone.project.client_id);
      return new Response(JSON.stringify({ error: 'Only the project client can release payout' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validation: milestone must be in REVIEW_PENDING state
    if (milestone.status !== 'REVIEW_PENDING') {
      console.error('Milestone not in REVIEW_PENDING state:', milestone.status);
      return new Response(JSON.stringify({ error: `Payout can only be released when milestone is awaiting review. Current status: ${milestone.status}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find successful payment record for this milestone (escrow deposit)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('milestone_id', milestoneId)
      .eq('status', 'success')
      .single();

    if (paymentError || !payment) {
      console.error('Successful payment not found for milestone:', paymentError);
      return new Response(JSON.stringify({ error: 'No successful payment found for this milestone' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch artist payout account (RazorpayX fund account id stored as razorpay_account_id)
    const { data: artistAccount, error: accountError } = await supabaseAdmin
      .from('razorpay_accounts')
      .select('*')
      .eq('user_id', milestone.project.artist_id)
      .single();

    if (accountError || !artistAccount) {
      console.error('Artist payout account not found:', accountError);
      return new Response(JSON.stringify({ error: 'Artist payout account not found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!artistAccount.payouts_enabled || !artistAccount.razorpay_account_id) {
      console.error('Artist payouts not enabled or fund account missing');
      return new Response(JSON.stringify({ error: 'Artist payouts are not enabled or fund account is missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate payout amounts (base currency is USD in payments table)
    const grossAmount = Number(payment.amount);
    const platformFee = Number((grossAmount * PLATFORM_FEE_RATE).toFixed(2));
    const payoutAmount = Number((grossAmount - platformFee).toFixed(2));

    if (payoutAmount <= 0) {
      console.error('Invalid payout amount:', payoutAmount);
      return new Response(JSON.stringify({ error: 'Invalid payout amount calculated' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RazorpayX expects INR; convert from USD using same approximation as order creation
    const USD_TO_INR_RATE = 83.5;
    const amountINR = Math.round(payoutAmount * USD_TO_INR_RATE * 100) / 100;
    const amountInPaise = Math.round(amountINR * 100);

    const razorpayxAuth = btoa(`${RAZORPAYX_KEY_ID}:${RAZORPAYX_KEY_SECRET}`);

    const payoutBody = {
      account_number: RAZORPAYX_ACCOUNT_NUMBER,
      fund_account_id: artistAccount.razorpay_account_id,
      amount: amountInPaise,
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: `ms_payout_${milestoneId.slice(0, 8)}`,
      narration: `Milestone payout - ${milestone.title}`,
      notes: {
        milestone_id: milestoneId,
        project_id: milestone.project_id,
        client_id: milestone.project.client_id,
        artist_id: milestone.project.artist_id,
        gross_amount_usd: grossAmount,
        platform_fee_usd: platformFee,
        artist_payout_usd: payoutAmount,
      },
    };

    const payoutResponse = await fetch('https://api.razorpayx.com/v1/payouts', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayxAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payoutBody),
    });

    if (!payoutResponse.ok) {
      const errorText = await payoutResponse.text();
      console.error('RazorpayX payout failed:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create payout' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payout = await payoutResponse.json();

    // Update milestone to COMPLETED and store payout_id
    const { error: updateMilestoneError } = await supabaseAdmin
      .from('project_milestones')
      .update({
        status: 'COMPLETED',
        payout_id: payout.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', milestoneId);

    if (updateMilestoneError) {
      console.error('Failed to update milestone after payout:', updateMilestoneError);
    }

    // Unlock the next milestone in sequence (LOCKED -> WAITING_FUNDS)
    const { data: milestones } = await supabaseAdmin
      .from('project_milestones')
      .select('*')
      .eq('project_id', milestone.project_id)
      .order('sort_order');

    if (milestones) {
      const currentIndex = milestones.findIndex((m) => m.id === milestoneId);
      if (currentIndex !== -1 && currentIndex < milestones.length - 1) {
        const nextMilestone = milestones[currentIndex + 1];
        if (nextMilestone.status === 'LOCKED') {
          await supabaseAdmin
            .from('project_milestones')
            .update({ status: 'WAITING_FUNDS' })
            .eq('id', nextMilestone.id);
        }
      }
    }

    // Log activity
    await supabaseAdmin.from('project_activity_logs').insert({
      project_id: milestone.project_id,
      milestone_id: milestoneId,
      user_id: userId,
      action: 'milestone_payout_released',
      details: {
        payout_id: payout.id,
        payout_amount_usd: payoutAmount,
        platform_fee_usd: platformFee,
      },
    });

    // Notify artist that payout has been released
    await supabaseAdmin.from('notifications').insert({
      user_id: milestone.project.artist_id,
      type: 'payment',
      title: 'Payout Released!',
      message: `Escrow payout has been released for milestone "${milestone.title}".`,
      metadata: {
        milestone_id: milestoneId,
        project_id: milestone.project_id,
        payout_id: payout.id,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      payoutId: payout.id,
      milestoneId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error releasing milestone payout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
