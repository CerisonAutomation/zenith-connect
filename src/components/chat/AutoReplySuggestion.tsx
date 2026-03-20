'use client'

import { useAutoReply, type Message } from '@/hooks/useAutoReply'
import { Button } from '@/components/ui/button'
import { Sparkles, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AutoReplySuggestion({
  history,
  onSelect,
  className,
}: {
  history: Message[]
  onSelect: (text: string) => void
  className?: string
}) {
  const { suggestion, loading, error, generate, dismiss } = useAutoReply()

  if (error === 'Premium required') return null // silently hide for free users

  return (
    <div className={cn('px-3 py-2', className)}>
      {!suggestion && !loading && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => generate(history)}
        >
          <Sparkles className="h-3 w-3" />
          Suggest reply
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Thinking…
        </div>
      )}

      {suggestion && (
        <div className="flex items-start gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
          <button
            className="flex-1 text-left text-xs leading-relaxed hover:text-primary transition-colors"
            onClick={() => { onSelect(suggestion); dismiss() }}
          >
            {suggestion}
          </button>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground" aria-label="Dismiss">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {error && error !== 'Premium required' && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
