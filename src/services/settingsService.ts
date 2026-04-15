import type { Settings } from '@/types'
import { getItem, setItem } from './storageUtils'

const KEY = 'blog_settings'

const DEFAULT_SETTINGS: Settings = {
  blogTitle: 'My Blog',
  blogSubtitle: '记录技术，记录生活',
  postsPerPage: 10,
  theme: 'system',
  primaryColor: '#6366f1',
  footerText: '© 2026 My Blog. All rights reserved.',
  enableSearch: true,
}

export const settingsService = {
  get(): Settings {
    return getItem<Settings>(KEY, DEFAULT_SETTINGS)
  },

  update(data: Partial<Settings>): Settings {
    const current = this.get()
    const updated = { ...current, ...data }
    setItem(KEY, updated)
    return updated
  },
}
