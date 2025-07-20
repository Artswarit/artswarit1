import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// UUID validation function
const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { action, data } = await req.json();
    console.log(`Social features action: ${action}`, data);

    // Validate UUIDs in data
    if (data.userId && !isValidUUID(data.userId)) {
      throw new Error(`Invalid userId format: ${data.userId}`);
    }
    if (data.followerId && !isValidUUID(data.followerId)) {
      throw new Error(`Invalid followerId format: ${data.followerId}`);
    }
    if (data.followingId && !isValidUUID(data.followingId)) {
      throw new Error(`Invalid followingId format: ${data.followingId}`);
    }
    if (data.artworkId && !isValidUUID(data.artworkId)) {
      throw new Error(`Invalid artworkId format: ${data.artworkId}`);
    }

    switch (action) {
      case "follow_user":
        return await followUser(supabase, data);
      case "unfollow_user":
        return await unfollowUser(supabase, data);
      case "get_followers":
        return await getFollowers(supabase, data);
      case "get_following":
        return await getFollowing(supabase, data);
      case "like_artwork":
        return await likeArtwork(supabase, data);
      case "unlike_artwork":
        return await unlikeArtwork(supabase, data);
      case "add_comment":
        return await addComment(supabase, data);
      case "get_comments":
        return await getComments(supabase, data);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("Social features error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function followUser(supabase: any, data: any) {
  const { followerId, followingId } = data;
  
  // Check if already following
  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("client_id", followerId)
    .eq("artist_id", followingId)
    .single();

  if (existing) {
    return new Response(
      JSON.stringify({ success: false, message: "Already following this user" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { error } = await supabase
    .from("follows")
    .insert({
      client_id: followerId,
      artist_id: followingId,
    });

  if (error) throw error;

  // Send notification to followed user
  await supabase
    .from("notifications")
    .insert({
      user_id: followingId,
      title: "New Follower!",
      message: "Someone started following you!",
      type: "follow",
    });

  return new Response(
    JSON.stringify({ success: true, message: "Successfully followed user" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function unfollowUser(supabase: any, data: any) {
  const { followerId, followingId } = data;
  
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("client_id", followerId)
    .eq("artist_id", followingId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Successfully unfollowed user" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getFollowers(supabase: any, data: any) {
  const { userId, limit = 50, offset = 0 } = data;
  
  const { data: followers, error } = await supabase
    .from("follows")
    .select(`
      client_id,
      created_at,
      profiles:client_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("artist_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return new Response(
    JSON.stringify({ followers }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getFollowing(supabase: any, data: any) {
  const { userId, limit = 50, offset = 0 } = data;
  
  const { data: following, error } = await supabase
    .from("follows")
    .select(`
      artist_id,
      created_at,
      profiles:artist_id (
        id,
        full_name,
        avatar_url,
        role
      )
    `)
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return new Response(
    JSON.stringify({ following }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function likeArtwork(supabase: any, data: any) {
  const { userId, artworkId } = data;
  
  // Check if already liked
  const { data: existing } = await supabase
    .from("artwork_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("artwork_id", artworkId)
    .single();

  if (existing) {
    return new Response(
      JSON.stringify({ success: false, message: "Already liked this artwork" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { error } = await supabase
    .from("artwork_likes")
    .insert({
      user_id: userId,
      artwork_id: artworkId,
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Artwork liked successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function unlikeArtwork(supabase: any, data: any) {
  const { userId, artworkId } = data;
  
  const { error } = await supabase
    .from("artwork_likes")
    .delete()
    .eq("user_id", userId)
    .eq("artwork_id", artworkId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Artwork unliked successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function addComment(supabase: any, data: any) {
  const { userId, artworkId, content, parentId } = data;
  
  const { error } = await supabase
    .from("artwork_feedback")
    .insert({
      user_id: userId,
      artwork_id: artworkId,
      content: content,
      parent_id: parentId || null,
    });

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true, message: "Comment added successfully" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getComments(supabase: any, data: any) {
  const { artworkId, limit = 50, offset = 0 } = data;
  
  const { data: comments, error } = await supabase
    .from("artwork_feedback")
    .select(`
      *,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq("artwork_id", artworkId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return new Response(
    JSON.stringify({ comments }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
