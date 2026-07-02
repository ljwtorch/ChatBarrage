export interface BarrageMessage {
  id: string
  content: string
  username: string
  avatar: string
  color: string
  fontSize: number
  createdAt: number
}

export interface StorageAdapter {
  getAll(): Promise<BarrageMessage[]>
  add(msg: Omit<BarrageMessage, 'id' | 'createdAt'>): Promise<BarrageMessage>
  delete(id: string): Promise<void>
  deleteBatch(ids: string[]): Promise<void>
}

export interface AppConfig {
  storage: {
    type: 'local' | 'kv'
  }
  barrage: {
    maxVisible: number
    defaultSpeed: number
    lanes: number
    maxLength: number
    pollInterval: number
  }
}

export interface AdminCredentials {
  username: string
  password: string
}
