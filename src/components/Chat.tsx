import React, { useState, useEffect, useRef } from 'react'
import { Settings, MoreVertical, Trash2, Send } from 'lucide-react'
import { useMessages } from '../hooks/useMessages'
import { useSettings } from '../hooks/useSettings'
import { MessageBubble } from './MessageBubble'
import { DateDivider } from './DateDivider'
import { SettingsDialog } from './SettingsDialog'
import { Message } from '../lib/supabase'

export const Chat: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const { messages, loading, sendMessage, clearMessages } = useMessages()
  const { n8nWebhookUrl, saveWebhookUrl } = useSettings()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    try {
      await sendMessage(inputMessage, n8nWebhookUrl)
      setInputMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleClearChat = async () => {
    if (window.confirm('Weet je zeker dat je alle berichten wilt verwijderen?')) {
      await clearMessages()
      setShowMenu(false)
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {})

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h1>Chat</h1>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <Settings size={24} />
          </button>
          <div className="menu-container" ref={menuRef}>
            <button
              className="icon-button"
              onClick={() => setShowMenu(!showMenu)}
              title="More"
            >
              <MoreVertical size={24} />
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <button onClick={handleClearChat}>
                  <Trash2 size={18} />
                  <span>Chat wissen</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div className="loading">Laden...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>Nog geen berichten</p>
            <p className="empty-subtitle">Start een gesprek!</p>
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <DateDivider date={new Date(date)} />
                {msgs.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type een bericht..."
          className="chat-input"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputMessage.trim()}
        >
          <Send size={20} />
        </button>
      </form>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        webhookUrl={n8nWebhookUrl}
        onSaveWebhookUrl={saveWebhookUrl}
      />
    </div>
  )
}
