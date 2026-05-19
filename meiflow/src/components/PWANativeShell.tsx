import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getPWAEnv, useIsPWA } from '@/hooks/useIsPWA'
import { installAndroidBack } from '@/hooks/useAndroidBack'
import { useThemeStore } from '@/store/theme'

const STATUS_BAR_COLORS = {
  dark: '#0D1117',
  light: '#F4F6FA',
} as const

function syncStatusBar(theme: 'dark' | 'light') {
  const meta = document.getElementById('theme-color-meta') as HTMLMetaElement | null
  if (meta) meta.content = STATUS_BAR_COLORS[theme]

  // iOS status-bar style — black-translucent lets content go edge-to-edge
  let appleMeta = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]',
  ) as HTMLMetaElement | null
  if (!appleMeta) {
    appleMeta = document.createElement('meta')
    appleMeta.name = 'apple-mobile-web-app-status-bar-style'
    document.head.appendChild(appleMeta)
  }
  appleMeta.content = theme === 'dark' ? 'black-translucent' : 'default'
}

function applyHtmlClasses() {
  const env = getPWAEnv()
  const html = document.documentElement
  html.classList.toggle('pwa-standalone', env.isStandalone)
  html.classList.toggle('pwa-mobile', env.isPWAMobile)
  html.classList.toggle('pwa-android', env.isPWAMobile && env.platform === 'android')
  html.classList.toggle('pwa-ios', env.isPWAMobile && env.platform === 'ios')
}

/**
 * Splash overlay — visível brevemente quando o app é aberto como PWA standalone.
 * Some logo central que escala/fade, imitando splash screen Android nativo.
 */
function PWASplash({ visible }: { visible: boolean }) {
  if (!visible) return null
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        background: 'var(--bg-0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        animation: 'pwaSplashOut 320ms ease-out 480ms forwards',
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(28px, 8vw, 44px)',
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          animation: 'pwaSplashLogo 520ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        MEI<span style={{ color: 'var(--primary)' }}>Flow</span>
      </div>
    </div>
  )
}

/**
 * Aplica comportamentos nativos quando o app está rodando como PWA instalado
 * em mobile. Não afeta o site quando aberto via navegador.
 *
 * - Adiciona classes `pwa-mobile` / `pwa-android` / `pwa-ios` no <html>
 * - Sincroniza cor da status bar com o tema
 * - Instala interceptor do botão Voltar Android
 * - Mostra splash screen no boot
 * - Marca a rota corrente no <html> para animações de transição
 */
export default function PWANativeShell() {
  const env = useIsPWA()
  const theme = useThemeStore((s) => s.theme)
  const location = useLocation()
  const [splash, setSplash] = useState(() => getPWAEnv().isPWAMobile)
  const [settingsSplash, setSettingsSplash] = useState(false)
  const prevPathname = useRef(location.pathname)
  const settingsTimer = useRef<number | null>(null)

  // Apply html classes whenever env changes
  useEffect(() => {
    applyHtmlClasses()
  }, [env.isPWAMobile, env.isStandalone, env.platform])

  // Sync status bar color with theme
  useEffect(() => {
    syncStatusBar(theme)
  }, [theme])

  // Install Android back interceptor (idempotent)
  useEffect(() => {
    if (env.isPWAMobile) installAndroidBack()
  }, [env.isPWAMobile])

  // Splash dismiss
  useEffect(() => {
    if (!splash) return
    const t = window.setTimeout(() => setSplash(false), 820)
    return () => window.clearTimeout(t)
  }, [splash])

  // Show splash when navigating away from /settings
  useEffect(() => {
    if (prevPathname.current === '/settings' && location.pathname !== '/settings' && env.isPWAMobile) {
      if (settingsTimer.current) clearTimeout(settingsTimer.current)
      setSettingsSplash(true)
      settingsTimer.current = window.setTimeout(() => {
        setSettingsSplash(false)
        settingsTimer.current = null
      }, 820)
    }
    prevPathname.current = location.pathname
  }, [location.pathname, env.isPWAMobile])

  // Mark route key for slide-direction animation
  useEffect(() => {
    if (!env.isPWAMobile) return
    document.documentElement.dataset.route = location.pathname
  }, [location.pathname, env.isPWAMobile])

  return <PWASplash visible={(splash || settingsSplash) && env.isPWAMobile} />
}
