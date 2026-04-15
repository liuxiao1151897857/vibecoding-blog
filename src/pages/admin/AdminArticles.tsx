import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Search, Pencil, Trash2, Eye, EyeOff, Pin } from 'lucide-react'
import { articleService } from '@/services/articleService'
import type { Article } from '@/types'

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>(() => articleService.getAll())
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return articles
      .filter(a => {
        const matchStatus = statusFilter === 'all' || a.status === statusFilter
        const matchSearch = !search ||
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
        return matchStatus && matchSearch
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.updatedAt.localeCompare(a.updatedAt)
      })
  }, [articles, search, statusFilter])

  const handleTogglePublish = (id: string) => {
    const article = articles.find(a => a.id === id)
    if (!article) return
    const newStatus = article.status === 'published' ? 'draft' : 'published'
    articleService.update(id, { status: newStatus })
    setArticles(articleService.getAll())
  }

  const handleDelete = (id: string) => {
    articleService.delete(id)
    setArticles(articleService.getAll())
    setDeleteConfirm(null)
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">文章管理</h1>
        <Link
          to="/admin/articles/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <PlusCircle size={15} />
          新建文章
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索标题或标签..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {(['all', 'published', 'draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === s
                  ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {s === 'all' ? '全部' : s === 'published' ? '已发布' : '草稿'}
            </button>
          ))}
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">暂无文章</p>
            <Link
              to="/admin/articles/new"
              className="mt-3 inline-block text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              创建第一篇文章
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="text-left px-5 py-3 font-medium">标题</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">标签</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">状态</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">更新时间</th>
                <th className="text-right px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map(article => (
                <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {article.pinned && (
                        <Pin size={12} className="text-indigo-500 flex-shrink-0" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {article.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                      {article.wordCount} 字
                    </p>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{article.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">
                    {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleTogglePublish(article.id)}
                        title={article.status === 'published' ? '取消发布' : '发布'}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {article.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <Link
                        to={`/admin/articles/${article.id}/edit`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Pencil size={15} />
                      </Link>
                      {deleteConfirm === article.id ? (
                        <span className="flex items-center gap-1 text-xs">
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            取消
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(article.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">共 {filtered.length} 篇文章</p>
    </div>
  )
}
