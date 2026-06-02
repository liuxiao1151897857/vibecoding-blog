# 简历模块：数据模型与功能定义

> 任务：`2b58b0a9-ace0-449b-916a-f17d70adc2b7`  
> 项目：vibecoding-blog（React + TypeScript + localStorage）  
> 类型代码：`src/types/resume.ts`、`src/types/resumeWizard.ts`

---

## 1. 与现有架构的关系

### 1.1 已有数据（保持不变）

| localStorage Key | 类型 | 说明 |
|------------------|------|------|
| `blog_profile` | `Profile` | 姓名、技能、经历、项目、链接（About/Home/PDF 已使用） |
| `blog_articles` | `Article[]` | 博客文章 |
| `blog_settings` | `Settings` | 博客设置 |
| `blog_admin_pwd` | `string` | 管理员密码哈希 |

`Profile` 字段与页面映射：

- `About.tsx`：展示 `about`、`skills`、`experiences`、`projects`、静态 MD 简历下载
- `Home.tsx`：`jspdf` 从 `profileStorage` 生成 PDF
- `profileService.ts` / `profileStorage`：读写 `blog_profile`

### 1.2 新增存储 Key（扩展，不破坏旧数据）

| Key | 类型 | 说明 |
|-----|------|------|
| `blog_daily_notes` | `DailyNote[]` | 点滴记录 |
| `blog_resume_wizard` | `ResumeWizardSession` | 问答向导进度 |
| `blog_resume_draft` | `Resume` | 当前简历草稿 |
| `blog_resume_snapshots` | `Resume[]` | 历史简历快照（可选） |
| `blog_resume_settings` | `ResumeSettings` | 模块偏好 |

**兼容原则**：

1. 不修改 `Profile` 结构；`Resume` 通过映射生成，可选回写 `Profile.projects` / `experiences`。
2. 新 Key 不存在时使用空数组 / 默认值，与 `getItem(key, default)` 模式一致。
3. `dataIO.export()` / `import()` 后续扩展时增加 `dailyNotes`、`resumeDraft` 字段（向后兼容）。

---

## 2. 核心数据模型摘要

### 2.1 Resume（简历主体）

聚合导出用快照，包含：

- `meta`：标题、状态、目标岗位、模板 ID
- `personal`：姓名、headline、联系方式、链接（对齐 `Profile`）
- `summary`：个人总结
- `skills`：复用 `Skill[]`
- `workExperiences` / `educations`：由 `Experience` 拆分并支持 `bullets[]`
- `projects`：增强 `Project`，含 `highlights[]`（STAR 成果点）
- `source`：追溯来源（profile / wizard / daily_notes / merged）

### 2.2 DailyNote（点滴记录）

| 字段 | 说明 |
|------|------|
| `content` | Markdown 正文 |
| `category` | 预设分类（见第 4 节） |
| `tags` | 自由标签 |
| `projectId` | 可选，关联 `Profile.projects[].id` |
| `noteDate` | 业务日期 YYYY-MM-DD |
| `summarized` | 是否已纳入简历汇总 |

### 2.3 ResumeTemplate（模板）

前端渲染配置：`layout` + `sections[]` 顺序与显隐，对应 Markdown/PDF 章节编排。内置 `tpl_classic_zh`、`tpl_modern_zh`。

### 2.4 ResumeWizardSession（问答会话）

保存 `answers[]`、`currentStepId`、`draftProjectIds`，对应 `blog_resume_wizard`。

---

## 3. Profile ↔ Resume 映射规则

```
Profile.name          → Resume.personal.name
Profile.bio           → Resume.personal.headline
Profile.links         → Resume.personal.links
Profile.skills        → Resume.skills
Experience(type=work) → ResumeWorkExperience (description → bullets 按行拆分)
Experience(type=education) → ResumeEducation
Project               → ResumeProjectEntry (description → summary, bullets 可空)
```

**合并优先级**（实现阶段约定）：

1. 用户向导 / 手动编辑的 `Resume` 字段优先  
2. 点滴汇总生成的 `bullets` 追加到对应 `projectId` 项目  
3. 空缺字段从 `Profile` 回填  

---

## 4. 点滴记录分类定义

| category | 中文 | 适用场景 | 简历转化建议 |
|----------|------|----------|----------------|
| `achievement` | 工作成就 | 上线里程碑、获奖、KPI 达标 | 转为工作经历/项目 bullet，强调数字 |
| `tech_growth` | 技术进步 | 新框架上手、重构、工具链 | 归入技能或项目技术栈说明 |
| `project_progress` | 项目进展 | 迭代、联调、交付 | 合并到对应 `projectId` 的 highlights |
| `problem_solved` | 问题解决 | 线上故障、性能瓶颈 | STAR 中的 Action/Result |
| `learning` | 学习笔记 | 课程、会议、读书 | 一般不进简历，可选入「其他」 |
| `communication` | 沟通协作 | 评审、跨团队、客户 | 工作经历 bullet（软技能） |
| `other` | 其他 | 无法归类 | 人工筛选后汇总 |

