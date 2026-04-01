import { createLLMClient, ACTIVE_PROVIDER, ACTIVE_MODEL } from './providers'

export const anthropic = createLLMClient(ACTIVE_PROVIDER)
export const MODEL = ACTIVE_MODEL
export const MAX_TOKENS = 1024
