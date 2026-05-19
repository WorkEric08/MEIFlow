import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  FileText,
  Link2,
  Settings,
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'
import OfflineIndicator from '@/components/OfflineIndicator'
import PWAInstallButton from '@/components/PWAInstallButton'
import PWANativeShell from '@/components/PWANativeShell'
import { triggerHaptic } from '@/hooks/useHaptic'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/',          label: 'Início',     icon: LayoutDashboard, end: true },
  { to: '/clients',   label: 'Clientes',   icon: Users },
  { to: '/projects',  label: 'Projetos',   icon: FolderKanban },
  { to: '/payments',  label: 'Pagamentos', icon: CreditCard },
  { to: '/contracts', label: 'Contratos',  icon: FileText },
  { to: '/link-page', label: 'Link Page',  icon: Link2 },
]

const TAB_PCT = 100 / NAV_ITEMS.length
const EASE_STRETCH  = 'cubic-bezier(0.4, 0, 0.6, 1)'
const EASE_CONTRACT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

function getActiveNavIndex(pathname: string): number {
  for (let i = 0; i < NAV_ITEMS.length; i++) {
    const { to, end } = NAV_ITEMS[i]
    if (end ? pathname === to : pathname.startsWith(to)) return i
  }
  return -1
}

function pillLeft(i: number): string {
  return `calc(${i} * ${TAB_PCT}% + ${TAB_PCT * 0.5}% - 1rem)`
}

export default function AppShell() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const activeIndex = getActiveNavIndex(location.pathname)
  const prevRef = useRef(activeIndex)

  const [pillStyle, setPillStyle] = useState<CSSProperties>({
    left: pillLeft(Math.max(activeIndex, 0)),
    width: '2rem',
    opacity: activeIndex >= 0 ? 1 : 0,
    transition: 'none',
  })

  useEffect(() => {
    const prev = prevRef.current
    const curr = activeIndex
    prevRef.current = curr

    if (curr < 0) {
      setPillStyle(s => ({ ...s, opacity: 0, transition: 'opacity 150ms ease' }))
      return
    }
    if (prev < 0) {
      setPillStyle({ left: pillLeft(curr), width: '2rem', opacity: 1, transition: 'opacity 200ms ease' })
      return
    }
    if (prev === curr) return

    const movingRight = curr > prev
    const diff = Math.abs(curr - prev)
    const stretchW = `calc(${diff * TAB_PCT}% + 2rem)`

    // Phase 1 — stretch
    setPillStyle(movingRight
      ? { left: pillLeft(prev), width: stretchW, opacity: 1, transition: `width 140ms ${EASE_STRETCH}` }
      : { left: pillLeft(curr), width: stretchW, opacity: 1, transition: `left 140ms ${EASE_STRETCH}, width 140ms ${EASE_STRETCH}` }
    )

    // Phase 2 — contract to destination with spring
    const t = window.setTimeout(() => {
      setPillStyle({
        left: pillLeft(curr),
        width: '2rem',
        opacity: 1,
        transition: movingRight
          ? `left 180ms ${EASE_CONTRACT}, width 180ms ${EASE_CONTRACT}`
          : `width 180ms ${EASE_CONTRACT}`,
      })
    }, 140)

    return () => clearTimeout(t)
  }, [activeIndex])

  return (
    <div className="flex min-h-dvh" style={{ background: 'var(--bg-0)' }}>
      <PWANativeShell />

      {/* ── Sidebar (lg+) ──
          No PWA instalado (standalone): fica transparente — sem bg, sem borda, sem divisores.
          Os itens de navegação seguem visíveis e funcionais sobre o fundo da página. */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r sticky top-0 h-dvh pwa-sidebar"
        style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>

        <div className="px-5 py-6 border-b pwa-sidebar-divider flex items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            MEI<span style={{ color: 'var(--primary)' }}>Flow</span>
          </span>
          <OfflineIndicator />
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

        <div className="px-3 py-4 border-t flex flex-col gap-3 pwa-sidebar-divider"
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

        {/* Mobile header — visível apenas no dashboard */}
        {isHome && (
          <header
            className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur"
            style={{
              background: 'color-mix(in srgb, var(--bg-1) 92%, transparent)',
              borderColor: 'var(--border)',
              paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                MEI<span style={{ color: 'var(--primary)' }}>Flow</span>
              </span>
              <OfflineIndicator />
            </div>
            <div className="flex items-center gap-0.5">
              <NotificationBell />
              <NavLink
                to="/settings"
                aria-label="Configurações"
                data-pwa-tap
                onClick={() => triggerHaptic('selection')}
                className={({ isActive }) => cn(
                  'p-2.5 rounded-input min-h-[40px] min-w-[40px] flex items-center justify-center transition-all hover:opacity-70',
                  isActive && 'bg-[var(--primary-subtle)]',
                )}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                })}
              >
                <Settings size={18} />
              </NavLink>
            </div>
          </header>
        )}

        {/* Page content — padding-bottom acomoda bottom nav + safe-area-inset-bottom */}
        <main
          key={location.pathname}
          className="flex-1 overflow-auto p-4 md:p-5 lg:p-6 lg:pb-6"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 96px)' }}
        >
          <Outlet />
        </main>

        {/* ── Bottom nav (mobile e tablet até lg) ──
            Safe-area bottom para home indicator. Glassmorphism sutil em mobile. ── */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 border-t flex items-stretch backdrop-blur"
          style={{
            background: 'color-mix(in srgb, var(--bg-1) 92%, transparent)',
            borderColor: 'var(--border)',
            paddingBottom: 'env(safe-area-inset-bottom)',
            zIndex: 40,
          }}
        >
          {/* Pill animado — único elemento que desliza/estica entre abas */}
          <span
            aria-hidden
            className="rounded-b-full pointer-events-none"
            style={{
              position: 'absolute',
              top: 0,
              height: '2px',
              background: 'var(--primary)',
              ...pillStyle,
            }}
          />

          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => triggerHaptic('selection')}
              data-pwa-tap
              className={({ isActive }) => cn(
                'flex-1 flex flex-col items-center gap-1 pt-2 pb-1.5 min-h-[56px] justify-center relative',
                'text-[10px] font-semibold transition-all duration-fast',
                isActive ? '' : 'opacity-60'
              )}
              style={({ isActive }) => ({
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} aria-hidden strokeWidth={isActive ? 2.4 : 2} />
                  <span className="hidden xs:block leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

      </div>
    </div>
  )
}