**推荐默认标签**（`tags`，自由输入）：`React`、`性能`、`上线`、`重构`、`会议`、`Bugfix`

---

## 5. 交互式问答步骤（问题清单）

完整配置见 `src/types/resumeWizard.ts`。

### 5.1 步骤总览

| 顺序 | stepId | 标题 | 目的 |
|------|--------|------|------|
| 1 | step_basic | 基本信息 | 姓名、headline、联系方式 |
| 2 | step_target | 求职目标 | 岗位、关键词、个人总结 |
| 3 | step_skills | 核心技能 | 主技能、次技能、年限 |
| 4 | step_work_latest | 最近一份工作 | 公司、职位、职责、成果、量化 |
| 5 | step_project_main | 代表项目 | STAR 四问 + 技术栈 |
| 6 | step_education | 教育背景 | 可跳过 |
| 7 | step_review | 确认生成 | 选模板、生成草稿 |

### 5.2 高效出题原则（为何这样设计）

1. **先目标后细节**：`targetRole` / `keywords` 在前，便于后续项目描述对齐 JD。  
2. **一条工作经历深挖**：MVP 只问「最近一份」，降低负担；多份经历从 `Profile` 带入或二期扩展 `step_work_more`。  
3. **STAR 单项目**：`background / action / result` 三问直接映射 `ResumeProjectEntry.highlights`。  
4. **量化单独一问**：`q_work_metric` 可选，避免压迫感但鼓励写数据。  
5. **月份格式统一**：与现有 `Experience.startDate` 一致，使用 `YYYY-MM`。  

### 5.3 二期可增步骤（Out of Scope MVP）

- `step_work_more`：第二、第三份工作  
- `step_projects_more`：第 2-3 个项目  
- `step_from_notes`：从点滴勾选纳入简历  

---

## 6. 功能范围定义

### 6.1 In Scope（建议实现顺序）

| 功能 ID | 描述 | 依赖数据 |
|---------|------|----------|
| F-01 | 点滴 CRUD（列表、筛选、按分类） | `DailyNote` + `blog_daily_notes` |
| F-02 | 点滴按时间/标签汇总为 bullets | `DailyNoteSummaryRequest/Result` |
| F-03 | 问答向导 UI + 进度持久化 | `ResumeWizardSession` |
| F-04 | 向导答案 → `Resume` 草稿 | `RESUME_WIZARD_*` |
| F-05 | `Profile` → `Resume` 映射 + 合并点滴 | mapper 函数 |
| F-06 | 按 `ResumeTemplate` 导出 Markdown | `Resume` |
| F-07 | 复用现有 jspdf 从 `Resume` 导出 PDF | `Resume` |
| F-08 | `dataIO` 扩展导入导出 | 新 Keys |

### 6.2 Out of Scope

- 后端 API、多用户、云端同步  
- 真实 LLM 调用（可预留 `AIConfig`，非本任务）  
- Word/.docx 模板引擎  

---

## 7. 存储层实现约定（供开发参考）

与 `storage.js` 保持一致风格：

```javascript
// KEYS 扩展
DAILY_NOTES: 'blog_daily_notes',
RESUME_WIZARD: 'blog_resume_wizard',
RESUME_DRAFT: 'blog_resume_draft',
// ...

dailyNoteStorage = {
  getAll() { return getItem(KEYS.DAILY_NOTES) || []; },
  create(data) { /* id: note_yyyymmdd_xxx */ },
  update(id, data) { /* updatedAt */ },
  delete(id) { },
  filter(predicate) { },
}
```

TypeScript 服务层可仿 `profileService.ts` 使用 `storageUtils.getItem/setItem`。

---

## 8. 验收检查清单

- [ ] `src/types/resume.ts` 导出 `Resume`、`DailyNote`、`ResumeTemplate` 等类型  
- [ ] `RESUME_STORAGE_KEYS` 与文档 Key 一致  
- [ ] `DailyNote` 与 `Profile.projects[].id` 可关联  
- [ ] `Resume` 可从 `Profile` 映射且不修改原 `blog_profile` 结构  
- [ ] 向导 7 步、30+ 题覆盖：基本信息、目标、技能、工作、项目 STAR、教育、确认  
- [ ] 6 类点滴分类 + `other` 有中文标签映射  
- [ ] 2 套内置 `ResumeTemplate` 定义章节顺序  

---

## 9. 文件索引

| 文件 | 内容 |
|------|------|
| `src/types/resume.ts` | 全部接口、存储 Key、默认模板与设置 |
| `src/types/resumeWizard.ts` | 向导步骤与问题静态配置 |
| `docs/resume-data-model.md` | 本文档 |
