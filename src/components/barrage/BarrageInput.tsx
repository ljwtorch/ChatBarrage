import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { filterSensitiveWords } from '@/lib/filter'
import { getRandomColor } from '@/lib/utils'
import config from '@/config/app'

interface BarrageInputProps {
  onSend: (content: string, username: string, color: string) => Promise<void>
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#111111', '#666666',
]

export function BarrageInput({ onSend }: BarrageInputProps) {
  const [content, setContent] = useState('')
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('chatbarrage_username') || ''
  })
  const [color, setColor] = useState(() => getRandomColor())
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showUsernameInput, setShowUsernameInput] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = content.trim()
    if (!trimmed || isSending) return

    if (!username) {
      setShowUsernameInput(true)
      return
    }

    if (trimmed.length > config.barrage.maxLength) return

    setIsSending(true)
    try {
      const filtered = filterSensitiveWords(trimmed)
      await onSend(filtered, username, color)
      setContent('')
    } finally {
      setIsSending(false)
    }
  }, [content, username, color, onSend, isSending])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleUsernameSave = () => {
    const trimmed = username.trim()
    if (trimmed) {
      localStorage.setItem('chatbarrage_username', trimmed)
      setShowUsernameInput(false)
    }
  }

  const charCount = content.length
  const isOverLimit = charCount > config.barrage.maxLength

  return (
    <div className="relative w-full">
      {showUsernameInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--surface)]/90 p-3 shadow-lg backdrop-blur-xl"
        >
          <input
            autoFocus
            placeholder="输入你的昵称..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameSave()}
            className="flex-1 bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-secondary)] focus:outline-none"
          />
          <Button size="sm" onClick={handleUsernameSave}>
            确认
          </Button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-end gap-2 rounded-[var(--radius-full)] border border-[var(--border-color)] bg-[var(--surface)]/90 p-2 pl-4 shadow-lg backdrop-blur-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg)]"
      >
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            title="选择颜色"
          >
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
          </button>

          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-12 left-0 z-10 flex flex-wrap gap-1.5 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--surface)] p-3 shadow-xl"
              style={{ width: '180px' }}
            >
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c)
                    setShowColorPicker(false)
                  }}
                  className="h-6 w-6 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                />
              ))}
            </motion.div>
          )}
        </div>

        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="说点什么..."
          rows={1}
          className="max-h-20 flex-1 resize-none bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-secondary)] focus:outline-none"
          style={{ lineHeight: '1.5' }}
        />

        <div className="flex items-center gap-2 pr-1">
          <span
            className={`text-xs tabular-nums ${
              isOverLimit
                ? 'text-[var(--color-danger)]'
                : 'text-[var(--fg-secondary)]'
            }`}
          >
            {charCount}/{config.barrage.maxLength}
          </span>

          <Button
            size="sm"
            onClick={handleSend}
            disabled={!content.trim() || isSending || isOverLimit}
            className="rounded-full px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <p className="mt-2 text-center text-xs text-[var(--fg-secondary)]">
        按 Enter 发送 · Shift + Enter 换行
      </p>
    </div>
  )
}
