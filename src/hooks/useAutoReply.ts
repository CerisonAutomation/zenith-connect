'use client'

import { useState, useCallback } from 'react'

export interface Message { role: 'user' | 'assistant'; content: string }

export function useAutoReply() {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (history: Message[]) => {
    setLoading(true)
    setSuggestion(null)
    setError(null)
    try {
      const res = await fetch('/api/auto-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationHistory: history }),
      })
      if (res.status === 402) { setError('Premium required'); return }
      if (!res.ok) { setError('Failed to generate reply'); return }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
      }
      setSuggestion(text.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const dismiss = useCallback(() => setSuggestion(null), [])

  return { suggestion, loading, error, generate, dismiss }
}
