interface TagBadgeProps {
  tag: string
  active?: boolean
  onClick?: () => void
}

export default function TagBadge({ tag, active = false, onClick }: TagBadgeProps) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors'
  const style = active
    ? 'bg-indigo-600 text-white'
    : onClick
      ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'

  return (
    <span className={`${base} ${style}`} onClick={onClick}>
      {tag}
    </span>
  )
}
