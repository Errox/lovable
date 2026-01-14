import { useEffect, useState } from 'react'
import { supabase, Message } from '../lib/supabase'

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Get or create conversation
  useEffect(() => {
    const getOrCreateConversation = async () => {
      try {
        let { data: conversation, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', 'default')
          .single()

        if (error || !conversation) {
          const { data: newConv, error: createError } = await supabase
            .from('conversations')
            .insert({ session_id: 'default' })
            .select('id')
            .single()

          if (createError) throw createError
          conversation = newConv
        }

        setConversationId(conversation.id)
      } catch (error) {
        console.error('Error getting conversation:', error)
      }
    }

    getOrCreateConversation()
  }, [])

  // Load messages
  useEffect(() => {
    if (!conversationId) return

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    loadMessages()
  }, [conversationId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((current) => [...current, payload.new as Message])
          } else if (payload.eventType === 'UPDATE') {
            setMessages((current) =>
              current.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages((current) =>
              current.filter((msg) => msg.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const sendMessage = async (content: string, n8nEndpoint?: string) => {
    if (!conversationId) return

    try {
      // Insert message with pending status
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          direction: 'outgoing',
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Call edge function to send to n8n
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message`
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message_id: message.id,
          content,
          n8n_endpoint: n8nEndpoint
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const clearMessages = async () => {
    if (!conversationId) return

    try {
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId)

      setMessages([])
    } catch (error) {
      console.error('Error clearing messages:', error)
    }
  }

  return { messages, loading, sendMessage, clearMessages }
}
