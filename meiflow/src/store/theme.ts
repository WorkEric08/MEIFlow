import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
    }),
    {
      name: 'meiflow-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark'

  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'

  const colorSchemeMeta = document.getElementById('color-scheme-meta')
  if (colorSchemeMeta) colorSchemeMeta.setAttribute('content', isDark ? 'dark' : 'light')

  const themeColorMeta = document.getElementById('theme-color-meta')
  if (themeColorMeta) themeColorMeta.setAttribute('content', isDark ? '#0D1117' : '#F4F6FA')
}
