import React from 'react'
import { Message } from '../lib/supabase'
import { DEFAULT_LOCALE } from '../lib/constants'

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isOutgoing = message.direction === 'outgoing'
  const time = new Date(message.created_at).toLocaleTimeString(DEFAULT_LOCALE, {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`message-wrapper ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
        <div className="message-content">{message.content}</div>
        <div className="message-time">
          {time}
          {isOutgoing && (
            <span className="message-status">
              {message.status === 'pending' && ' ⏳'}
              {message.status === 'delivered' && ' ✓✓'}
              {message.status === 'failed' && ' ✗'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
