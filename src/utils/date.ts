import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

export const formatDate = (iso: string, template = 'YYYY年MM月DD日') =>
  dayjs(iso).format(template)

export const formatRelative = (iso: string) => dayjs(iso).fromNow()

export const toISO = () => new Date().toISOString()

/** 估算阅读时间（分钟），按 300 字/分钟 */
export const readingTime = (wordCount: number) =>
  Math.max(1, Math.ceil(wordCount / 300))
