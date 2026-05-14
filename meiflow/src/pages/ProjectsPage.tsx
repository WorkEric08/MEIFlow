import { useState } from 'react'
import { FolderKanban, Plus, Pencil, Trash2 } from 'lucide-react'
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban size={18} style={{ color: 'var(--primary)' }} />
            <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Projetos</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{projects.length} projeto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <Plus size={15} /> Novo projeto
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="px-3 py-1.5 rounded-badge text-xs font-medium transition-all"
            style={{ background: filter === f.value ? 'var(--primary)' : 'var(--bg-2)', color: filter === f.value ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filter === f.value ? 'var(--primary)' : 'var(--border)'}` }}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FolderKanban size={20} />} title="Nenhum projeto" description="Crie seu primeiro projeto para começar."
          action={<button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white" style={{ background: 'var(--primary)' }}><Plus size={14} /> Novo projeto</button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => {
            const client = clients.find((c) => c.id === p.clientId)
            return (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-card border transition-all hover:opacity-90"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {client?.name ?? '—'} · Início {formatDate(p.startDate)}
                    {p.endDate ? ` · Entrega ${formatDate(p.endDate)}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="font-mono text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>{formatCurrency(p.value)}</span>
                  <button onClick={() => handleEdit(p)} aria-label="Editar" className="p-2.5 rounded-input transition-all hover:opacity-70" style={{ color: 'var(--text-secondary)' }}><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(p.id)} aria-label="Remover" className="p-2.5 rounded-input transition-all hover:opacity-70" style={{ color: 'var(--status-overdue)' }}><Trash2 size={14} /></button>
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
