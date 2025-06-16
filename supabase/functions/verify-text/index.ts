import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text } = await req.json()

    if (!text) {
      throw new Error('Missing required field: text')
    }

    // Call Anthropic API for AI detection
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        temperature: 0,
        system: "You are an AI detection expert. Rate if text is AI-generated from 0-100 (0=definitely human, 100=definitely AI). Respond with ONLY the number.",
        messages: [{
          role: 'user',
          content: text.substring(0, 1500)  // Limit text length for speed
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content[0].text
    
    // Extract the number from response
    const match = content.match(/\d+/)
    const aiScore = match ? parseInt(match[0]) : 50

    // Confidence based on how extreme the score is
    // Very high or very low scores = high confidence
    // Middle scores = lower confidence
    const distance = Math.abs(aiScore - 50)
    const confidence = Math.min(50 + distance, 100)

    return new Response(
      JSON.stringify({
        aiScore,           // 0-100 where 100 = definitely AI
        humanScore: 100 - aiScore,  // 0-100 where 100 = definitely human
        confidence,        // 0-100 how sure we are
        method: 'anthropic_claude',
        success: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        aiScore: 50,       // Default to uncertain
        humanScore: 50,
        confidence: 0,     // No confidence in error case
        error: error.message,
        method: 'error',
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})