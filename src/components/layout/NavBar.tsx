import { Moon, Sun, Wifi, WifiOff, Users } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { motion } from 'framer-motion'

interface NavBarProps {
  onlineCount?: number
  isConnected?: boolean
}

export function NavBar({ onlineCount = 1, isConnected = true }: NavBarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <span className="text-sm font-semibold text-white">C</span>
          </div>
          <span className="text-base font-semibold text-[var(--fg)]">
            ChatBarrage
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs text-[var(--fg-secondary)]">
            <Users className="h-3.5 w-3.5" />
            <span>{onlineCount}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-xs text-[var(--fg-secondary)]">
            {isConnected ? (
              <Wifi className="h-3.5 w-3.5 text-[var(--color-success)]" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-[var(--color-danger)]" />
            )}
            <span>{isConnected ? '已连接' : '未连接'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-[var(--fg-secondary)]" />
            ) : (
              <Sun className="h-4 w-4 text-[var(--fg-secondary)]" />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  )
}
