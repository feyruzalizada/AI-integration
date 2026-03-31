export type Language = 'spanish' | 'french' | 'german' | 'japanese'
export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

export interface GrammarResult {
  original: string
  corrected: string
  explanations: string[]
  score: number
  isCorrect: boolean
}

export interface TranslationResult {
  original: string
  translated: string
  culturalNotes: string
  alternatives: string[]
}

export interface ModerationResult {
  safe: boolean
  reason?: string
}

export interface LLMUsageStats {
  totalRequests: number
  totalTokens: number
  provider: string
}
