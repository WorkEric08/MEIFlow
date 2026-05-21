import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ExternalLink, MapPin, Phone, Mail, Globe, ArrowLeft, Share2,
} from 'lucide-react'
import { linkPageService } from '@/features/link-page/service'
import { useToast } from '@/store/toast'
import SplashOverlay from '@/components/SplashOverlay'

const TOKENS = {
  dark: {
    bg0: '#0D1117', bg1: '#161B27', bg2: '#1E2537',
    textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textTertiary: '#64748B',
    border: 'rgba(255,255,255,0.08)',
    blueprintGrid: 'rgba(59,140,232,0.06)', blueprintGridStrong: 'rgba(59,140,232,0.04)',
    blueprintBorder: 'rgba(59,140,232,0.22)', blueprintText: '#7DD3FC',
    cardShadow: '0 0 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(59,140,232,0.08)',
    chromeBg: 'rgba(22,27,39,0.85)', chromeBorder: 'rgba(255,255,255,0.08)',
  },
  light: {
    bg0: '#F4F6FA', bg1: '#FFFFFF', bg2: '#EEF2FB',
    textPrimary: '#0D1117', textSecondary: '#64748B', textTertiary: '#94A3B8',
    border: 'rgba(0,0,0,0.1)',
    blueprintGrid: 'rgba(26,101,192,0.06)', blueprintGridStrong: 'rgba(26,101,192,0.04)',
    blueprintBorder: 'rgba(26,101,192,0.2)', blueprintText: '#1A65C0',
    cardShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(26,101,192,0.06)',
    chromeBg: 'rgba(255,255,255,0.92)', chromeBorder: 'rgba(0,0,0,0.08)',
  },
} as const

const CONTACT_ICONS = { city: MapPin, phone: Phone, email: Mail, website: Globe } as const
type ContactKey = keyof typeof CONTACT_ICONS

