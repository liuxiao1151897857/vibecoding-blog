import type { Profile } from '@/types'
import { getItem, setItem } from './storageUtils'

const KEY = 'blog_profile'

const DEFAULT_PROFILE: Profile = {
  name: '张伟',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  bio: '全栈开发者 | AI 爱好者 | 热爱分享技术与生活',
  about: '# 关于我\n\n我是一名热爱技术的全栈开发者，专注于前端工程化、AI 应用开发和用户体验设计。过去 5 年我参与过多个大型项目，从 0 到 1 构建过多个 SaaS 产品。\n\n**核心价值观**：\n- 代码优雅\n- 用户至上\n- 持续学习',
  skills: [
    { name: 'React', level: 95, category: '前端' },
    { name: 'TypeScript', level: 90, category: '前端' },
    { name: 'Next.js', level: 85, category: '前端' },
    { name: 'Node.js', level: 88, category: '后端' },
    { name: 'Python', level: 75, category: 'AI' },
    { name: 'Tailwind CSS', level: 92, category: '前端' },
  ],
  experiences: [
    {
      type: 'work',
      title: '高级前端工程师',
      organization: '字节跳动',
      startDate: '2023-03',
      endDate: '',
      description: '负责公司核心 SaaS 产品的迭代开发，主导了新版本 UI 重构，提升了 40% 用户满意度。',
    },
    {
      type: 'work',
      title: '全栈工程师',
      organization: '腾讯',
      startDate: '2021-07',
      endDate: '2023-02',
      description: '参与企业微信生态建设，开发了多个企业级插件，日活跃用户超 10w+。',
    },
    {
      type: 'education',
      title: '计算机科学与技术',
      organization: '清华大学',
      startDate: '2017-09',
      endDate: '2021-06',
      description: '主修人工智能方向，获得优秀毕业设计奖。',
    },
  ],
  projects: [
    {
      id: 'proj_001',
      title: 'VibeCoding - AI 编程助手',
      description: '一个基于大模型的智能代码助手，支持代码生成、调试、文档生成等功能。已服务数千开发者。',
      role: '独立开发者 & 主导者',
      technologies: ['Next.js', 'TypeScript', 'OpenAI', 'Tailwind', 'Vercel'],
      links: {
        github: 'https://github.com/example/vibecoding',
        demo: 'https://vibecoding.dev'
      },
      image: 'https://picsum.photos/id/1015/600/400',
      startDate: '2024-06',
      endDate: '至今',
      featured: true
    },
    {
      id: 'proj_002',
      title: '智能简历生成器',
      description: 'AI 驱动的简历优化工具，能根据职位描述智能生成个性化简历，并提供 ATS 优化建议。',
      role: '全栈开发者',
      technologies: ['React', 'Python', 'FastAPI', 'LangChain', 'PDF.js'],
      links: {
        demo: 'https://resume.vibecoding.dev'
      },
      image: 'https://picsum.photos/id/106/600/400',
      startDate: '2024-01',
      endDate: '2024-05',
      featured: true
    },
    {
      id: 'proj_003',
      title: '个人博客系统',
      description: '使用 React + Vite + Tailwind 构建的现代化博客平台，支持 Markdown、暗黑模式、SEO 优化和管理员后台。',
      role: '独立开发者',
      technologies: ['React', 'TypeScript', 'Tailwind', 'Vite', 'localStorage'],
      links: {
        github: 'https://github.com/yourname/vibecoding-blog'
      },
      image: 'https://picsum.photos/id/201/600/400',
      startDate: '2025-01',
      endDate: '2025-04',
      featured: false
    }
  ],
  links: [
    { platform: 'GitHub', url: 'https://github.com', icon: 'Github' },
    { platform: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
    { platform: 'Email', url: 'mailto:example@email.com', icon: 'Mail' },
  ],
}

export const profileService = {
  get(): Profile {
    return getItem<Profile>(KEY, DEFAULT_PROFILE)
  },

  update(data: Partial<Profile>): Profile {
    const current = this.get()
    const updated = { ...current, ...data }
    setItem(KEY, updated)
    return updated
  },
}
