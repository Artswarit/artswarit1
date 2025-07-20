
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
    console.log(`Notification action: ${action}`, data);

    switch (action) {
      case "send_notification":
        return await sendNotification(supabase, data);
      case "mark_read":
        return await markNotificationRead(supabase, data);
      case "get_notifications":
        return await getNotifications(supabase, data);
      case "delete_notification":
        return await deleteNotification(supabase, data);
      case "send_bulk_notification":
        return await sendBulkNotification(supabase, data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function sendNotification(supabase: any, data: any) {
  const { userId, title, message, type, metadata } = data;
  
  const { error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      title: title,
      message: message,
      type: type || "info",
      metadata: metadata || {},
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Notification sent" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function markNotificationRead(supabase: any, data: any) {
  const { notificationId, userId } = data;
  
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Notification marked as read" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getNotifications(supabase: any, data: any) {
  const { userId, limit = 50, offset = 0, unreadOnly = false } = data;
  
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data: notifications, error } = await query;

  if (error) throw error;

  return new Response(
    JSON.stringify({ notifications }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function deleteNotification(supabase: any, data: any) {
  const { notificationId, userId } = data;
  
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Notification deleted" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function sendBulkNotification(supabase: any, data: any) {
  const { userIds, title, message, type } = data;
  
  const notifications = userIds.map((userId: string) => ({
    user_id: userId,
    title: title,
    message: message,
    type: type || "info",
  }));

  const { error } = await supabase
    .from("notifications")
    .insert(notifications);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: `Sent ${userIds.length} notifications` }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