function buildContactItems(page: { city?: string; phone?: string; email?: string; website?: string }) {
  const items: Array<{ key: ContactKey; label: string; href?: string }> = []
  if (page.city)    items.push({ key: 'city',    label: page.city })
  if (page.phone) {
    const digits = page.phone.replace(/\D/g, '')
    items.push({ key: 'phone', label: page.phone, href: digits ? `tel:${digits}` : undefined })
  }
  if (page.email)   items.push({ key: 'email',   label: page.email,   href: `mailto:${page.email}` })
  if (page.website) items.push({ key: 'website', label: page.website.replace(/^https?:\/\//, ''), href: page.website })
  return items
}

export default function LinkPagePublic() {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  // ?preview=1 → dono visualizando a partir do editor; mostra Voltar + Compartilhar
  const isOwner = searchParams.get('preview') === '1'

  // Splash MEIFlow padrão — sempre aparece brevemente ao abrir
  const [splashVisible, setSplashVisible] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setSplashVisible(false), 820)
    return () => window.clearTimeout(t)
  }, [])

  const { data: page, isLoading } = useQuery({
    queryKey: ['link-page-public', username],
    queryFn: () => linkPageService.get(),
    enabled: !!username,
    staleTime: 0,
    refetchOnMount: 'always',
  })

  // Erro / loading inicial — splash em cima
  if (isLoading) {
    return <SplashOverlay visible fadeOutDelay={9999} />
  }

  if (!page || page.username !== username) {
    return (
      <>
        <SplashOverlay visible={splashVisible} />
        <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4"
          style={{ background: TOKENS.dark.bg0 }}>
          <p className="text-lg font-bold" style={{ color: TOKENS.dark.textPrimary }}>Página não encontrada</p>
          <p className="text-sm" style={{ color: TOKENS.dark.textSecondary }}>@{username} não existe.</p>
        </div>
      </>
    )
  }

  const t = TOKENS[page.theme]
  const accent = page.accentColor
  const contacts = buildContactItems(page)
  const showLinks = page.showLinks !== false
  const isHorizontal = (page.layout ?? 'vertical') === 'horizontal'
  const hasLinks = showLinks && page.links.length > 0

  function handleLinkClick(linkId: string) { linkPageService.incrementClick(linkId) }

  async function handleShare() {
    // URL limpa — sem o ?preview=1; destinatário só vê o cartão
    const url = `${window.location.origin}/${page!.username}`
    if (navigator.share) {
      try { await navigator.share({ title: page!.displayName, url }) } catch { /* cancelado */ }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    }
  }

  function handleBack() {
    navigate('/link-page')
  }

  // ── Blocos reutilizados ─────────────────────────────────────────

  const avatarSize = isHorizontal ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-14 h-14 sm:w-[72px] sm:h-[72px]'
  const avatarTextSize = isHorizontal ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'

  const AvatarIdentity = (
    <div className={`flex items-center gap-3 sm:gap-4 ${isHorizontal ? 'mb-3 sm:mb-4' : 'mb-4 sm:mb-5'}`}>
      <div className={`${avatarSize} rounded-full shrink-0 overflow-hidden`}
        style={{ boxShadow: `0 0 0 4px ${t.bg1}, 0 0 0 5px ${t.blueprintBorder}` }}>
        {page.avatarUrl ? (
          <img src={page.avatarUrl} alt={page.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-black ${avatarTextSize}`}
            style={{ background: accent, color: '#fff' }}>
            {page.displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <h1 className="font-extrabold leading-tight break-words"
          style={{ color: t.textPrimary, fontSize: isHorizontal ? '18px' : '22px', letterSpacing: '-0.02em' }}>
          {page.displayName}
        </h1>
        {page.role && (
          <p className="mt-1 font-semibold uppercase"
            style={{ color: t.textSecondary, fontSize: '11px', letterSpacing: '0.08em' }}>
            {page.role}
          </p>
        )}
      </div>
    </div>
  )

  const Bio = page.bio && (
    <p className={`text-sm leading-relaxed break-words ${isHorizontal ? 'mb-3 sm:mb-4' : 'mb-4 sm:mb-5'}`}
      style={{ color: t.textSecondary }}>
      {page.bio}
    </p>
  )

  function renderContactItem(item: { key: ContactKey; label: string; href?: string }) {
    const Icon = CONTACT_ICONS[item.key]
    const inner = (
      <span className="flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-input flex items-center justify-center shrink-0 border"
          style={{ background: t.bg2, borderColor: t.blueprintBorder, color: accent }}>
          <Icon size={13} strokeWidth={2.2} />
        </span>
        <span className="text-sm font-medium truncate min-w-0 flex-1" style={{ color: t.textPrimary }}>
          {item.label}
        </span>
      </span>
    )
    return (
      <li key={item.key}>
        {item.href ? (
          <a href={item.href}
            target={item.key === 'website' ? '_blank' : undefined}
            rel={item.key === 'website' ? 'noopener noreferrer' : undefined}
            className="block transition-all duration-fast hover:opacity-80 active:scale-[0.99]">
            {inner}
          </a>
        ) : inner}
      </li>
    )
  }

  // ── Layout horizontal — sempre 2 colunas, responsivo ────────────
  const HorizontalCard = (
    <article id="card-print-area"
      className="relative w-full rounded-modal border overflow-hidden"
      style={{ background: t.bg1, borderColor: t.blueprintBorder, boxShadow: t.cardShadow }}
    >
      <div className="blueprint-grid absolute inset-0 pointer-events-none" />
      <div className="absolute top-3 right-4 font-mono text-[10px] tracking-widest uppercase pointer-events-none"
        style={{ color: t.textTertiary, opacity: 0.8 }}>
        ID · {page.username}
      </div>

      <div className="relative flex">
        {/* Coluna esquerda */}
        <div className={`p-4 sm:p-6 pt-7 sm:pt-8 ${hasLinks ? 'flex-1 min-w-0' : 'w-full'}`}>
          {AvatarIdentity}
          {Bio}
          {contacts.length > 0 && (
            <>
              <Separator color={t.blueprintBorder} label="CONTATO" labelColor={t.textTertiary} bg={t.bg1} />
              {/* Grade de 2 col quando não há links e a tela permite */}
              <ul className={`grid gap-2 sm:gap-2.5 ${!hasLinks ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {contacts.map(renderContactItem)}
              </ul>
            </>
          )}
        </div>

        {hasLinks && (
          <>
            <div className="w-px shrink-0 self-stretch" style={{ background: t.blueprintBorder }} />
            <div className="w-[148px] sm:w-[200px] shrink-0 p-3.5 sm:p-6 pt-7 sm:pt-8">
              <Separator color={t.blueprintBorder} label="LINKS" labelColor={t.textTertiary} bg={t.bg1} />
              <div className="flex flex-col gap-1.5 sm:gap-2.5">
                {page.links.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link.id)}
                    className="w-full flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-input border font-semibold transition-all duration-fast active:scale-[0.98] no-underline"
                    style={{ background: t.bg2, borderColor: t.blueprintBorder, color: t.textPrimary }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.blueprintBorder }}>
                    <span className="text-[11px] sm:text-sm truncate">{link.label}</span>
                    <ExternalLink size={12} style={{ color: accent, flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative px-4 sm:px-6 pt-3 pb-4 sm:pb-5 border-t flex items-center"
        style={{ borderColor: t.blueprintBorder }}>
        <span className="font-mono text-[11px] tracking-wide truncate" style={{ color: accent, opacity: 0.7 }}>
          meiflow.com/{page.username}
        </span>
      </div>
    </article>
  )

  // ── Layout vertical ─────────────────────────────────────────────
  const VerticalCard = (
    <article id="card-print-area"
      className="relative w-full rounded-modal border overflow-hidden"
      style={{ background: t.bg1, borderColor: t.blueprintBorder, boxShadow: t.cardShadow }}
    >
      <div className="blueprint-grid absolute inset-0 pointer-events-none" />
      <div className="absolute top-3 right-4 font-mono text-[10px] tracking-widest uppercase pointer-events-none"
        style={{ color: t.textTertiary, opacity: 0.8 }}>
        ID · {page.username}
      </div>

      <div className="relative p-5 sm:p-6 pt-8">
        {AvatarIdentity}
        {Bio}
        {contacts.length > 0 && (
          <>
            <Separator color={t.blueprintBorder} label="CONTATO" labelColor={t.textTertiary} bg={t.bg1} />
            <ul className="flex flex-col gap-2 sm:gap-2.5 mb-4 sm:mb-5">
              {contacts.map(renderContactItem)}
            </ul>
          </>
        )}

        {hasLinks && (
          <>
            <Separator color={t.blueprintBorder} label="LINKS" labelColor={t.textTertiary} bg={t.bg1} />
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {page.links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-input border font-semibold transition-all duration-fast active:scale-[0.98] no-underline"
                  style={{ background: t.bg2, borderColor: t.blueprintBorder, color: t.textPrimary }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.blueprintBorder }}>
                  <span className="text-sm truncate">{link.label}</span>
                  <ExternalLink size={14} style={{ color: accent, flexShrink: 0 }} />
                </a>
              ))}
            </div>
          </>
        )}

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t flex items-center"
          style={{ borderColor: t.blueprintBorder }}>
          <span className="font-mono text-[11px] tracking-wide truncate" style={{ color: accent, opacity: 0.7 }}>
            meiflow.com/{page.username}
          </span>
        </div>
      </div>
    </article>
  )

  // Container — horizontal usa mais espaço útil, vertical fica mais estreito
  const containerMaxW = isHorizontal ? 'max-w-[720px]' : 'max-w-[448px]'

  return (
    <>
      <SplashOverlay visible={splashVisible} />

      <div className="min-h-dvh relative animate-fade-in"
        id="link-page-root"
        style={{
          background: t.bg0,
          ['--blueprint-grid' as string]: t.blueprintGrid,
          ['--blueprint-border' as string]: t.blueprintBorder,
          ['--blueprint' as string]: accent,
        }}>

        {/* Grid blueprint de fundo */}
        <div className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: `linear-gradient(${t.blueprintGridStrong} 1px, transparent 1px), linear-gradient(90deg, ${t.blueprintGridStrong} 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }} />

        {/* Cartão centralizado */}
        <div className="relative min-h-dvh flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10"
          style={{
            paddingTop: isOwner ? 'calc(env(safe-area-inset-top) + 84px)' : 'max(1.5rem, env(safe-area-inset-top))',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
          }}>
          <div className={`relative w-full ${containerMaxW}`}>
            {isHorizontal ? HorizontalCard : VerticalCard}
          </div>
        </div>

        {/* Controles do dono — visíveis só se ?preview=1 */}
        {isOwner && (
          <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b backdrop-blur"
            style={{
              background: t.chromeBg,
              borderColor: t.chromeBorder,
              paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
            }}>
            <button onClick={handleBack}
              data-pwa-tap
              className="flex items-center gap-1.5 px-3 py-2 rounded-input text-sm font-medium transition-all hover:opacity-80 active:scale-95"
              style={{ color: t.textSecondary }}>
              <ArrowLeft size={15} />
              <span className="hidden xs:inline">Voltar</span>
            </button>

            <button onClick={handleShare}
              data-pwa-tap
              className="flex items-center gap-1.5 px-3 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: accent }}>
              <Share2 size={14} />
              <span>Compartilhar</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function Separator({ color, label, labelColor, bg }: {
  color: string; label: string; labelColor: string; bg: string
}) {
  return (
    <div className="relative my-3 sm:my-4">
      <div className="border-t" style={{ borderColor: color }} />
      <span className="absolute -top-[7px] left-0 px-2 font-mono text-[10px] font-semibold uppercase tracking-widest"
        style={{ background: bg, color: labelColor }}>
        {label}
      </span>
    </div>
  )
}
