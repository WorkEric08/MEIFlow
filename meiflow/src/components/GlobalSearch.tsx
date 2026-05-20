import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, FolderKanban, CreditCard, FileText } from 'lucide-react'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { usePayments } from '@/features/payments/index'
import { useContracts } from '@/features/contracts/index'
import { formatCurrency, formatDate } from '@/lib/utils'

type ResultType = 'client' | 'project' | 'payment' | 'contract'

interface ResultItem {
  id: string
  type: ResultType
  title: string
  subtitle: string
  href: string
}

const TYPE_LABEL: Record<ResultType, string> = {
  client: 'Cliente', project: 'Projeto', payment: 'Pagamento', contract: 'Contrato',
}
const TYPE_ICON: Record<ResultType, React.ReactNode> = {
  client: <Users size={13} />, project: <FolderKanban size={13} />,
  payment: <CreditCard size={13} />, contract: <FileText size={13} />,
}
const TYPE_COLOR: Record<ResultType, string> = {
  client: 'var(--primary)', project: 'var(--status-active)',
  payment: 'var(--status-paid)', contract: 'var(--text-secondary)',
}

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState(0)

  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const { data: payments = [] } = usePayments()
  const { data: contracts = [] } = useContracts()

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 40) }
  }, [open])

  useEffect(() => { setSelected(0) }, [query])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) { e.preventDefault(); handleSelect(results[selected]) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, selected, query])

  if (!open) return null

  const q = query.trim().toLowerCase()

  const results: ResultItem[] = q.length < 1 ? [] : [
    ...clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.company ?? '').toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ id: c.id, type: 'client' as const, title: c.name, subtitle: c.email + (c.company ? ` · ${c.company}` : ''), href: '/clients' })),
    ...projects
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({ id: p.id, type: 'project' as const, title: p.name, subtitle: formatCurrency(p.value), href: '/projects' })),
    ...payments
      .filter((p) => p.description.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({ id: p.id, type: 'payment' as const, title: p.description, subtitle: `${formatCurrency(p.amount)} · ${formatDate(p.dueDate)}`, href: '/payments' })),
    ...contracts
      .filter((c) => c.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((c) => ({ id: c.id, type: 'contract' as const, title: c.title, subtitle: TYPE_LABEL.contract, href: `/contracts/${c.id}/edit` })),
  ]

  function handleSelect(item: ResultItem) {
    navigate(item.href)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed top-[8vh] left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg px-4">
        <div
          className="rounded-card border shadow-2xl overflow-hidden animate-fade-in"
          style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <Search size={16} className="shrink-0" style={{ color: 'var(--text-tertiary)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar clientes, projetos, pagamentos…"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)', fontSize: '16px' }}
            />
            {query ? (
              <button onClick={() => setQuery('')} style={{ color: 'var(--text-tertiary)' }}>
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border)', background: 'var(--bg-0)', color: 'var(--text-tertiary)' }}>
                Esc
              </kbd>
            )}
          </div>

          {/* Results */}
          {q.length >= 1 ? (
            results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Nenhum resultado para "{query}"
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto py-1">
                {results.map((item, i) => (
                  <button
                    key={item.type + item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ background: i === selected ? 'var(--bg-2)' : 'transparent' }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span
                      className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
                      style={{ background: 'var(--bg-0)', color: TYPE_COLOR[item.type] }}
                    >
                      {TYPE_ICON[item.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{item.subtitle}</p>
                    </div>
                    <span
                      className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-0)', color: TYPE_COLOR[item.type] }}
                    >
                      {TYPE_LABEL[item.type]}
                    </span>
                  </button>
                ))}
              </div>
            )
          ) : (
            <p className="px-4 py-3.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Digite para buscar em todos os registros
            </p>
          )}
        </div>
      </div>
    </>
  )
}
