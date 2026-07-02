import type { AppConfig } from '@/types'

const config: AppConfig = {
  storage: {
    type: 'local',
  },
  barrage: {
    maxVisible: 50,
    defaultSpeed: 8,
    lanes: 12,
    maxLength: 100,
    pollInterval: 3000,
  },
}

export default config
