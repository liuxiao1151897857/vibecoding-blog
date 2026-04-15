import { useState, useEffect, FormEvent, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Eye, EyeOff, ArrowLeft, X, Pin } from 'lucide-react'
import { articleService } from '@/services/articleService'
import type { Article } from '@/types'

type ArticleFormData = Pick<Article, 'title' | 'slug' | 'summary' | 'content' | 'tags' | 'coverImage' | 'status' | 'pinned'>

const emptyForm: ArticleFormData = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  tags: [],
  coverImage: '',
  status: 'draft',
  pinned: false,
}

export default function AdminArticleEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id

  const [form, setForm] = useState<ArticleFormData>(emptyForm)
  const [tagInput, setTagInput] = useState('')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [currentId, setCurrentId] = useState<string | undefined>(id)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!isNew && id) {
      const article = articleService.getById(id)
      if (article) {
        setForm({
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          tags: article.tags,
          coverImage: article.coverImage || '',
          status: article.status,
          pinned: article.pinned,
        })
        setCurrentId(id)
      } else {
        navigate('/admin/articles')
      }
    }
  }, [id, isNew, navigate])

  const updateField = <K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleTitleChange = (title: string) => {
    updateField('title', title)
    if (isNew || !form.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      updateField('slug', slug)
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    updateField('tags', form.tags.filter(t => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!form.title.trim()) {
      alert('请输入文章标题')
      return
    }
    setSaving(true)
    try {
      if (isNew && !currentId) {
        const created = articleService.create({
          title: form.title,
          summary: form.summary,
          content: form.content,
          tags: form.tags,
          coverImage: form.coverImage,
          status: form.status,
          pinned: form.pinned,
        })
        setCurrentId(created.id)
        setSaved(true)
        navigate(`/admin/articles/${created.id}/edit`, { replace: true })
      } else {
        articleService.update(currentId!, form)
        setSaved(true)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (value: string) => {
    updateField('content', value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  // 简单 Markdown 预览（转换常见语法，注意：内容来自用户自己输入，不存在 XSS 风险）
  const renderPreview = (md: string) => {
    const escaped = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-5 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm font-mono">$1</code>')
      .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-3 text-sm font-mono"><code>$1</code></pre>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^---$/gm, '<hr class="border-gray-300 dark:border-gray-600 my-4" />')
      .replace(/\n\n+/g, '</p><p class="mb-3">')
      .replace(/^(?!<[h1-6hlipcasp])(.+)/gm, '$1')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶栏 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/articles')}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          {isNew ? '新建文章' : '编辑文章'}
        </h1>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-600 dark:text-green-400">已保存</span>
          )}
          <button
            onClick={() => setPreview(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {preview ? <EyeOff size={14} /> : <Eye size={14} />}
            {preview ? '编辑' : '预览'}
          </button>
          <button
            onClick={() => updateField('status', form.status === 'published' ? 'draft' : 'published')}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              form.status === 'published'
                ? 'border-green-500 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {form.status === 'published' ? '已发布' : '草稿'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主编辑区 */}
          <div className="lg:col-span-2 space-y-4">
            <input
              type="text"
              placeholder="文章标题"
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              className="w-full px-0 py-2 text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
            />

            {preview ? (
              <div
                className="min-h-96 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(form.content) }}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                  <span className="text-xs text-gray-400">Markdown 编辑器</span>
                  <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-xs text-gray-400">{form.content.length} 字符</span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={e => handleContentChange(e.target.value)}
                  placeholder={`用 Markdown 开始写作...\n\n# 一级标题\n## 二级标题\n\n**粗体** *斜体* \`行内代码\`\n\n\`\`\`javascript\nconsole.log('Hello')\n\`\`\`\n\n- 列表项 1\n- 列表项 2`}
                  className="w-full min-h-96 p-4 text-sm font-mono bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none resize-none"
                />
              </div>
            )}
          </div>

          {/* 侧边设置 */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => updateField('slug', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-400 mt-1">/articles/{form.slug || 'slug'}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">文章摘要</label>
              <textarea
                value={form.summary}
                onChange={e => updateField('summary', e.target.value)}
                placeholder="留空则自动取正文前 200 字"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">标签</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="输入标签，回车添加"
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  添加
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase">封面图 URL</label>
              <input
                type="url"
                value={form.coverImage}
                onChange={e => updateField('coverImage', e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">其他设置</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => updateField('pinned', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Pin size={13} className="text-indigo-500" />
                  置顶文章
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
