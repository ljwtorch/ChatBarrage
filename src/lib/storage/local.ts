import type { BarrageMessage, StorageAdapter } from '@/types'
import { generateId } from '@/lib/utils'

const STORAGE_KEY = 'chatbarrage_messages'

export class LocalStorageAdapter implements StorageAdapter {
  private getMessages(): BarrageMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  private saveMessages(messages: BarrageMessage[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }

  async getAll(): Promise<BarrageMessage[]> {
    return this.getMessages()
  }

  async add(msg: Omit<BarrageMessage, 'id' | 'createdAt'>): Promise<BarrageMessage> {
    const messages = this.getMessages()
    const newMsg: BarrageMessage = {
      ...msg,
      id: generateId(),
      createdAt: Date.now(),
    }
    messages.push(newMsg)
    this.saveMessages(messages)
    return newMsg
  }

  async delete(id: string): Promise<void> {
    const messages = this.getMessages()
    this.saveMessages(messages.filter((m) => m.id !== id))
  }

  async deleteBatch(ids: string[]): Promise<void> {
    const idSet = new Set(ids)
    const messages = this.getMessages()
    this.saveMessages(messages.filter((m) => !idSet.has(m.id)))
  }
}
