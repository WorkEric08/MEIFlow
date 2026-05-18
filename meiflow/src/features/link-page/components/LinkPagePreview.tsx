import { ExternalLink, MapPin, Phone, Mail, Globe } from 'lucide-react'
import type { LinkPage } from '../types'

interface Props {
  page: LinkPage
}

const TOKENS = {
  dark: {
    bg0: '#0D1117', bg1: '#161B27', bg2: '#1E2537',
    textPrimary: '#F1F5F9', textSecondary: '#94A3B8', textTertiary: '#64748B',
    blueprintGrid: 'rgba(59,140,232,0.06)', blueprintBorder: 'rgba(59,140,232,0.22)',
  },
  light: {
    bg0: '#F4F6FA', bg1: '#FFFFFF', bg2: '#EEF2FB',
    textPrimary: '#0D1117', textSecondary: '#64748B', textTertiary: '#94A3B8',
    blueprintGrid: 'rgba(26,101,192,0.06)', blueprintBorder: 'rgba(26,101,192,0.2)',
  },
} as const

const CONTACT_ICONS = { city: MapPin, phone: Phone, email: Mail, website: Globe } as const
type ContactKey = keyof typeof CONTACT_ICONS

export default function LinkPagePreview({ page }: Props) {
  const t = TOKENS[page.theme]
  const accent = page.accentColor
  const showLinks = page.showLinks !== false
  const layout = page.layout ?? 'vertical'

  const contacts: Array<{ key: ContactKey; value: string }> = [
    page.city    ? { key: 'city',    value: page.city }    : null,
    page.phone   ? { key: 'phone',   value: page.phone }   : null,
    page.email   ? { key: 'email',   value: page.email }   : null,
    page.website ? { key: 'website', value: page.website.replace(/^https?:\/\//, '') } : null,
  ].filter((x): x is { key: ContactKey; value: string } => x !== null)

  const cssVars = {
    ['--blueprint-grid' as string]: t.blueprintGrid,
    ['--blueprint-border' as string]: t.blueprintBorder,
    ['--blueprint' as string]: accent,
  }

  const IdentityBlock = (
    <div className="flex items-center gap-2.5 mb-2.5">
      <div
        className="w-10 h-10 rounded-full shrink-0 overflow-hidden"
        style={{ boxShadow: `0 0 0 2px ${t.bg1}, 0 0 0 3px ${t.blueprintBorder}` }}
      >
        {page.avatarUrl ? (
          <img src={page.avatarUrl} alt={page.displayName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm font-black"
            style={{ background: accent, color: '#fff' }}>
            {(page.displayName || '?').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-extrabold leading-tight truncate" style={{ color: t.textPrimary, fontSize: '12px', letterSpacing: '-0.02em' }}>
          {page.displayName || 'Seu Nome'}
        </h2>
        {page.role && (
          <p className="mt-0.5 font-semibold uppercase truncate" style={{ color: t.textSecondary, fontSize: '8px', letterSpacing: '0.08em' }}>
            {page.role}
          </p>
        )}
      </div>
    </div>
  )

  const BioBlock = page.bio && (
    <p className="text-[9px] leading-relaxed mb-2.5 line-clamp-2" style={{ color: t.textSecondary }}>
      {page.bio}
    </p>
  )

  const ContactsBlock = contacts.length > 0 && (
    <div className="mb-2.5">
      <MiniSeparator color={t.blueprintBorder} label="CONTATO" labelColor={t.textTertiary} bg={t.bg1} />
      <ul className="flex flex-col gap-1.5 mt-2">
        {contacts.map(({ key, value }) => {
          const Icon = CONTACT_ICONS[key]
          return (
            <li key={key} className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-[3px] flex items-center justify-center shrink-0 border"
                style={{ background: t.bg2, borderColor: t.blueprintBorder, color: accent }}>
                <Icon size={9} strokeWidth={2.4} />
              </span>
              <span className="text-[9px] font-medium truncate" style={{ color: t.textPrimary }}>{value}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )

  const LinksBlock = showLinks && (
    page.links.length === 0 ? (
      <p className="text-center text-[9px] py-1.5" style={{ color: t.textTertiary }}>Nenhum link</p>
    ) : (
      <div className="flex flex-col gap-1.5">
        {page.links.map((link) => (
          <div key={link.id} className="flex items-center justify-between px-2 py-1.5 rounded-[5px] border"
            style={{ background: t.bg2, borderColor: t.blueprintBorder, color: t.textPrimary }}>
            <span className="truncate text-[9px] font-semibold">{link.label}</span>
            <ExternalLink size={8} style={{ color: accent, flexShrink: 0, marginLeft: 3 }} />
          </div>
        ))}
      </div>
    )
  )

  const Footer = (
    <div className="mt-2.5 pt-2 border-t flex items-center" style={{ borderColor: t.blueprintBorder }}>
      <span className="font-mono text-[8px] truncate" style={{ color: accent, opacity: 0.7 }}>
        meiflow.com/{page.username || '—'}
      </span>
    </div>
  )

  if (layout === 'horizontal') {
    return (
      <div
        className="rounded-card border overflow-hidden relative"
        style={{ background: t.bg1, borderColor: t.blueprintBorder, ...cssVars }}
      >
        <div className="blueprint-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-2 right-3 font-mono text-[7px] tracking-widest uppercase pointer-events-none"
          style={{ color: t.textTertiary, opacity: 0.8 }}>
          ID · {page.username || '—'}
        </div>

        {/* Two columns */}
        <div className="relative flex">
          {/* Left: identity + bio + contacts */}
          <div className="flex-1 min-w-0 p-3 pt-5">
            {IdentityBlock}
            {BioBlock}
            {ContactsBlock}
          </div>

          {/* Divider + right: links */}
          {showLinks && (
            <>
              <div className="w-px self-stretch shrink-0" style={{ background: t.blueprintBorder }} />
              <div className="w-[108px] shrink-0 p-3 pt-5">
                {page.links.length > 0 && (
                  <>
                    <MiniSeparator color={t.blueprintBorder} label="LINKS" labelColor={t.textTertiary} bg={t.bg1} />
                    <div className="mt-2">{LinksBlock}</div>
                  </>
                )}
                {page.links.length === 0 && (
                  <p className="text-center text-[9px] pt-2" style={{ color: t.textTertiary }}>Nenhum link</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer full-width */}
        <div className="relative px-3 pb-3">{Footer}</div>
      </div>
    )
  }

  // Vertical layout (default)
  return (
    <div
      className="rounded-card border overflow-hidden relative"
      style={{ background: t.bg1, borderColor: t.blueprintBorder, ...cssVars }}
    >
      <div className="blueprint-grid absolute inset-0 pointer-events-none" />
      <div className="absolute top-2 right-3 font-mono text-[8px] tracking-widest uppercase pointer-events-none"
        style={{ color: t.textTertiary, opacity: 0.8 }}>
        ID · {page.username || '—'}
      </div>

      <div className="relative p-3.5 pt-5">
        {IdentityBlock}
        {BioBlock}
        {ContactsBlock}

        {showLinks && (
          <>
            <MiniSeparator color={t.blueprintBorder} label="LINKS" labelColor={t.textTertiary} bg={t.bg1} />
            <div className="mt-2">{LinksBlock}</div>
          </>
        )}

        {Footer}
      </div>
    </div>
  )
}

function MiniSeparator({ color, label, labelColor, bg }: {
  color: string; label: string; labelColor: string; bg: string
}) {
  return (
    <div className="relative">
      <div className="border-t" style={{ borderColor: color }} />
      <span className="absolute -top-[5px] left-0 px-1 font-mono text-[7px] font-semibold uppercase tracking-widest"
        style={{ background: bg, color: labelColor }}>
        {label}
      </span>
    </div>
  )
}
