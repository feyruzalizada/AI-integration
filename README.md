# Duolingo AI Classroom

An AI-powered language learning app built with Next.js. Chat with an AI tutor, check your grammar, and translate between languages — all in real-time.

## What it does

- **Chat with an AI tutor** — ask questions about Spanish, French, German, or Japanese. Responses stream in real-time.
- **Grammar checker** — paste your text and get corrections with explanations, not just red underlines
- **Translation** — translates between English and the four languages, with cultural notes and alternative phrasings
- **AI tutor sidebar** — quick prompts to get started without typing

## Tech stack

- Next.js 16 with App Router + TypeScript
- Tailwind CSS
- `openai` npm package (used as an OpenAI-compatible client)
- **Default provider: Groq** — `llama-3.3-70b-versatile` (fast, free tier available)
- Supports switching to OpenAI or Together AI via env vars
- Native `ReadableStream` for streaming — no extra libraries

## Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.local.example` to `.env.local` and add your API key
4. `npm run dev`
5. Open http://localhost:3000

Get a free Groq API key at https://console.groq.com

## Provider switching

The app supports multiple LLM providers without code changes. Set `LLM_PROVIDER` in `.env.local`:

```
# Use OpenAI instead of Groq
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Use Together AI
LLM_PROVIDER=together
TOGETHER_API_KEY=...
```

See `.env.local.example` for all options.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        streaming chat endpoint
│   │   ├── grammar/route.ts     grammar check endpoint
│   │   ├── translate/route.ts   translation endpoint
│   │   ├── moderate/route.ts    content moderation endpoint
│   │   └── usage/route.ts       usage stats endpoint (GET)
│   ├── classroom/page.tsx       main classroom page with tabs
│   └── page.tsx                 landing page
├── components/
│   ├── ChatInterfaceControlled.tsx  chat UI with streaming + abort
│   ├── StreamingMessage.tsx         renders streaming text with cursor
│   ├── GrammarHelper.tsx            grammar check panel
│   ├── TranslationPanel.tsx         translation UI
│   └── AITutor.tsx                  sidebar with quick prompts
└── lib/
    ├── providers.ts   provider abstraction (Groq, OpenAI, Together AI)
    ├── anthropic.ts   active LLM client (uses providers.ts)
    ├── usage.ts       request tracking and stats
    ├── prompts.ts     prompt templates
    └── types.ts       TypeScript types
```

## Usage tracking

Hit `GET /api/usage` to see request counts and estimated token usage since the server started:

```json
{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "totalRequests": 12,
  "totalTokens": 3840,
  "byEndpoint": { "chat": 8, "grammar": 2, "translate": 2 }
}
```

## Streaming implementation

The chat uses `ReadableStream` and `TextDecoder` to pipe LLM output directly to the browser. The grammar and translation routes don't stream because they return structured JSON. There's an `AbortController` so you can cancel a response mid-stream.
