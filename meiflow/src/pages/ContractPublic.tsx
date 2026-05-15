import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, FileText, AlertCircle } from 'lucide-react'
import { useContractBySlug, useAcceptContract } from '@/features/contracts/index'
import { renderMarkdown } from '@/features/contracts/markdown'

export default function ContractPublic() {
  const { slug } = useParams<{ slug: string }>()
  const { data: contract, isLoading } = useContractBySlug(slug ?? '')
  const accept = useAcceptContract()
  const [accepted, setAccepted] = useState(false)

  const accentColor = '#3B8CE8'

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: '#0D1117' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: accentColor, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-3 px-4" style={{ background: '#0D1117' }}>
        <AlertCircle size={32} style={{ color: '#EF4444' }} />
        <p className="text-lg font-bold" style={{ color: '#F1F5F9' }}>Contrato não encontrado</p>
        <p className="text-sm text-center" style={{ color: '#64748B' }}>O link pode ter expirado ou o contrato foi removido.</p>
      </div>
    )
  }

  if (contract.status === 'accepted' || accepted) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4" style={{ background: '#0D1117' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.15)' }}>
          <CheckCircle size={32} style={{ color: '#10B981' }} />
        </div>
        <div className="text-center">
          <p className="text-xl font-bold mb-2" style={{ color: '#F1F5F9' }}>Contrato aceito!</p>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {contract.acceptedAt
              ? `Aceito em ${new Intl.DateTimeFormat('pt-BR').format(new Date(contract.acceptedAt))}`
              : 'Seu aceite foi registrado com sucesso.'}
          </p>
        </div>
        <a href="/" className="text-sm font-medium" style={{ color: accentColor }}>Acessar MEIFlow →</a>
      </div>
    )
  }

  // Compat: contratos novos vêm em HTML (TipTap), legados em markdown.
  const html = contract.content.trimStart().startsWith('<')
    ? contract.content
    : renderMarkdown(contract.content)

  function handleAccept() {
    if (!slug) return
    accept.mutate(slug, {
      onSuccess: () => setAccepted(true),
    })
  }

  return (
    <div className="min-h-dvh py-10 px-4" style={{ background: '#0D1117' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(59,140,232,0.15)' }}>
            <FileText size={18} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: accentColor }}>
              Contrato para aceite
            </p>
            <h1 className="text-lg font-bold" style={{ color: '#F1F5F9' }}>{contract.title}</h1>
          </div>
        </div>

        {/* Contract content */}
        <div className="rounded-card border p-6 mb-8 overflow-auto"
          style={{ background: '#161B27', borderColor: 'rgba(255,255,255,0.08)' }}>
          <style>{`
            .contract-body h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: #F1F5F9; }
            .contract-body h2 { font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 6px; color: #F1F5F9; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
            .contract-body h3 { font-size: 13px; font-weight: 600; margin-top: 14px; color: #F1F5F9; }
            .contract-body p { font-size: 14px; line-height: 1.75; margin-bottom: 10px; color: #94A3B8; }
            .contract-body ul, .contract-body ol { padding-left: 20px; margin-bottom: 10px; }
            .contract-body li { font-size: 14px; line-height: 1.6; color: #94A3B8; margin-bottom: 4px; }
            .contract-body strong { font-weight: 700; color: #F1F5F9; }
            .contract-body em { font-style: italic; }
            .contract-body u { text-decoration: underline; }
            .contract-body blockquote { border-left: 3px solid rgba(255,255,255,0.18); padding: 2px 0 2px 12px; margin: 10px 0; color: #64748B; font-style: italic; }
            .contract-body a { color: #3B8CE8; text-decoration: underline; }
            .contract-body hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0; }
          `}</style>
          <div className="contract-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        {/* Accept button */}
        <div className="flex flex-col items-center gap-3">
          <button onClick={handleAccept} disabled={accept.isPending}
            className="w-full sm:w-auto px-8 py-3.5 rounded-card text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: accentColor }}>
            {accept.isPending ? 'Registrando aceite…' : 'Li e aceito o contrato'}
          </button>
          <p className="text-xs text-center" style={{ color: '#475569' }}>
            Ao clicar, você confirma que leu e concorda com todos os termos acima.
            Seu IP e a data/hora serão registrados.
          </p>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-xs" style={{ color: '#475569' }}>
            Powered by <span style={{ color: accentColor }}>MEIFlow</span>
          </a>
        </div>
      </div>
    </div>
  )
}
