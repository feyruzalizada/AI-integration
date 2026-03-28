'use client'

interface StreamingMessageProps {
  content: string
  isStreaming?: boolean
}

export default function StreamingMessage({ content, isStreaming }: StreamingMessageProps) {
  return (
    <span>
      {content}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-gray-500 ml-0.5 animate-pulse" />
      )}
    </span>
  )
}
