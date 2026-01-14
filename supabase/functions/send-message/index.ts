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
    const body = await req.json()
    const { message_id, content, n8n_endpoint } = body

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Valid message content is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (message_id && typeof message_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid message_id format' }),
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

    // Get the n8n endpoint from the request or environment
    const webhookUrl = n8n_endpoint || Deno.env.get('N8N_WEBHOOK_URL')

    if (!webhookUrl) {
      // Update message status to failed
      if (message_id) {
        await supabase
          .from('messages')
          .update({ status: 'failed' })
          .eq('id', message_id)
      }

      return new Response(
        JSON.stringify({ error: 'No n8n webhook URL configured' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send message to n8n
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        throw new Error(`n8n webhook returned ${response.status}`)
      }

      // Update message status to delivered
      if (message_id) {
        await supabase
          .from('messages')
          .update({ status: 'delivered' })
          .eq('id', message_id)
      }

      return new Response(
        JSON.stringify({ success: true, status: 'delivered' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } catch (error) {
      // Update message status to failed
      if (message_id) {
        await supabase
          .from('messages')
          .update({ status: 'failed' })
          .eq('id', message_id)
      }

      throw error
    }
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
