import { getUsageStats } from '@/lib/usage'

export async function GET() {
  const stats = getUsageStats()
  return new Response(JSON.stringify(stats), {
    headers: { 'Content-Type': 'application/json' },
  })
}
