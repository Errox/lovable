import React, { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  webhookUrl: string
  onSaveWebhookUrl: (url: string) => void
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveWebhookUrl
}) => {
  const [url, setUrl] = useState(webhookUrl)
  const [copied, setCopied] = useState(false)

  const incomingWebhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/receive-message`

  const handleSave = () => {
    onSaveWebhookUrl(url)
    onClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label htmlFor="n8n-webhook">n8n Webhook URL (Outgoing)</label>
            <p className="settings-description">
              URL where outgoing messages will be sent
            </p>
            <input
              id="n8n-webhook"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-n8n-instance.com/webhook/..."
              className="settings-input"
            />
          </div>

          <div className="settings-section">
            <label>Incoming Webhook URL</label>
            <p className="settings-description">
              Configure this URL in n8n to receive incoming messages
            </p>
            <div className="url-copy-container">
              <code className="webhook-url">{incomingWebhookUrl}</code>
              <button
                className="copy-button"
                onClick={() => copyToClipboard(incomingWebhookUrl)}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <label>Payload Formats</label>
            <div className="payload-info">
              <div>
                <strong>To n8n (Outgoing):</strong>
                <pre>{'{ "message": "your message text" }'}</pre>
              </div>
              <div>
                <strong>From n8n (Incoming):</strong>
                <pre>{'{ "message": "response text" }'}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
