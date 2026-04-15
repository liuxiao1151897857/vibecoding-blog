/**
 * 初始化示例数据（仅在 localStorage 为空时调用）
 */
import { articleService } from '@/services/articleService'
import { profileService } from '@/services/profileService'

export function seedIfEmpty() {
  const articles = articleService.getAll()
  if (articles.length > 0) return

  // 示例文章
  articleService.create({
    title: '欢迎来到我的博客',
    summary: '这是第一篇博客文章，介绍博客的基本功能和使用方法。',
    content: `# 欢迎来到我的博客

你好！这是我的第一篇博客文章。

## 功能介绍

- **文章展示**：支持 Markdown 渲染，代码高亮
- **文章管理**：在 /admin 页面管理文章
- **个人信息**：展示技能、经历、社交链接

## 快速开始

访问 [/admin](/admin) 进入管理后台，开始编写你的第一篇文章吧！

\`\`\`javascript
console.log('Hello, Blog!')
\`\`\`
`,
    tags: ['公告', '教程'],
    coverImage: '',
    status: 'published',
    pinned: true,
  })

  articleService.create({
    title: 'React Hooks 实践指南',
    summary: '深入理解 useState、useEffect、useMemo 等常用 Hooks 的使用场景和最佳实践。',
    content: `# React Hooks 实践指南

React Hooks 彻底改变了我们编写 React 组件的方式...

## useState

\`\`\`tsx
const [count, setCount] = useState(0)
\`\`\`

## useEffect

副作用管理的利器，注意正确填写依赖数组。
`,
    tags: ['React', '前端', 'JavaScript'],
    coverImage: '',
    status: 'published',
    pinned: false,
  })

  // 示例个人信息
  profileService.update({
    name: '张三',
    bio: '全栈工程师 | 开源爱好者 | 写代码，写生活',
    skills: [
      { name: 'React', level: 90, category: '前端' },
      { name: 'TypeScript', level: 85, category: '前端' },
      { name: 'Node.js', level: 75, category: '后端' },
    ],
    links: [
      { platform: 'GitHub', url: 'https://github.com', icon: 'Github' },
    ],
  })
}
