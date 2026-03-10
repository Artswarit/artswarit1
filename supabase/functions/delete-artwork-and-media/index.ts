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
    // Check authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Admin client to bypass RLS for deletion after auth check
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate user and get ID
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id

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
    const { data: artwork, error: artworkError } = await supabaseAdmin
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

    // Check ownership or admin status
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError) {
      console.error('Role check error:', roleError)
    }

    const isAdmin = userRole?.role === 'admin'
    console.log(`User ${userId} is admin: ${isAdmin}`)

    if (artwork.artist_id !== userId && !isAdmin) {
      console.error(`Permission denied: User ${userId} tried to delete artwork ${artworkId} owned by ${artwork.artist_id}`)
      return new Response(
        JSON.stringify({ error: `Permission denied: ${isAdmin ? 'Admin' : 'User'} status check failed or ownership mismatch` }),
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
        // Handle Supabase storage URLs
        if (url.pathname.includes('/storage/v1/object/public/media/')) {
          filePath = url.pathname.split('/storage/v1/object/public/media/')[1]
        } else if (url.pathname.includes('/media/')) {
          // Fallback for other formats
          const parts = url.pathname.split('/media/')
          filePath = parts[parts.length - 1]
        }
        
        if (filePath) {
          filePath = decodeURIComponent(filePath)
          console.log('Extracted file path for deletion:', filePath)
        }
      } catch (error) {
        console.warn('Could not parse media URL:', error)
      }
    }

    // Delete associated records using admin client to bypass any Fks
    console.log(`Cleaning up dependencies for artwork ${artworkId}...`)
    
    // We wrap these in a try-catch because some might not exist or already be gone
    const cleanup = async (table: string, column: string) => {
      try {
        console.log(`Cleaning up ${table}...`)
        // Check if table exists by doing a simple select head
        const { error: tableError } = await supabaseAdmin.from(table).select('*').limit(1)
        if (tableError && (tableError.code === '42P01' || tableError.message?.includes('does not exist'))) {
          console.log(`Table ${table} does not exist, skipping...`)
          return { table, success: true, skipped: true }
        }

        const { error } = await supabaseAdmin.from(table).delete().eq(column, artworkId)
        if (error) {
          console.warn(`Cleanup warning for ${table}:`, error.message)
          return { table, success: false, error: error.message }
        }
        return { table, success: true }
      } catch (e: any) {
        console.warn(`Cleanup exception for ${table}:`, e.message)
        return { table, success: false, error: e.message }
      }
    }

    const cleanupResults = await Promise.all([
      cleanup('reports', 'artwork_id'),
      cleanup('saved_artworks', 'artwork_id'),
      cleanup('likes', 'artwork_id'),
      cleanup('comments', 'artwork_id'),
      cleanup('artwork_views', 'artwork_id'),
      cleanup('artwork_feedback', 'artwork_id'),
      cleanup('project_files', 'artwork_id'),
      cleanup('project_milestones', 'artwork_id'),
      cleanup('admin_audit_logs', 'target_id'),
    ])

    // Cleanup notifications separately to handle JSONB safely
    try {
      console.log('Searching for notifications with artwork metadata...')
      const { data: notifications, error: notifFetchError } = await supabaseAdmin
        .from('notifications')
        .select('id, metadata')
      
      if (notifFetchError) {
        console.warn('Could not fetch notifications for cleanup:', notifFetchError.message)
      } else {
        const toDelete = notifications?.filter(n => {
          const meta = n.metadata as any
          return meta?.artwork_id === artworkId || meta?.artworkId === artworkId
        }).map(n => n.id) || []

        if (toDelete.length > 0) {
          console.log(`Deleting ${toDelete.length} notifications...`)
          const { error: notifDelError } = await supabaseAdmin.from('notifications').delete().in('id', toDelete)
          if (notifDelError) console.warn('Notification deletion error:', notifDelError.message)
        }
      }
    } catch (e: any) {
      console.warn('Notification cleanup failed:', e.message)
    }

    // Specific check for transactions as they might be restricted
    try {
      const { count: txCount, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('artwork_id', artworkId)
      
      if (txError) {
        console.warn('Transaction check error:', txError.message)
      } else if (txCount && txCount > 0) {
        console.log(`Found ${txCount} transactions for artwork ${artworkId}. Nullifying FK instead of deleting transactions.`)
        const { error: txUpdError } = await supabaseAdmin.from('transactions').update({ artwork_id: null }).eq('artwork_id', artworkId)
        if (txUpdError) console.warn('Transaction update error:', txUpdError.message)
      }
    } catch (e: any) {
      console.warn('Transaction cleanup failed:', e.message)
    }

    // Delete the artwork from database
    console.log(`Deleting artwork record ${artworkId}...`)
    const { error: deleteError } = await supabaseAdmin
      .from('artworks')
      .delete()
      .eq('id', artworkId)

    if (deleteError) {
      console.error('Artwork record deletion error:', deleteError)
      return new Response(
        JSON.stringify({ error: `Database deletion failed: ${deleteError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Delete the media file from storage if path is available
    if (filePath) {
      console.log(`Deleting file from storage: ${filePath}`)
      const { error: storageError } = await supabaseAdmin.storage
        .from('media')
        .remove([filePath])

      if (storageError) {
        console.warn('Storage deletion warning:', storageError)
      } else {
        console.log('Storage file deleted successfully')
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Artwork and associated media deleted successfully',
        deleted_id: artworkId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error: any) {
    console.error('Unexpected error in Edge Function:', error)
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message || 'Unknown error'}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})