# 产品需求文档：简历生成系统

> 版本：v1.0 | 日期：2026-06-02 | 作者：产品经理

---

## 一、背景与目标

### 1.1 背景

当前项目 vibecoding-blog 是一个基于 React + TypeScript + Vite + Tailwind CSS 的个人博客平台，已有完善的个人信息管理（Profile）、文章管理、项目经历管理功能，并已集成 jspdf + html2canvas 依赖。

用户（博主）已在系统中维护了个人技能、工作经历、项目经历等数据，但缺少将这些数据转化为专业简历的能力。

### 1.2 产品目标

在现有博客平台上新增「简历生成系统」，帮助用户：
1. 通过交互式问答快速生成专业简历
2. 日常积累工作点滴，自动汇总为简历亮点
3. 从多种模板中选择并导出 PDF 简历

### 1.3 设计原则

- **短小简单**：功能精炼，不引入后端，所有数据存储在 localStorage
- **易部署**：保持纯前端 SPA，`npm run build` 即可部署
- **复用现有数据**：充分利用已有的 Profile（skills、experiences、projects）数据结构
- **渐进增强**：三个模块可独立使用，互不依赖，但数据互通

---

## 二、现有数据资产分析

### 2.1 可直接复用的类型（src/types/index.ts）

| 类型 | 关键字段 | 简历用途 |
|------|---------|---------|
| `Profile` | name, avatar, bio, about | 简历头部：姓名、头像、个人简介 |
| `Skill` | name, level, category | 技能清单（可按分类分组展示） |
| `Experience` | type, title, organization, startDate, endDate, description | 工作经历 + 教育背景 |
| `Project` | title, description, role, technologies, startDate, endDate | 项目经验 |
| `SocialLink` | platform, url | 联系方式 |

### 2.2 可复用的服务（src/services/）

| 服务 | 用途 |
|------|------|
| `profileService` | 读取/更新个人信息，简历数据的主要来源 |
| `storageUtils` | localStorage CRUD 封装，新模块直接复用 |
| `articleService` | 文章数据，点滴记录可参考其 CRUD 模式 |

### 2.3 已有依赖

- `jspdf` + `html2canvas`：PDF 导出能力已就绪
- `lucide-react`：图标库
- `dayjs`：日期处理
- `react-router-dom`：路由

---

## 三、核心功能模块

### 模块 A：交互式问答简历生成（优先级：P0）

#### 功能概述

通过分步问答引导用户补充/确认简历信息，最终一键生成 PDF 简历。降低简历制作门槛，尤其适合初次使用或不擅长排版的用户。

#### 用户故事

| 编号 | 用户故事 | 验收标准 |
|------|---------|---------|
| A-1 | 作为用户，我想通过回答问题来生成简历，这样不需要从零排版 | 进入问答页面后，系统分步展示问题，每步可填写/修改，最终生成简历 |
| A-2 | 作为用户，我希望系统自动填入我已有的个人信息，这样不用重复输入 | 问答开始时，自动从 Profile 读取已有数据作为默认值 |
| A-3 | 作为用户，我想预览生成的简历效果，确认后再导出 PDF | 问答完成后展示简历预览，用户确认后可导出 PDF |
| A-4 | 作为用户，我想选择不同的简历模板来生成 | 问答最后一步可选择模板样式 |

#### 问答流程设计（共 6 步）

```
Step 1: 基本信息  → 姓名、联系方式、一句话简介（预填 Profile 数据）
Step 2: 求职意向  → 期望职位、期望城市、薪资范围（新增字段）
Step 3: 工作经历  → 展示已有 experiences(work)，支持增删改
Step 4: 教育背景  → 展示已有 experiences(education)，支持增删改
Step 5: 项目经验  → 展示已有 projects，支持选择哪些项目放入简历
Step 6: 技能清单  → 展示已有 skills，支持增删改 + 选择模板 → 预览 → 导出
```

#### 需要新增的数据类型

```typescript
// 求职意向（Profile 中不存在，需新增）
interface JobIntention {
  targetPosition: string    // 期望职位
  targetCity: string        // 期望城市
  salaryRange?: string      // 薪资范围（可选）
  jobType?: 'full-time' | 'part-time' | 'freelance'  // 工作类型
}

// 简历数据快照（问答完成后的完整数据）
interface ResumeData {
  id: string
  templateId: string        // 使用的模板 ID
  basicInfo: {
    name: string
    phone?: string
    email?: string
    bio: string
    avatar?: string
    links: SocialLink[]
  }
  jobIntention?: JobIntention
  experiences: Experience[]   // 复用现有类型
  projects: Project[]         // 复用现有类型
  skills: Skill[]             // 复用现有类型
  createdAt: string
  updatedAt: string
}
```

---

### 模块 B：点滴记录（优先级：P1）

#### 功能概述

用户日常随手记录工作内容、成就、学到的技能，系统帮助汇总，用户可手动将记录整理为简历中的亮点描述。类似"工作日记"，降低简历维护成本。

#### 用户故事

| 编号 | 用户故事 | 验收标准 |
|------|---------|---------|
| B-1 | 作为用户，我想快速记录今天的工作亮点，这样不会忘记 | 提供简洁的输入界面，支持一句话快速记录 |
| B-2 | 作为用户，我想给记录打标签分类，方便后续整理 | 支持添加标签（如"技术突破"、"项目成果"、"团队协作"） |
| B-3 | 作为用户，我想按时间线查看我的所有记录 | 提供时间线视图，按日/周/月分组展示 |
| B-4 | 作为用户，我想将多条点滴记录合并为一段简历描述 | 支持选择多条记录，手动编辑合并为一段项目/工作经历描述 |
| B-5 | 作为用户，我想将汇总后的内容直接同步到简历数据中 | 合并后的描述可一键写入对应的 Experience 或 Project 的 description |

