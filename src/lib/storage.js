/**
 * localStorage 数据层模块
 * 提供文章、个人信息、设置、认证的 CRUD 操作封装
 */

// ==================== Storage Keys ====================
export const KEYS = {
  ARTICLES: 'blog_articles',
  PROFILE: 'blog_profile',
  SETTINGS: 'blog_settings',
  ADMIN_PWD: 'blog_admin_pwd',
  INITIALIZED: 'blog_initialized',
};

// ==================== 底层工具函数 ====================
function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeItem(key) {
  localStorage.removeItem(key);
}

// ==================== ID 生成 ====================
function generateId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randPart = Math.random().toString(36).slice(2, 8);
  return `art_${datePart}_${randPart}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || `post-${Date.now()}`;
}

// ==================== 字数统计 ====================
function countWords(content) {
  if (!content) return 0;
  // 中文字符按字计，英文按词计
  const chinese = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (content.replace(/[\u4e00-\u9fa5]/g, ' ').match(/\b\w+\b/g) || []).length;
  return chinese + english;
}

function estimateReadTime(wordCount) {
  // 中文阅读速度约 500 字/分钟
  const minutes = Math.ceil(wordCount / 500);
  return Math.max(1, minutes);
}

// ==================== 密码哈希（SHA-256） ====================
export async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==================== 管理员认证 ====================
export const authStorage = {
  hasPassword() {
    return !!getItem(KEYS.ADMIN_PWD);
  },
  async setPassword(password) {
    const hash = await hashPassword(password);
    return setItem(KEYS.ADMIN_PWD, hash);
  },
  async verifyPassword(password) {
    const stored = getItem(KEYS.ADMIN_PWD);
    if (!stored) return false;
    const hash = await hashPassword(password);
    return hash === stored;
  },
};

// ==================== 文章 CRUD ====================
export const articleStorage = {
  /** 获取全部文章（原始数据） */
  getAll() {
    return getItem(KEYS.ARTICLES) || [];
  },

  /** 获取已发布文章，按置顶+时间倒序排列 */
  getPublished() {
    const all = this.getAll();
    return all
      .filter(a => a.status === 'published')
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  },

  /** 按 ID 查找文章 */
  getById(id) {
    return this.getAll().find(a => a.id === id) || null;
  },

  /** 按 slug 查找文章 */
  getBySlug(slug) {
    return this.getAll().find(a => a.slug === slug) || null;
  },

  /** 搜索文章（标题 + 内容 + 标签） */
  search(query, tags = []) {
    const all = this.getPublished();
    const q = query.toLowerCase();
    return all.filter(a => {
      const matchQuery = !q ||
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q);
      const matchTags = tags.length === 0 ||
        tags.every(t => a.tags.includes(t));
      return matchQuery && matchTags;
    });
  },

  /** 获取所有标签（去重） */
  getAllTags() {
    const all = this.getPublished();
    const tagSet = new Set();
    all.forEach(a => a.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  },

  /** 新增文章 */
  create(data) {
    const all = this.getAll();
    const now = new Date().toISOString();
    const wordCount = countWords(data.content || '');
    const article = {
      id: generateId(),
      slug: data.slug || slugify(data.title || ''),
      title: data.title || '无标题',
      summary: data.summary || (data.content || '').slice(0, 200),
      content: data.content || '',
      tags: data.tags || [],
      coverImage: data.coverImage || '',
      status: data.status || 'draft',
      pinned: data.pinned || false,
      wordCount,
      readTime: estimateReadTime(wordCount),
      createdAt: now,
      updatedAt: now,
    };
    all.unshift(article);
    setItem(KEYS.ARTICLES, all);
    return article;
  },

  /** 更新文章 */
  update(id, data) {
    const all = this.getAll();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const wordCount = countWords(data.content || all[idx].content);
    const updated = {
      ...all[idx],
      ...data,
      id, // 防止覆盖 id
      wordCount,
      readTime: estimateReadTime(wordCount),
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    setItem(KEYS.ARTICLES, all);
    return updated;
  },

  /** 删除文章 */
  delete(id) {
    const all = this.getAll();
    const filtered = all.filter(a => a.id !== id);
    if (filtered.length === all.length) return false;
    setItem(KEYS.ARTICLES, filtered);
    return true;
  },

  /** 切换发布状态 */
  togglePublish(id) {
    const article = this.getById(id);
    if (!article) return null;
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    return this.update(id, { status: newStatus });
  },

  /** 分页获取 */
  paginate(articles, page = 1, pageSize = 10) {
    const total = articles.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const items = articles.slice(start, start + pageSize);
    return { items, total, totalPages, page, pageSize };
  },
};

// ==================== 个人信息 ====================
export const profileStorage = {
  get() {
    return getItem(KEYS.PROFILE) || defaultProfile;
  },
  set(data) {
    const current = this.get();
    const updated = { ...current, ...data };
    setItem(KEYS.PROFILE, updated);
    return updated;
  },
};

// ==================== 博客设置 ====================
export const settingsStorage = {
  get() {
    return getItem(KEYS.SETTINGS) || defaultSettings;
  },
  set(data) {
    const current = this.get();
    const updated = { ...current, ...data };
    setItem(KEYS.SETTINGS, updated);
    return updated;
  },
};

// ==================== 数据导入导出 ====================
export const dataIO = {
  export() {
    return {
      articles: articleStorage.getAll(),
      profile: profileStorage.get(),
      settings: settingsStorage.get(),
      exportedAt: new Date().toISOString(),
    };
  },
  import(data) {
    if (data.articles) setItem(KEYS.ARTICLES, data.articles);
    if (data.profile) setItem(KEYS.PROFILE, data.profile);
    if (data.settings) setItem(KEYS.SETTINGS, data.settings);
    return true;
  },
};

// ==================== 默认数据 ====================
const defaultProfile = {
  name: '博主昵称',
  avatar: '',
  bio: '一句话介绍自己，让读者快速了解你',
  about: `## 关于我

