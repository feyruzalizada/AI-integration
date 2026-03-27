import { anthropic, MODEL, MAX_TOKENS } from '@/lib/anthropic'
import { getModerationPrompt } from '@/lib/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    const response = await anthropic.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: getModerationPrompt(text) }],
    })

    const content = response.choices[0].message.content || ''

    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      parsed = { safe: true }
    }

    return new Response(
      JSON.stringify({
        safe: parsed.safe !== false,
        reason: parsed.reason,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Moderate route error:', error)
    return new Response(JSON.stringify({ error: 'Failed to moderate content' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
