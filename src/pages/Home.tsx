import { useCallback, useState } from 'react'
import { NavBar } from '@/components/layout/NavBar'
import { BarrageCanvas } from '@/components/barrage/BarrageCanvas'
import { BarrageInput } from '@/components/barrage/BarrageInput'
import { useBarrage } from '@/hooks/useBarrage'


export default function Home() {
  const {
    activeItems,
    isLoading,
    containerRef,
    addMessage,
    pauseItem,
    resumeItem,
  } = useBarrage()

  const [onlineCount] = useState(() => Math.floor(Math.random() * 50) + 1)

  const handleSend = useCallback(
    async (content: string, username: string, color: string) => {
      await addMessage(content, username, color)
    },
    [addMessage],
  )

  return (
    <div className="flex h-dvh flex-col bg-[var(--bg)]">
      <NavBar onlineCount={onlineCount} isConnected={true} />

      <main className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4">
        <BarrageCanvas
          containerRef={containerRef}
          activeItems={activeItems}
          isLoading={isLoading}
          onPause={pauseItem}
          onResume={resumeItem}
        />

        <div className="sticky bottom-0 z-10 w-full pb-4 pt-2">
          <div className="mx-auto max-w-2xl">
            <BarrageInput onSend={handleSend} />
          </div>
        </div>
      </main>
    </div>
  )
}
