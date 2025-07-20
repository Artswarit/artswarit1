
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
    console.log(`User management action: ${action}`, data);

    switch (action) {
      case "update_profile":
        return await updateUserProfile(supabase, data);
      case "reset_password":
        return await resetPassword(supabase, data);
      case "delete_account":
        return await deleteAccount(supabase, data);
      case "get_user_stats":
        return await getUserStats(supabase, data);
      case "update_preferences":
        return await updateUserPreferences(supabase, data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("User management error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function updateUserProfile(supabase: any, data: any) {
  const { userId, updates } = data;
  
  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Profile updated successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function resetPassword(supabase: any, data: any) {
  const { email } = data;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${Deno.env.get("SITE_URL")}/reset-password`,
  });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Password reset email sent" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function deleteAccount(supabase: any, data: any) {
  const { userId } = data;
  
  // Delete user's artworks first
  await supabase.from("artworks").delete().eq("artist_id", userId);
  
  // Delete user's profile
  await supabase.from("profiles").delete().eq("id", userId);
  
  // Delete auth user
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Account deleted successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getUserStats(supabase: any, data: any) {
  const { userId } = data;
  
  const [artworksCount, followersCount, followingCount, likesCount] = await Promise.all([
    supabase.from("artworks").select("id", { count: "exact" }).eq("artist_id", userId),
    supabase.from("follows").select("id", { count: "exact" }).eq("artist_id", userId),
    supabase.from("follows").select("id", { count: "exact" }).eq("client_id", userId),
    supabase.from("artwork_likes").select("id", { count: "exact" }).eq("user_id", userId),
  ]);

  return new Response(
    JSON.stringify({
      artworks: artworksCount.count || 0,
      followers: followersCount.count || 0,
      following: followingCount.count || 0,
      likes: likesCount.count || 0,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function updateUserPreferences(supabase: any, data: any) {
  const { userId, preferences } = data;
  
  const { error } = await supabase
    .from("profiles")
    .update({
      social_links: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Preferences updated" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
