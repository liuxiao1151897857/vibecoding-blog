import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Github, Mail, ExternalLink, Briefcase, GraduationCap } from 'lucide-react'
import { profileStorage } from '../lib/storage'
import type { Profile } from '../types'

const ICON_MAP: Record<string, React.ElementType> = {
  Github,
  Mail,
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">经历</h2>
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
