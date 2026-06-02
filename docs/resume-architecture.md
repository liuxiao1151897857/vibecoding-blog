# 简历模块技术架构设计

> 版本：v1.0 | 日期：2026-06-02 | 架构目标：简单、零后端依赖、基于现有 localStorage 模式扩展

---

## 1. 现有架构分析

### 1.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| UI 框架 | React 18 + TypeScript | 函数组件 + Hooks |
| 路由 | react-router-dom 6 | `createBrowserRouter` 模式 |
| 样式 | Tailwind CSS 3 | 原子化 CSS，支持暗色模式 |
| 构建 | Vite 4 | 路径别名 `@` → `./src` |
| 存储 | localStorage | 通过 `storageUtils.ts` 封装 |
| PDF | jspdf + html2canvas | 已安装，尚未使用 |
| 工具库 | dayjs, lucide-react, react-markdown | 日期、图标、Markdown 渲染 |

### 1.2 现有分层模式

```
src/
├── types/          # TypeScript 类型定义（纯类型，无逻辑）
├── services/       # 服务层（storageUtils → xxxService 封装 CRUD）
├── lib/            # 底层存储（storage.js，旧版 JS 实现）
├── utils/          # 工具函数（id、date、markdown）
├── contexts/       # React Context（Auth、Theme）
├── components/     # 可复用组件
├── pages/          # 页面级组件
└── App.tsx         # 路由配置 + 初始化
```

**服务层约定**（从 articleService / profileService 提取的模式）：
- 每个领域一个 `xxxService.ts`，导出一个对象字面量
- 内部调用 `storageUtils.ts` 的 `getItem<T>(key, default)` / `setItem<T>(key, value)`
- 每个 service 自持一个 `KEY` 常量和一个 `DEFAULT_XXX` 默认值
- ID 生成统一使用 `utils/id.ts` 的 `generateId(prefix)`

### 1.3 已有的简历类型定义

**已完成**（无需修改）：
- `src/types/resume.ts` — 完整的简历数据模型，包含 Resume、DailyNote、ResumeTemplate、WizardQuestion/Step/Session 等全部类型定义，以及 `RESUME_STORAGE_KEYS` 存储键常量
- `src/types/resumeWizard.ts` — 7 步交互向导的步骤定义 `RESUME_WIZARD_STEPS` 和 30 道问题清单 `RESUME_WIZARD_QUESTIONS`

---

## 2. 新增模块设计

### 2.1 目录结构（新增文件一览）

```
src/
├── types/
│   ├── resume.ts                    # ✅ 已存在，无需修改
│   └── resumeWizard.ts              # ✅ 已存在，无需修改
│
├── services/
│   ├── resumeService.ts             # 🆕 简历 CRUD + 快照管理
│   ├── dailyNoteService.ts          # 🆕 点滴记录 CRUD + 筛选
│   ├── resumeWizardService.ts       # 🆕 向导会话管理
│   ├── resumeExportService.ts       # 🆕 PDF/Markdown 导出
│   └── resumeMapperService.ts       # 🆕 Profile ↔ Resume 数据映射
│
├── pages/
│   ├── Resume.tsx                   # 🆕 简历主页（预览 + 入口导航）
│   ├── ResumeWizard.tsx             # 🆕 交互式问答向导页
│   ├── ResumeEditor.tsx             # 🆕 简历编辑器（手动调整）
│   └── Notes.tsx                    # 🆕 点滴记录页（列表 + 新增）
│
├── components/
│   └── resume/
│       ├── ResumePreview.tsx         # 🆕 简历预览组件（渲染完整简历）
│       ├── ResumeTemplateClassic.tsx # 🆕 经典模板渲染
│       ├── ResumeTemplateModern.tsx  # 🆕 现代模板渲染
│       ├── WizardStepRenderer.tsx    # 🆕 向导单步渲染器
│       ├── WizardProgress.tsx        # 🆕 向导进度条
│       ├── NoteCard.tsx              # 🆕 点滴记录卡片
│       ├── NoteForm.tsx              # 🆕 点滴记录表单（新增/编辑）
│       └── ExportButton.tsx          # 🆕 导出按钮（PDF/Markdown）
│
└── App.tsx                          # 🔧 修改：新增 /resume、/notes 等路由
```

**需要修改的现有文件**：
| 文件 | 修改内容 |
|------|----------|
| `src/App.tsx` | 新增 4 条路由：`/resume`、`/resume/wizard`、`/resume/edit`、`/notes` |
| `src/components/layout/Navbar.tsx` | navLinks 数组新增「简历」「点滴」两个导航项 |

### 2.2 新增文件清单（共 16 个文件）

