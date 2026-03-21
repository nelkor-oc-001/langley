import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useThemeStore } from '../shared/ThemeStore'

export function Layout() {
  const { theme, toggleTheme } = useThemeStore()

  // Sync theme attribute to <html> whenever it changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="app-layout">
      <header className="app-header">
        <button
          className="theme-toggle btn-secondary"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
          aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>
      <Outlet />
    </div>
  )
}
