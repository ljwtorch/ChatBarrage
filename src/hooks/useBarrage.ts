import { useCallback, useEffect, useRef, useState } from 'react'
import type { BarrageMessage } from '@/types'
import { getStorage, isApiStorage } from '@/lib/storage'
import config from '@/config/app'

interface BarrageItem extends BarrageMessage {
  lane: number
  speed: number
  x: number
  width: number
  paused: boolean
  visible: boolean
}

export function useBarrage() {
  const [messages, setMessages] = useState<BarrageMessage[]>([])
  const [activeItems, setActiveItems] = useState<BarrageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const laneOccupancy = useRef<Map<number, number>>(new Map())
  const itemMap = useRef<Map<string, BarrageItem>>(new Map())

  const storage = getStorage()

  const fetchMessages = useCallback(async () => {
    try {
      const data = await storage.getAll()
      setMessages(data)
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setIsLoading(false)
    }
  }, [storage])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  useEffect(() => {
    if (!isApiStorage()) return
    const interval = setInterval(fetchMessages, config.barrage.pollInterval)
    return () => clearInterval(interval)
  }, [fetchMessages])

  const findLane = useCallback((): number => {
    const now = Date.now()
    const lanes = config.barrage.lanes
    for (let i = 0; i < lanes; i++) {
      const lastTime = laneOccupancy.current.get(i) ?? 0
      if (now - lastTime > 800) {
        laneOccupancy.current.set(i, now)
        return i
      }
    }
    return Math.floor(Math.random() * lanes)
  }, [])

  const spawnItem = useCallback(
    (msg: BarrageMessage): BarrageItem => {
      const container = containerRef.current
      const containerWidth = container?.offsetWidth ?? 1200
      const lane = findLane()
      const speed = config.barrage.defaultSpeed + (Math.random() - 0.5) * 4
      const fontSize = 14 + Math.random() * 6

      return {
        ...msg,
        lane,
        speed,
        x: containerWidth + 10,
        width: 0,
        paused: false,
        visible: true,
        fontSize,
      }
    },
    [findLane],
  )

  const addMessage = useCallback(
    async (content: string, username: string, color: string) => {
      const msg = await storage.add({
        content,
        username,
        avatar: '',
        color,
        fontSize: 16,
      })
      setMessages((prev) => [...prev, msg])
      return msg
    },
    [storage],
  )

  const removeMessage = useCallback(
    async (id: string) => {
      await storage.delete(id)
      setMessages((prev) => prev.filter((m) => m.id !== id))
      itemMap.current.delete(id)
      setActiveItems((prev) => prev.filter((item) => item.id !== id))
    },
    [storage],
  )

  const removeMessages = useCallback(
    async (ids: string[]) => {
      await storage.deleteBatch(ids)
      const idSet = new Set(ids)
      setMessages((prev) => prev.filter((m) => !idSet.has(m.id)))
      ids.forEach((id) => itemMap.current.delete(id))
      setActiveItems((prev) => prev.filter((item) => !idSet.has(item.id)))
    },
    [storage],
  )

  const spawnedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    for (const msg of messages) {
      if (spawnedIds.current.has(msg.id)) continue
      if (activeItems.length >= config.barrage.maxVisible) break

      spawnedIds.current.add(msg.id)
      const item = spawnItem(msg)
      itemMap.current.set(msg.id, item)
      setActiveItems((prev) => [...prev, item])
    }
  }, [messages, spawnItem, activeItems.length])

  useEffect(() => {
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 16.67
      lastTime = currentTime

      const container = containerRef.current
      if (!container) {
        animFrameRef.current = requestAnimationFrame(animate)
        return
      }

      setActiveItems((prev) => {
        const updated: BarrageItem[] = []
        for (const item of prev) {
          if (item.paused) {
            updated.push(item)
            continue
          }
          const newX = item.x - item.speed * delta
          if (newX < -item.width - 50) {
            spawnedIds.current.delete(item.id)
            itemMap.current.delete(item.id)
            continue
          }
          updated.push({ ...item, x: newX })
        }
        return updated
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [])

  const pauseItem = useCallback((id: string) => {
    setActiveItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paused: true } : item)),
    )
  }, [])

  const resumeItem = useCallback((id: string) => {
    setActiveItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paused: false } : item)),
    )
  }, [])

  return {
    messages,
    activeItems,
    isLoading,
    containerRef,
    addMessage,
    removeMessage,
    removeMessages,
    pauseItem,
    resumeItem,
    fetchMessages,
  }
}
