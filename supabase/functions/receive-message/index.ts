import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get or create the default conversation
    let { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('session_id', 'default')
      .single()

    if (convError || !conversation) {
      // Create the default conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({ session_id: 'default' })
        .select('id')
        .single()

      if (createError) {
        throw createError
      }

      conversation = newConversation
    }

    // Insert incoming message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: message,
        direction: 'incoming',
        status: 'delivered'
      })
      .select()
      .single()

    if (messageError) {
      throw messageError
    }

    return new Response(
      JSON.stringify({ success: true, message: newMessage }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