你好！我是一名热爱技术的开发者。

## 我的技术栈

- 前端：React、Vue、TypeScript
- 后端：Node.js、Python
- 数据库：MySQL、MongoDB

## 联系我

欢迎通过各种方式与我交流！`,
  skills: [
    { name: 'React', level: 90, category: '前端' },
    { name: 'TypeScript', level: 85, category: '前端' },
    { name: 'Node.js', level: 80, category: '后端' },
    { name: 'Python', level: 75, category: '后端' },
    { name: 'MySQL', level: 70, category: '数据库' },
  ],
  experiences: [
    {
      type: 'work',
      title: '高级前端工程师',
      organization: '某科技公司',
      startDate: '2022-07',
      endDate: '',
      description: '负责核心产品前端开发，技术栈 React + TypeScript',
    },
    {
      type: 'education',
      title: '计算机科学学士',
      organization: '某知名大学',
      startDate: '2018-09',
      endDate: '2022-06',
      description: '主修计算机科学与技术',
    },
  ],
  links: [
    { platform: 'GitHub', url: 'https://github.com/username', icon: 'Github' },
    { platform: '掘金', url: 'https://juejin.cn/user/xxx', icon: 'BookOpen' },
    { platform: '邮箱', url: 'mailto:hello@example.com', icon: 'Mail' },
  ],
};

const defaultSettings = {
  blogTitle: 'VibeCoding Blog',
  blogSubtitle: '记录技术与思考',
  postsPerPage: 10,
  theme: 'system',
  primaryColor: '#6366f1',
  footerText: '© 2026 My Blog. Built with React.',
  enableSearch: true,
};

// ==================== 种子数据初始化 ====================
const seedArticles = [
  {
    title: '欢迎来到我的博客',
    slug: 'welcome-to-my-blog',
    summary: '这是我博客的第一篇文章，介绍博客的创建初衷和未来规划。',
    content: `# 欢迎来到我的博客

你好！这是我博客的第一篇文章。

## 为什么要写博客？

写博客是一种非常好的学习方式。通过写作，可以：

- **加深理解**：把知识讲清楚才算真正学会了
- **记录成长**：回看过去的文章，看看自己走了多远
- **结交朋友**：博客是连接同类人的桥梁

## 这个博客会写什么？

主要记录技术学习笔记，包括但不限于：

- 前端开发（React、Vue、CSS）
- 后端开发（Node.js、Python）
- 工具与效率
- 读书笔记

## 技术栈

这个博客使用以下技术构建：

