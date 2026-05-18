import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, MapPin, Phone, Mail, Globe, ArrowLeft, Share2, Download } from 'lucide-react'
import { linkPageService } from '@/features/link-page/service'

// ── Tokens de tema do cartão público (espelham globals.css, escopados ao cartão) ──
const TOKENS = {
  dark: {
    bg0: '#0D1117',
    bg1: '#161B27',
    bg2: '#1E2537',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    border: 'rgba(255,255,255,0.08)',
    blueprintGrid: 'rgba(59,140,232,0.06)',
    blueprintGridStrong: 'rgba(59,140,232,0.04)',
    blueprintBorder: 'rgba(59,140,232,0.22)',
    blueprintText: '#7DD3FC',
    cardShadow: '0 0 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(59,140,232,0.08)',
  },
  light: {
    bg0: '#F4F6FA',
    bg1: '#FFFFFF',
    bg2: '#EEF2FB',
    textPrimary: '#0D1117',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    border: 'rgba(0,0,0,0.1)',
    blueprintGrid: 'rgba(26,101,192,0.06)',
    blueprintGridStrong: 'rgba(26,101,192,0.04)',
    blueprintBorder: 'rgba(26,101,192,0.2)',
    blueprintText: '#1A65C0',
    cardShadow: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(26,101,192,0.06)',
  },
} as const

const CONTACT_ICONS = {
  city: MapPin,
  phone: Phone,
  email: Mail,
  website: Globe,
} as const

type ContactKey = keyof typeof CONTACT_ICONS

