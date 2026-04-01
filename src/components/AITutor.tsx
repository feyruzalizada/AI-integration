'use client'

interface AITutorProps {
  onPrompt: (prompt: string) => void
  language: string
}

const QUICK_PROMPTS = [
  {
    icon: '📖',
    label: 'Explain a grammar rule',
    prompt: 'Explain an important grammar rule I should know',
  },
  {
    icon: '✏️',
    label: 'Practice sentence',
    prompt: 'Give me a practice sentence to translate',
  },
  {
    icon: '🧠',
    label: 'Quiz me on vocabulary',
    prompt: 'Quiz me on 5 common vocabulary words',
  },
  {
    icon: '🗣️',
    label: 'How to introduce myself',
    prompt: 'Teach me how to introduce myself',
  },
  {
    icon: '🔢',
    label: 'Numbers and counting',
    prompt: 'Teach me numbers 1 to 10',
  },
  {
    icon: '🌟',
    label: 'Common phrases',
    prompt: 'What are the 5 most useful phrases for a beginner?',
  },
  {
    icon: '🎯',
    label: 'Daily routine vocabulary',
    prompt: 'Teach me vocabulary for describing my daily routine',
  },
]

export default function AITutor({ onPrompt, language }: AITutorProps) {
  return (
    <div className="h-full bg-gray-900 text-white p-4 flex flex-col">
      <div className="mb-6">
        <div className="text-2xl mb-2">🤖</div>
        <h2 className="text-lg font-bold">AI Tutor</h2>
        <p className="text-sm text-gray-400 mt-1">
          Your personal {language} teacher
        </p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Quick Prompts
        </p>
        <div className="space-y-2">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => onPrompt(item.prompt)}
              className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors group"
            >
              <span className="mr-2">{item.icon}</span>
              <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 bg-[#58CC02] rounded-full animate-pulse" />
          <span>Powered by Groq (Llama 3.3)</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Tip: Click any prompt above or type your own question in the chat.
        </p>
      </div>
    </div>
  )
}
