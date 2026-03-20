'use client'

import { useAIIcebreaker } from '@/hooks/useAIIcebreaker'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

export function IcebreakerSuggestions({
  targetUsername,
  onSelect,
}: {
  targetUsername: string
  onSelect: (text: string) => void
}) {
  const { icebreakers, loading, error, generate } = useAIIcebreaker()

  return (
    <div className="px-4 py-2 space-y-2">
      {icebreakers.length === 0 ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-xs"
          onClick={() => generate(targetUsername)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {loading ? 'Generating…' : 'AI Icebreakers'}
        </Button>
      ) : (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Tap to use:</p>
          {icebreakers.map((text, i) => (
            <button
              key={i}
              onClick={() => onSelect(text)}
              className="w-full text-left text-xs rounded-lg bg-muted px-3 py-2 hover:bg-muted/70 transition-colors"
            >
              {text}
            </button>
          ))}
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
      )}
    </div>
  )
}