function buildContactItems(page: {
  city?: string
  phone?: string
  email?: string
  website?: string
}): Array<{ key: ContactKey; label: string; href?: string }> {
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
  const [copied, setCopied] = useState(false)

  const { data: page, isLoading } = useQuery({
    queryKey: ['link-page-public', username],
    queryFn: () => linkPageService.get(),
    enabled: !!username,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: TOKENS.dark.bg0 }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#3B8CE8', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!page || page.username !== username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3 px-4"
        style={{ background: TOKENS.dark.bg0 }}>
        <p className="text-lg font-bold" style={{ color: TOKENS.dark.textPrimary }}>
          Página não encontrada
        </p>
        <p className="text-sm" style={{ color: TOKENS.dark.textSecondary }}>
          @{username} não existe.
        </p>
      </div>
    )
  }

  const t = TOKENS[page.theme]
  const accent = page.accentColor
  const contacts = buildContactItems(page)

  function handleLinkClick(linkId: string) {
    linkPageService.incrementClick(linkId)
  }

  async function handleShare() {
    const url = `${window.location.origin}/${page!.username}`
    if (navigator.share) {
      try { await navigator.share({ title: page!.displayName, url }) } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function handleDownloadPDF() {
    window.print()
  }

  return (
    <div
      className="min-h-dvh flex items-start sm:items-center justify-center py-10 sm:py-12 px-4 relative overflow-hidden"
      id="link-page-root"
      style={{
        background: t.bg0,
        // Variáveis CSS escopadas a esta página — fazem as utilities .blueprint-grid
        // e .blueprint-corner usarem as cores corretas mesmo fora do tema global.
        ['--blueprint-grid' as string]: t.blueprintGrid,
        ['--blueprint-border' as string]: t.blueprintBorder,
        ['--blueprint' as string]: accent,
      }}
    >
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="no-print fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-fast hover:opacity-80 active:scale-95 rounded-input border"
        style={{ background: t.bg1, borderColor: t.blueprintBorder, color: t.textSecondary, boxShadow: t.cardShadow }}
      >
        <ArrowLeft size={14} />
        Voltar
      </button>

      {/* Grid blueprint suave no fundo da página */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(${t.blueprintGridStrong} 1px, transparent 1px),
            linear-gradient(90deg, ${t.blueprintGridStrong} 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Cartão de visitas digital ── */}
      <article
        id="card-print-area"
        className="relative w-full max-w-[448px] rounded-modal border overflow-hidden blueprint-corner"
        style={{
          background: t.bg1,
          borderColor: t.blueprintBorder,
          boxShadow: t.cardShadow,
        }}
      >
        {/* Background grid blueprint do cartão */}
        <div className="blueprint-grid absolute inset-0 pointer-events-none" />

        {/* Identificador técnico no canto direito superior — visual blueprint */}
        <div
          className="absolute top-3 right-4 font-mono text-[10px] tracking-widest uppercase pointer-events-none"
          style={{ color: t.textTertiary, opacity: 0.8 }}
        >
          ID · {page.username}
        </div>

        <div className="relative p-6">
          {/* ── Avatar + identidade ── */}
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-black shrink-0"
              style={{
                background: accent,
                color: '#fff',
                boxShadow: `0 0 0 4px ${t.bg1}, 0 0 0 5px ${t.blueprintBorder}`,
              }}
            >
              {page.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <h1
                className="font-extrabold leading-tight break-words"
                style={{
                  color: t.textPrimary,
                  fontSize: '22px',
                  letterSpacing: '-0.02em',
                }}
              >
                {page.displayName}
              </h1>
              {page.role && (
                <p
                  className="mt-1.5 font-semibold uppercase"
                  style={{
                    color: t.textSecondary,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {page.role}
                </p>
              )}
            </div>
          </div>

          {page.bio && (
            <p
              className="text-sm leading-relaxed mb-5 break-words"
              style={{ color: t.textSecondary }}
            >
              {page.bio}
            </p>
          )}

          {/* ── Separador técnico ── */}
          {contacts.length > 0 && (
            <>
              <Separator color={t.blueprintBorder} label="CONTATO" labelColor={t.textTertiary} bg={t.bg1} />

              <ul className="flex flex-col gap-2.5 mb-5">
                {contacts.map(({ key, label, href }) => {
                  const Icon = CONTACT_ICONS[key]
                  const content = (
                    <span className="flex items-center gap-2.5 group">
                      <span
                        className="w-7 h-7 rounded-input flex items-center justify-center shrink-0 border"
                        style={{
                          background: t.bg2,
                          borderColor: t.blueprintBorder,
                          color: accent,
                        }}
                      >
                        <Icon size={13} strokeWidth={2.2} />
                      </span>
                      <span
                        className="text-sm font-medium truncate min-w-0 flex-1"
                        style={{ color: t.textPrimary }}
                      >
                        {label}
                      </span>
                    </span>
                  )
                  return (
                    <li key={key}>
                      {href ? (
                        <a
                          href={href}
                          target={key === 'website' ? '_blank' : undefined}
                          rel={key === 'website' ? 'noopener noreferrer' : undefined}
                          className="block transition-all duration-fast hover:opacity-80 active:scale-[0.99]"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* ── Links externos ── */}
          {page.links.length > 0 && (
            <>
              <Separator color={t.blueprintBorder} label="LINKS" labelColor={t.textTertiary} bg={t.bg1} />

              <div className="flex flex-col gap-2.5">
                {page.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link.id)}
                    className="group w-full flex items-center justify-between px-4 py-3 rounded-input border font-semibold transition-all duration-fast active:scale-[0.98] no-underline"
                    style={{
                      background: t.bg2,
                      borderColor: t.blueprintBorder,
                      color: t.textPrimary,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accent
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = t.blueprintBorder
                    }}
                  >
                    <span className="text-sm truncate">{link.label}</span>
                    <ExternalLink size={14} style={{ color: accent, flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </>
          )}

          {/* ── Footer técnico ── */}
          <div
            className="mt-6 pt-4 border-t flex items-center justify-between gap-3"
            style={{ borderColor: t.blueprintBorder }}
          >
            <span
              className="font-mono text-[11px] tracking-wide truncate"
              style={{ color: accent, opacity: 0.7 }}
            >
              meiflow.com/{page.username}
            </span>

            <div className="no-print flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-input border text-xs font-medium transition-all duration-fast hover:opacity-80 active:scale-95"
                style={{ background: t.bg2, borderColor: t.blueprintBorder, color: t.textSecondary }}
                title="Compartilhar link"
              >
                <Share2 size={12} />
                {copied ? 'Copiado!' : 'Compartilhar'}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-input border text-xs font-medium transition-all duration-fast hover:opacity-80 active:scale-95"
                style={{ background: t.bg2, borderColor: t.blueprintBorder, color: t.textSecondary }}
                title="Baixar como PDF"
              >
                <Download size={12} />
                PDF
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

// ── Separador com label técnico no estilo blueprint ──
function Separator({
  color,
  label,
  labelColor,
  bg,
}: {
  color: string
  label: string
  labelColor: string
  bg: string
}) {
  return (
    <div className="relative my-4">
      <div className="border-t" style={{ borderColor: color }} />
      <span
        className="absolute -top-[7px] left-0 px-2 font-mono text-[10px] font-semibold uppercase tracking-widest"
        style={{ background: bg, color: labelColor }}
      >
        {label}
      </span>
    </div>
  )
}
