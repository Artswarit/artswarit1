
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HIVE_API_URL = 'https://api.thehive.ai/api/v2/task/sync'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileUrl, contentType } = await req.json()
    const hiveApiKey = Deno.env.get('HIVE_API_KEY')

    if (!hiveApiKey) {
      throw new Error('HIVE_API_KEY not configured')
    }

    console.log(`Analyzing ${contentType} content: ${fileUrl}`)

    // Determine which models to use based on content type
    let models = []
    switch (contentType.toLowerCase()) {
      case 'image':
        models = ['ai_generated_media']
        break
      case 'video':
        models = ['ai_generated_media']
        break
      case 'audio':
        models = ['ai_generated_media']
        break
      case 'text':
        models = ['ai_generated_text']
        break
      default:
        models = ['ai_generated_media']
    }

    const response = await fetch(HIVE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${hiveApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: fileUrl,
        models: models
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hive API error:', errorText)
      throw new Error(`Hive API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Hive API response:', JSON.stringify(result, null, 2))

    // Parse the detection results
    const detectionResult = {
      isAiGenerated: false,
      confidence: 0,
      details: result,
      flagged: false
    }

    // Check for AI-generated content
    if (result.status && result.status[0] && result.status[0].response) {
      const outputs = result.status[0].response.outputs
      
      for (const output of outputs) {
        if (output.classes) {
          for (const cls of output.classes) {
            if (cls.class === 'ai_generated' && cls.score > 0.5) {
              detectionResult.isAiGenerated = true
              detectionResult.confidence = cls.score
              detectionResult.flagged = cls.score > 0.7 // Flag if confidence > 70%
              break
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify(detectionResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in AI content detection:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze content',
        details: error.message,
        isAiGenerated: false,
        confidence: 0,
        flagged: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
