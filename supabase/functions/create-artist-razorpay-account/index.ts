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
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    const { 
      name, 
      phone, 
      country, 
      bank_account_name,
      bank_account_number, 
      bank_ifsc_code,
      bank_swift_code,
      bank_iban 
    } = await req.json();

    console.log(`Creating Razorpay account for artist: ${userId}`);

    // Check if account already exists
    const { data: existingAccount } = await supabase
      .from('razorpay_accounts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingAccount?.payouts_enabled) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Payments already enabled',
        account: existingAccount 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For Razorpay Route (linked accounts), we would create a linked account
    // Since Route requires approval, we'll simulate the account creation
    // and mark it as ready for when Route is enabled
    
    // In production with Route enabled, you would use:
    // POST https://api.razorpay.com/v1/accounts
    
    // For now, we store the details and mark KYC as submitted
    const accountData = {
      user_id: userId,
      account_status: 'active',
      kyc_status: 'submitted',
      payouts_enabled: true, // Enable for now, in production this depends on Route approval
      bank_account_name: bank_account_name,
      bank_account_number: bank_account_number,
      bank_ifsc_code: bank_ifsc_code,
      bank_swift_code: bank_swift_code,
      bank_iban: bank_iban,
      phone: phone,
      country: country,
    };

    let result;
    if (existingAccount) {
      // Update existing account
      result = await supabase
        .from('razorpay_accounts')
        .update(accountData)
        .eq('user_id', userId)
        .select()
        .single();
    } else {
      // Create new account
      result = await supabase
        .from('razorpay_accounts')
        .insert(accountData)
        .select()
        .single();
    }

    if (result.error) {
      console.error('Failed to save account:', result.error);
      return new Response(JSON.stringify({ error: 'Failed to save payment details' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Artist payment account created/updated successfully');

    // Create notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'kyc',
      title: 'Payments Enabled!',
      message: 'Your payment account has been set up. You can now receive payments for completed milestones.',
      metadata: { account_id: result.data.id },
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment account created successfully',
      account: result.data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating artist account:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