#### 需要新增的数据类型

```typescript
interface DailyNote {
  id: string
  content: string           // 记录内容（纯文本或简单 Markdown）
  tags: string[]            // 标签，如 ["技术突破", "React"]
  relatedProject?: string   // 关联的项目 ID（可选）
  relatedExperience?: string // 关联的工作经历（可选，按 organization 关联）
  createdAt: string         // 记录时间
}
```

#### 预设标签

系统提供一组默认标签供快速选择：
- 技术突破、项目成果、团队协作、问题解决、学习成长、流程优化

---

### 模块 C：简历模板与导出（优先级：P0）

#### 功能概述

提供多种简历模板，用户可预览不同模板的效果，选择心仪模板后导出 PDF。模板基于 HTML/CSS 渲染，通过 html2canvas + jspdf 导出。

#### 用户故事

| 编号 | 用户故事 | 验收标准 |
|------|---------|---------|
| C-1 | 作为用户，我想浏览多种简历模板 | 模板列表页展示所有可用模板的缩略预览 |
| C-2 | 作为用户，我想用自己的数据实时预览模板效果 | 点击模板后用用户真实数据渲染完整预览 |
| C-3 | 作为用户，我想一键导出 PDF 简历 | 预览页提供"导出 PDF"按钮，生成标准 A4 尺寸 PDF |
| C-4 | 作为用户，我想保存多份简历（不同模板/不同内容） | 支持保存多份 ResumeData 快照到 localStorage |

#### V1.0 模板规划（首期 3 个）

| 模板 ID | 名称 | 风格描述 |
|---------|------|---------|
| `classic` | 经典简约 | 黑白简约风，传统单栏布局，适合大多数场景 |
| `modern` | 现代双栏 | 左侧信息栏 + 右侧主内容，带主题色，适合技术岗 |
| `compact` | 紧凑一页 | 信息密度高的单页简历，适合经验丰富的求职者 |

---

## 四、页面与路由规划

### 4.1 新增路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/resume` | ResumeHub | 简历系统入口页，展示三个模块入口 |
| `/resume/create` | ResumeWizard | 交互式问答生成简历（分步表单） |
| `/resume/notes` | DailyNotes | 点滴记录列表 + 快速添加 |
| `/resume/templates` | ResumeTemplates | 模板浏览与预览 |
| `/resume/preview/:id` | ResumePreview | 简历预览与 PDF 导出 |

### 4.2 导航集成

在现有导航栏（Navbar）中新增"简历"菜单项，路由指向 `/resume`。

---

## 五、数据存储设计

所有数据基于现有 `storageUtils`（getItem/setItem），新增以下 localStorage key：

| Key | 数据类型 | 说明 |
|-----|---------|------|
| `blog_resumes` | `ResumeData[]` | 已保存的简历列表 |
| `blog_daily_notes` | `DailyNote[]` | 点滴记录列表 |
| `blog_resume_draft` | `Partial<ResumeData>` | 问答过程中的草稿（防丢失） |

---

## 六、功能优先级与迭代计划

### P0 - 第一期（核心 MVP）

| 功能 | 模块 | 工作量估算 |
|------|------|----------|
| 交互式问答流程（6 步） | A | 中 |
| 经典简约模板（classic） | C | 中 |
| PDF 导出功能 | C | 小 |
| 简历预览页 | C | 小 |
| 简历系统入口页 | - | 小 |

**P0 交付标准**：用户可以通过问答流程生成一份使用经典模板的 PDF 简历。

### P1 - 第二期（体验增强）

| 功能 | 模块 | 工作量估算 |
|------|------|----------|
| 点滴记录 CRUD | B | 中 |
| 点滴时间线视图 | B | 小 |
| 点滴汇总→简历描述 | B | 中 |
| 现代双栏模板（modern） | C | 中 |
| 紧凑一页模板（compact） | C | 中 |

**P1 交付标准**：用户可以日常记录工作亮点，并手动整理到简历中；可选择 3 种模板。

### P2 - 第三期（锦上添花）

| 功能 | 模块 | 工作量估算 |
|------|------|----------|
| 多份简历管理（列表/删除/复制） | A | 小 |
| 问答草稿自动保存 | A | 小 |
| 模板主题色自定义 | C | 小 |

---

## 七、技术约束与注意事项

1. **不引入后端**：所有数据存储在 localStorage，导出为纯前端 PDF 生成
2. **复用现有类型**：`Experience`、`Skill`、`Project`、`SocialLink` 直接复用，不重新定义
3. **复用现有服务模式**：新 service（resumeService、dailyNoteService）参照 articleService 的 CRUD 模式
4. **PDF 生成方案**：使用已有的 html2canvas + jspdf，将简历 HTML 渲染为 canvas 再转 PDF
5. **响应式**：简历编辑页面支持移动端，但 PDF 预览/导出按 A4 尺寸（210mm x 297mm）固定
6. **数据量限制**：localStorage 约 5MB，简历数据量极小，无需担心存储上限

---

## 八、验收标准总览

- [ ] 用户可从导航栏进入简历系统
- [ ] 问答流程可自动读取已有 Profile 数据作为默认值
- [ ] 问答完成后可预览简历
- [ ] 可选择模板并导出 PDF（A4 尺寸，内容清晰可读）
- [ ] 点滴记录可快速添加、查看、按标签筛选
- [ ] 点滴记录可手动汇总为简历描述并同步到 Profile
- [ ] 所有数据持久化在 localStorage，刷新不丢失
- [ ] 项目仍可通过 `npm run build` 正常构建和部署
