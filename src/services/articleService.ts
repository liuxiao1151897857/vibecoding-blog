import type { Article, ArticleFilter, PaginatedResult } from '@/types'
import { getItem, setItem } from './storageUtils'
import { generateId } from '@/utils/id'
import { toISO } from '@/utils/date'
import { countWords, extractSummary, slugify } from '@/utils/markdown'

const KEY = 'blog_articles'

export const articleService = {
  /** 获取全部文章 */
  getAll(): Article[] {
    return getItem<Article[]>(KEY, [])
  },

  /** 按 ID 获取单篇文章 */
  getById(id: string): Article | undefined {
    return this.getAll().find((a) => a.id === id)
  },

  /** 按 slug 获取单篇文章 */
  getBySlug(slug: string): Article | undefined {
    return this.getAll().find((a) => a.slug === slug)
  },

  /** 筛选 + 分页 */
  query(filter: ArticleFilter = {}): PaginatedResult<Article> {
    const { keyword, tags, status, page = 1, pageSize = 10 } = filter
    let list = this.getAll()

    if (status) list = list.filter((a) => a.status === status)
    if (keyword) {
      const kw = keyword.toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(kw) ||
          a.summary.toLowerCase().includes(kw)
      )
    }
    if (tags?.length) {
      list = list.filter((a) => tags.every((t) => a.tags.includes(t)))
    }

    // 置顶优先，再按时间倒序
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.createdAt.localeCompare(a.createdAt)
    })

    const total = list.length
    const totalPages = Math.ceil(total / pageSize)
    const items = list.slice((page - 1) * pageSize, page * pageSize)
    return { items, total, page, pageSize, totalPages }
  },

  /** 获取所有标签及其出现次数 */
  getAllTags(): Record<string, number> {
    const counts: Record<string, number> = {}
    this.getAll()
      .filter((a) => a.status === 'published')
      .forEach((a) => a.tags.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)))
    return counts
  },

  /** 新建文章 */
  create(data: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'wordCount' | 'slug'>): Article {
    const now = toISO()
    const wordCount = countWords(data.content)
    const summary = data.summary || extractSummary(data.content)
    const slug = slugify(data.title) || generateId('art')
    const article: Article = {
      ...data,
      id: generateId('art'),
      slug,
      summary,
      wordCount,
      createdAt: now,
      updatedAt: now,
    }
    const list = this.getAll()
    list.unshift(article)
    setItem(KEY, list)
    return article
  },

  /** 更新文章 */
  update(id: string, data: Partial<Omit<Article, 'id' | 'createdAt'>>): Article | null {
    const list = this.getAll()
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) return null

    const updated: Article = {
      ...list[idx],
      ...data,
      updatedAt: toISO(),
      wordCount: countWords(data.content ?? list[idx].content),
    }
    if (data.content && !data.summary) {
      updated.summary = extractSummary(data.content)
    }
    list[idx] = updated
    setItem(KEY, list)
    return updated
  },

  /** 删除文章 */
  delete(id: string): boolean {
    const list = this.getAll()
    const filtered = list.filter((a) => a.id !== id)
    if (filtered.length === list.length) return false
    setItem(KEY, filtered)
    return true
  },

  /** 获取相邻文章（上一篇 / 下一篇，仅已发布） */
  getAdjacentArticles(id: string): { prev: Article | null; next: Article | null } {
    const published = this.getAll()
      .filter((a) => a.status === 'published')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const idx = published.findIndex((a) => a.id === id)
    return {
      prev: idx > 0 ? published[idx - 1] : null,
      next: idx < published.length - 1 ? published[idx + 1] : null,
    }
  },
}
