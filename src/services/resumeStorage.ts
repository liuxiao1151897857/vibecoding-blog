import type {
  Resume,
  DailyNote,
  DailyNoteFilter,
  ResumeWizardSession,
  ResumeSettings,
} from '@/types/resume'
import {
  RESUME_STORAGE_KEYS,
  DEFAULT_RESUME_SETTINGS,
} from '@/types/resume'
import { getItem, setItem, removeItem } from './storageUtils'
import { generateId } from '@/utils/id'
import { toISO } from '@/utils/date'

const KEYS = RESUME_STORAGE_KEYS

// ---- 简历草稿（当前编辑中，最多一份） ----

export const resumeDraftStorage = {
  get(): Resume | null {
    return getItem<Resume | null>(KEYS.RESUME_DRAFT, null)
  },

  save(resume: Resume): Resume {
    const updated = { ...resume, updatedAt: toISO() }
    setItem(KEYS.RESUME_DRAFT, updated)
    return updated
  },

  clear(): void {
    removeItem(KEYS.RESUME_DRAFT)
  },
}

// ---- 简历快照（已保存版本列表） ----

const MAX_SNAPSHOTS = 10

export const resumeSnapshotStorage = {
  getAll(): Resume[] {
    return getItem<Resume[]>(KEYS.RESUME_SNAPSHOTS, [])
  },

  getById(id: string): Resume | undefined {
    return this.getAll().find((r) => r.id === id)
  },

  save(resume: Resume): Resume {
    const now = toISO()
    const snapshot: Resume = {
      ...resume,
      id: resume.id || generateId('resume'),
      meta: { ...resume.meta, status: 'ready' },
      updatedAt: now,
    }
    const list = this.getAll()
    const existingIdx = list.findIndex((r) => r.id === snapshot.id)
    if (existingIdx >= 0) {
      list[existingIdx] = snapshot
    } else {
      list.unshift(snapshot)
      if (list.length > MAX_SNAPSHOTS) list.pop()
    }
    setItem(KEYS.RESUME_SNAPSHOTS, list)
    return snapshot
  },

  delete(id: string): boolean {
    const list = this.getAll()
    const filtered = list.filter((r) => r.id !== id)
    if (filtered.length === list.length) return false
    setItem(KEYS.RESUME_SNAPSHOTS, filtered)
    return true
  },
}

// ---- 点滴记录 ----

export const dailyNoteStorage = {
  getAll(): DailyNote[] {
    return getItem<DailyNote[]>(KEYS.DAILY_NOTES, [])
  },

  getById(id: string): DailyNote | undefined {
    return this.getAll().find((n) => n.id === id)
  },

  query(filter: DailyNoteFilter): DailyNote[] {
    let list = this.getAll()

    if (filter.category) {
      list = list.filter((n) => n.category === filter.category)
    }
    if (filter.tags?.length) {
      list = list.filter((n) => filter.tags!.some((t) => n.tags.includes(t)))
    }
    if (filter.projectId) {
      list = list.filter((n) => n.projectId === filter.projectId)
    }
    if (filter.dateFrom) {
      list = list.filter((n) => n.noteDate >= filter.dateFrom!)
    }
    if (filter.dateTo) {
      list = list.filter((n) => n.noteDate <= filter.dateTo!)
    }
    if (filter.summarized !== undefined) {
      list = list.filter((n) => n.summarized === filter.summarized)
    }
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase()
      list = list.filter(
        (n) =>
          n.content.toLowerCase().includes(kw) ||
          n.tags.some((t) => t.toLowerCase().includes(kw))
      )
    }

    return list.sort((a, b) => b.noteDate.localeCompare(a.noteDate))
  },

  create(
    data: Omit<DailyNote, 'id' | 'createdAt' | 'updatedAt' | 'summarized'>
  ): DailyNote {
    const now = toISO()
    const note: DailyNote = {
      ...data,
      id: generateId('note'),
      summarized: false,
      createdAt: now,
      updatedAt: now,
    }
    const list = this.getAll()
    list.unshift(note)
    setItem(KEYS.DAILY_NOTES, list)
    return note
  },

  update(id: string, data: Partial<DailyNote>): DailyNote | null {
    const list = this.getAll()
    const idx = list.findIndex((n) => n.id === id)
    if (idx === -1) return null
    const updated: DailyNote = {
      ...list[idx],
      ...data,
      id: list[idx].id,
      updatedAt: toISO(),
    }
    list[idx] = updated
    setItem(KEYS.DAILY_NOTES, list)
    return updated
  },

  delete(id: string): boolean {
    const list = this.getAll()
    const filtered = list.filter((n) => n.id !== id)
    if (filtered.length === list.length) return false
    setItem(KEYS.DAILY_NOTES, filtered)
    return true
  },

  markSummarized(ids: string[], resumeId: string): void {
    const list = this.getAll()
    let changed = false
    for (const note of list) {
      if (ids.includes(note.id)) {
        note.summarized = true
        note.resumeId = resumeId
        note.updatedAt = toISO()
        changed = true
      }
    }
    if (changed) setItem(KEYS.DAILY_NOTES, list)
  },

  getAllTags(): string[] {
    const tagSet = new Set<string>()
    for (const note of this.getAll()) {
      for (const tag of note.tags) tagSet.add(tag)
    }
    return Array.from(tagSet).sort()
  },
}

// ---- 向导会话 ----

export const wizardSessionStorage = {
  get(): ResumeWizardSession | null {
    return getItem<ResumeWizardSession | null>(KEYS.WIZARD_SESSION, null)
  },

  save(session: ResumeWizardSession): ResumeWizardSession {
    const updated = { ...session, updatedAt: toISO() }
    setItem(KEYS.WIZARD_SESSION, updated)
    return updated
  },

  clear(): void {
    removeItem(KEYS.WIZARD_SESSION)
  },
}

// ---- 模块设置 ----

export const resumeSettingsStorage = {
  get(): ResumeSettings {
    return getItem<ResumeSettings>(KEYS.RESUME_SETTINGS, DEFAULT_RESUME_SETTINGS)
  },

  save(settings: Partial<ResumeSettings>): ResumeSettings {
    const current = this.get()
    const updated = { ...current, ...settings }
    setItem(KEYS.RESUME_SETTINGS, updated)
    return updated
  },
}

// ---- 全局操作 ----

export function clearAllResumeData(): void {
  for (const key of Object.values(KEYS)) {
    removeItem(key)
  }
}
