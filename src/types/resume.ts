// ============================================================
// 简历模块类型定义
// 与 blog_profile 兼容：可通过 Profile 映射生成 Resume，也可独立存储
// localStorage keys 见 docs/resume-data-model.md
// ============================================================

import type { Skill, SocialLink } from './index'

// ---- 存储 Key（与 src/lib/storage.js KEYS 对齐扩展）----------------

export const RESUME_STORAGE_KEYS = {
  /** 点滴记录列表 DailyNote[] */
  DAILY_NOTES: 'blog_daily_notes',
  /** 问答向导进度 ResumeWizardSession | null */
  WIZARD_SESSION: 'blog_resume_wizard',
  /** 当前编辑中的简历草稿 Resume */
  RESUME_DRAFT: 'blog_resume_draft',
  /** 已保存的简历快照 Resume[] */
  RESUME_SNAPSHOTS: 'blog_resume_snapshots',
  /** 简历模块设置（模板偏好、汇总规则等） */
  RESUME_SETTINGS: 'blog_resume_settings',
} as const

// ---- 点滴记录分类 -------------------------------------------

/** 点滴记录预设分类（用户也可通过 tags 自由扩展） */
export type DailyNoteCategory =
  | 'achievement'        // 工作成就：可量化成果、获奖、里程碑
  | 'tech_growth'        // 技术进步：新技能、踩坑总结、最佳实践
  | 'project_progress'   // 项目进展：迭代、上线、协作
  | 'problem_solved'     // 问题解决：故障排查、性能优化
  | 'learning'           // 学习笔记：课程、读书、会议收获
  | 'communication'      // 沟通协作：评审、跨团队、客户反馈
  | 'other'              // 其他

export const DAILY_NOTE_CATEGORY_LABELS: Record<DailyNoteCategory, string> = {
  achievement: '工作成就',
  tech_growth: '技术进步',
  project_progress: '项目进展',
  problem_solved: '问题解决',
  learning: '学习笔记',
  communication: '沟通协作',
  other: '其他',
}

/** 单条点滴记录（DailyNote） */
export interface DailyNote {
  /** 唯一 ID，格式建议 note_yyyymmdd_xxxxxx */
  id: string
  /** 正文，支持 Markdown */
  content: string
  /** 预设分类 */
  category: DailyNoteCategory
  /** 自由标签，如 ["React", "性能优化"] */
  tags: string[]
  /** 关联 Profile.projects[].id，可选 */
  projectId?: string
  /** 记录日期（业务日期，可与 createdAt 不同），ISO 8601 日期 YYYY-MM-DD */
  noteDate: string
  /** 是否已纳入某次简历汇总 */
  summarized: boolean
  /** 纳入汇总时关联的 resumeId，可选 */
  resumeId?: string
  createdAt: string
  updatedAt: string
}

/** 点滴筛选条件 */
export interface DailyNoteFilter {
  category?: DailyNoteCategory
  tags?: string[]
  projectId?: string
  dateFrom?: string
  dateTo?: string
  summarized?: boolean
  keyword?: string
}

// ---- 简历主体 Resume ----------------------------------------

export type ResumeStatus = 'draft' | 'ready' | 'archived'

/** 简历数据来源，便于追溯与合并策略 */
export type ResumeSourceKind = 'profile' | 'wizard' | 'daily_notes' | 'manual' | 'merged'

export interface ResumeSource {
  kind: ResumeSourceKind
  /** 合并时记录各来源版本时间 */
  profileUpdatedAt?: string
  wizardSessionId?: string
  dailyNoteIds?: string[]
}

/** 简历元信息 */
export interface ResumeMeta {
  /** 简历标题，如「前端工程师-2026Q2」 */
  title: string
  status: ResumeStatus
  /** 目标岗位 / JD 摘要，用于定制侧重点 */
  targetRole?: string
  targetKeywords?: string[]
  /** 使用的导出模板 ID */
  templateId: string
  locale: 'zh-CN' | 'en-US'
}

/** 个人信息块（与 Profile 字段对齐，便于双向同步） */
export interface ResumePersonal {
  name: string
  avatar?: string
  /** 一句话定位，对应 Profile.bio */
  headline: string
  email?: string
  phone?: string
  location?: string
  links: SocialLink[]
}

/** 技能（复用 Skill，简历展示时可只取 name + category） */
export type ResumeSkill = Skill

/** 工作经历（由 Experience type=work 映射） */
export interface ResumeWorkExperience {
  id: string
  title: string
  organization: string
  startDate: string
  endDate?: string
  /** 职责与成果，建议 bullet 列表 */
  bullets: string[]
  /** 原始长描述（可选，导出时可省略） */
  description?: string
}

/** 教育背景（由 Experience type=education 映射） */
export interface ResumeEducation {
  id: string
  degree: string
  school: string
  startDate: string
  endDate?: string
  bullets: string[]
  description?: string
}

/** 项目经历条目（由 Project 增强，支持 STAR） */
export interface ResumeProjectEntry {
  id: string
  title: string
  role: string
  startDate: string
  endDate?: string
  /** 一句话概述 */
  summary?: string
  /** 成果要点，用于简历 bullet */
  highlights: string[]
  technologies: string[]
  links?: {
    github?: string
    demo?: string
    other?: string
  }
  featured?: boolean
}

/** 自定义章节（证书、开源、语言等） */
export interface ResumeSection {
  id: string
  title: string
  items: string[]
  order: number
}

/**
 * 简历主体：可导出 PDF/Markdown 的完整快照
 * 生成策略：Profile + Wizard 答案 + DailyNote 汇总 → merge → Resume
 */
