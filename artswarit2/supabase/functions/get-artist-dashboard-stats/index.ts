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

    // Check if user is an artist
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userProfile || userProfile.role !== 'artist') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Artist role required.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get current month start date
    const currentMonthStart = new Date()
    currentMonthStart.setDate(1)
    currentMonthStart.setHours(0, 0, 0, 0)

    // Get total artworks count
    const { count: totalArtworks } = await supabase
      .from('artworks')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', user.id)

    // Get total followers count
    const { count: totalFollowers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', user.id)

    // Get total sales count and earnings
    const { data: salesData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('seller_id', user.id)
      .eq('status', 'success')

    const totalSales = salesData?.length || 0
    const totalEarnings = salesData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0

    // Get monthly earnings
    const { data: monthlySalesData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('seller_id', user.id)
      .eq('status', 'success')
      .gte('created_at', currentMonthStart.toISOString())

    const monthlyEarnings = monthlySalesData?.reduce((sum, sale) => sum + Number(sale.amount), 0) || 0

    // Get total views (sum of views from all artworks)
    const { data: artworksData } = await supabase
      .from('artworks')
      .select('metadata')
      .eq('artist_id', user.id)

    // Note: This assumes views are stored in metadata. Adjust based on actual schema
    const totalViews = artworksData?.reduce((sum, artwork) => {
      const views = artwork.metadata?.views || 0
      return sum + views
    }, 0) || 0

    const stats = {
      total_artworks: totalArtworks || 0,
      total_views: totalViews,
      monthly_earnings: monthlyEarnings,
      total_followers: totalFollowers || 0,
      total_sales: totalSales,
      total_earnings: totalEarnings
    }

    return new Response(
      JSON.stringify({ data: stats }),
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