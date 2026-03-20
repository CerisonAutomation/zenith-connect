'use client'

import { useState } from 'react'

export function useAIIcebreaker() {
  const [icebreakers, setIcebreakers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (targetUsername: string) => {
    setLoading(true)
    setError(null)
    try {
      let text = ''
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'icebreaker',
          messages: [{
            role: 'user',
            content: `Generate 3 icebreaker messages to send to ${targetUsername} on a gay dating app.`,
          }],
        }),
      })
      if (!res.ok) throw new Error('AI request failed')
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
      }
      const jsonMatch = text.match(/\[.*\]/s)
      if (jsonMatch) {
        setIcebreakers(JSON.parse(jsonMatch[0]) as string[])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { icebreakers, loading, error, generate }
}
