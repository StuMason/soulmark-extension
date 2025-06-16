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
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const expectedWords = JSON.parse(formData.get('words') as string)

    if (!audioFile || !expectedWords) {
      throw new Error('Missing required fields: audio and words')
    }

    // Convert audio for Whisper
    const audioBuffer = await audioFile.arrayBuffer()
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })

    // Call Whisper API
    const whisperForm = new FormData()
    whisperForm.append('file', audioBlob, 'audio.webm')
    whisperForm.append('model', 'whisper-1')
    whisperForm.append('language', 'en')

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
    
    // Fuzzy matching
    const spokenWords = transcription.toLowerCase().split(/\s+/)
    const expectedLower = expectedWords.map((w: string) => w.toLowerCase())
    
    const matchedWords: string[] = []
    let matchCount = 0
    
    expectedLower.forEach((word: string) => {
      const match = spokenWords.find(spoken => {
        if (spoken === word) return true
        if (spoken.includes(word) || word.includes(spoken)) return true
        if (Math.abs(spoken.length - word.length) <= 1) {
          let differences = 0
          for (let i = 0; i < Math.min(spoken.length, word.length); i++) {
            if (spoken[i] !== word[i]) differences++
          }
          return differences <= 1
        }
        return false
      })
      
      if (match) {
        matchCount++
        matchedWords.push(word)
      }
    })

    // Calculate score (0-100 where 100 = perfect match)
    const score = Math.round((matchCount / expectedWords.length) * 100)
    
    // Confidence is high for voice - it's pretty binary
    const confidence = 100

    return new Response(
      JSON.stringify({
        score,
        confidence,
        transcription,
        matchedWords,
        expectedWords,
        matchCount,
        success: score > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        score: 0,
        confidence: 100,
        error: error.message,
        success: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})