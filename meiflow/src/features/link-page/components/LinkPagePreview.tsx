import { ExternalLink, MapPin, Phone, Mail, Globe } from 'lucide-react'
import type { LinkPage } from '../types'

interface Props {
  page: LinkPage
}

// Tokens espelham globals.css mas são hardcoded porque o preview pode renderizar
// um tema diferente do tema global ativo (light no app dark, ou vice-versa).
const TOKENS = {
  dark: {
    bg0: '#0D1117',
    bg1: '#161B27',
    bg2: '#1E2537',
    textPrimary: '#F1F5F9',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    blueprintGrid: 'rgba(59,140,232,0.06)',
    blueprintBorder: 'rgba(59,140,232,0.22)',
  },
  light: {
    bg0: '#F4F6FA',
    bg1: '#FFFFFF',
    bg2: '#EEF2FB',
    textPrimary: '#0D1117',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    blueprintGrid: 'rgba(26,101,192,0.06)',
    blueprintBorder: 'rgba(26,101,192,0.2)',
  },
} as const

const CONTACT_ICONS = { city: MapPin, phone: Phone, email: Mail, website: Globe } as const
type ContactKey = keyof typeof CONTACT_ICONS

export default function LinkPagePreview({ page }: Props) {
  const t = TOKENS[page.theme]
  const accent = page.accentColor

  const contacts: Array<{ key: ContactKey; value: string }> = [
    page.city    ? { key: 'city',    value: page.city }    : null,
    page.phone   ? { key: 'phone',   value: page.phone }   : null,
    page.email   ? { key: 'email',   value: page.email }   : null,
    page.website ? { key: 'website', value: page.website.replace(/^https?:\/\//, '') } : null,
  ].filter((x): x is { key: ContactKey; value: string } => x !== null)

  return (
    <div
      className="rounded-card border overflow-hidden relative blueprint-corner"
      style={{
        background: t.bg1,
        borderColor: t.blueprintBorder,
        // CSS vars escopadas para as utility classes do projeto
        ['--blueprint-grid' as string]: t.blueprintGrid,
        ['--blueprint-border' as string]: t.blueprintBorder,
        ['--blueprint' as string]: accent,
      }}
    >
      {/* Grid blueprint */}
      <div className="blueprint-grid absolute inset-0 pointer-events-none" />

      {/* ID técnico */}
      <div
        className="absolute top-2 right-3 font-mono text-[8px] tracking-widest uppercase pointer-events-none"
        style={{ color: t.textTertiary, opacity: 0.8 }}
      >
        ID · {page.username || '—'}
      </div>

      <div className="relative p-4">
        {/* Avatar + identidade */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-black shrink-0"
            style={{
              background: accent,
              color: '#fff',
              boxShadow: `0 0 0 3px ${t.bg1}, 0 0 0 4px ${t.blueprintBorder}`,
            }}
          >
            {(page.displayName || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2
              className="font-extrabold leading-tight truncate"
              style={{ color: t.textPrimary, fontSize: '13px', letterSpacing: '-0.02em' }}
            >
              {page.displayName || 'Seu Nome'}
            </h2>
            {page.role && (
              <p
                className="mt-0.5 font-semibold uppercase truncate"
                style={{ color: t.textSecondary, fontSize: '8px', letterSpacing: '0.08em' }}
              >
                {page.role}
              </p>
            )}
          </div>
        </div>

        {page.bio && (
          <p
            className="text-[10px] leading-relaxed mb-3 line-clamp-2"
            style={{ color: t.textSecondary }}
          >
            {page.bio}
          </p>
        )}

        {/* Contatos */}
        {contacts.length > 0 && (
          <div className="mb-3">
            <MiniSeparator color={t.blueprintBorder} label="CONTATO" labelColor={t.textTertiary} bg={t.bg1} />
            <ul className="flex flex-col gap-1.5 mt-2">
              {contacts.map(({ key, value }) => {
                const Icon = CONTACT_ICONS[key]
                return (
                  <li key={key} className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-[3px] flex items-center justify-center shrink-0 border"
                      style={{
                        background: t.bg2,
                        borderColor: t.blueprintBorder,
                        color: accent,
                      }}
                    >
                      <Icon size={9} strokeWidth={2.4} />
                    </span>
                    <span
                      className="text-[10px] font-medium truncate"
                      style={{ color: t.textPrimary }}
                    >
                      {value}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Links */}
        {page.links.length === 0 ? (
          <p
            className="text-center text-[10px] py-2"
            style={{ color: t.textTertiary }}
          >
            Nenhum link adicionado
          </p>
        ) : (
          <div>
            <MiniSeparator color={t.blueprintBorder} label="LINKS" labelColor={t.textTertiary} bg={t.bg1} />
            <div className="flex flex-col gap-1.5 mt-2">
              {page.links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-[6px] border"
                  style={{ background: t.bg2, borderColor: t.blueprintBorder, color: t.textPrimary }}
                >
                  <span className="truncate text-[10px] font-semibold">{link.label}</span>
                  <ExternalLink size={9} style={{ color: accent, flexShrink: 0, marginLeft: 4 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-3 pt-2 border-t flex items-center justify-between gap-2"
          style={{ borderColor: t.blueprintBorder }}
        >
          <span
            className="font-mono text-[8px] truncate"
            style={{ color: accent, opacity: 0.7 }}
          >
            meiflow.com/{page.username || '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function MiniSeparator({
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
    <div className="relative">
      <div className="border-t" style={{ borderColor: color }} />
      <span
        className="absolute -top-[5px] left-0 px-1 font-mono text-[8px] font-semibold uppercase tracking-widest"
        style={{ background: bg, color: labelColor }}
      >
        {label}
      </span>
    </div>
  )
}
