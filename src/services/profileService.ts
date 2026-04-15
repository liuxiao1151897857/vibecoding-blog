import type { Profile } from '@/types'
import { getItem, setItem } from './storageUtils'

const KEY = 'blog_profile'

const DEFAULT_PROFILE: Profile = {
  name: '博主',
  avatar: '/default-avatar.png',
  bio: '热爱技术，热爱生活',
  about: '# 关于我\n\n欢迎来到我的博客！',
  skills: [],
  experiences: [],
  links: [],
}

export const profileService = {
  get(): Profile {
    return getItem<Profile>(KEY, DEFAULT_PROFILE)
  },

  update(data: Partial<Profile>): Profile {
    const current = this.get()
    const updated = { ...current, ...data }
    setItem(KEY, updated)
    return updated
  },
}
