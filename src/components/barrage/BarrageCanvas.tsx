import { type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import type { BarrageMessage } from '@/types'
import { getAvatarUrl } from '@/lib/utils'

interface BarrageItem extends BarrageMessage {
  lane: number
  speed: number
  x: number
  width: number
  paused: boolean
  visible: boolean
}

interface BarrageCanvasProps {
  containerRef: RefObject<HTMLDivElement | null>
  activeItems: BarrageItem[]
  isLoading: boolean
  onPause: (id: string) => void
  onResume: (id: string) => void
}

export function BarrageCanvas({
  containerRef,
  activeItems,
  isLoading,
  onPause,
  onResume,
}: BarrageCanvasProps) {
  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <p className="text-sm text-[var(--fg-secondary)]">加载中...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && activeItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <MessageCircle className="h-8 w-8 text-[var(--fg-secondary)]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--fg)]">还没有弹幕</p>
              <p className="mt-1 text-sm text-[var(--fg-secondary)]">
                发送第一条弹幕，开始聊天吧
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {activeItems.map((item) => {
        const containerHeight = containerRef.current?.offsetHeight ?? 500
        const laneHeight = containerHeight / 12
        const top = item.lane * laneHeight + 4

        return (
          <div
            key={item.id}
            className="absolute flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 shadow-sm backdrop-blur-xl transition-opacity"
            style={{
              top: `${top}px`,
              left: `${item.x}px`,
              backgroundColor: 'color-mix(in srgb, var(--surface) 85%, transparent)',
              border: '1px solid var(--border-color)',
              fontSize: `${item.fontSize}px`,
              color: item.color || 'var(--fg)',
              opacity: item.x < 100 ? item.x / 100 : 1,
              cursor: 'default',
              willChange: 'transform',
            }}
            onMouseEnter={() => onPause(item.id)}
            onMouseLeave={() => onResume(item.id)}
          >
            <img
              src={getAvatarUrl(item.username)}
              alt=""
              className="h-5 w-5 rounded-full"
              loading="lazy"
            />
            <span className="text-xs font-medium text-[var(--fg-secondary)]">
              {item.username}
            </span>
            <span className="max-w-[300px] truncate">{item.content}</span>
          </div>
        )
      })}
    </div>
  )
}
