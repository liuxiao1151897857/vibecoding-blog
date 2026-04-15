/** 统计 Markdown 正文字数（去除语法符号） */
export function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, '')  // 去除代码块
    .replace(/`[^`]*`/g, '')         // 去除行内代码
    .replace(/!\[.*?\]\(.*?\)/g, '') // 去除图片
    .replace(/\[.*?\]\(.*?\)/g, '')  // 去除链接
    .replace(/#+\s/g, '')            // 去除标题符号
    .replace(/[*_~`>#\-]/g, '')      // 去除其他 Markdown 符号
    .trim()
    .length
}

/** 提取 Markdown 正文前 N 个字符作为摘要 */
export function extractSummary(markdown: string, length = 200): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/[*_~>#\-]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  return plain.length > length ? plain.slice(0, length) + '...' : plain
}

/** 将标题文本转换为 URL 锚点 slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s\u4e00-\u9fa5]+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
}
