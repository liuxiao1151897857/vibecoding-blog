import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { articleStorage } from '../lib/storage'
import type { Article } from '../types'
import ArticleCard from '../components/article/ArticleCard'

export default function AI() {
  const [aiArticles, setAiArticles] = useState<Article[]>([])

  useEffect(() => {
    const articles = articleStorage.getAll()

    // 筛选 AI 相关文章
    const filtered = articles.filter((article: Article) =>
      article.status === 'published' &&
      (
        article.title.toLowerCase().includes('ai') ||
        article.title.toLowerCase().includes('人工智能') ||
        article.title.toLowerCase().includes('大模型') ||
        article.title.toLowerCase().includes('llm') ||
        article.title.toLowerCase().includes('gpt') ||
        article.tags.some((tag: string) =>
          tag.toLowerCase().includes('ai') ||
          tag.toLowerCase().includes('人工智能') ||
          tag.toLowerCase().includes('llm') ||
          tag.toLowerCase().includes('gpt')
        )
      )
    ).sort((a: Article, b: Article) => b.createdAt.localeCompare(a.createdAt))

    setAiArticles(filtered)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <ArrowLeft size={20} />
          <span>返回首页</span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-2xl text-sm font-medium">
          AI 内容专区
        </div>
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-8 py-3 rounded-3xl mb-6">
          <BookOpen size={28} />
          <h1 className="text-4xl font-bold">AI 技术文章</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          精选我撰写的关于人工智能、大模型、Prompt Engineering 等领域的技术文章
        </p>
      </div>

      {/* 简历生成已移动到首页，此处仅展示 AI 文章 */}

      {aiArticles.length > 0 ? (
        <div className="space-y-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <BookOpen size={26} className="text-violet-500" />
            AI 相关文章 ({aiArticles.length})
          </h3>

          <div className="grid gap-6">
            {aiArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">暂无 AI 相关文章</p>
          <p className="text-sm text-gray-400 mt-2">在后台发布带有 "AI" 标签的文章后会自动显示在这里</p>
        </div>
      )}

      <div className="mt-16 text-center text-xs text-gray-400">
        AI 专区 · 自动从博客中提取相关内容 · 一键简历基于全站数据生成
      </div>
    </div>
  )
}
