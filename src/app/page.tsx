import Link from 'next/link'

const FEATURES = [
  {
    icon: '💬',
    title: 'Streaming AI Chat',
    description: 'Chat with Claude in real-time. Get corrections and explanations as you type.',
  },
  {
    icon: '✏️',
    title: 'Grammar Checker',
    description: 'Paste your writing and get instant grammar corrections with explanations.',
  },
  {
    icon: '🌐',
    title: 'Smart Translation',
    description: 'Translate with cultural context and alternative phrasings.',
  },
  {
    icon: '🤖',
    title: 'AI Tutor Sidebar',
    description: 'Quick prompts for grammar rules, vocabulary quizzes, and practice sentences.',
  },
]

const LANGUAGES = [
  { flag: '🇪🇸', name: 'Spanish' },
  { flag: '🇫🇷', name: 'French' },
  { flag: '🇩🇪', name: 'German' },
  { flag: '🇯🇵', name: 'Japanese' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#4CAF00]">
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="text-8xl mb-6">🦜</div>
        <h1 className="text-5xl font-extrabold text-white mb-4">
          Duolingo AI Classroom
        </h1>
        <p className="text-xl text-green-100 mb-3 max-w-2xl mx-auto">
          An AI-powered language learning platform using Claude. Practice speaking, check your grammar, and translate — all in one place.
        </p>
        <p className="text-sm text-green-200 mb-10">
          Powered by Groq • Llama 3.3 70B • Streaming responses • 4 languages
        </p>

        <Link
          href="/classroom"
          className="inline-block bg-white text-[#58CC02] font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          Enter Classroom →
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-12">
          {LANGUAGES.map((lang) => (
            <div
              key={lang.name}
              className="bg-white/20 backdrop-blur rounded-xl p-4 text-center text-white"
            >
              <div className="text-3xl mb-1">{lang.flag}</div>
              <div className="font-semibold">{lang.name}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-12">
        <p className="text-green-200 text-sm">
          Set your <code className="bg-green-700/50 rounded px-1.5 py-0.5">GROQ_API_KEY</code> in{' '}
          <code className="bg-green-700/50 rounded px-1.5 py-0.5">.env.local</code> to get started
        </p>
      </div>
    </div>
  )
}
