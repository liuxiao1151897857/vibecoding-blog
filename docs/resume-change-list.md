# 简历生成系统：文件改动清单

> 基于 [PRD](./PRD-resume-system.md) 与当前代码现状分析 | 2026-06-02

---

## 一、现有文件改动

| 文件路径 | 改动类型 | 具体改动说明 |
|---------|---------|-------------|
| `src/App.tsx` | **修改** | 新增 5 条路由：`/resume`（入口页）、`/resume/create`（问答向导）、`/resume/notes`（点滴记录）、`/resume/templates`（模板浏览）、`/resume/preview/:id`（预览导出）。均作为 Layout 子路由添加到 `children` 数组中，与现有 `/articles`、`/projects` 等平级 |
| `src/components/layout/Navbar.tsx` | **修改** | 在 `navLinks` 数组中新增 `{ to: '/resume', label: '简历' }`，建议插在"项目"和"AI"之间（即第 3 项位置），桌面端和移动端菜单会自动渲染 |
| `src/types/index.ts` | **无需改动** | 已在文件末尾通过 `export type { ... } from './resume'` 和 `export { ... } from './resumeWizard'` 完成所有简历类型导出。类型定义完备，无需额外修改 |
| `src/types/resume.ts` | **无需改动** | 已定义完整的类型体系：`Resume`、`DailyNote`、`ResumeTemplate`、`WizardQuestion`、`WizardStep`、`ResumeWizardSession` 等，以及 `RESUME_STORAGE_KEYS`、`DEFAULT_RESUME_TEMPLATES`、`DEFAULT_RESUME_SETTINGS` 等常量 |
| `src/types/resumeWizard.ts` | **无需改动** | 已定义 7 步向导（`RESUME_WIZARD_STEPS`）和 30+ 问题（`RESUME_WIZARD_QUESTIONS`），覆盖基本信息、求职目标、技能、工作、项目、教育、确认生成全流程 |
| `src/lib/storage.js` | **无需改动** | 旧版 JS 存储层，提供 `getItem`/`setItem`/`articleStorage`/`profileStorage` 等。新的简历服务应使用 TypeScript 版 `src/services/storageUtils.ts` 的 `getItem`/`setItem`，与 `articleService.ts`、`profileService.ts` 保持一致。`storage.js` 中的 `KEYS` 对象无需修改——简历模块的 key 已在 `src/types/resume.ts` 的 `RESUME_STORAGE_KEYS` 中独立定义 |
| `src/services/storageUtils.ts` | **无需改动** | 提供通用的 `getItem<T>`/`setItem<T>`/`removeItem`/`exportAllData`/`importAllData`，新 service 直接 import 复用即可 |

---

## 二、新增文件

### 2.1 服务层（参照 `articleService.ts` 的 CRUD 模式）

| 文件路径 | 改动类型 | 具体改动说明 |
|---------|---------|-------------|
| `src/services/resumeService.ts` | **新增** | 简历 CRUD 服务。参照 `articleService.ts` 的模式，使用 `storageUtils.getItem/setItem` 操作 `RESUME_STORAGE_KEYS.RESUME_SNAPSHOTS` key。核心方法：`getAll(): Resume[]`、`getById(id): Resume`、`create(data): Resume`、`update(id, data): Resume`、`delete(id): boolean`、`getDraft(): Resume | null`、`saveDraft(data): void`、`clearDraft(): void` |
| `src/services/dailyNoteService.ts` | **新增** | 点滴记录 CRUD 服务。参照 `articleService.ts` 模式，操作 `RESUME_STORAGE_KEYS.DAILY_NOTES` key。核心方法：`getAll(): DailyNote[]`、`query(filter: DailyNoteFilter): DailyNote[]`、`create(data): DailyNote`、`update(id, data): DailyNote`、`delete(id): boolean`、`getByDateRange(from, to): DailyNote[]`、`getAllTags(): string[]` |
| `src/services/resumeWizardService.ts` | **新增** | 问答向导会话管理。操作 `RESUME_STORAGE_KEYS.WIZARD_SESSION` key。核心方法：`getSession(): ResumeWizardSession | null`、`startSession(): ResumeWizardSession`、`saveAnswer(questionId, value): void`、`completeStep(stepId): void`、`buildResumeFromSession(session): Resume`（将向导答案映射为 Resume 对象） |
| `src/services/resumeMapper.ts` | **新增** | Profile ↔ Resume 数据映射工具。核心方法：`buildResumeFromProfile(profile, options): Resume`（将已有 Profile 数据映射为 Resume 初始值，对应 PRD 中"自动填入已有个人信息"需求）、`exportResumeToMarkdown(resume): string` |
| `src/services/pdfExportService.ts` | **新增** | PDF 导出服务。使用已有的 `html2canvas` + `jspdf` 依赖，核心方法：`exportToPDF(elementRef, filename): Promise<void>`（将 HTML 元素渲染为 A4 尺寸 PDF 并下载） |

