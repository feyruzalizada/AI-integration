import { anthropic, MODEL, MAX_TOKENS } from '@/lib/anthropic'
import { getTutorSystemPrompt } from '@/lib/prompts'
import { trackRequest } from '@/lib/usage'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const abortSignal = req.signal
  try {
    const { messages, language } = await req.json()
    trackRequest('chat', messages.map((m: { content: string }) => m.content).join(' '))

    const stream = await anthropic.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: getTutorSystemPrompt(language || 'Spanish') },
        ...messages,
      ],
      stream: true,
    })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (abortSignal?.aborted) { controller.close(); return }
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Chat route error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process chat' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
