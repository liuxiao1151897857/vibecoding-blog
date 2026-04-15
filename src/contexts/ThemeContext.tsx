import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { settingsStorage } from '../lib/storage'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: ThemeMode
  isDark: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const settings = settingsStorage.get()
    return settings.theme || 'system'
  })

  const getIsDark = (t: ThemeMode) => {
    if (t === 'dark') return true
    if (t === 'light') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const [isDark, setIsDark] = useState(() => getIsDark(theme))

  useEffect(() => {
    const updateDark = () => {
      const dark = getIsDark(theme)
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    }
    updateDark()

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', updateDark)
    return () => mq.removeEventListener('change', updateDark)
  }, [theme])

  const setTheme = (t: ThemeMode) => {
    setThemeState(t)
    settingsStorage.set({ theme: t })
  }

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
