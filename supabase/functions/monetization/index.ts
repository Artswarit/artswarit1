
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { action, data } = await req.json();
    console.log(`Monetization action: ${action}`, data);

    switch (action) {
      case "send_tip":
        return await sendTip(supabase, data);
      case "create_subscription":
        return await createSubscription(supabase, data);
      case "process_donation":
        return await processDonation(supabase, data);
      case "get_earnings":
        return await getEarnings(supabase, data);
      case "withdraw_funds":
        return await withdrawFunds(supabase, data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Monetization error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function sendTip(supabase: any, data: any) {
  const { fromUserId, toUserId, amount, artworkId, message } = data;
  
  // Record tip transaction
  const { error } = await supabase
    .from("transactions")
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount: amount,
      type: "tip",
      artwork_id: artworkId,
      message: message,
      status: "completed",
    });

  if (error) throw error;

  // Create notification for artist
  await supabase
    .from("notifications")
    .insert({
      user_id: toUserId,
      title: "New Tip Received!",
      message: `You received a $${amount} tip${artworkId ? ' on your artwork' : ''}!`,
      type: "tip",
    });

  return new Response(
    JSON.stringify({ success: true, message: "Tip sent successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function createSubscription(supabase: any, data: any) {
  const { userId, artistId, tier, amount } = data;
  
  const { error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      artist_id: artistId,
      tier: tier,
      amount: amount,
      status: "active",
      next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

  if (error) throw error;

  // Notify artist
  await supabase
    .from("notifications")
    .insert({
      user_id: artistId,
      title: "New Subscriber!",
      message: `Someone subscribed to your ${tier} tier!`,
      type: "subscription",
    });

  return new Response(
    JSON.stringify({ success: true, message: "Subscription created" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function processDonation(supabase: any, data: any) {
  const { fromUserId, toUserId, amount, message } = data;
  
  const { error } = await supabase
    .from("transactions")
    .insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount: amount,
      type: "donation",
      message: message,
      status: "completed",
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Donation processed" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getEarnings(supabase: any, data: any) {
  const { userId, period = "month" } = data;
  
  let startDate = new Date();
  if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  const { data: earnings, error } = await supabase
    .from("transactions")
    .select("amount, type, created_at")
    .eq("to_user_id", userId)
    .gte("created_at", startDate.toISOString());

  if (error) throw error;

  const totalEarnings = earnings.reduce((sum: number, tx: any) => sum + tx.amount, 0);
  const tipEarnings = earnings.filter((tx: any) => tx.type === "tip").reduce((sum: number, tx: any) => sum + tx.amount, 0);
  const subscriptionEarnings = earnings.filter((tx: any) => tx.type === "subscription").reduce((sum: number, tx: any) => sum + tx.amount, 0);

  return new Response(
    JSON.stringify({
      total: totalEarnings,
      tips: tipEarnings,
      subscriptions: subscriptionEarnings,
      transactions: earnings,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function withdrawFunds(supabase: any, data: any) {
  const { userId, amount, paymentMethod } = data;
  
  const { error } = await supabase
    .from("withdrawals")
    .insert({
      user_id: userId,
      amount: amount,
      payment_method: paymentMethod,
      status: "pending",
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Withdrawal request submitted" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
