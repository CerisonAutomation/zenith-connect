export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 w-fit rounded-2xl bg-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
      <span className="sr-only">Typing…</span>
    </div>
  )
}
