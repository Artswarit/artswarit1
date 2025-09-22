import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    })

    // Get user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { artworkId } = await req.json()

    if (!artworkId) {
      return new Response(
        JSON.stringify({ error: 'Artwork ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch artwork to verify ownership and get media URL
    const { data: artwork, error: artworkError } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', artworkId)
      .single()

    if (artworkError || !artwork) {
      console.error('Artwork fetch error:', artworkError)
      return new Response(
        JSON.stringify({ error: 'Artwork not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check ownership
    if (artwork.artist_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You can only delete your own artworks' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract file path from media URL
    let filePath: string | null = null
    if (artwork.media_url) {
      try {
        const url = new URL(artwork.media_url)
        const pathParts = url.pathname.split('/')
        // Assuming URL format: /storage/v1/object/public/media/{path}
        const mediaIndex = pathParts.indexOf('media')
        if (mediaIndex !== -1 && mediaIndex < pathParts.length - 1) {
          filePath = pathParts.slice(mediaIndex + 1).join('/')
        }
      } catch (error) {
        console.warn('Could not parse media URL:', error)
      }
    }

    // Delete the artwork from database first
    const { error: deleteError } = await supabase
      .from('artworks')
      .delete()
      .eq('id', artworkId)

    if (deleteError) {
      console.error('Artwork deletion error:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete artwork' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Delete the media file from storage if path is available
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([filePath])

      if (storageError) {
        console.warn('Storage deletion warning:', storageError)
        // Don't fail the request if storage deletion fails
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Artwork and associated media deleted successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})