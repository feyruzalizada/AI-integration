# Welcome to 06 Ai Integration

## Task

Language learning apps use static content and rigid exercises that
do not adapt to the student. The challenge is integrating a real LLM
into an existing chat system so it feels like a live tutor — streaming
answers in real time, checking grammar with explanations, translating
with cultural context, and moderating content automatically. The added
difficulty is keeping the LLM provider swappable so the app is not
locked into one API or pricing model.

## Description

Built a full-stack AI classroom on Next.js App Router with four core
features: a streaming chat tutor, a grammar checker, a streaming
translation panel, and an AI tutor sidebar with quick prompts. LLM
calls go through a provider abstraction layer in src/lib/providers.ts
that supports Groq, OpenAI, and Together AI — switchable via one env
variable with no code changes. Streaming uses native ReadableStream
and AbortController so users can cancel mid-generation. Content
moderation runs automatically on every chat message before it reaches
the LLM. All API routes track usage and expose stats at GET /api/usage.
React Suspense with lazy loading handles tab panel transitions. The
default provider is Groq with Llama 3.3 70B — fast and free to start.

## Installation

```
git clone <repo-url>
cd duolingo-ai-classroom
npm install
cp .env.local.example .env.local
```

Add your GROQ_API_KEY to .env.local (free at https://console.groq.com)

```
npm run dev
```

Open http://localhost:3000 in your browser.

To switch providers set LLM_PROVIDER in .env.local:

```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

Supported values: groq (default), openai, together

## Usage

```
npm run dev        Start development server on localhost:3000
npm run build      Build for production
npm run start      Start the production server after build
```

Open the classroom at http://localhost:3000/classroom

Chat tab: type a question in Spanish, French, German, or Japanese
Grammar tab: paste text and get a score with corrections explained
Translation tab: pick a language pair, see the translation stream live
Sidebar: click a quick prompt to inject it directly into the chat
Level Check: ask the AI to assess your current language level

Check live usage stats at http://localhost:3000/api/usage

## The Core Team

Made at Qwasar SV -- Software Engineering School <img alt='Qwasar SV -- Software Engineering School Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px' />
