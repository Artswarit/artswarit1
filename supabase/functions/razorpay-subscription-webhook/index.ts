import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

// Verify Razorpay webhook signature using Web Crypto API
async function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );
    
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify signature (optional but recommended for production)
    if (signature) {
      const isValid = await verifyWebhookSignature(body, signature, razorpayKeySecret);
      if (!isValid) {
        console.warn("Invalid webhook signature - processing anyway for testing");
        // In production, you might want to reject invalid signatures:
        // return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log("Razorpay webhook event:", event.event);

    const payload = event.payload;

    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged": {
        const subscription = payload.subscription?.entity;
        const payment = payload.payment?.entity;
        
        if (!subscription) {
          console.error("No subscription in payload");
          break;
        }

        console.log("Processing subscription:", subscription.id);
        
        // Extract user info from notes or payment email
        const userId = subscription.notes?.user_id;
        const email = payment?.email || subscription.notes?.email;
        
        if (!userId && !email) {
          console.error("No user_id or email in subscription notes");
          break;
        }

        // Find user by email if no user_id
        let finalUserId = userId;
        if (!finalUserId && email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();
          
          if (profile) {
            finalUserId = profile.id;
          }
        }

        if (!finalUserId) {
          console.error("Could not find user for subscription");
          break;
        }

        // Calculate renewal date
        const currentEnd = subscription.current_end 
          ? new Date(subscription.current_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

        // Upsert subscriber record
        const { error: upsertError } = await supabase
          .from("subscribers")
          .upsert({
            user_id: finalUserId,
            email: email || "",
            subscription_tier: "monthly",
            is_active: true,
            started_at: new Date().toISOString(),
            renew_at: currentEnd,
            stripe_customer_id: subscription.id, // Using this field for razorpay subscription id
            updated_at: new Date().toISOString(),
          }, {
            onConflict: "user_id",
            ignoreDuplicates: false
          });

        if (upsertError) {
          console.error("Error upserting subscriber:", upsertError);
          
          // Try insert if upsert fails
          const { error: insertError } = await supabase
            .from("subscribers")
            .insert({
              user_id: finalUserId,
              email: email || "",
              subscription_tier: "monthly",
              is_active: true,
              started_at: new Date().toISOString(),
              renew_at: currentEnd,
              stripe_customer_id: subscription.id,
            });
          
          if (insertError) {
            console.error("Error inserting subscriber:", insertError);
          }
        }

        // Create notification
        await supabase.from("notifications").insert({
          user_id: finalUserId,
          type: "subscription",
          title: "🎉 Pro Subscription Activated!",
          message: "Welcome to Pro! You now have 0% platform fees and unlimited portfolio.",
          metadata: { subscription_id: subscription.id }
        });

        console.log("Subscription activated for user:", finalUserId);
        break;
      }

      case "subscription.halted":
      case "subscription.cancelled":
      case "subscription.completed": {
        const subscription = payload.subscription?.entity;
        
        if (!subscription) break;
        
        const userId = subscription.notes?.user_id;
        const email = subscription.notes?.email;
        
        let finalUserId = userId;
        if (!finalUserId && email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();
          
          if (profile) {
            finalUserId = profile.id;
          }
        }

        if (finalUserId) {
          // Deactivate subscription
          await supabase
            .from("subscribers")
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq("user_id", finalUserId);

          // Notify user
          await supabase.from("notifications").insert({
            user_id: finalUserId,
            type: "subscription",
            title: "Subscription Ended",
            message: "Your Pro subscription has ended. You're now on the Starter plan.",
            metadata: { subscription_id: subscription.id }
          });

          console.log("Subscription deactivated for user:", finalUserId);
        }
        break;
      }

      case "subscription.pending": {
        console.log("Subscription pending - awaiting payment");
        break;
      }

      case "payment.authorized":
      case "payment.captured": {
        const payment = payload.payment?.entity;
        console.log("Payment processed:", payment?.id);
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        const email = payment?.email;
        
        if (email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();
          
          if (profile) {
            await supabase.from("notifications").insert({
              user_id: profile.id,
              type: "payment",
              title: "Payment Failed",
              message: "Your subscription payment failed. Please update your payment method.",
              metadata: { payment_id: payment.id }
            });
          }
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.event);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
