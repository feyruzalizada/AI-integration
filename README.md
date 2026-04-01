# Welcome to 06 Ai Integration

## Task

Language learning apps rely on static content and rigid exercises.
The challenge is making a real-time AI tutor that feels responsive —
streaming answers as they generate, checking grammar with explanations,
and translating with cultural context, all without page reloads.
The added complexity is keeping the LLM provider swappable so the app
is not locked into a single API or pricing model.

## Description

Built a full-stack AI classroom on top of Next.js App Router with four
core features: a streaming chat tutor, a grammar checker, a translation
panel, and an AI tutor sidebar with quick prompts. LLM calls go through
a provider abstraction layer (src/lib/providers.ts) that supports Groq,
OpenAI, and Together AI — switchable via a single env variable. Streaming
is handled with native ReadableStream and AbortController so users can
stop a response mid-generation. All API routes track usage and expose
stats at GET /api/usage. The default provider is Groq with Llama 3.3 70B
because it is fast and has a free tier, which made development cheap.

## Installation

```
git clone <repo-url>
cd duolingo-ai-classroom
npm install
cp .env.local.example .env.local
# Add your GROQ_API_KEY (free at https://console.groq.com)
npm run dev
```

Open http://localhost:3000 in your browser.

To switch providers, set LLM_PROVIDER in .env.local:

```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Supported values: groq (default), openai, together

## Usage

```
npm run dev       Start the development server on localhost:3000
npm run build     Build for production
npm run start     Start the production server
```

Open the classroom at http://localhost:3000/classroom

- Chat tab: type a question in Spanish, French, German, or Japanese
- Grammar tab: paste text and get a score with corrections and explanations
- Translation tab: pick a language pair and translate with cultural notes
- Sidebar: click a quick prompt to send it directly to the chat

Check live usage stats at http://localhost:3000/api/usage

## The Core Team

Made at Qwasar SV -- Software Engineering School <img alt='Qwasar SV -- Software Engineering School Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px' />
