import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HIVE_API_URL = 'https://api.thehive.ai/api/v2/task/sync'

// Input validation schema
const ALLOWED_CONTENT_TYPES = ['image', 'video', 'audio', 'text'] as const
const MAX_URL_LENGTH = 500

function validateInput(input: unknown): { fileUrl: string; contentType: string } {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid request body')
  }

  const { fileUrl, contentType } = input as Record<string, unknown>

  // Validate fileUrl
  if (typeof fileUrl !== 'string' || !fileUrl) {
    throw new Error('fileUrl is required and must be a string')
  }
  
  if (fileUrl.length > MAX_URL_LENGTH) {
    throw new Error('fileUrl exceeds maximum length')
  }

  // Basic URL validation
  try {
    const url = new URL(fileUrl)
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol')
    }
  } catch {
    throw new Error('Invalid URL format')
  }

  // Validate contentType
  if (typeof contentType !== 'string' || !contentType) {
    throw new Error('contentType is required and must be a string')
  }

  const normalizedContentType = contentType.toLowerCase()
  if (!ALLOWED_CONTENT_TYPES.includes(normalizedContentType as typeof ALLOWED_CONTENT_TYPES[number])) {
    throw new Error('Invalid contentType. Must be one of: image, video, audio, text')
  }

  return { fileUrl, contentType: normalizedContentType }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse and validate input
    let requestBody: unknown
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let validated: { fileUrl: string; contentType: string }
    try {
      validated = validateInput(requestBody)
    } catch (validationError) {
      console.error('Input validation failed:', validationError)
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { fileUrl, contentType } = validated
    const hiveApiKey = Deno.env.get('HIVE_API_KEY')

    if (!hiveApiKey) {
      console.error('HIVE_API_KEY not configured')
      throw new Error('Content analysis service unavailable')
    }

    console.log(`Analyzing ${contentType} content`)

    // Determine which models to use based on content type
    let models: string[] = []
    switch (contentType) {
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
      console.error('Content analysis API error:', response.status, errorText)
      throw new Error('Content analysis failed')
    }

    const result = await response.json()
    console.log('Hive API response received')

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
        error: 'Failed to analyze content. Please try again later.',
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