export interface Resume {
  id: string
  version: number
  meta: ResumeMeta
  personal: ResumePersonal
  /** 个人总结 / 求职意向（2-4 句） */
  summary?: string
  skills: ResumeSkill[]
  workExperiences: ResumeWorkExperience[]
  educations: ResumeEducation[]
  projects: ResumeProjectEntry[]
  customSections?: ResumeSection[]
  source: ResumeSource
  createdAt: string
  updatedAt: string
}

// ---- 简历模板 ResumeTemplate -------------------------------

export type ResumeTemplateLayout = 'classic' | 'modern' | 'minimal'

export type ResumeSectionKey =
  | 'personal'
  | 'summary'
  | 'skills'
  | 'work'
  | 'education'
  | 'projects'
  | 'custom'

export interface ResumeTemplateSection {
  key: ResumeSectionKey
  title: string
  enabled: boolean
  order: number
}

/** 导出模板定义（纯前端渲染配置，非 Word 模板文件） */
export interface ResumeTemplate {
  id: string
  name: string
  description: string
  layout: ResumeTemplateLayout
  sections: ResumeTemplateSection[]
  /** Markdown 渲染时的章节标题映射 */
  sectionTitles: Partial<Record<ResumeSectionKey, string>>
  /** 是否默认模板 */
  isDefault?: boolean
}

export const DEFAULT_RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'tpl_classic_zh',
    name: '经典中文',
    description: '传统分段式：个人信息 → 总结 → 技能 → 工作 → 项目 → 教育',
    layout: 'classic',
    isDefault: true,
    sections: [
      { key: 'personal', title: '个人信息', enabled: true, order: 0 },
      { key: 'summary', title: '个人总结', enabled: true, order: 1 },
      { key: 'skills', title: '专业技能', enabled: true, order: 2 },
      { key: 'work', title: '工作经历', enabled: true, order: 3 },
      { key: 'projects', title: '项目经历', enabled: true, order: 4 },
      { key: 'education', title: '教育背景', enabled: true, order: 5 },
    ],
    sectionTitles: {
      personal: '基本信息',
      summary: '个人总结',
      skills: '专业技能',
      work: '工作经历',
      education: '教育背景',
      projects: '项目经历',
    },
  },
  {
    id: 'tpl_modern_zh',
    name: '现代紧凑',
    description: '技能与项目前置，适合技术岗一页简历',
    layout: 'modern',
    sections: [
      { key: 'personal', title: '个人信息', enabled: true, order: 0 },
      { key: 'skills', title: '技能', enabled: true, order: 1 },
      { key: 'projects', title: '项目', enabled: true, order: 2 },
      { key: 'work', title: '工作', enabled: true, order: 3 },
      { key: 'summary', title: '关于我', enabled: true, order: 4 },
      { key: 'education', title: '教育', enabled: false, order: 5 },
    ],
    sectionTitles: {},
  },
]

// ---- 交互式问答向导 -----------------------------------------

export type WizardQuestionType =
  | 'text'
  | 'textarea'
  | 'month'       // YYYY-MM
  | 'tags'        // 逗号分隔或标签输入
  | 'select'
  | 'multi_select'
  | 'number'

export interface WizardQuestionOption {
  value: string
  label: string
}

/** 单道向导题定义（静态配置，存于代码或 RESUME_SETTINGS） */
export interface WizardQuestion {
  id: string
  stepId: string
  /** 写入 Resume 的字段路径，如 projects[0].highlights */
  fieldPath: string
  type: WizardQuestionType
  label: string
  placeholder?: string
  required: boolean
  options?: WizardQuestionOption[]
  /** 校验：最少字符数 */
  minLength?: number
  helpText?: string
}

export interface WizardStep {
  id: string
  title: string
  description?: string
  order: number
  questionIds: string[]
}

/** 用户对单题的回答 */
export interface WizardAnswer {
  questionId: string
  value: string | string[] | number
  updatedAt: string
}

/** 向导会话（持久化到 blog_resume_wizard） */
export interface ResumeWizardSession {
  id: string
  currentStepId: string
  answers: WizardAnswer[]
  /** 向导过程中临时生成的项目/经历 ID */
  draftProjectIds: string[]
  completedStepIds: string[]
  status: 'in_progress' | 'completed' | 'abandoned'
  createdAt: string
  updatedAt: string
}

// ---- 点滴 → 简历 汇总结果 -----------------------------------

export interface DailyNoteSummaryRequest {
  noteIds?: string[]
  filter?: DailyNoteFilter
  targetProjectId?: string
  /** 输出风格：bullet 列表 | 段落 */
  outputStyle: 'bullets' | 'paragraph'
}

export interface DailyNoteSummaryResult {
  id: string
  sourceNoteIds: string[]
  /** 生成的简历素材文本 */
  content: string
  bullets: string[]
  suggestedProjectId?: string
  createdAt: string
}

// ---- 模块设置 -----------------------------------------------

export interface ResumeSettings {
  defaultTemplateId: string
  /** 汇总点滴时默认时间范围（天） */
  dailyNoteSummaryDays: number
  /** 导出时是否包含 Profile.about 全文 */
  includeAboutInExport: boolean
  lastWizardSessionId?: string
}

export const DEFAULT_RESUME_SETTINGS: ResumeSettings = {
  defaultTemplateId: 'tpl_classic_zh',
  dailyNoteSummaryDays: 30,
  includeAboutInExport: false,
}

// ---- Profile ↔ Resume 映射（实现见 services/resumeMapper.ts）---

/** 从 Profile 构建 Resume 时的可选覆盖项 */
export interface BuildResumeFromProfileOptions {
  templateId?: string
  targetRole?: string
  /** 是否将 experience.description 拆成 bullets */
  splitDescriptionToBullets?: boolean
}
