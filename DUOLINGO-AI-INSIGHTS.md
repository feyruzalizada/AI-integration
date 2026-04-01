# What I Learned Building This

Honest notes from building the Duolingo AI Classroom. What actually tripped me up vs what was easy.

## The OpenAI SDK works with any OpenAI-compatible API

The project uses the `openai` npm package — not just for OpenAI, but as a universal client for any provider that follows the OpenAI API format. Groq, Together AI, and others all implement the same interface. You just change the `baseURL` and `apiKey`:

```typescript
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
})
```

This is why the provider abstraction in `providers.ts` works — one SDK, multiple backends.

## Streaming from a Next.js API route to the browser

This was the part I was most unsure about. The trick is:

1. Create the LLM call with `stream: true`
2. The route returns `new Response(readable, ...)` where `readable` is a `ReadableStream`
3. On the frontend, get the response body reader with `res.body.getReader()`
4. Loop calling `reader.read()` until `done` is true
5. Each `value` is a `Uint8Array` — use `TextDecoder` to turn it into a string

```typescript
for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content || ''
  if (text) controller.enqueue(encoder.encode(text))
}
```

The `delta.content` field is where the text comes in — one or a few characters at a time.

## Choosing Groq with Llama 3.3 70B

I picked Groq because:
- It has a generous free tier — good for testing
- Llama 3.3 70B is fast and capable enough for educational responses
- The Groq API follows the OpenAI spec exactly, so switching providers later is trivial
- Latency is very low — you see the first token almost immediately

The tradeoff is that Groq has rate limits on the free tier. For a production app you would pay for higher limits or use a different provider.

## JSON prompting is finicky

For grammar, translation, and moderation I ask the LLM to "respond with JSON only". This works most of the time but the model sometimes wraps the JSON in markdown code blocks or adds extra text. The fix:

```typescript
const jsonMatch = content.match(/\{[\s\S]*\}/)
parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
```

Find the first `{...}` in the response and parse that. Always wrap in try/catch with a fallback.

## Provider abstraction saved time

Building `providers.ts` early meant I could experiment with different models without touching any other file. Just change `LLM_PROVIDER` in `.env.local` and the whole app switches. This also made adding fallover straightforward — if the primary provider fails, retry with the next one in the list.

## The moderation endpoint needed to be connected

I built the moderation route early but forgot to wire it into the chat flow. The endpoint existed but nothing called it. Later connected it inside `/api/chat` — before sending to the LLM, check the last user message. If unsafe, return 400 immediately. Gating at the API route level means even direct API calls get filtered.

## System prompts matter a lot

The system prompt for the tutor is short but makes a difference:

> "You are a friendly language tutor helping students learn Spanish. Keep responses concise and educational. Always encourage the student. When correcting mistakes, explain why gently."

Without "keep responses concise" you get walls of text. Without "explain why gently" corrections feel harsh. Small phrasing changes affect the whole tone.

## What didn't work the first time

- **External prompt injection** — getting AITutor sidebar clicks to trigger a chat send was tricky. Ended up using a `pendingSend` ref and two `useEffect` hooks that coordinate. It works but is not clean.
- **Tab state** — switching tabs unmounts components, losing form state. Should lift state to the parent, but left it for now.
- **Streaming translations** — initially translations were batch JSON. Added streaming later, which required changing the route to stream and adding a `streaming` state to accumulate the raw text before parsing the JSON at the end.

## If I were to keep building this

- Store chat history in localStorage so it persists between refreshes
- Use structured outputs from the API instead of prompt-based JSON parsing
- Actually connect the difficulty assessment to adaptive prompt difficulty
- Add real cost tracking with actual token counts from the API response
- Speech-to-text input using the Web Speech API
