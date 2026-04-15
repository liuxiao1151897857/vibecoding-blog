import { Link } from 'react-router-dom'
import { Clock, Calendar, Pin } from 'lucide-react'
import TagBadge from '../ui/TagBadge'
import type { Article } from '../../types'

interface ArticleCardProps {
  article: Article
  onTagClick?: (tag: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ArticleCard({ article, onTagClick }: ArticleCardProps) {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow group">
      {article.pinned && (
        <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mb-2">
          <Pin size={12} />
          置顶
        </div>
      )}

      <Link to={`/articles/${article.slug}`} className="block">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
          {article.title}
        </h2>
      </Link>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {article.summary}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {article.tags.map(tag => (
          <TagBadge key={tag} tag={tag} onClick={onTagClick ? () => onTagClick(tag) : undefined} />
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {formatDate(article.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          约 {article.readTime} 分钟
        </span>
        <span>{article.wordCount.toLocaleString()} 字</span>
      </div>
    </article>
  )
}
