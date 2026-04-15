import { useState, FormEvent } from 'react'
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { profileStorage } from '../../lib/storage'
import type { Profile, Skill, Experience, SocialLink } from '../../types'

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile>(() => profileStorage.get())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('basic')

  const update = (data: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...data }))
    setSaved(false)
  }

  const handleSave = async (e?: FormEvent) => {
    e?.preventDefault()
    setSaving(true)
    try {
      profileStorage.set(profile)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  // 技能操作
  const addSkill = () => {
    update({ skills: [...profile.skills, { name: '', level: 80, category: '前端' }] })
  }
  const updateSkill = (index: number, data: Partial<Skill>) => {
    const skills = profile.skills.map((s, i) => i === index ? { ...s, ...data } : s)
    update({ skills })
  }
  const removeSkill = (index: number) => {
    update({ skills: profile.skills.filter((_, i) => i !== index) })
  }

  // 经历操作
  const addExperience = () => {
    const exp: Experience = {
      type: 'work',
      title: '',
      organization: '',
      startDate: '',
      endDate: '',
      description: '',
    }
    update({ experiences: [...profile.experiences, exp] })
  }
  const updateExperience = (index: number, data: Partial<Experience>) => {
    const experiences = profile.experiences.map((e, i) => i === index ? { ...e, ...data } : e)
    update({ experiences })
  }
  const removeExperience = (index: number) => {
    update({ experiences: profile.experiences.filter((_, i) => i !== index) })
  }

  // 社交链接操作
  const addLink = () => {
    const link: SocialLink = { platform: '', url: '', icon: 'Link' }
    update({ links: [...profile.links, link] })
  }
  const updateLink = (index: number, data: Partial<SocialLink>) => {
    const links = profile.links.map((l, i) => i === index ? { ...l, ...data } : l)
    update({ links })
  }
  const removeLink = (index: number) => {
    update({ links: profile.links.filter((_, i) => i !== index) })
  }

  const SectionHeader = ({ id, label }: { id: string; label: string }) => (
    <button
      type="button"
      onClick={() => setActiveSection(activeSection === id ? '' : id)}
      className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
      {activeSection === id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
    </button>
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">个人信息</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 dark:text-green-400">已保存</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Save size={14} />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* 基本信息 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader id="basic" label="基本信息" />
          {activeSection === 'basic' && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">姓名/昵称</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => update({ name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">头像 URL</label>
                  <input
                    type="text"
                    value={profile.avatar}
                    onChange={e => update({ avatar: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">一句话简介</label>
                <input
                  type="text"
                  value={profile.bio}
                  onChange={e => update({ bio: e.target.value })}
                  placeholder="简短的自我介绍"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">关于我（Markdown）</label>
                <textarea
                  value={profile.about}
                  onChange={e => update({ about: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>
            </div>
          )}
        </div>

        {/* 技能列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader id="skills" label={`技能列表（${profile.skills.length}）`} />
          {activeSection === 'skills' && (
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
              {profile.skills.map((skill, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={e => updateSkill(i, { name: e.target.value })}
                    placeholder="技能名称"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={skill.category}
                    onChange={e => updateSkill(i, { category: e.target.value })}
                    placeholder="分类"
                    className="w-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2 w-36">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={e => updateSkill(i, { level: Number(e.target.value) })}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right">{skill.level}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(i)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full justify-center"
              >
                <Plus size={14} /> 添加技能
              </button>
            </div>
          )}
        </div>

        {/* 经历 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader id="experiences" label={`工作/教育经历（${profile.experiences.length}）`} />
          {activeSection === 'experiences' && (
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
              {profile.experiences.map((exp, i) => (
                <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={exp.type}
                      onChange={e => updateExperience(i, { type: e.target.value as 'work' | 'education' })}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="work">工作经历</option>
                      <option value="education">教育经历</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeExperience(i)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">职位/学位</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={e => updateExperience(i, { title: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">公司/学校</label>
                      <input
                        type="text"
                        value={exp.organization}
                        onChange={e => updateExperience(i, { organization: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">开始时间（如 2022-07）</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={e => updateExperience(i, { startDate: e.target.value })}
                        placeholder="2022-07"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">结束时间（留空表示至今）</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={e => updateExperience(i, { endDate: e.target.value })}
                        placeholder="至今"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">描述</label>
                    <textarea
                      value={exp.description}
                      onChange={e => updateExperience(i, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full justify-center"
              >
                <Plus size={14} /> 添加经历
              </button>
            </div>
          )}
        </div>

        {/* 社交链接 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SectionHeader id="links" label={`社交链接（${profile.links.length}）`} />
          {activeSection === 'links' && (
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
              {profile.links.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={link.platform}
                    onChange={e => updateLink(i, { platform: e.target.value })}
                    placeholder="平台（如 GitHub）"
                    className="w-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={link.icon}
                    onChange={e => updateLink(i, { icon: e.target.value })}
                    placeholder="图标（如 Github）"
                    className="w-28 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={e => updateLink(i, { url: e.target.value })}
                    placeholder="链接 URL"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addLink}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full justify-center"
              >
                <Plus size={14} /> 添加链接
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
