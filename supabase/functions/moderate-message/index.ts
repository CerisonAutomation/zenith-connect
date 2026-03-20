import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const OPENROUTER_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''

serve(async (req) => {
  const { content } = await req.json() as { content: string }
  if (!content) return Response.json({ flagged: false })

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        {
          role: 'system',
          content: 'You are a content moderation assistant. Reply ONLY with JSON: {"flagged": boolean, "reason": string|null}',
        },
        { role: 'user', content: `Moderate this message: "${content.slice(0, 500)}"` },
      ],
      max_tokens: 64,
      temperature: 0,
    }),
  })

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content ?? '{"flagged":false}'
  try {
    return Response.json(JSON.parse(text))
  } catch {
    return Response.json({ flagged: false })
  }
})
