import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'
import { articleStorage } from '../lib/storage'
import type { Article } from '../types'
import TagBadge from '../components/ui/TagBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function Post() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    const found = articleStorage.getBySlug(slug)
    if (!found || found.status !== 'published') {
      setNotFound(true)
    } else {
      setArticle(found)
    }
  }, [slug])

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">文章不存在</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">该文章可能已被删除或地址有误。</p>
        <Link to="/articles" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          返回文章列表
        </Link>
      </div>
    )
  }

  if (!article) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        返回
      </button>

      {/* Cover */}
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
        />
      )}

      {/* Meta */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatDate(article.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            约 {article.readTime} 分钟阅读
          </span>
          <span>{article.wordCount.toLocaleString()} 字</span>
        </div>

        {article.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-gray-400" />
            {article.tags.map(tag => (
              <Link key={tag} to={`/articles?tag=${encodeURIComponent(tag)}`}>
                <TagBadge tag={tag} />
              </Link>
            ))}
          </div>
        )}
      </header>

      <hr className="border-gray-200 dark:border-gray-700 mb-8" />

      {/* Markdown Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-7
        prose-a:text-indigo-600 dark:prose-a:text-indigo-400
        prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:rounded-xl prose-pre:overflow-auto
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-400 prose-blockquote:pl-4 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
        prose-table:border-collapse prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:px-4 prose-th:py-2 prose-th:bg-gray-50 dark:prose-th:bg-gray-800
        prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700 prose-td:px-4 prose-td:py-2
        prose-img:rounded-xl prose-img:shadow-md
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        prose-strong:text-gray-900 dark:prose-strong:text-white
      ">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.content}
        </ReactMarkdown>
      </div>

      {/* Footer nav */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/articles"
          className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
        >
          <ArrowLeft size={14} />
          返回文章列表
        </Link>
      </div>
    </div>
  )
}
