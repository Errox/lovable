import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Message = {
  id: string
  conversation_id: string
  content: string
  direction: 'incoming' | 'outgoing'
  status: string
  created_at: string
}

export type Conversation = {
  id: string
  session_id: string
  metadata: any
  created_at: string
  updated_at: string
}
