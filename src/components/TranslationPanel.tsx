'use client'

import { useState } from 'react'
import { TranslationResult } from '@/lib/types'
import StreamingMessage from './StreamingMessage'

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Japanese',
]

export default function TranslationPanel() {
  const [sourceText, setSourceText] = useState('')
  const [from, setFrom] = useState('English')
  const [to, setTo] = useState('Spanish')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState('')
  const [error, setError] = useState('')

  async function translate() {
    if (!sourceText.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    setStreaming('')

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, from, to }),
      })
      if (!res.ok) throw new Error('Request failed')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreaming(accumulated)
      }

      try {
        const jsonMatch = accumulated.match(/\{[\s\S]*\}/)
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : accumulated)
        setResult({
          original: sourceText,
          translated: parsed.translated || '',
          culturalNotes: parsed.culturalNotes || '',
          alternatives: parsed.alternatives || [],
        })
      } catch {
        setResult({
          original: sourceText,
          translated: accumulated,
          culturalNotes: '',
          alternatives: [],
        })
      }
      setStreaming('')
    } catch {
      setError('Translation failed. Please check your API key and try again.')
    } finally {
      setLoading(false)
    }
  }

  function swapLanguages() {
    setFrom(to)
    setTo(from)
    if (result) {
      setSourceText(result.translated)
      setResult(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="flex-1 text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#58CC02]"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <button
          onClick={swapLanguages}
          className="p-2 text-gray-500 hover:text-[#58CC02] transition-colors text-lg"
          title="Swap languages"
        >
          ⇄
        </button>

        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="flex-1 text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#58CC02]"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source ({from})
        </label>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={`Enter text in ${from}...`}
          rows={4}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58CC02] resize-none"
        />
      </div>

      <button
        onClick={translate}
        disabled={loading || !sourceText.trim()}
        className="w-full py-2.5 bg-[#58CC02] text-white rounded-xl text-sm font-semibold hover:bg-[#4CAF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Translating...' : `Translate to ${to}`}
      </button>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</div>
      )}

      {streaming && !result && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Translating...</p>
          <p className="text-sm text-gray-700">
            <StreamingMessage content={streaming} isStreaming />
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-3 bg-gray-50 rounded-xl p-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Translation ({to})
            </p>
            <p className="text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2">
              {result.translated}
            </p>
          </div>

          {result.alternatives.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Alternatives
              </p>
              <div className="flex flex-wrap gap-2">
                {result.alternatives.map((alt, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-600"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.culturalNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Cultural Notes
              </p>
              <p className="text-sm text-gray-600 italic">{result.culturalNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
