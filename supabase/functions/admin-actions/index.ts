import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, targetId, data } = await req.json();
    
    if (!action || !targetId) {
      throw new Error("Missing required fields: action, targetId");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) throw new Error("Authentication failed");

    // Check if user is admin
    const { data: adminCheck } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminCheck) {
      throw new Error("Unauthorized: Admin access required");
    }

    let result;

    switch (action) {
      case 'approve_artwork':
        result = await supabaseClient
          .from('artworks')
          .update({ 
            approval_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId)
          .select()
          .single();

        if (!result.error) {
          // Notify artist
          const artwork = result.data;
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: artwork.artist_id,
              title: 'Artwork Approved',
              message: `Your artwork "${artwork.title}" has been approved and is now live`,
              type: 'success',
              metadata: { artworkId: targetId }
            });
        }
        break;

      case 'reject_artwork':
        result = await supabaseClient
          .from('artworks')
          .update({ 
            approval_status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId)
          .select()
          .single();

        if (!result.error) {
          const artwork = result.data;
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: artwork.artist_id,
              title: 'Artwork Rejected',
              message: `Your artwork "${artwork.title}" has been rejected. ${data?.reason || ''}`,
              type: 'warning',
              metadata: { 
                artworkId: targetId,
                reason: data?.reason
              }
            });
        }
        break;

      case 'approve_artist':
        result = await supabaseClient
          .from('profiles')
          .update({ 
            account_status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId)
          .select()
          .single();

        if (!result.error) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: targetId,
              title: 'Account Approved',
              message: 'Your artist account has been approved! You can now upload and sell artworks.',
              type: 'success'
            });
        }
        break;

      case 'suspend_user':
        result = await supabaseClient
          .from('profiles')
          .update({ 
            account_status: 'suspended',
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId)
          .select()
          .single();

        if (!result.error) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: targetId,
              title: 'Account Suspended',
              message: `Your account has been suspended. ${data?.reason || 'Please contact support for more information.'}`,
              type: 'error',
              metadata: { reason: data?.reason }
            });
        }
        break;

      case 'feature_artwork':
        result = await supabaseClient
          .from('artworks')
          .update({ 
            is_featured: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', targetId)
          .select()
          .single();

        if (!result.error) {
          const artwork = result.data;
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: artwork.artist_id,
              title: 'Artwork Featured',
              message: `Your artwork "${artwork.title}" has been featured on the homepage!`,
              type: 'success',
              metadata: { artworkId: targetId }
            });
        }
        break;

      case 'delete_artwork':
        // Get artwork details first
        const { data: artwork } = await supabaseClient
          .from('artworks')
          .select('artist_id, title')
          .eq('id', targetId)
          .single();

        result = await supabaseClient
          .from('artworks')
          .delete()
          .eq('id', targetId);

        if (!result.error && artwork) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: artwork.artist_id,
              title: 'Artwork Removed',
              message: `Your artwork "${artwork.title}" has been removed. ${data?.reason || ''}`,
              type: 'warning',
              metadata: { 
                reason: data?.reason,
                deletedArtworkTitle: artwork.title
              }
            });
        }
        break;

      case 'make_admin':
        // Add admin role
        result = await supabaseClient
          .from('user_roles')
          .upsert({
            user_id: targetId,
            role: 'admin'
          });

        if (!result.error) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: targetId,
              title: 'Admin Access Granted',
              message: 'You have been granted administrator privileges.',
              type: 'success'
            });
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (result?.error) {
      throw new Error(`Failed to execute action: ${result.error.message}`);
    }

    // Log admin action
    await supabaseClient
      .from('analytics_events')
      .insert({
        user_id: user.id,
        event_type: 'admin_action',
        event_data: {
          action,
          targetId,
          data,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Action '${action}' completed successfully`,
        data: result?.data
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Admin action error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});