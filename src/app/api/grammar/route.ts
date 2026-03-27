import { anthropic, MODEL, MAX_TOKENS } from '@/lib/anthropic'
import { getGrammarPrompt } from '@/lib/prompts'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, language } = await req.json()

    const response = await anthropic.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: getGrammarPrompt(text, language || 'Spanish') }],
    })

    const content = response.choices[0].message.content || ''

    let parsed
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      parsed = { corrected: text, explanations: ['Could not parse response'], score: 0, isCorrect: false }
    }

    return new Response(
      JSON.stringify({
        original: text,
        corrected: parsed.corrected || text,
        explanations: parsed.explanations || [],
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        isCorrect: parsed.isCorrect ?? false,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Grammar route error:', error)
    return new Response(JSON.stringify({ error: 'Failed to check grammar' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
