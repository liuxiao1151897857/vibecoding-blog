import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Tag, BookOpen, PlusCircle, Download, Upload } from 'lucide-react'
import { articleService } from '@/services/articleService'
import { profileService } from '@/services/profileService'
import { exportAllData, importAllData } from '@/services/storageUtils'

const ALL_KEYS = ['blog_articles', 'blog_profile', 'blog_settings']

export default function AdminDashboard() {
  const articles = articleService.getAll()
  const profile = profileService.get()

  const stats = useMemo(() => {
    const published = articles.filter(a => a.status === 'published').length
    const draft = articles.filter(a => a.status === 'draft').length
    const tagSet = new Set<string>()
    articles.forEach(a => a.tags.forEach(t => tagSet.add(t)))
    const totalWords = articles.reduce((sum, a) => sum + (a.wordCount || 0), 0)
    return { total: articles.length, published, draft, tags: tagSet.size, totalWords }
  }, [articles])

  const recentArticles = [...articles]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5)

  const handleExport = () => {
    const json = exportAllData(ALL_KEYS)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blog-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          importAllData(ev.target?.result as string, ALL_KEYS)
          alert('导入成功，页面将刷新')
          window.location.reload()
        } catch {
          alert('文件格式错误，导入失败')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">控制台</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            你好，{profile.name}！欢迎回来。
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload size={14} /> 导入数据
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download size={14} /> 导出备份
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">全部文章</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <BookOpen size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">已发布</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
            <FileText size={18} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">草稿</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
            <Tag size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tags}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">标签数</p>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusCircle size={15} />
            新建文章
          </Link>
          <Link
            to="/admin/articles"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <FileText size={15} />
            管理文章
          </Link>
          <Link
            to="/admin/profile"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            编辑个人信息
          </Link>
        </div>
      </div>

      {/* 最近文章 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">最近文章</h2>
          <Link
            to="/admin/articles"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            查看全部
          </Link>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {recentArticles.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无文章</p>
          ) : (
            recentArticles.map(article => (
              <div key={article.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{article.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(article.updatedAt).toLocaleDateString('zh-CN')}
                    {' · '}
                    {article.tags.join(', ') || '无标签'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    article.status === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {article.status === 'published' ? '已发布' : '草稿'}
                  </span>
                  <Link
                    to={`/admin/articles/${article.id}/edit`}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    编辑
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
