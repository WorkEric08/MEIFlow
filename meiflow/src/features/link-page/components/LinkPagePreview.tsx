import { ExternalLink } from 'lucide-react'
import type { LinkPage } from '../types'

interface Props {
  page: LinkPage
}

export default function LinkPagePreview({ page }: Props) {
  const isDark = page.theme === 'dark'

  const bg     = isDark ? '#0D1117' : '#F4F6FA'
  const card   = isDark ? '#161B27' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const text   = isDark ? '#F1F5F9' : '#0D1117'
  const muted  = isDark ? '#94A3B8' : '#64748B'

  return (
    <div
      className="rounded-card overflow-hidden border"
      style={{ background: bg, borderColor: border }}
    >
      <div className="p-4 pb-0 text-center">
        {/* Avatar placeholder */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold"
          style={{ background: page.accentColor, color: '#fff' }}
        >
          {page.displayName.charAt(0).toUpperCase()}
        </div>

        <h2 className="font-bold text-sm" style={{ color: text }}>
          {page.displayName}
        </h2>

        {page.bio && (
          <p className="text-xs mt-1 max-w-[200px] mx-auto leading-relaxed" style={{ color: muted }}>
            {page.bio}
          </p>
        )}

        <p className="text-xs mt-1 font-mono" style={{ color: page.accentColor }}>
          meiflow.com/{page.username}
        </p>
      </div>

      <div className="p-4 flex flex-col gap-2">
        {page.links.length === 0 && (
          <p className="text-center text-xs py-4" style={{ color: muted }}>
            Nenhum link adicionado
          </p>
        )}
        {page.links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between px-3 py-2 rounded-input border text-xs font-medium transition-all"
            style={{ background: card, borderColor: border, color: text }}
          >
            <span className="truncate">{link.label}</span>
            <ExternalLink size={10} style={{ color: page.accentColor, flexShrink: 0, marginLeft: 4 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
