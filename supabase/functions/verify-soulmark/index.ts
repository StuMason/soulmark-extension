import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Standard verification result contract
interface VerificationResult {
  type: string
  score: number  // 0-100, where 100 = definitely human
  confidence: number  // 0-100, how confident we are in the score
  processingTimeMs: number
  error?: string
  metadata?: any
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] ========== NEW SOULMARK REQUEST ==========`)

  try {
    const formData = await req.formData()
    const messageHash = formData.get('messageHash') as string
    const userId = formData.get('userId') as string | null
    const platform = formData.get('platform') as string || 'unknown'
    const text = formData.get('text') as string
    
    console.log(`[${requestId}] Platform: ${platform}, User: ${userId || 'anonymous'}`)
    console.log(`[${requestId}] Text preview: "${text?.substring(0, 100)}..."` )
    console.log(`[${requestId}] Text length: ${text?.length || 0} chars`)
    
    // Log selected words
    if (formData.has('words')) {
      const words = JSON.parse(formData.get('words') as string)
      console.log(`[${requestId}] Selected words: ${words.join(', ')}`)
    }

    if (!messageHash) {
      throw new Error('messageHash is required')
    }

    // Build parallel verifications based on what data we have
    const verifications: Promise<VerificationResult>[] = []

    // Voice verification
    if (formData.has('audio') && formData.has('words')) {
      verifications.push(
        callVerifyVoice(formData)
          .catch(err => ({
            type: 'voice',
            score: 0,
            confidence: 100,
            processingTimeMs: 0,
            error: err.message
          }))
      )
    }

    // Text AI detection
    if (formData.has('text')) {
      verifications.push(
        callVerifyText(formData.get('text') as string)
          .catch(err => ({
            type: 'text',
            score: 50,  // Default to uncertain
            confidence: 0,
            processingTimeMs: 0,
            error: err.message
          }))
      )
    }

    // Future: Add more verifications here
    // if (formData.has('heartRate')) { ... }
    // if (formData.has('typingPattern')) { ... }

    if (verifications.length === 0) {
      throw new Error('No verification data provided')
    }

    // Run all verifications in parallel
    const startTime = Date.now()
    console.log(`[${requestId}] Running ${verifications.length} verifications in parallel...`)
    const results = await Promise.all(verifications)
    const totalProcessingTime = Date.now() - startTime
    
    console.log(`[${requestId}] All verifications complete in ${totalProcessingTime}ms`)
    results.forEach(r => {
      console.log(`[${requestId}] ${r.type.toUpperCase()}: score=${r.score}, confidence=${r.confidence}, error=${r.error || 'none'}`)
    })

    // Calculate aggregate score
    const aggregateScore = calculateAggregateScore(results)
    console.log(`[${requestId}] AGGREGATE: totalScore=${aggregateScore.totalScore}, trustLevel=${aggregateScore.trustLevel}`)

    // Only create soulmark if score is high enough
    const MINIMUM_SCORE = 30  // Lowered from implicit 30
    if (aggregateScore.totalScore < MINIMUM_SCORE) {
      console.log(`[${requestId}] DENIED: Score ${aggregateScore.totalScore} below minimum ${MINIMUM_SCORE}`)
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Verification failed',
          totalScore: aggregateScore.totalScore,
          trustLevel: aggregateScore.trustLevel,
          processingTimeMs: totalProcessingTime
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

    // Extract selected words from formData
    let selectedWords: string[] = []
    try {
      if (formData.has('words')) {
        const wordsString = formData.get('words') as string
        console.log(`[${requestId}] Raw words string: "${wordsString}"`)
        selectedWords = JSON.parse(wordsString)
        console.log(`[${requestId}] Parsed selected words:`, selectedWords)
      } else {
        console.log(`[${requestId}] WARNING: No 'words' field in formData`)
        // Try to extract from voice verification metadata
        const voiceResult = results.find(r => r.type === 'voice')
        if (voiceResult?.metadata?.matchedWords) {
          selectedWords = voiceResult.metadata.matchedWords
          console.log(`[${requestId}] Using words from voice result:`, selectedWords)
        }
      }
    } catch (e) {
      console.error(`[${requestId}] Error parsing words:`, e)
      selectedWords = []
    }
    
    // Ensure we always have an array, even if empty
    if (!Array.isArray(selectedWords)) {
      console.log(`[${requestId}] WARNING: selectedWords is not an array, setting to empty array`)
      selectedWords = []
    }
    
    const soulmarkData: any = {
      code,
      message_hash: messageHash,
      selected_words: selectedWords,  // This should never be null now
      total_score: aggregateScore.totalScore,
      trust_level: aggregateScore.trustLevel,
      platform,
      user_id: userId,
      verification_results: results,
      metadata: {
        processingTimeMs: totalProcessingTime,
        verificationsRun: results.map(r => r.type),
        timestamp: new Date().toISOString()
      }
    }

    // If we have text, store first 1000 chars
    if (formData.has('text')) {
      const text = formData.get('text') as string
      soulmarkData['text_preview'] = text.substring(0, 1000)
      soulmarkData['word_count'] = text.split(/\s+/).length
    }

    console.log(`[${requestId}] About to insert soulmark with selected_words:`, soulmarkData.selected_words)
    
    const { error } = await supabase
      .from('soulmarks')
      .insert(soulmarkData)

    if (error) {
      console.error(`[${requestId}] Database insert error:`, error)
      console.error(`[${requestId}] Failed soulmarkData:`, JSON.stringify(soulmarkData, null, 2))
      throw error
    }

    console.log(`[${requestId}] SUCCESS: Soulmark created with code SM:${code}`)
    console.log(`[${requestId}] ========== REQUEST COMPLETE ==========\n`)

    return new Response(
      JSON.stringify({
        success: true,
        code: `SM:${code}`,
        totalScore: aggregateScore.totalScore,
        trustLevel: aggregateScore.trustLevel,
        processingTimeMs: totalProcessingTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(`[${requestId}] ERROR:`, error)
    console.log(`[${requestId}] ========== REQUEST FAILED ==========\n`)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function callVerifyVoice(formData: FormData): Promise<VerificationResult> {
  const startTime = Date.now()
  
  // Create new FormData with just what verify-voice needs
  const voiceData = new FormData()
  voiceData.append('audio', formData.get('audio') as File)
  voiceData.append('words', formData.get('words') as string)
  
  const expectedWords = JSON.parse(formData.get('words') as string)
  console.log(`[VOICE] Expected words: ${expectedWords.join(', ')}`)

  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-voice`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: voiceData
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[VOICE] Failed with ${response.status}: ${errorText}`)
    throw new Error(`verify-voice failed: ${response.status}`)
  }

  const result = await response.json()
  console.log(`[VOICE] Response: success=${result.success}, score=${result.score}, transcription="${result.transcription}"`)
  
  // Transform to standard contract
  return {
    type: 'voice',
    score: result.score || 0,  // Expecting 0-100 where 100 = perfect match
    confidence: result.confidence || 100,  // Voice matching is pretty binary
    processingTimeMs: Date.now() - startTime,
    metadata: {
      transcription: result.transcription,
      matchedWords: result.matchedWords
    }
  }
}

async function callVerifyText(text: string): Promise<VerificationResult> {
  const startTime = Date.now()
  
  console.log(`[TEXT] Checking text (${text.length} chars): "${text.substring(0, 100)}..."`)

  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-text`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[TEXT] Failed with ${response.status}: ${errorText}`)
    throw new Error(`verify-text failed: ${response.status}`)
  }

  const result = await response.json()
  
  // Transform to standard contract
  // Note: verify-text returns AI score (0-100 where 100 = AI)
  // We need human score (0-100 where 100 = human)
  const humanScore = 100 - result.aiScore
  console.log(`[TEXT] Response: aiScore=${result.aiScore}, humanScore=${humanScore}, confidence=${result.confidence}`)
  
  return {
    type: 'text',
    score: humanScore,  // Invert to get human score
    confidence: result.confidence || 80,  // How confident is the AI detection
    processingTimeMs: Date.now() - startTime,
    metadata: {
      aiScore: result.aiScore,
      method: result.method
    }
  }
}

function calculateAggregateScore(results: VerificationResult[]): {
  totalScore: number
  trustLevel: string
} {
  // Filter out errored results
  const validResults = results.filter(r => !r.error)
  
  console.log(`[SCORING] Valid results: ${validResults.length}/${results.length}`)
  
  if (validResults.length === 0) {
    return { totalScore: 0, trustLevel: 'failed' }
  }

  // Calculate weighted average based on confidence
  let weightedSum = 0
  let totalWeight = 0

  // Define base weights for each verification type
  const typeWeights = {
    voice: 60,   // Voice is most important
    text: 40,    // Text analysis is secondary
    // Future weights:
    // heartRate: 20,
    // typingPattern: 15,
  }

  validResults.forEach(result => {
    const baseWeight = typeWeights[result.type] || 10
    const confidenceMultiplier = result.confidence / 100
    const actualWeight = baseWeight * confidenceMultiplier
    
    console.log(`[SCORING] ${result.type}: score=${result.score}, baseWeight=${baseWeight}, confidence=${result.confidence}, actualWeight=${actualWeight.toFixed(2)}`)
    
    weightedSum += result.score * actualWeight
    totalWeight += actualWeight
  })

  const totalScore = Math.round(weightedSum / totalWeight)
  console.log(`[SCORING] Weighted sum: ${weightedSum.toFixed(2)}, Total weight: ${totalWeight.toFixed(2)}, Final score: ${totalScore}`)

  // Determine trust level
  let trustLevel: string
  
  // Must have voice verification to get above 'low'
  const hasVoice = validResults.some(r => r.type === 'voice' && r.score > 0)
  console.log(`[SCORING] Has voice verification: ${hasVoice}`)
  
  // MORE FORGIVING THRESHOLDS
  if (!hasVoice) {
    trustLevel = totalScore > 50 ? 'low' : 'failed'
  } else if (totalScore >= 70) {  // Lowered from 80
    trustLevel = 'high'
  } else if (totalScore >= 50) {  // Lowered from 60
    trustLevel = 'medium'
  } else if (totalScore >= 30) {  // Lowered from 40
    trustLevel = 'low'
  } else {
    trustLevel = 'very_low'
  }

  console.log(`[SCORING] Final decision: score=${totalScore}, trustLevel=${trustLevel}`)
  return { totalScore, trustLevel }
}

function generateSoulmarkCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}