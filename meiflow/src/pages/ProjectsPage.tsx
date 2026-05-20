import { useState } from 'react'
import { FolderKanban, Plus, Pencil, Archive, ArchiveRestore, Calendar } from 'lucide-react'
import { useProjects, useArchivedProjects, useArchiveProject, useUnarchiveProject } from '@/features/projects/hooks'
import { useClients } from '@/features/clients/hooks'
import { useToast } from '@/store/toast'
import ProjectModal from '@/features/projects/components/ProjectModal'
import { EmptyState, StatusBadge } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Project } from '@/services/db'

type FilterStatus = 'all' | 'active' | 'completed' | 'paused' | 'cancelled'
const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' }, { value: 'active', label: 'Em andamento' },
  { value: 'completed', label: 'Concluídos' }, { value: 'paused', label: 'Pausados' },
]

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: archived = [], isLoading: loadingArchived } = useArchivedProjects()
  const { data: clients = [] } = useClients()
  const archiveProject = useArchiveProject()
  const unarchiveProject = useUnarchiveProject()
  const toast = useToast()

  const [filter, setFilter] = useState<FilterStatus>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const activeList = filter === 'all' ? projects : projects.filter((p) => p.status === filter)
  const list = showArchived ? archived : activeList

  function handleEdit(p: Project) { setEditing(p); setModal(true) }
  function handleNew() { setEditing(null); setModal(true) }

  function handleArchive(p: Project) {
    archiveProject.mutate(p.id, {
      onSuccess: () => toast.info(`"${p.name}" arquivado.`, {
        action: { label: 'Desfazer', onClick: () => unarchiveProject.mutate(p.id) },
      }),
    })
  }

  function handleUnarchive(p: Project) {
    unarchiveProject.mutate(p.id, {
      onSuccess: () => toast.success(`"${p.name}" restaurado.`),
    })
  }

  const loading = showArchived ? loadingArchived : isLoading

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-2xl sm:text-h2 font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Projetos
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
            {archived.length > 0 && ` · ${archived.length} arquivado${archived.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowArchived((v) => !v)}
            title={showArchived ? 'Ver ativos' : 'Ver arquivados'}
            className="p-2.5 rounded-input border transition-all hover:opacity-80 min-h-[40px] min-w-[40px] flex items-center justify-center"
            style={{
              borderColor: showArchived ? 'var(--primary)' : 'var(--border)',
              color: showArchived ? 'var(--primary)' : 'var(--text-secondary)',
              background: showArchived ? 'var(--primary-subtle)' : 'var(--bg-1)',
            }}
          >
            <Archive size={15} />
          </button>
          <button onClick={handleNew} data-pwa-tap aria-label="Novo projeto"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 min-h-[44px]"
            style={{ background: 'var(--primary)' }}>
            <Plus size={16} />
            <span className="hidden xs:inline">Novo</span>
          </button>
        </div>
      </div>

      {!showArchived && (
        <div className="mb-4 -mx-4 sm:mx-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 sm:px-0 pb-1">
            {FILTERS.map((f) => {
              const active = filter === f.value
              return (
                <button key={f.value} onClick={() => setFilter(f.value)} data-pwa-tap
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
      )}

      {showArchived && (
        <div className="mb-3 px-3 py-2 rounded-input text-xs font-medium flex items-center gap-2"
          style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
          <Archive size={13} />
          Mostrando projetos arquivados
        </div>
      )}

      {loading ? (
        <SkeletonList variant="generic" count={3} />
      ) : list.length === 0 ? (
        <EmptyState icon={<FolderKanban size={22} />}
          title={showArchived ? 'Nenhum projeto arquivado' : 'Nenhum projeto'}
          description={showArchived ? 'Arquivos aparecerão aqui.' : 'Crie seu primeiro projeto para acompanhar seu trabalho.'}
          action={!showArchived ? (
            <button onClick={handleNew} data-pwa-tap
              className="flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white"
              style={{ background: 'var(--primary)' }}>
              <Plus size={15} /> Novo projeto
            </button>
          ) : undefined} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.map((p) => {
            const client = clients.find((c) => c.id === p.clientId)
            return (
              <div key={p.id} className="rounded-card border overflow-hidden"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
                <div className="px-4 pt-3.5 pb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold leading-snug min-w-0 flex-1 break-words"
                      style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  {client && (
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                      {client.name}
                    </p>
                  )}
                </div>
                <div className="flex items-end justify-between gap-3 px-4 pb-3">
                  <div className="flex items-center gap-1.5 text-[11px] min-w-0" style={{ color: 'var(--text-tertiary)' }}>
                    <Calendar size={12} className="shrink-0" />
                    <span className="truncate">
                      {formatDate(p.startDate)}{p.endDate ? ` → ${formatDate(p.endDate)}` : ''}
                    </span>
                  </div>
                  <span className="font-mono text-base font-bold tabular-nums shrink-0" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(p.value)}
                  </span>
                </div>
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  {showArchived ? (
                    <button onClick={() => handleUnarchive(p)} data-pwa-tap
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                      style={{ color: 'var(--primary)' }}>
                      <ArchiveRestore size={13} /> Restaurar
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(p)} data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                        style={{ color: 'var(--text-secondary)' }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <div className="w-px" style={{ background: 'var(--border)' }} />
                      <button onClick={() => handleArchive(p)} data-pwa-tap
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70"
                        style={{ color: 'var(--text-secondary)' }}>
                        <Archive size={13} /> Arquivar
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ProjectModal open={modal} onClose={() => setModal(false)} editing={editing} />
    </div>
  )
}
