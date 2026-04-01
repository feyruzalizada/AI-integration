import { ACTIVE_PROVIDER, ACTIVE_MODEL } from './providers'

interface RequestRecord {
  provider: string
  model: string
  endpoint: string
  estimatedTokens: number
  timestamp: number
}

// In-memory store — resets on server restart. For production, use a database.
const records: RequestRecord[] = []

export function trackRequest(endpoint: string, inputText: string, outputText = '') {
  const estimatedTokens = Math.ceil((inputText.length + outputText.length) / 4)
  records.push({
    provider: ACTIVE_PROVIDER,
    model: ACTIVE_MODEL,
    endpoint,
    estimatedTokens,
    timestamp: Date.now(),
  })
}

export function getUsageStats() {
  const totalRequests = records.length
  const totalTokens = records.reduce((sum, r) => sum + r.estimatedTokens, 0)
  const byEndpoint = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.endpoint] = (acc[r.endpoint] || 0) + 1
    return acc
  }, {})

  return {
    provider: ACTIVE_PROVIDER,
    model: ACTIVE_MODEL,
    totalRequests,
    totalTokens,
    byEndpoint,
  }
}
