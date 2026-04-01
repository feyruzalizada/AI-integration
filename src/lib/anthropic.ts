import { createLLMClient, ACTIVE_PROVIDER, ACTIVE_MODEL, FALLBACK_PROVIDERS } from './providers'
import { flags } from './flags'
import type OpenAI from 'openai'

export const anthropic = createLLMClient(ACTIVE_PROVIDER)
export const MODEL = ACTIVE_MODEL
export const MAX_TOKENS = 1024

export async function callWithFallback(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
) {
  try {
    return await anthropic.chat.completions.create(params)
  } catch (err) {
    if (!flags.providerFailover || FALLBACK_PROVIDERS.length === 0) throw err
    const fallback = createLLMClient(FALLBACK_PROVIDERS[0])
    return await fallback.chat.completions.create(params)
  }
}