### 2.2 页面组件

| 文件路径 | 改动类型 | 具体改动说明 |
|---------|---------|-------------|
| `src/pages/ResumeHub.tsx` | **新增** | 简历系统入口页（路由 `/resume`）。展示三大模块入口卡片：交互式问答、点滴记录、模板浏览。可展示已保存的简历列表快照 |
| `src/pages/ResumeWizard.tsx` | **新增** | 交互式问答页（路由 `/resume/create`）。分步表单 UI，按 `RESUME_WIZARD_STEPS` 顺序展示问题，自动从 Profile 预填数据，完成后跳转预览页 |
| `src/pages/DailyNotes.tsx` | **新增** | 点滴记录页（路由 `/resume/notes`）。包含快速添加表单 + 时间线列表 + 标签筛选。支持按分类/标签/日期过滤 |
| `src/pages/ResumeTemplates.tsx` | **新增** | 模板浏览页（路由 `/resume/templates`）。展示 `DEFAULT_RESUME_TEMPLATES` 中定义的模板缩略预览，点击后跳转预览页 |
| `src/pages/ResumePreview.tsx` | **新增** | 简历预览与导出页（路由 `/resume/preview/:id`）。渲染完整简历 HTML，提供"导出 PDF"按钮，支持模板切换 |

### 2.3 UI 子组件（按需拆分）

| 文件路径 | 改动类型 | 具体改动说明 |
|---------|---------|-------------|
| `src/components/resume/WizardStepBar.tsx` | **新增** | 向导步骤进度条，展示当前步骤和完成状态 |
| `src/components/resume/WizardStepForm.tsx` | **新增** | 单步问题表单，根据 `WizardQuestion.type` 渲染对应输入控件（text/textarea/tags/select/month/number） |
| `src/components/resume/TemplateCard.tsx` | **新增** | 模板缩略预览卡片，展示模板名称、描述和布局风格缩略图 |
| `src/components/resume/ResumeRenderer.tsx` | **新增** | 简历 HTML 渲染器，根据 `ResumeTemplate.layout`（classic/modern/minimal）和 `Resume` 数据渲染完整简历 HTML。是 PDF 导出的渲染源 |
| `src/components/resume/DailyNoteCard.tsx` | **新增** | 单条点滴记录卡片，展示内容、分类标签、日期 |
| `src/components/resume/DailyNoteForm.tsx` | **新增** | 点滴记录快速添加/编辑表单 |

---

## 三、复用关系汇总

| 现有资产 | 被复用方式 |
|---------|----------|
| `src/services/storageUtils.ts` → `getItem`/`setItem` | 所有新 service 直接 import 使用，不引入新的存储封装 |
| `src/services/profileService.ts` → `profileService.get()` | `resumeMapper.ts` 调用读取 Profile 数据，映射为 Resume 初始值 |
| `src/services/articleService.ts` 的代码模式 | 新 service（resumeService、dailyNoteService）参照其 CRUD 结构：常量 KEY → getAll → getById → create → update → delete |
| `src/types/resume.ts` 全部类型定义 | 页面和服务层直接通过 `@/types` 导入使用 |
| `src/types/resumeWizard.ts` → Steps & Questions | `ResumeWizard.tsx` 页面直接使用这些静态配置驱动表单渲染 |
| `src/utils/id.ts` → `generateId()` | 新 service 中生成 Resume/DailyNote 的 ID |
| `src/utils/date.ts` → `toISO()` | 新 service 中生成时间戳 |
| `jspdf` + `html2canvas`（package.json 已有） | `pdfExportService.ts` 直接 import 使用 |
| `lucide-react`（package.json 已有） | 新页面/组件的图标 |
| `dayjs`（package.json 已有） | 点滴记录的日期处理和显示 |

---

## 四、改动量估算

| 类别 | 文件数 | 说明 |
|------|-------|------|
| 修改现有文件 | 2 | App.tsx（路由）+ Navbar.tsx（导航） |
| 新增服务层 | 5 | resumeService + dailyNoteService + resumeWizardService + resumeMapper + pdfExportService |
| 新增页面 | 5 | ResumeHub + ResumeWizard + DailyNotes + ResumeTemplates + ResumePreview |
| 新增组件 | 6 | WizardStepBar + WizardStepForm + TemplateCard + ResumeRenderer + DailyNoteCard + DailyNoteForm |
| 无需改动 | 5 | types/index.ts + types/resume.ts + types/resumeWizard.ts + storageUtils.ts + storage.js |
| **合计** | **18 个文件**（2 修改 + 16 新增） | |