\`\`\`
React + Vite + Tailwind CSS
\`\`\`

纯前端实现，数据存储在浏览器的 localStorage 中。

---

感谢你的到来，希望这里的内容对你有所帮助！`,
    tags: ['随笔', '博客'],
    status: 'published',
    pinned: true,
    coverImage: '',
  },
  {
    title: 'React Hooks 深度解析',
    slug: 'react-hooks-deep-dive',
    summary: '深入理解 React Hooks 的工作原理，包括 useState、useEffect、useCallback、useMemo 的使用场景与最佳实践。',
    content: `# React Hooks 深度解析

React Hooks 是 React 16.8 引入的重大特性，彻底改变了我们编写组件的方式。

## useState

\`useState\` 是最基础的 Hook，用于在函数组件中添加状态。

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

### 函数式更新

当新状态依赖于旧状态时，推荐使用函数式更新：

\`\`\`javascript
setCount(prev => prev + 1);
\`\`\`

## useEffect

\`useEffect\` 用于处理副作用，如数据请求、订阅、手动 DOM 操作。

\`\`\`javascript
useEffect(() => {
  // 副作用逻辑
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);

  // 清理函数
  return () => clearInterval(timer);
}, [/* 依赖项 */]);
\`\`\`

### 依赖数组的三种情况

| 依赖数组 | 执行时机 |
|---------|---------|
| 不传 | 每次渲染后都执行 |
| \`[]\` | 仅挂载时执行一次 |
| \`[a, b]\` | \`a\` 或 \`b\` 变化时执行 |

## useCallback 和 useMemo

这两个 Hook 都是用于性能优化：

- **useCallback**：缓存函数引用
- **useMemo**：缓存计算结果

\`\`\`javascript
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(input);
}, [input]);
\`\`\`

## 自定义 Hook

将复用逻辑提取为自定义 Hook：

\`\`\`javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}
\`\`\`

## 总结

Hooks 让我们的代码更简洁、逻辑更内聚，是现代 React 开发的核心。`,
    tags: ['React', '前端', 'JavaScript'],
    status: 'published',
    pinned: false,
    coverImage: '',
  },
  {
    title: 'Tailwind CSS 实战技巧',
    slug: 'tailwind-css-tips',
    summary: '整理了 Tailwind CSS 开发中常用的实战技巧，包括响应式设计、深色模式、自定义配置等。',
    content: `# Tailwind CSS 实战技巧

Tailwind CSS 是一个功能类优先的 CSS 框架，让你无需离开 HTML 即可快速构建现代网站。

## 响应式设计

Tailwind 使用移动端优先的断点系统：

\`\`\`html
<div class="w-full md:w-1/2 lg:w-1/3">
  响应式容器
</div>
\`\`\`

断点前缀：
- \`sm:\` 640px+
- \`md:\` 768px+
- \`lg:\` 1024px+
- \`xl:\` 1280px+
- \`2xl:\` 1536px+

## 深色模式

在 \`tailwind.config.js\` 中配置 \`darkMode: 'class'\`，然后：

\`\`\`html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  支持深色模式的容器
</div>
\`\`\`

## 常用布局模式

### Flex 居中

\`\`\`html
<div class="flex items-center justify-center min-h-screen">
  完美居中
</div>
\`\`\`

### Grid 网格

\`\`\`html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <div>卡片 1</div>
  <div>卡片 2</div>
  <div>卡片 3</div>
</div>
\`\`\`

## 自定义配置

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
\`\`\`

## 实用的组合类

\`\`\`html
<!-- 截断文本 -->
<p class="truncate">很长的文本...</p>

<!-- 多行截断 -->
<p class="line-clamp-3">多行文本截断...</p>

<!-- 过渡动画 -->
<button class="transition-all duration-300 hover:scale-105">
  悬浮放大
</button>
\`\`\`

Tailwind 的原子化思路一开始可能不习惯，但用久了会非常高效！`,
    tags: ['CSS', 'Tailwind', '前端'],
    status: 'published',
    pinned: false,
    coverImage: '',
  },
  {
    title: 'Git 工作流最佳实践',
    slug: 'git-workflow-best-practices',
    summary: '介绍团队协作中常用的 Git 工作流，包括 Git Flow、GitHub Flow 的对比和实际使用建议。',
    content: `# Git 工作流最佳实践

良好的 Git 工作流是团队高效协作的基础。

## Git Flow

适合有明确发布周期的项目：

\`\`\`
main          ●─────────────────────●
              ↑                     ↑
develop   ●──●──●──●──●──●──●──●──●
              ↑           ↑
feature   ●──●           ●──●
\`\`\`

**分支职责**：
- \`main\`：生产环境代码
- \`develop\`：开发主分支
- \`feature/*\`：功能开发
- \`release/*\`：发布准备
- \`hotfix/*\`：紧急修复

## GitHub Flow

适合持续部署的项目，更简单：

1. 从 \`main\` 创建功能分支
2. 提交代码，推送到远程
3. 创建 Pull Request
4. 代码审查
5. 合并到 \`main\`，部署

## Commit Message 规范

推荐使用 [Conventional Commits](https://www.conventionalcommits.org/)：

\`\`\`
<type>(<scope>): <subject>

feat: 新增用户登录功能
fix: 修复首页图片加载失败问题
docs: 更新 API 文档
style: 格式化代码
refactor: 重构数据处理逻辑
test: 添加单元测试
chore: 升级依赖版本
\`\`\`

## 实用 Git 命令

\`\`\`bash
# 撤销最近一次提交（保留改动）
git reset --soft HEAD~1

# 查看某文件的修改历史
git log --follow -p src/components/App.jsx

# 临时保存工作区
git stash push -m "WIP: 用户功能"
git stash pop

# 交互式变基，整理提交历史
git rebase -i HEAD~5
\`\`\`

## 小结

选择适合团队的工作流，比用"最好"的工作流更重要。`,
    tags: ['Git', '效率', '团队协作'],
    status: 'published',
    pinned: false,
    coverImage: '',
  },
  {
    title: 'localStorage 数据持久化方案',
    slug: 'localstorage-data-persistence',
    summary: '探讨在纯前端应用中使用 localStorage 进行数据持久化的设计思路，以及数据安全、容量限制等实践经验。',
    content: `# localStorage 数据持久化方案

对于纯前端应用，localStorage 是最简单可靠的数据持久化方案。

## 基本 API

\`\`\`javascript
// 存储
localStorage.setItem('key', JSON.stringify(data));

// 读取
const data = JSON.parse(localStorage.getItem('key'));

// 删除
localStorage.removeItem('key');

// 清空
localStorage.clear();
\`\`\`

## 封装思路

直接使用原生 API 过于零散，推荐封装一个 Storage 工具类：

\`\`\`javascript
class Storage {
  constructor(prefix = 'app_') {
    this.prefix = prefix;
  }

  _key(key) {
    return this.prefix + key;
  }

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
      return true;
    } catch (e) {
      // QuotaExceededError
      console.error('Storage quota exceeded:', e);
      return false;
    }
  }

  remove(key) {
    localStorage.removeItem(this._key(key));
  }
}
\`\`\`

## 容量限制

localStorage 通常限制为 **5MB**，注意：

- 大量图片不要存 base64（改用 URL）
- 定期清理旧数据
- 考虑数据压缩（如 LZ-string）

## 安全注意事项

1. **不存敏感信息**：密码需要哈希处理
2. **XSS 防护**：避免将 localStorage 数据直接插入 DOM
3. **同源限制**：不同域名无法共享数据

## 数据迁移策略

当数据结构变化时，需要版本迁移：

\`\`\`javascript
const SCHEMA_VERSION = 2;

function migrateData() {
  const version = localStorage.getItem('schema_version');
  if (!version || parseInt(version) < SCHEMA_VERSION) {
    // 执行迁移逻辑
    runMigrations(parseInt(version) || 0);
    localStorage.setItem('schema_version', SCHEMA_VERSION);
  }
}
\`\`\`

localStorage 虽然简单，但用好了完全能满足中小型前端应用的数据需求。`,
    tags: ['JavaScript', '前端', '数据存储'],
    status: 'published',
    pinned: false,
    coverImage: '',
  },
];

/**
 * 初始化种子数据
 * 仅在首次访问时执行
 */
export function initializeStorage() {
  if (getItem(KEYS.INITIALIZED)) return;

  // 设置默认个人信息
  setItem(KEYS.PROFILE, defaultProfile);

  // 设置默认配置
  setItem(KEYS.SETTINGS, defaultSettings);

  // 插入示例文章
  const now = new Date();
  const articles = seedArticles.map((seed, index) => {
    const createdAt = new Date(now - (seedArticles.length - index) * 3 * 24 * 60 * 60 * 1000).toISOString();
    const wordCount = countWords(seed.content);
    return {
      id: `art_seed_${String(index + 1).padStart(3, '0')}`,
      slug: seed.slug,
      title: seed.title,
      summary: seed.summary,
      content: seed.content,
      tags: seed.tags,
      coverImage: seed.coverImage || '',
      status: seed.status,
      pinned: seed.pinned,
      wordCount,
      readTime: estimateReadTime(wordCount),
      createdAt,
      updatedAt: createdAt,
    };
  });
  setItem(KEYS.ARTICLES, articles);

  // 标记已初始化
  setItem(KEYS.INITIALIZED, true);
}
