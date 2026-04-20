import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Link2, Mail, ExternalLink, FolderGit2, FileText, Download } from 'lucide-react'
import { articleStorage, profileStorage } from '../lib/storage'
import type { Article, Profile } from '../types'
import ArticleCard from '../components/article/ArticleCard'
import TagBadge from '../components/ui/TagBadge'
import jsPDF from 'jspdf'
const ICON_MAP: Record<string, React.ElementType> = {
  Github: Link2,
  GitHub: Link2,
  Mail,
}

function SocialIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] || ExternalLink
  return <Icon size={18} />
}

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    const p = profileStorage.get()
    setProfile(p)
    const published = articleStorage.getPublished()
    setLatestArticles(published.slice(0, 3))
    setAllTags(articleStorage.getAllTags())
  }, [])

  if (!profile) return null

  const generatePDFResume = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let yPosition = 20

    // 标题
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.text(profile.name, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 12

    // 简介
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(100, 100, 100)
    const bioLines = pdf.splitTextToSize(profile.bio, pageWidth - margin * 2)
    pdf.text(bioLines, margin, yPosition)
    yPosition += bioLines.length * 6 + 8

    // 联系方式
    pdf.setFontSize(10)
    pdf.setTextColor(60, 60, 60)
    const contactText = profile.links.map(l => `${l.platform}: ${l.url.replace('mailto:', '')}`).join('   |   ')
    const contactLines = pdf.splitTextToSize(contactText, pageWidth - margin * 2)
    pdf.text(contactLines, margin, yPosition)
    yPosition += 15

    // 分隔线
    pdf.setDrawColor(200, 200, 200)
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 12

    // 技能
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.setTextColor(40, 40, 40)
    pdf.text('专业技能', margin, yPosition)
    yPosition += 10

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    profile.skills.forEach((skill) => {
      if (yPosition > 260) {
        pdf.addPage()
        yPosition = 20
      }
      const skillText = `${skill.name} (${skill.category}) - ${skill.level}%`
      pdf.text(skillText, margin, yPosition)
      yPosition += 8
    })
    yPosition += 10

    // 项目经历
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(14)
    pdf.text('项目经历', margin, yPosition)
    yPosition += 12

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)

    ;(profile.projects || []).forEach((project, idx) => {
      if (yPosition > 240) {
        pdf.addPage()
        yPosition = 25
      }

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.text(project.title, margin, yPosition)
      yPosition += 7

      pdf.setFont('helvetica', 'italic')
      pdf.setFontSize(10)
      pdf.text(`${project.role} | ${project.startDate} — ${project.endDate || '至今'}`, margin, yPosition)
      yPosition += 8

      const descLines = pdf.splitTextToSize(project.description, pageWidth - margin * 2 - 10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(descLines, margin + 5, yPosition)
      yPosition += descLines.length * 5 + 5

      if (project.technologies && project.technologies.length > 0) {
        pdf.setFontSize(9)
        pdf.setTextColor(80, 80, 80)
        pdf.text(`技术栈: ${(project.technologies || []).join(' · ')}`, margin + 5, yPosition)
        yPosition += 10
      }

      if (idx < (profile.projects || []).length - 1) {
        yPosition += 5
      }
    })

    // 页脚
    pdf.setFontSize(9)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `简历生成时间: ${new Date().toLocaleString('zh-CN')} | 基于个人博客系统自动生成`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    )

    // 下载
    pdf.save(`${profile.name}-技术简历-${new Date().toISOString().slice(0,10)}.pdf`)

    alert('✅ PDF 简历已生成并下载！\n\n包含头像位置提示、个人介绍、完整项目经历、技能等内容。')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            你好，我是 <span className="text-indigo-600 dark:text-indigo-400">{profile.name}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {profile.bio}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {profile.links.map(link => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all text-sm"
              >
                <SocialIcon name={link.icon} />
                {link.platform}
              </a>
            ))}
          </div>
        </div>
        {profile.avatar && (
          <div className="flex-shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-900"
            />
          </div>
        )}
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">技能</h2>
        <div className="space-y-4">
          {profile.skills.map(skill => (
            <div key={skill.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
                <span className="text-gray-400 dark:text-gray-500">{skill.category}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tags */}
      {allTags.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">标签</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <Link key={tag} to={`/articles?tag=${encodeURIComponent(tag)}`}>
                <TagBadge tag={tag} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects Quick Link */}
      {(profile.projects || []).length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderGit2 size={24} className="text-amber-500" />
              精选项目
            </h2>
            <Link
              to="/projects"
              className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              全部项目 <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(profile.projects || []).filter(p => p.featured).slice(0, 2).map(project => (
              <Link
                key={project.id}
                to="/projects"
                className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:border-amber-200 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {project.image && (
                    <img src={project.image} alt="" className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 line-clamp-2 mb-1.5">
                      {project.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {project.description}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {project.technologies.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-2 py-px bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* PDF Resume Generator - 主页醒目按钮 */}
      <section className="pt-4">
        <div
          onClick={generatePDFResume}
          className="group block bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-3xl p-12 text-white cursor-pointer hover:shadow-2xl transition-all active:scale-[0.985] relative overflow-hidden border border-white/20"
        >
          <div className="absolute -right-12 -top-12 text-[180px] opacity-10 pointer-events-none">📄</div>

          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="w-24 h-24 bg-white/15 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <FileText size={52} className="text-white" />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 text-xs font-medium tracking-widest px-5 py-2 rounded-3xl mb-4">
                <Download size={16} /> PDF FORMAT
              </div>
              <h3 className="text-4xl font-bold mb-5 leading-none">一键生成专业 PDF 简历</h3>
              <p className="text-lg opacity-90 max-w-lg mx-auto lg:mx-0">
                包含头像区域、个人介绍、完整项目经历、技能展示。<br />
                直接可投递使用，排版专业美观。
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 lg:items-end">
              <div className="px-10 py-5 bg-white text-indigo-700 rounded-2xl font-semibold flex items-center gap-3 shadow-inner group-hover:scale-105 transition-transform">
                生成 PDF 简历
                <Download size={26} />
              </div>
              <div className="text-xs opacity-75">支持头像 • 项目经历 • 个人介绍</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">最新文章</h2>
          <Link
            to="/articles"
            className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            全部文章 <ArrowRight size={14} />
          </Link>
        </div>
        {latestArticles.length > 0 ? (
          <div className="space-y-4">
            {latestArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">暂无文章</p>
        )}
      </section>
    </div>
  )
}