| # | 文件路径 | 类型 | 职责 |
|---|---------|------|------|
| 1 | `src/services/dailyNoteService.ts` | 服务 | 点滴记录 CRUD、筛选、标签聚合 |
| 2 | `src/services/resumeService.ts` | 服务 | 简历草稿/快照 CRUD、版本管理 |
| 3 | `src/services/resumeWizardService.ts` | 服务 | 向导会话生命周期管理 |
| 4 | `src/services/resumeMapperService.ts` | 服务 | Profile→Resume 转换、DailyNote 汇总 |
| 5 | `src/services/resumeExportService.ts` | 服务 | PDF(jspdf+html2canvas) / Markdown 导出 |
| 6 | `src/pages/Resume.tsx` | 页面 | 简历主页：预览当前草稿 + 入口按钮 |
| 7 | `src/pages/ResumeWizard.tsx` | 页面 | 多步向导交互页面 |
| 8 | `src/pages/ResumeEditor.tsx` | 页面 | 手动编辑简历各章节 |
| 9 | `src/pages/Notes.tsx` | 页面 | 点滴记录时间线 + 新增入口 |
| 10 | `src/components/resume/ResumePreview.tsx` | 组件 | 接收 Resume 数据，按模板渲染 |
| 11 | `src/components/resume/ResumeTemplateClassic.tsx` | 组件 | 经典布局 HTML 模板 |
| 12 | `src/components/resume/ResumeTemplateModern.tsx` | 组件 | 现代紧凑 HTML 模板 |
| 13 | `src/components/resume/WizardStepRenderer.tsx` | 组件 | 渲染单步问题列表 |
| 14 | `src/components/resume/WizardProgress.tsx` | 组件 | 步骤进度条 |
| 15 | `src/components/resume/NoteCard.tsx` | 组件 | 单条点滴记录卡片 |
| 16 | `src/components/resume/NoteForm.tsx` | 组件 | 新增/编辑点滴表单 |
| 17 | `src/components/resume/ExportButton.tsx` | 组件 | 导出 PDF/Markdown 按钮 |

---

## 3. 服务层接口设计

### 3.1 dailyNoteService.ts

```typescript
import type { DailyNote, DailyNoteFilter } from '@/types/resume'

const KEY = 'blog_daily_notes'

export const dailyNoteService = {
  getAll(): DailyNote[]
  getById(id: string): DailyNote | undefined
  query(filter: DailyNoteFilter): DailyNote[]
  create(data: Omit<DailyNote, 'id' | 'createdAt' | 'updatedAt' | 'summarized'>): DailyNote
  update(id: string, data: Partial<DailyNote>): DailyNote | null
  delete(id: string): boolean
  markSummarized(ids: string[], resumeId: string): void
  getAllTags(): string[]
  getByDateRange(from: string, to: string): DailyNote[]
}
```

**存储模式**：`localStorage['blog_daily_notes']` = `DailyNote[]`，与 articleService 完全一致的数组模式。

### 3.2 resumeService.ts

```typescript
import type { Resume, ResumeSettings } from '@/types/resume'

const DRAFT_KEY = 'blog_resume_draft'
const SNAPSHOTS_KEY = 'blog_resume_snapshots'
const SETTINGS_KEY = 'blog_resume_settings'

export const resumeService = {
  // --- 草稿 ---
  getDraft(): Resume | null
  saveDraft(resume: Resume): Resume
  clearDraft(): void

  // --- 快照（已保存版本） ---
  getSnapshots(): Resume[]
  getSnapshotById(id: string): Resume | undefined
  saveSnapshot(resume: Resume): Resume        // 将草稿保存为快照
  deleteSnapshot(id: string): boolean

  // --- 设置 ---
  getSettings(): ResumeSettings
  updateSettings(data: Partial<ResumeSettings>): ResumeSettings
}
```

**存储模式**：
- `blog_resume_draft` = `Resume | null`（单个对象，当前编辑中）
- `blog_resume_snapshots` = `Resume[]`（历史版本列表）
- `blog_resume_settings` = `ResumeSettings`（模板偏好等）

### 3.3 resumeWizardService.ts

```typescript
import type { ResumeWizardSession, WizardAnswer } from '@/types/resume'

const KEY = 'blog_resume_wizard'

export const resumeWizardService = {
  getSession(): ResumeWizardSession | null
  startSession(): ResumeWizardSession         // 创建新会话
  saveAnswer(questionId: string, value: string | string[] | number): void
  getAnswer(questionId: string): WizardAnswer | undefined
  completeStep(stepId: string): void
  goToStep(stepId: string): void
  completeSession(): ResumeWizardSession       // 标记为 completed
  abandonSession(): void                       // 标记为 abandoned
  clearSession(): void                         // 删除会话数据
}
```

**存储模式**：`blog_resume_wizard` = `ResumeWizardSession | null`（只维护一个进行中的会话）

