import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GitBranch, Mail, ExternalLink, Briefcase, GraduationCap, FolderGit2, Sparkles, Download } from 'lucide-react'
import { profileStorage } from '../lib/storage'
import type { Profile } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  Github: GitBranch,
  GitBranch,
  Mail,
  Sparkles,
}

function SocialIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] || ExternalLink
  return <Icon size={18} />
}

export default function About() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    setProfile(profileStorage.get())
  }, [])

  if (!profile) return null

  const grouped = profile.skills.reduce<Record<string, typeof profile.skills>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {})

  // 项目经历按 featured 排序
  const sortedProjects = [...profile.projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.startDate.localeCompare(a.startDate)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Profile Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-900 flex-shrink-0"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-4xl font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {profile.name.charAt(0)}
          </div>
        )}
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">{profile.bio}</p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {profile.links.map(link => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                <SocialIcon name={link.icon} />
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* About Markdown */}
      {profile.about && (
        <section>
          <div className="prose prose-gray dark:prose-invert max-w-none
            prose-headings:text-gray-900 dark:prose-headings:text-white
            prose-p:text-gray-700 dark:prose-p:text-gray-300
            prose-li:text-gray-700 dark:prose-li:text-gray-300
            prose-a:text-indigo-600 dark:prose-a:text-indigo-400
            prose-strong:text-gray-900 dark:prose-strong:text-white
            prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {profile.about}
            </ReactMarkdown>
          </div>
        </section>
      )}

      {/* Skills by Category */}
      {Object.keys(grouped).length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">技能栈</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(grouped).map(([category, skills]) => (
              <div key={category} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                  {category}
                </h3>
                <div className="space-y-3">
                  {skills.map(skill => (
                    <div key={skill.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{skill.name}</span>
                        <span className="text-gray-400">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {profile.experiences.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Briefcase size={24} />
            工作与教育经历
          </h2>
          <div className="space-y-4">
            {profile.experiences.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  {exp.type === 'work'
                    ? <Briefcase size={18} className="text-indigo-600 dark:text-indigo-400" />
                    : <GraduationCap size={18} className="text-indigo-600 dark:text-indigo-400" />
                  }
                </div>
                <div className="flex-1 pb-6 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h3>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      {exp.startDate} — {exp.endDate || '至今'}
                    </span>
                  </div>
                  <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-2">
                    {exp.organization}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section - 新增项目经历模块 */}
      {sortedProjects.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderGit2 size={24} />
              项目经历
            </h2>
            <a
              href="/projects"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              查看全部项目 <ExternalLink size={14} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedProjects.slice(0, 4).map((project) => (
              <div key={project.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group">
                {project.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">{project.title}</h3>
                    {project.featured && (
                      <span className="px-2.5 py-1 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full">精选</span>
                    )}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-500 dark:text-gray-400">
                      {project.startDate} {project.endDate ? `— ${project.endDate}` : '至今'}
                    </div>

                    <div className="flex gap-3">
                      {project.links?.github && (
                        <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <GitBranch size={16} />
                        </a>
                      )}
                      {project.links?.demo && (
                        <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Resume Generator - 一键生成简历 */}
      <section className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-900">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0 w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-center shadow-sm">
            <Sparkles size={28} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              AI 智能简历生成
              <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">NEW</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              使用 AI 帮你一键生成专业简历，支持个性化定制、ATS 优化建议。基于您的项目经历和技能自动生成。
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/ai"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-medium transition-all active:scale-[0.985]"
              >
                <Sparkles size={18} />
                进入 AI 工作台
              </a>

              <button
                onClick={() => {
                  const resumeContent = `
# ${profile.name} 的简历

**${profile.bio}**

## 技能专长
${profile.skills.map(s => `- ${s.name} (${s.level}%)`).join('\n')}

## 项目经历
${profile.projects.map(p => `
### ${p.title}
**${p.role}** | ${p.startDate} - ${p.endDate || '至今'}

${p.description}

**技术栈**：${p.technologies.join(' · ')}
`).join('\n')}

## 联系方式
${profile.links.map(l => `- ${l.platform}: ${l.url}`).join('\n')}
                  `.trim()

                  const blob = new Blob([resumeContent], { type: 'text/markdown' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${profile.name}-resume.md`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)

                  alert('简历 Markdown 已下载！您也可以访问 /ai 页面使用更强大的 AI 生成器。')
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 rounded-2xl font-medium transition-all"
              >
                <Download size={18} />
                一键下载简历 (MD)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">联系我</h2>
        <div className="flex flex-wrap gap-3">
          {profile.links.map(link => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              <SocialIcon name={link.icon} />
              {link.platform}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
