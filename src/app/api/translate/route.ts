import { anthropic, MODEL, MAX_TOKENS } from '@/lib/anthropic'
import { getTranslationPrompt } from '@/lib/prompts'
import { trackRequest } from '@/lib/usage'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()
    trackRequest('translate', text)

    const stream = await anthropic.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: getTranslationPrompt(text, from || 'English', to || 'Spanish') }],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || ''
            if (delta) controller.enqueue(encoder.encode(delta))
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error) {
    console.error('Translate route error:', error)
    return new Response(JSON.stringify({ error: 'Failed to translate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
