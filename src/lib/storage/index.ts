import type { StorageAdapter } from '@/types'
import config from '@/config/app'
import { LocalStorageAdapter } from './local'
import { ApiStorageAdapter } from './api'

let adapter: StorageAdapter | null = null
let apiAdapter: ApiStorageAdapter | null = null

export function getStorage(): StorageAdapter {
  if (adapter) return adapter

  if (config.storage.type === 'kv') {
    apiAdapter = new ApiStorageAdapter()
    adapter = apiAdapter
  } else {
    adapter = new LocalStorageAdapter()
  }

  return adapter
}

export function getApiAdapter(): ApiStorageAdapter | null {
  return apiAdapter
}

export function isApiStorage(): boolean {
  return config.storage.type === 'kv'
}
