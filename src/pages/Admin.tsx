import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogIn,
  Trash2,
  CheckSquare,
  Square,
  Search,
  ArrowLeft,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BarrageMessage } from '@/types'
import { getStorage, getApiAdapter, isApiStorage } from '@/lib/storage'
import { formatTime, getAvatarUrl } from '@/lib/utils'

export default function Admin() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [barrages, setBarrages] = useState<BarrageMessage[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const storage = getStorage()

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('chatbarrage_admin_token')
    if (token && isApiStorage()) {
      const apiAdapter = getApiAdapter()
      if (apiAdapter) {
        apiAdapter.setToken(token)
        try {
          const res = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            setIsAuthenticated(true)
            return
          }
        } catch {}
      }
    }
    if (!isApiStorage()) {
      const stored = localStorage.getItem('chatbarrage_admin_auth')
      if (stored === 'true') {
        setIsAuthenticated(true)
      }
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const fetchBarrages = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await storage.getAll()
      setBarrages(data.sort((a, b) => b.createdAt - a.createdAt))
    } catch (err) {
      console.error('Failed to fetch barrages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [storage])

  useEffect(() => {
    if (isAuthenticated) {
      fetchBarrages()
    }
  }, [isAuthenticated, fetchBarrages])

  const handleLogin = async () => {
    setLoginError('')
    setIsLoggingIn(true)

    try {
      if (isApiStorage()) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })

        if (!res.ok) {
          setLoginError('用户名或密码错误')
          return
        }

        const data = await res.json()
        localStorage.setItem('chatbarrage_admin_token', data.token)
        const apiAdapter = getApiAdapter()
        if (apiAdapter) apiAdapter.setToken(data.token)
      } else {
        const storedUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
        const storedPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'

        if (username === storedUser && password === storedPass) {
          localStorage.setItem('chatbarrage_admin_auth', 'true')
        } else {
          setLoginError('用户名或密码错误')
          return
        }
      }

      setIsAuthenticated(true)
    } catch {
      setLoginError('登录失败，请重试')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleDelete = async (id: string) => {
    await storage.delete(id)
    setBarrages((prev) => prev.filter((b) => b.id !== id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    await storage.deleteBatch(Array.from(selectedIds))
    setBarrages((prev) => prev.filter((b) => !selectedIds.has(b.id)))
    setSelectedIds(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const filtered = barrages.filter((b) =>
      b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.username.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((b) => b.id)))
    }
  }

  const filteredBarrages = barrages.filter(
    (b) =>
      b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--bg)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-[var(--radius-xl)] border border-[var(--border-color)] bg-[var(--surface)]/90 p-8 shadow-xl backdrop-blur-xl"
        >
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10">
              <Shield className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--fg)]">管理员登录</h1>
            <p className="text-sm text-[var(--fg-secondary)]">
              请输入管理员账号和密码
            </p>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            {loginError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-[var(--color-danger)]"
              >
                {loginError}
              </motion.p>
            )}

            <Button
              className="w-full"
              onClick={handleLogin}
              disabled={isLoggingIn || !username || !password}
            >
              {isLoggingIn ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              登录
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg)]"
            >
              ← 返回首页
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--fg-secondary)]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
              <span className="text-sm font-semibold text-white">C</span>
            </div>
            <span className="text-base font-semibold text-[var(--fg)]">
              管理面板
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--fg-secondary)]">
              共 {barrages.length} 条弹幕
            </span>
            <Button variant="ghost" size="sm" onClick={fetchBarrages}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('chatbarrage_admin_token')
                localStorage.removeItem('chatbarrage_admin_auth')
                setIsAuthenticated(false)
              }}
            >
              退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-secondary)]" />
            <Input
              placeholder="搜索弹幕内容或用户名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={toggleSelectAll}>
              {selectedIds.size === filteredBarrages.length && filteredBarrages.length > 0 ? (
                <CheckSquare className="mr-2 h-4 w-4" />
              ) : (
                <Square className="mr-2 h-4 w-4" />
              )}
              全选
            </Button>

            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button variant="danger" size="sm" onClick={handleBatchDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除 ({selectedIds.size})
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          </div>
        ) : filteredBarrages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg font-medium text-[var(--fg)]">暂无弹幕</p>
            <p className="mt-1 text-sm text-[var(--fg-secondary)]">
              {searchQuery ? '没有找到匹配的弹幕' : '还没有任何弹幕数据'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredBarrages.map((barrage) => (
                <motion.div
                  key={barrage.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--surface)] p-4 transition-all duration-200 hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleSelect(barrage.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors"
                  >
                    {selectedIds.has(barrage.id) ? (
                      <CheckSquare className="h-5 w-5 text-[var(--accent)]" />
                    ) : (
                      <Square className="h-5 w-5 text-[var(--fg-secondary)]" />
                    )}
                  </button>

                  <img
                    src={getAvatarUrl(barrage.username)}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--fg)]">
                        {barrage.username}
                      </span>
                      <span className="text-xs text-[var(--fg-secondary)]">
                        {formatTime(barrage.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-[var(--fg-secondary)]">
                      {barrage.content}
                    </p>
                  </div>

                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: barrage.color }}
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(barrage.id)}
                    className="shrink-0 text-[var(--color-danger)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
