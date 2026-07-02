import sensitiveWords from '@/config/sensitive-words.json'

let compiledPatterns: RegExp | null = null

function getPatterns(): RegExp {
  if (!compiledPatterns) {
    const words = sensitiveWords.words
    const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    compiledPatterns = new RegExp(escaped.join('|'), 'gi')
  }
  return compiledPatterns
}

export function filterSensitiveWords(text: string): string {
  const pattern = getPatterns()
  return text.replace(pattern, (match) => '*'.repeat(match.length))
}

export function hasSensitiveWords(text: string): boolean {
  const pattern = getPatterns()
  return pattern.test(text)
}

export function resetPatterns(): void {
  compiledPatterns = null
}
