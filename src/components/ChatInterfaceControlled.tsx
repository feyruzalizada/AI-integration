'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage, Language } from '@/lib/types'
import StreamingMessage from './StreamingMessage'

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'japanese', label: 'Japanese' },
]

interface Props {
  externalInput?: string
  onExternalInputConsumed?: () => void
  onLanguageChange?: (lang: string) => void
}

export default function ChatInterfaceControlled({
  externalInput,
  onExternalInputConsumed,
  onLanguageChange,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<Language>('spanish')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchResult, setSearchResult] = useState('')
  const [searching, setSearching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pendingSend = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (externalInput && externalInput !== input) {
      setInput(externalInput)
      pendingSend.current = true
      onExternalInputConsumed?.()
    }
  }, [externalInput])

  useEffect(() => {
    if (pendingSend.current && input.trim() && !isStreaming) {
      pendingSend.current = false
      sendMessageWith(input)
    }
  }, [input, isStreaming])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  function handleLanguageChange(lang: Language) {
    setLanguage(lang)
    onLanguageChange?.(lang.charAt(0).toUpperCase() + lang.slice(1))
  }

  async function sendMessageWith(text: string) {
    if (!text.trim() || isStreaming) return
    setError('')

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsStreaming(true)
    textareaRef.current?.focus()
    setStreamingContent('')

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          language,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to get response')
      }
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setStreamingContent(accumulated)
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: accumulated,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setStreamingContent('')
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong. Make sure your API key is set.')
      }
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
      abortRef.current = null
      textareaRef.current?.focus()
    }
  }

  async function sendMessage() {
    await sendMessageWith(input)
  }

  function abort() {
    abortRef.current?.abort()
  }

  async function searchConversation() {
    if (!search.trim() || messages.length === 0) return
    setSearching(true)
    setSearchResult('')
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: search,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setSearchResult(data.result || '')
    } catch {
      setSearchResult('Search failed.')
    } finally {
      setSearching(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <label className="text-sm font-medium text-gray-700">Learning:</label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value as Language)}
          className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#58CC02]"
          disabled={isStreaming}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {messages.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchConversation()}
              placeholder="Search this conversation..."
              className="flex-1 text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#58CC02]"
            />
            <button
              onClick={searchConversation}
              disabled={searching || !search.trim()}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {searching ? '...' : '🔍'}
            </button>
          </div>
          {searchResult && (
            <p className="mt-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2">
              {searchResult}
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <div className="text-5xl mb-4">🦜</div>
            <p className="text-lg font-medium">Start chatting with your AI tutor!</p>
            <p className="text-sm mt-1">Ask anything about {language}. Use the sidebar prompts to get started.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#58CC02] text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm bg-white border border-gray-200 text-gray-800 shadow-sm">
              <StreamingMessage content={streamingContent} isStreaming />
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 rounded-lg p-3">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Type in ${language.charAt(0).toUpperCase() + language.slice(1)} or ask a question...`}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#58CC02] min-h-[44px] max-h-32"
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              onClick={abort}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-4 py-2 bg-[#58CC02] text-white rounded-xl text-sm font-medium hover:bg-[#4CAF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
