import OpenAI from 'openai'

export type ProviderName = 'groq' | 'openai' | 'together'

interface ProviderConfig {
  apiKey: string
  baseURL: string
  defaultModel: string
  label: string
}

const PROVIDER_CONFIGS: Record<ProviderName, ProviderConfig> = {
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    label: 'Groq (Llama 3.3 70B)',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    label: 'OpenAI (GPT-4o Mini)',
  },
  together: {
    apiKey: process.env.TOGETHER_API_KEY || '',
    baseURL: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3-70b-chat-hf',
    label: 'Together AI (Llama 3 70B)',
  },
}

export const ACTIVE_PROVIDER: ProviderName =
  (process.env.LLM_PROVIDER as ProviderName) || 'groq'

export const ACTIVE_MODEL =
  process.env.LLM_MODEL || PROVIDER_CONFIGS[ACTIVE_PROVIDER].defaultModel

export const ACTIVE_LABEL = PROVIDER_CONFIGS[ACTIVE_PROVIDER].label

export const FALLBACK_PROVIDERS: ProviderName[] = (
  Object.keys(PROVIDER_CONFIGS) as ProviderName[]
).filter((p) => p !== ACTIVE_PROVIDER)

export function createLLMClient(provider: ProviderName = ACTIVE_PROVIDER): OpenAI {
  const config = PROVIDER_CONFIGS[provider]
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  })
}
