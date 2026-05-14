import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  FileText,
  Link2,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { useThemeStore } from '@/store/theme'
import NotificationBell from '@/components/NotificationBell'
import PWAInstallButton from '@/components/PWAInstallButton'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/',          label: 'Início',     icon: LayoutDashboard, end: true },
  { to: '/clients',   label: 'Clientes',   icon: Users },
  { to: '/projects',  label: 'Projetos',   icon: FolderKanban },
  { to: '/payments',  label: 'Pagamentos', icon: CreditCard },
  { to: '/contracts', label: 'Contratos',  icon: FileText },
  { to: '/link-page', label: 'Link Page',  icon: Link2 },
]

export default function AppShell() {
  const { theme, toggleTheme } = useThemeStore()

  function handleToggleTheme() {
    toggleTheme()
    // Fix 3 — atualiza theme-color da barra de status Android/iOS
    const next = theme === 'dark' ? '#F4F6FA' : '#0D1117'
    const meta = document.getElementById('theme-color-meta')
    if (meta) meta.setAttribute('content', next)
  }

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg-0)' }}>

      {/* ── Sidebar (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r sticky top-0 h-dvh"
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>

        <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            MEI<span style={{ color: 'var(--primary)' }}>Flow</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto min-h-0">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-input text-sm font-medium transition-all duration-fast',
                isActive ? 'text-white' : 'hover:opacity-80'
              )}
              style={({ isActive }) => ({
                background: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
              })}
            >
              <Icon size={16} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t flex flex-col gap-3"
          style={{ borderColor: 'var(--border)' }}>
          <PWAInstallButton />
          <div className="flex items-center justify-center gap-8">
            <NavLink to="/settings"
              aria-label="Configurações"
              className="p-2 rounded-input transition-all duration-fast hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}>
              <Settings size={16} aria-hidden />
            </NavLink>
            <NotificationBell />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
          <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            MEI<span style={{ color: 'var(--primary)' }}>Flow</span>
          </span>
          <div className="flex items-center gap-1.5">
            <PWAInstallButton />
            <NotificationBell />
            <button onClick={handleToggleTheme} aria-label="Alternar tema"
              className="p-2 rounded-input"
              style={{ color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page content — pb-24 em mobile/tablet garante conteúdo acima do bottom nav */}
        <main className="flex-1 overflow-auto p-4 md:p-5 lg:p-6 pb-24 md:pb-24 lg:pb-6">
          <Outlet />
        </main>

        {/* ── Bottom nav (mobile e tablet até lg) ──
            Fix 2: padding-bottom = safe-area-inset-bottom para home indicator
            Fix 6: sem labels em xs (320px), visível em sm+ (375px) ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 border-t flex items-center"
          style={{
            background: 'var(--bg-1)',
            borderColor: 'var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-0.5 pt-2.5 pb-2 min-h-[44px] justify-center',
                'text-[10px] font-medium transition-all duration-fast',
                isActive ? '' : 'opacity-50'
              )}
              style={({ isActive }) => ({
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              })}
            >
              <Icon size={20} aria-hidden />
              {/* Fix 6 — label oculta em 320px, visível em 375px+ */}
              <span className="hidden xs:block">{label}</span>
            </NavLink>
          ))}
        </nav>

      </div>
    </div>
  )
}
