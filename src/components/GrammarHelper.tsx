'use client'

import { useState } from 'react'
import { GrammarResult, Language } from '@/lib/types'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
]

export default function GrammarHelper() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState<Language>('spanish')
  const [result, setResult] = useState<GrammarResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkGrammar() {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Failed to check grammar. Is your API key set?')
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#58CC02]"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste your ${language} text here...`}
          rows={5}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58CC02] resize-none"
        />
      </div>

      <button
        onClick={checkGrammar}
        disabled={loading || !text.trim()}
        className="w-full py-2.5 bg-[#58CC02] text-white rounded-xl text-sm font-semibold hover:bg-[#4CAF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Checking...' : 'Check Grammar'}
      </button>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</div>
      )}

      {result && (
        <div className="space-y-4 bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Grammar Score</span>
            <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}/100
            </span>
          </div>

          {result.corrected !== result.original && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Corrected</p>
              <p className="text-sm text-gray-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {result.corrected}
              </p>
            </div>
          )}

          {result.explanations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Explanations</p>
              <ul className="space-y-1.5">
                {result.explanations.map((exp, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-[#58CC02] mt-0.5">•</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.corrected === result.original && (
            <p className="text-sm text-green-600 font-medium">
              Looks great! No corrections needed.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
