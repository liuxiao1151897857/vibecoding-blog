import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Link2, Mail, ExternalLink } from 'lucide-react'
import { articleStorage, profileStorage } from '../lib/storage'
import type { Article, Profile } from '../types'
import ArticleCard from '../components/article/ArticleCard'
import TagBadge from '../components/ui/TagBadge'

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
    setProfile(profileStorage.get())
    const published = articleStorage.getPublished()
    setLatestArticles(published.slice(0, 3))
    setAllTags(articleStorage.getAllTags())
  }, [])

  if (!profile) return null

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
