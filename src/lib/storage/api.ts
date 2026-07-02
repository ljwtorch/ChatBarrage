import type { BarrageMessage, StorageAdapter } from '@/types'

const API_BASE = '/api'

export class ApiStorageAdapter implements StorageAdapter {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    return headers
  }

  async getAll(): Promise<BarrageMessage[]> {
    const res = await fetch(`${API_BASE}/barrages`, { headers: this.getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch barrages')
    const data = await res.json()
    return data.barrages ?? data
  }

  async add(msg: Omit<BarrageMessage, 'id' | 'createdAt'>): Promise<BarrageMessage> {
    const res = await fetch(`${API_BASE}/barrages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(msg),
    })
    if (!res.ok) throw new Error('Failed to add barrage')
    const data = await res.json()
    return data.barrage ?? data
  }

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/barrages/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete barrage')
  }

  async deleteBatch(ids: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/barrages/delete-batch`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) throw new Error('Failed to delete barrages')
  }
}
