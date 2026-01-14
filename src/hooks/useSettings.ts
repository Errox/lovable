import { useState, useEffect } from 'react'

const STORAGE_KEY = 'n8n_webhook_url'

export const useSettings = () => {
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setN8nWebhookUrl(stored)
    }
  }, [])

  const saveWebhookUrl = (url: string) => {
    localStorage.setItem(STORAGE_KEY, url)
    setN8nWebhookUrl(url)
  }

  return { n8nWebhookUrl, saveWebhookUrl }
}
