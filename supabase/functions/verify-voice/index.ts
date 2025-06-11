import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const expectedWords = JSON.parse(formData.get('words') as string)
    const messageHash = formData.get('messageHash') as string
    const userId = formData.get('userId') as string | null // Optional!

    if (!audioFile || !expectedWords || !messageHash) {
      throw new Error('Missing required fields')
    }

    // Convert audio for Whisper
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })

    // Call Whisper API
    const whisperForm = new FormData()
    whisperForm.append('file', audioBlob, 'audio.webm')
    whisperForm.append('model', 'whisper-1')
    whisperForm.append('language', 'en') // Faster if we specify language

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: whisperForm,
    })

    if (!whisperResponse.ok) {
      throw new Error('Whisper API failed')
    }

    const { text: transcription } = await whisperResponse.json()
    
    // Fuzzy matching - check if user said at least one expected word
    const spokenWords = transcription.toLowerCase().split(/\s+/)
    const expectedLower = expectedWords.map((w: string) => w.toLowerCase())
    
    const matchFound = expectedLower.some((word: string) => 
      spokenWords.some(spoken => {
        // Direct match
        if (spoken === word) return true
        // Partial match (for plurals, tense changes)
        if (spoken.includes(word) || word.includes(spoken)) return true
        // Very close match (1 letter difference)
        if (Math.abs(spoken.length - word.length) <= 1) {
          let differences = 0
          for (let i = 0; i < Math.min(spoken.length, word.length); i++) {
            if (spoken[i] !== word[i]) differences++
          }
          return differences <= 1
        }
        return false
      })
    )

    if (!matchFound) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Words not matched',
          transcription,
          debug: { expectedWords, spokenWords: spokenWords.slice(0, 10) }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate soulmark code
    const code = generateSoulmarkCode()

    // Store in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const insertData: any = {
      code,
      message_hash: messageHash,
      selected_words: expectedWords,
      word_count: expectedWords.length,
      voice_confirmed: true,
      platform: 'chrome-extension',
      metadata: {
        transcription: transcription.substring(0, 200),
        match_confidence: 'fuzzy',
        timestamp: new Date().toISOString()
      }
    }

    // Only add user_id if provided
    if (userId) {
      insertData.user_id = userId
    }

    const { error } = await supabase
      .from('soulmarks')
      .insert(insertData)

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        code: `SM:${code}`,
        transcription 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function generateSoulmarkCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}