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
    const { 
      recipientId, 
      content, 
      conversationId, 
      projectTitle,
      attachments = []
    } = await req.json();
    
    if (!recipientId || !content) {
      throw new Error("Missing required fields: recipientId, content");
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

    let finalConversationId = conversationId;

    // Create or get conversation if not provided
    if (!conversationId) {
      // Check if conversation already exists
      const { data: existingConversation } = await supabaseClient
        .from('conversations')
        .select('id')
        .or(`and(client_id.eq.${user.id},artist_id.eq.${recipientId}),and(client_id.eq.${recipientId},artist_id.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        finalConversationId = existingConversation.id;
      } else {
        // Get user roles to determine client vs artist
        const { data: senderProfile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const { data: recipientProfile } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', recipientId)
          .single();

        // Determine client and artist IDs
        let clientId, artistId;
        if (senderProfile?.role === 'client') {
          clientId = user.id;
          artistId = recipientId;
        } else if (recipientProfile?.role === 'client') {
          clientId = recipientId;
          artistId = user.id;
        } else {
          // Default: sender is client
          clientId = user.id;
          artistId = recipientId;
        }

        // Create new conversation
        const { data: newConversation, error: conversationError } = await supabaseClient
          .from('conversations')
          .insert({
            client_id: clientId,
            artist_id: artistId,
            project_title: projectTitle || 'New Project Discussion',
            status: 'active'
          })
          .select()
          .single();

        if (conversationError) {
          throw new Error(`Failed to create conversation: ${conversationError.message}`);
        }

        finalConversationId = newConversation.id;
      }
    }

    // Insert message
    const { data: message, error: messageError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        sender_id: user.id,
        content,
        attachments,
        is_read: false
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (messageError) {
      throw new Error(`Failed to send message: ${messageError.message}`);
    }

    // Update conversation last_message_at
    await supabaseClient
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', finalConversationId);

    // Create notification for recipient
    const { data: senderProfile } = await supabaseClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    await supabaseClient
      .from('notifications')
      .insert({
        user_id: recipientId,
        title: 'New Message',
        message: `${senderProfile?.full_name || 'Someone'} sent you a message`,
        type: 'message',
        action_url: `/messages/${finalConversationId}`,
        metadata: {
          conversationId: finalConversationId,
          senderId: user.id
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        conversationId: finalConversationId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Message sending error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});