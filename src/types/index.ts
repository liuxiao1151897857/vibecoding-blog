// ============================================================
// 博客系统核心类型定义
// ============================================================

// ---- 文章 --------------------------------------------------

export type ArticleStatus = 'draft' | 'published'

export interface Article {
  /** UUID，如 "art_20260415_abc123" */
  id: string
  /** 文章标题 */
  title: string
  /** URL 友好标识，如 "my-first-post" */
  slug: string
  /** 文章摘要（手动填写或取正文前 200 字） */
  summary: string
  /** Markdown 原文 */
  content: string
  /** 标签列表，如 ["React", "前端"] */
  tags: string[]
  /** 封面图 URL（可选） */
  coverImage?: string
  /** 草稿 / 已发布 */
  status: ArticleStatus
  /** 是否置顶 */
  pinned: boolean
  /** ISO 8601 时间戳 */
  createdAt: string
  /** ISO 8601 时间戳 */
  updatedAt: string
  /** 字数（自动计算） */
  wordCount: number
  /** 预计阅读时间（分钟，自动计算） */
  readTime?: number
}

// ---- 个人信息 -----------------------------------------------

export interface Skill {
  /** 技能名称 */
  name: string
  /** 熟练度 0-100 */
  level: number
  /** 分类，如 "前端"、"后端" */
  category: string
}

export type ExperienceType = 'work' | 'education'

export interface Experience {
  /** 工作 / 教育 */
  type: ExperienceType
  /** 职位/学位 */
  title: string
  /** 公司/学校 */
  organization: string
  /** 开始时间，如 "2022-07" */
  startDate: string
  /** 结束时间，为空表示"至今" */
  endDate?: string
  /** 描述 */
  description: string
}

export interface SocialLink {
  /** 平台名，如 "GitHub" */
  platform: string
  /** 链接 URL */
  url: string
  /** lucide-react 图标名 */
  icon: string
}

export interface Profile {
  /** 姓名/昵称 */
  name: string
  /** 头像 URL 或 base64 */
  avatar: string
  /** 一句话简介 */
  bio: string
  /** 关于我 Markdown 全文 */
  about: string
  /** 技能列表 */
  skills: Skill[]
  /** 经历列表 */
  experiences: Experience[]
  /** 项目经历列表 */
  projects: Project[]
  /** 社交链接 */
  links: SocialLink[]
}

// ---- 项目经历 -----------------------------------------------

export interface Project {
  /** 项目ID */
  id: string
  /** 项目名称 */
  title: string
  /** 项目描述 */
  description: string
  /** 项目角色 */
  role: string
  /** 使用的技术栈 */
  technologies: string[]
  /** 项目链接（GitHub、在线演示等） */
  links?: {
    github?: string
    demo?: string
    other?: string
  }
  /** 项目图片 */
  image?: string
  /** 开始时间 */
  startDate: string
  /** 结束时间 */
  endDate?: string
  /** 是否置顶展示 */
  featured: boolean
}

// ---- AI 模块配置 -------------------------------------------

export interface AIModule {
  /** 模块ID */
  id: string
  /** 模块名称 */
  name: string
  /** 模块描述 */
  description: string
  /** 提示词模板 */
  promptTemplate: string
  /** 是否启用 */
  enabled: boolean
}

export interface AIConfig {
  /** AI 模块列表 */
  modules: AIModule[]
  /** 默认模型 */
  defaultModel: string
  /** API Key（本地演示使用模拟数据） */
  apiKey?: string
}

// ---- 博客配置 -----------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system'

export interface Settings {
  /** 博客标题 */
  blogTitle: string
  /** 副标题 */
  blogSubtitle: string
  /** 每页文章数，默认 10 */
  postsPerPage: number
  /** 主题模式 */
  theme: ThemeMode
  /** 主题色，如 "#6366f1" */
  primaryColor: string
  /** 页脚文字 */
  footerText: string
  /** 是否开启搜索 */
  enableSearch: boolean
}

// ---- 工具类型 -----------------------------------------------

/** 文章列表分页结果 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 文章筛选参数 */
export interface ArticleFilter {
  keyword?: string
  tags?: string[]
  status?: ArticleStatus
  page?: number
  pageSize?: number
}

// ---- 简历模块（详见 src/types/resume.ts）---------------------

export type {
  BuildResumeFromProfileOptions,
  DailyNote,
  DailyNoteCategory,
  DailyNoteFilter,
  DailyNoteSummaryRequest,
  DailyNoteSummaryResult,
  Resume,
  ResumeEducation,
  ResumeMeta,
  ResumePersonal,
  ResumeProjectEntry,
  ResumeSection,
  ResumeSettings,
  ResumeSkill,
  ResumeSource,
  ResumeSourceKind,
  ResumeStatus,
  ResumeTemplate,
  ResumeTemplateLayout,
  ResumeTemplateSection,
  ResumeWizardSession,
  ResumeWorkExperience,
  WizardAnswer,
  WizardQuestion,
  WizardStep,
} from './resume'

export {
  DAILY_NOTE_CATEGORY_LABELS,
  DEFAULT_RESUME_SETTINGS,
  DEFAULT_RESUME_TEMPLATES,
  RESUME_STORAGE_KEYS,
} from './resume'

export { RESUME_WIZARD_QUESTIONS, RESUME_WIZARD_STEPS } from './resumeWizard'
