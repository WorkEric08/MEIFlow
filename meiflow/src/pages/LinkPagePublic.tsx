import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { linkPageService } from '@/features/link-page/service'

export default function LinkPagePublic() {
  const { username } = useParams<{ username: string }>()

  const { data: page, isLoading } = useQuery({
    queryKey: ['link-page-public', username],
    queryFn: () => linkPageService.get(),
    enabled: !!username,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: '#0D1117' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#3B8CE8', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!page || page.username !== username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3"
        style={{ background: '#0D1117' }}>
        <p className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Página não encontrada</p>
        <p className="text-sm" style={{ color: '#64748B' }}>@{username} não existe.</p>
      </div>
    )
  }

  const isDark = page.theme === 'dark'
  const bg     = isDark ? '#0D1117' : '#F4F6FA'
  const card   = isDark ? '#161B27' : '#FFFFFF'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const text   = isDark ? '#F1F5F9' : '#0D1117'
  const muted  = isDark ? '#94A3B8' : '#64748B'

  async function handleLinkClick(linkId: string, url: string) {
    await linkPageService.incrementClick(linkId)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-dvh flex items-start justify-center py-12 px-4" style={{ background: bg }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black"
            style={{ background: page.accentColor, color: '#fff' }}>
            {page.displayName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold" style={{ color: text }}>{page.displayName}</h1>
          {page.bio && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: muted }}>{page.bio}</p>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          {page.links.map((link) => (
            <button key={link.id}
              onClick={() => handleLinkClick(link.id, link.url)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-card border text-left font-medium transition-all duration-fast hover:opacity-80 active:scale-[0.98]"
              style={{ background: card, borderColor: border, color: text }}>
              <span>{link.label}</span>
              <ExternalLink size={14} style={{ color: page.accentColor, flexShrink: 0 }} />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <a href="/" className="text-xs font-medium transition-all hover:opacity-80"
            style={{ color: muted }}>
            Criado com <span style={{ color: page.accentColor }}>MEIFlow</span>
          </a>
        </div>
      </div>
    </div>
  )
}