### 3.4 resumeMapperService.ts

```typescript
import type { Profile } from '@/types'
import type { Resume, DailyNote, BuildResumeFromProfileOptions } from '@/types/resume'

export const resumeMapperService = {
  // Profile → Resume：从博客个人信息生成简历初始数据
  fromProfile(profile: Profile, options?: BuildResumeFromProfileOptions): Resume

  // Wizard answers → Resume：从向导回答构建简历
  fromWizardSession(sessionId?: string): Resume

  // DailyNotes → Resume bullets：汇总点滴记录为项目亮点
  summarizeNotes(notes: DailyNote[], projectId?: string): string[]

  // 合并多来源生成最终简历
  merge(sources: {
    profile?: Resume
    wizard?: Resume
    dailyNotes?: { projectId: string; bullets: string[] }[]
  }): Resume
}
```

### 3.5 resumeExportService.ts

```typescript
import type { Resume, ResumeTemplate } from '@/types/resume'

export const resumeExportService = {
  // 将简历渲染为 Markdown 字符串
  toMarkdown(resume: Resume, template?: ResumeTemplate): string

  // 将页面 DOM 元素导出为 PDF（基于 html2canvas + jspdf）
  toPDF(elementId: string, filename?: string): Promise<void>

  // 将简历数据导出为 JSON（备份/迁移用）
  toJSON(resume: Resume): string
}
```

**PDF 导出实现思路**：
```
1. 用 ResumePreview 组件渲染简历到一个隐藏的 DOM 容器（设定 A4 宽度 794px）
2. html2canvas 将 DOM 截图为 canvas
3. jspdf 创建 A4 尺寸文档，将 canvas 以图片形式插入
4. 调用 jspdf.save() 下载文件
```

---

## 4. 路由规划

### 4.1 新增路由表

| 路径 | 页面组件 | 说明 |
|------|---------|------|
| `/resume` | `Resume.tsx` | 简历主页：查看当前简历 + 入口导航 |
| `/resume/wizard` | `ResumeWizard.tsx` | 交互式问答向导 |
| `/resume/edit` | `ResumeEditor.tsx` | 手动编辑简历 |
| `/notes` | `Notes.tsx` | 点滴记录管理 |

### 4.2 App.tsx 路由修改

在现有 `Layout` 子路由数组中追加：

```tsx
{ path: 'resume',         element: <Resume /> },
{ path: 'resume/wizard',  element: <ResumeWizard /> },
{ path: 'resume/edit',    element: <ResumeEditor /> },
{ path: 'notes',          element: <Notes /> },
```

### 4.3 Navbar 修改

navLinks 数组新增：

```tsx
{ to: '/resume', label: '简历' },
{ to: '/notes',  label: '点滴' },
```

---

## 5. 数据流设计

### 5.1 三条生成路径

```
路径 A：Profile 快速生成
  Profile (profileService) 
    → resumeMapperService.fromProfile()
    → Resume 草稿 (resumeService.saveDraft)
    → 预览 / 编辑 / 导出

路径 B：向导交互生成
  用户逐步回答问题 (ResumeWizard 页面)
    → resumeWizardService 管理会话
    → 完成后 resumeMapperService.fromWizardSession()
    → Resume 草稿
    → 预览 / 编辑 / 导出

路径 C：点滴记录汇总
  日常记录点滴 (Notes 页面)
    → dailyNoteService CRUD
    → 生成简历时 resumeMapperService.summarizeNotes()
    → 汇总结果合并到 Resume.projects[].highlights
    → 预览 / 编辑 / 导出
```

### 5.2 合并策略

当用户同时有 Profile 数据、向导回答和点滴记录时：

```
优先级：向导回答 > Profile 数据 > 点滴汇总（仅补充 highlights）

resumeMapperService.merge({
  profile: fromProfile(profile),          // 基础框架
  wizard: fromWizardSession(),            // 覆盖用户明确填写的字段
  dailyNotes: summarizedByProject         // 追加到项目 highlights
}) → 最终 Resume
```

### 5.3 localStorage 键值总览

| Key | 类型 | 说明 |
|-----|------|------|
| `blog_daily_notes` | `DailyNote[]` | 点滴记录列表 |
| `blog_resume_wizard` | `ResumeWizardSession \| null` | 向导会话 |
| `blog_resume_draft` | `Resume \| null` | 当前简历草稿 |
| `blog_resume_snapshots` | `Resume[]` | 已保存的简历快照 |
| `blog_resume_settings` | `ResumeSettings` | 模块设置 |

（所有 Key 已在 `src/types/resume.ts` 的 `RESUME_STORAGE_KEYS` 中定义）

---

## 6. 依赖评估

