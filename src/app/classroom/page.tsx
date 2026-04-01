'use client'

import { useState, Suspense, lazy } from 'react'
import ChatInterfaceControlled from '@/components/ChatInterfaceControlled'
import AITutor from '@/components/AITutor'
import Link from 'next/link'

const GrammarHelper = lazy(() => import('@/components/GrammarHelper'))
const TranslationPanel = lazy(() => import('@/components/TranslationPanel'))

function TabFallback() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      Loading...
    </div>
  )
}

type Tab = 'chat' | 'grammar' | 'translation'

export default function ClassroomPage() {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [language, setLanguage] = useState('Spanish')
  const [injectedPrompt, setInjectedPrompt] = useState('')

  function handleTutorPrompt(prompt: string) {
    setActiveTab('chat')
    setInjectedPrompt(prompt)
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'grammar', label: 'Grammar', icon: '✏️' },
    { key: 'translation', label: 'Translation', icon: '🌐' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl">🦜</Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Duolingo AI Classroom</h1>
            <p className="text-xs text-gray-500">AI-powered language learning</p>
          </div>
        </div>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back to home
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100dvh - 65px)' }}>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="bg-white border-b border-gray-200 px-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-[#58CC02] text-[#58CC02]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-white">
            <div className={`h-full ${activeTab !== 'chat' ? 'hidden' : ''}`}>
              <ChatInterfaceControlled
                externalInput={injectedPrompt}
                onExternalInputConsumed={() => setInjectedPrompt('')}
                onLanguageChange={setLanguage}
              />
            </div>
            {activeTab === 'grammar' && (
              <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto">
                <Suspense fallback={<TabFallback />}>
                  <GrammarHelper />
                </Suspense>
              </div>
            )}
            {activeTab === 'translation' && (
              <div className="h-full overflow-y-auto p-6 max-w-2xl mx-auto">
                <Suspense fallback={<TabFallback />}>
                  <TranslationPanel />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        <div className="w-64 flex-shrink-0 border-l border-gray-200 overflow-y-auto">
          <AITutor onPrompt={handleTutorPrompt} language={language} />
        </div>
      </div>
    </div>
  )
}
