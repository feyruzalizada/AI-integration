import { callWithFallback, MODEL, MAX_TOKENS } from '@/lib/anthropic'
import { getTranslationPrompt } from '@/lib/prompts'
import { trackRequest } from '@/lib/usage'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, from, to } = await req.json()
    trackRequest('translate', text)

    const response = await callWithFallback({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: getTranslationPrompt(text, from || 'English', to || 'Spanish') }],
    })

    const content = response.choices[0].message.content || ''

    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      parsed = { translated: '', culturalNotes: '', alternatives: [] }
    }

    return new Response(
      JSON.stringify({
        original: text,
        translated: parsed.translated || '',
        culturalNotes: parsed.culturalNotes || '',
        alternatives: parsed.alternatives || [],
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Translate route error:', error)
    return new Response(JSON.stringify({ error: 'Failed to translate' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
