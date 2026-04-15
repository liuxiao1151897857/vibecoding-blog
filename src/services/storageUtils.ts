/** localStorage 底层封装：序列化 / 反序列化 */

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}

/** 导出所有博客数据为 JSON 字符串 */
export function exportAllData(keys: string[]): string {
  const data: Record<string, unknown> = {}
  keys.forEach((k) => {
    const raw = localStorage.getItem(k)
    if (raw) data[k] = JSON.parse(raw)
  })
  return JSON.stringify(data, null, 2)
}

/** 从 JSON 字符串导入数据（覆盖现有数据） */
export function importAllData(json: string, allowedKeys: string[]): void {
  const data = JSON.parse(json) as Record<string, unknown>
  allowedKeys.forEach((k) => {
    if (k in data) {
      localStorage.setItem(k, JSON.stringify(data[k]))
    }
  })
}
