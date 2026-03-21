import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'langley-theme',
    },
  ),
)

// Apply saved theme before React paints (prevents flash of wrong theme)
const saved = localStorage.getItem('langley-theme')
if (saved) {
  try {
    const { state } = JSON.parse(saved)
    if (state?.theme) {
      document.documentElement.dataset.theme = state.theme
    }
  } catch {
    // ignore malformed JSON
  }
}