### 6.1 现有依赖已满足

| 需求 | 现有依赖 | 状态 |
|------|---------|------|
| PDF 导出 | jspdf + html2canvas | ✅ 已安装 |
| 日期处理 | dayjs | ✅ 已安装 |
| 图标 | lucide-react | ✅ 已安装 |
| Markdown 渲染（简历预览中渲染 MD 内容） | react-markdown + remark-gfm | ✅ 已安装 |
| 路由 | react-router-dom | ✅ 已安装 |
| 样式 | tailwindcss | ✅ 已安装 |

### 6.2 无需额外依赖

当前依赖完全满足简历模块需求，**不建议引入新包**。理由：

- **表单管理**：向导表单较简单（7 步、每步 2-7 个字段），用 React state + 受控组件即可，无需 react-hook-form 等
- **状态管理**：数据持久化在 localStorage，页面状态用 useState/useReducer 足够，无需引入 zustand/redux
- **富文本编辑**：简历各字段均为纯文本或 Markdown，已有 react-markdown 渲染，无需富文本编辑器
- **拖拽排序**：V1 不需要拖拽调整章节顺序，后续如需可再引入

---

## 7. 实现顺序建议

分 4 个阶段，每个阶段产出可独立运行验证的增量：

### Phase 1：服务层基础（2 个文件）
```
1. src/services/dailyNoteService.ts    — 点滴 CRUD，最基础的数据操作
2. src/services/resumeService.ts       — 简历草稿/快照 CRUD
```
**验收标准**：service 函数可在控制台调用，数据正确读写 localStorage

### Phase 2：点滴记录功能（3 个文件）
```
3. src/components/resume/NoteCard.tsx   — 展示组件
4. src/components/resume/NoteForm.tsx   — 表单组件
5. src/pages/Notes.tsx                  — 整合页面
```
**验收标准**：`/notes` 页面可新增、编辑、删除、筛选点滴记录

### Phase 3：简历生成核心（8 个文件）
```
6. src/services/resumeMapperService.ts         — 数据转换
7. src/services/resumeWizardService.ts         — 向导会话
8. src/components/resume/WizardProgress.tsx     — 进度条
9. src/components/resume/WizardStepRenderer.tsx — 单步渲染
10. src/pages/ResumeWizard.tsx                  — 向导页面
11. src/components/resume/ResumeTemplateClassic.tsx — 经典模板
12. src/components/resume/ResumeTemplateModern.tsx  — 现代模板
13. src/components/resume/ResumePreview.tsx      — 预览组件
```
**验收标准**：完成向导 7 步问答后生成简历草稿，可在预览组件中查看

### Phase 4：编辑与导出（4 个文件 + 2 个修改）
```
14. src/services/resumeExportService.ts     — 导出逻辑
15. src/components/resume/ExportButton.tsx   — 导出按钮
16. src/pages/ResumeEditor.tsx               — 编辑页面
17. src/pages/Resume.tsx                     — 主页整合

修改：
18. src/App.tsx                              — 新增路由
19. src/components/layout/Navbar.tsx         — 新增导航项
```
**验收标准**：完整流程可跑通 — 点滴记录 → 向导生成 → 预览编辑 → PDF 下载

---

## 8. 风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| localStorage 5MB 限制 | 大量点滴记录可能接近上限 | 单条 DailyNote 限制正文 2000 字；resumeService 快照最多保留 10 份 |
| html2canvas 中文渲染 | PDF 中可能出现字体缺失 | 简历预览容器使用系统中文字体栈（`"PingFang SC", "Microsoft YaHei", sans-serif"`） |
| html2canvas 分页 | 长简历超一页时截断 | 实现时按 A4 高度（1123px @96dpi）分片渲染，逐页添加到 PDF |
| Profile 数据同步 | Profile 修改后简历草稿不自动更新 | 在 Resume 主页提示「Profile 已更新，是否重新生成？」；不做自动同步以避免覆盖手动编辑 |
| 向导中途退出 | 用户关闭页面，数据丢失 | 每步回答实时写入 localStorage，重新打开自动恢复进度 |

---

## 9. 架构决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 简历数据独立存储 vs 复用 Profile | 独立存储 + 映射 | 简历需要定制化调整，不应反写 Profile；通过 mapper 单向转换 |
| 向导会话存储位置 | localStorage | 保持零后端一致性；会话数据量小（< 5KB） |
| PDF 方案 | html2canvas + jspdf | 已安装、零成本；渲染结果所见即所得；缺点是非矢量 PDF |
| 模板系统 | 代码组件（非 JSON 配置） | V1 只有 2 个模板，React 组件直接渲染比模板引擎更灵活可控 |
| 新增包 | 不引入 | 保持项目轻量，现有依赖满足所有需求 |
