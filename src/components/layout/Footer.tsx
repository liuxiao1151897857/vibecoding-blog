import { settingsStorage } from '../../lib/storage'

export default function Footer() {
  const settings = settingsStorage.get()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {settings.footerText}
      </div>
    </footer>
  )
}
