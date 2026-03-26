export function getTutorSystemPrompt(language: string): string {
  return `You are a friendly language tutor helping students learn ${language}. Keep responses concise and educational. Always encourage the student. When correcting mistakes, explain why gently.`
}

export function getGrammarPrompt(text: string, language: string): string {
  return `Check the grammar of this ${language} text and respond with JSON only: {"corrected": "...", "explanations": ["..."], "score": 85}. Text: "${text}"`
}

export function getTranslationPrompt(text: string, from: string, to: string): string {
  return `Translate from ${from} to ${to} and respond with JSON only: {"translated": "...", "culturalNotes": "...", "alternatives": ["..."]}. Text: "${text}"`
}

export function getModerationPrompt(text: string): string {
  return `Is this text appropriate for educational use with students? Respond with JSON only: {"safe": true/false, "reason": "only if unsafe"}. Text: "${text}"`
}
