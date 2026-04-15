/** 生成唯一 ID，格式：art_yyyymmdd_xxxxxx */
export function generateId(prefix = 'id'): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${date}_${random}`
}
