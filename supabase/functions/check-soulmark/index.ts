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
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    if (!code) {
      throw new Error('Missing code parameter')
    }

    // Remove SM: prefix if present
    const cleanCode = code.replace(/^SM:/i, '')

    // Connect to Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Look up the soulmark
    const { data, error } = await supabase
      .from('soulmarks')
      .select('id, created_at, word_count, platform, user_id')
      .eq('code', cleanCode)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Soulmark not found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate age
    const createdAt = new Date(data.created_at)
    const ageInHours = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60))
    
    let ageText = ''
    if (ageInHours < 1) {
      ageText = 'Just now'
    } else if (ageInHours < 24) {
      ageText = `${ageInHours}h ago`
    } else {
      const days = Math.floor(ageInHours / 24)
      ageText = `${days}d ago`
    }

    return new Response(
      JSON.stringify({ 
        valid: true,
        verified: true,
        age: ageText,
        wordCount: data.word_count,
        hasUser: !!data.user_id,
        platform: data.platform
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})