import { anthropic, MODEL, MAX_TOKENS } from '@/lib/anthropic'
import { trackRequest } from '@/lib/usage'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { query, messages } = await req.json()
    trackRequest('search', query)

    const history = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n')

    const response = await anthropic.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{
        role: 'user',
        content: `Conversation history:\n${history}\n\nQuestion about this conversation: ${query}\n\nAnswer briefly. If nothing relevant, say so.`,
      }],
    })

    return new Response(
      JSON.stringify({ result: response.choices[0].message.content || '' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Search error:', error)
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
