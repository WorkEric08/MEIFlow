import { useState } from 'react'
import { FolderKanban, Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import { useProjects, useDeleteProject } from '@/features/projects/hooks'
import { useClients } from '@/features/clients/hooks'
import ProjectModal from '@/features/projects/components/ProjectModal'
import { EmptyState, StatusBadge } from '@/components/shared'
import UpgradeModal from '@/components/UpgradeModal'
import { usePlanGate } from '@/hooks/usePlanGate'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Project } from '@/services/db'

type FilterStatus = 'all' | 'active' | 'completed' | 'paused' | 'cancelled'
const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' }, { value: 'active', label: 'Em andamento' },
  { value: 'completed', label: 'Concluídos' }, { value: 'paused', label: 'Pausados' },
]

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: clients = [] } = useClients()
  const deleteProject = useDeleteProject()
  const planGate = usePlanGate()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [upgradeReason, setUpgradeReason] = useState('')

  const filtered = filter === 'all' ? projects : projects.filter((p) => p.status === filter)

  function handleEdit(p: Project) { setEditing(p); setModal(true) }

  function handleNew() {
    const gate = planGate.check('project')
    if (!gate.allowed) { setUpgradeReason(gate.reason); return }
    setEditing(null)
    setModal(true)
  }

  function handleDelete(id: string) { if (confirm('Remover este projeto?')) deleteProject.mutate(id) }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl sm:text-h2 font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}>
              Projetos
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={handleNew}
          data-pwa-tap
          aria-label="Novo projeto"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0 min-h-[44px]"
          style={{ background: 'var(--primary)' }}>
          <Plus size={16} />
          <span className="hidden xs:inline">Novo</span>
        </button>
      </div>

      {/* ── Filtros — scroll horizontal em mobile, evita wrap ── */}
      <div className="mb-4 -mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-4 sm:px-0 pb-1">
          {FILTERS.map((f) => {
            const active = filter === f.value
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                data-pwa-tap
                className="shrink-0 px-3.5 py-2 rounded-badge text-xs font-semibold transition-all whitespace-nowrap min-h-[36px]"
                style={{
                  background: active ? 'var(--primary)' : 'var(--bg-1)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                }}>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderKanban size={22} />}
          title="Nenhum projeto"
          description="Crie seu primeiro projeto para começar a acompanhar seu trabalho."
          action={
            <button onClick={handleNew}
              data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo projeto
            </button>
          } />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((p) => {
            const client = clients.find((c) => c.id === p.clientId)
            return (
              <div key={p.id}
                className="rounded-card border overflow-hidden"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                {/* Topo: título + status */}
                <div className="px-4 pt-3.5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold leading-snug min-w-0 flex-1 break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.name}
                    </p>
                    <StatusBadge status={p.status} />
                  </div>
                  {client && (
                    <p className="text-xs font-medium truncate"
                      style={{ color: 'var(--text-secondary)' }}>
                      {client.name}
                    </p>
                  )}
                </div>

                {/* Meio: meta + valor */}
                <div className="flex items-end justify-between gap-3 px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-[11px] min-w-0"
                    style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar size={12} className="shrink-0" />
                    <span className="truncate">
                      {formatDate(p.startDate)}
                      {p.endDate ? ` → ${formatDate(p.endDate)}` : ''}
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold tabular-nums shrink-0"
                    style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(p.value)}
                  </span>
                </div>

                {/* Rodapé: ações */}
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => handleEdit(p)}
                    data-pwa-tap
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Pencil size={13} /> Editar
                  </button>
                  <div className="w-px" style={{ background: 'var(--border)' }} />
                  <button onClick={() => handleDelete(p.id)}
                    data-pwa-tap
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                    style={{ color: 'var(--status-overdue)' }}>
                    <Trash2 size={13} /> Remover
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <UpgradeModal open={!!upgradeReason} onClose={() => setUpgradeReason('')} reason={upgradeReason} />
      <ProjectModal open={modal} onClose={() => setModal(false)} editing={editing} />
    </div>
  )
}
