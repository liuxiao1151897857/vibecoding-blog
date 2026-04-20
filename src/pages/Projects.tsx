import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Calendar, User, GitBranch } from 'lucide-react'
import { profileStorage } from '../lib/storage'
import type { Profile, Project } from '../types'

export default function Projects() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    setProfile(profileStorage.get())
  }, [])

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 确保 projects 始终是数组
  const projects = profile.projects || []
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return b.startDate.localeCompare(a.startDate)
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          返回关于我
        </Link>

        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">项目经历</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              精选项目展示 · 共 {projects.length} 个项目
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gray-400">Featured</div>
            <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
              {projects.filter((p: Project) => p.featured).length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sortedProjects.map((project: Project) => (
          <div
            key={project.id}
            className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col h-full"
          >
            {project.image && (
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
                {project.featured && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-black/80 text-xs font-semibold text-amber-600 dark:text-amber-400 rounded-full backdrop-blur-sm">
                    ★ 精选项目
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                  <User size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="font-medium text-indigo-600 dark:text-indigo-400 text-sm">{project.role}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} /> {project.startDate} — {project.endDate || '至今'}
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {project.title}
              </h2>

              <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1">
                {project.description}
              </p>

              <div className="mb-8">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-3">技术栈</div>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {(project.links?.github || project.links?.demo || project.links?.other) && (
                <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  {project.links.github && (
                    <a
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-gray-700 hover:border-gray-400 rounded-2xl text-sm font-medium transition-colors"
                    >
                      <GitBranch size={18} />
                      GitHub
                    </a>
                  )}
                  {project.links.demo && (
                    <a
                      href={project.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={18} />
                      在线演示
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          这些项目都是我在不同阶段积累的实战经验。欢迎通过 <a href="/ai" className="text-indigo-600 hover:underline">AI 工作台</a> 了解更多关于这些项目的细节，或生成基于这些经历的简历。
        </p>
      </div>
    </div>
  )
}
