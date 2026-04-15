import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { articleStorage } from '../lib/storage'
import type { Article } from '../types'
import ArticleCard from '../components/article/ArticleCard'
import TagBadge from '../components/ui/TagBadge'

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tag = searchParams.get('tag')
    return tag ? [tag] : []
  })

  const load = useCallback(() => {
    const result = articleStorage.search(query, selectedTags)
    setArticles(result)
    setAllTags(articleStorage.getAllTags())
  }, [query, selectedTags])

  useEffect(() => {
    load()
  }, [load])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedTags([])
    setSearchParams({})
  }

  const hasFilters = query || selectedTags.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">文章</h1>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索文章..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map(tag => (
            <TagBadge
              key={tag}
              tag={tag}
              active={selectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={12} /> 清除筛选
            </button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        共 {articles.length} 篇文章
        {hasFilters && (
          <span className="ml-2 text-indigo-600 dark:text-indigo-400">（已筛选）</span>
        )}
      </div>

      {articles.length > 0 ? (
        <div className="space-y-4">
          {articles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              onTagClick={toggleTag}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">没有找到匹配的文章</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  )
}
