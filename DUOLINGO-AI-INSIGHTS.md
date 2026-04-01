# What I Learned Building This

These are my honest notes from building the Duolingo AI Classroom. Writing this down so I remember what actually tripped me up vs what was easy.

## The Anthropic SDK is pretty straightforward

Setting up the client is two lines. The hardest part was figuring out that you need to iterate over `stream` events and check `event.type === 'content_block_delta'` and then `event.delta.type === 'text_delta'` to actually get the text. The nesting felt weird at first but it makes sense once you realize Claude can return different types of content (text, tool calls, thinking blocks, etc.).

```typescript
for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    controller.enqueue(encoder.encode(event.delta.text))
  }
}
```

## Streaming from a Next.js API route to the browser

This was the part I was most unsure about. The trick is:

1. The route returns a `new Response(readable, ...)` where `readable` is a `ReadableStream`
2. On the frontend, you get the response body reader with `res.body.getReader()`
3. You loop calling `reader.read()` until `done` is true
4. Each `value` is a `Uint8Array` so you need `TextDecoder` to turn it into a string

The abort controller was also important — without it there's no way to stop a response that's taking forever. You just pass the `AbortController.signal` to the fetch and call `abort()` when the user clicks Stop.

## JSON prompting is finicky

For grammar, translation, and moderation I'm asking Claude to "respond with JSON only". This works most of the time but Claude sometimes adds extra text around the JSON. The fix is wrapping the `JSON.parse()` in a try/catch and having a fallback. Probably the right solution long-term is to use structured outputs, but for a student project this is fine.

## Choosing Claude Haiku

I picked `claude-haiku-4-5-20251001` because:
- It's way cheaper than Sonnet or Opus
- For a language tutoring app with short responses, you don't need a massive model
- It's faster, which matters a lot for streaming (you start seeing text sooner)

The tradeoff is response quality isn't as high. For grammar explanations and translation it's totally fine. For really deep linguistic analysis you might want Sonnet.

## System prompts matter a lot

The system prompt for the tutor is short but makes a huge difference:
> "You are a friendly language tutor helping students learn Spanish. Keep responses concise and educational. Always encourage the student. When correcting mistakes, explain why gently."

Without "keep responses concise" you get walls of text. Without "explain why gently" the corrections feel harsh. Little things like this change the whole vibe of the app.

## What didn't work the first time

- **The classroom page was a mess at first** — I tried to make ChatInterface accept external prompts (from the sidebar) and ended up with a weird chain of wrapper components. Ended up just making a `ChatInterfaceControlled` version that accepts `externalInput` as a prop. Still not perfect but it works.

- **The streaming cursor** — I wanted a blinking cursor that appears while text is streaming. Ended up as a simple animated div using Tailwind's `animate-pulse`. Good enough.

- **Tab state persistence** — if you switch from Chat to Grammar and back, the chat history is gone because I'm conditionally rendering the component. Should probably lift the chat state to the parent, but it's a demo app so whatever.

## If I were to keep building this

- Store chat history in localStorage so it persists between page refreshes
- Add a speech-to-text input using the Web Speech API
- Actually use the moderation endpoint — right now it exists but isn't connected to the chat UI
- Add more languages
- Streak tracking and progress like actual Duolingo
- Use structured outputs from the Anthropic SDK instead of prompt-based JSON parsing

## The Anthropic SDK docs

The docs at https://docs.anthropic.com are actually pretty good. The streaming examples are clear. The TypeScript types are solid — everything is well-typed so you get good autocomplete. The main thing that confused me was the model naming — I thought `claude-haiku-4-5` was the right ID but the full versioned string (`claude-haiku-4-5-20251001`) is what you actually need to pass.

## Cost

For testing I probably made 50-100 API calls. Each chat message is maybe 200-500 tokens in + 200-400 tokens out. At Haiku pricing that's fractions of a cent per message. The whole testing session probably cost less than $0.10. Streaming doesn't cost extra, you just pay for the tokens.
