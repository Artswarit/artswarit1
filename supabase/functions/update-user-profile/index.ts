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

    const formData = await req.formData()
    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const profilePic = formData.get('profile_pic') as File
    const coverPhoto = formData.get('cover_photo') as File

    let profilePicUrl = null
    let coverPhotoUrl = null

    // Handle profile picture upload
    if (profilePic) {
      const profilePicPath = `image/${user.id}/profile_${Date.now()}.${profilePic.name.split('.').pop()}`
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(profilePicPath, profilePic)

      if (uploadError) {
        console.error('Profile pic upload error:', uploadError)
      } else {
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(profilePicPath)
        profilePicUrl = data.publicUrl
      }
    }

    // Handle cover photo upload
    if (coverPhoto) {
      const coverPhotoPath = `image/${user.id}/cover_${Date.now()}.${coverPhoto.name.split('.').pop()}`
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(coverPhotoPath, coverPhoto)

      if (uploadError) {
        console.error('Cover photo upload error:', uploadError)
      } else {
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(coverPhotoPath)
        coverPhotoUrl = data.publicUrl
      }
    }

    // Update user profile
    const updateData: any = {}
    if (name) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (profilePicUrl) updateData.profile_pic_url = profilePicUrl
    if (coverPhotoUrl) updateData.cover_photo_url = coverPhotoUrl

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ data: updatedUser }),
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