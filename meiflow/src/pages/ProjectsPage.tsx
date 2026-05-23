import { useState } from 'react'
import { FolderKanban, Plus, Pencil, Archive, ArchiveRestore, Calendar } from 'lucide-react'
import { useProjects, useArchivedProjects, useArchiveProject, useUnarchiveProject } from '@/features/projects/hooks'
import { useClients } from '@/features/clients/hooks'
import { useToast } from '@/store/toast'
import ProjectModal from '@/features/projects/components/ProjectModal'
import { EmptyState } from '@/components/shared'
import { SkeletonList } from '@/components/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/services/db'

type FilterStatus = 'all' | ProjectStatus
const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all',       label: 'Todos' },
  { value: 'active',    label: 'Em andamento' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'paused',    label: 'Pausados' },
]

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active:    'Em andamento',
  completed: 'Concluído',
  paused:    'Pausado',
  cancelled: 'Cancelado',
}

function statusColor(status: ProjectStatus): string {
  if (status === 'completed') return 'var(--status-paid)'
  if (status === 'paused')    return 'var(--status-pending)'
  if (status === 'cancelled') return 'var(--status-overdue)'
  return 'var(--status-active)'
}

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
              background: showArchived ? 'var(--primary-subtle)' : 'transparent',
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
          <div className="flex gap-1.5 px-4 sm:px-0 pb-1">
            {FILTERS.map((f) => {
              const active = filter === f.value
              return (
                <button key={f.value} onClick={() => setFilter(f.value)} data-pwa-tap
                  className="shrink-0 px-3 py-1.5 rounded-badge text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: active ? 'var(--primary)' : 'transparent',
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
        <div className="flex flex-col gap-2">
          {list.map((p) => {
            const client = clients.find((c) => c.id === p.clientId)
            const color = statusColor(p.status)
            return (
              <article key={p.id}
                className="rounded-card border overflow-hidden transition-colors"
                style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>

                {/* Linha principal */}
                <div className="px-4 py-3 flex items-start gap-3">
                  {/* Ponto de status */}
                  <span aria-hidden
                    className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                    style={{ background: color }} />

                  {/* Nome + cliente + datas */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug break-words"
                      style={{ color: 'var(--text-primary)' }}>
                      {p.name}
                    </p>
                    <p className="text-xs mt-0.5 truncate"
                      style={{ color: 'var(--text-tertiary)' }}>
                      {client?.name ?? 'Cliente removido'}
                    </p>
                    <p className="text-[11px] mt-0.5 inline-flex items-center gap-1"
                      style={{ color: 'var(--text-tertiary)' }}>
                      <Calendar size={10} aria-hidden />
                      {formatDate(p.startDate)}{p.endDate ? ` → ${formatDate(p.endDate)}` : ''}
                    </p>
                  </div>

                  {/* Valor + status */}
                  <div className="text-right shrink-0">
                    <p className="font-mono text-base font-bold tabular-nums leading-tight"
                      style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(p.value)}
                    </p>
                    <p className="text-[11px] font-medium mt-0.5"
                      style={{ color }}>
                      {STATUS_LABEL[p.status]}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-stretch border-t" style={{ borderColor: 'var(--border)' }}>
                  {showArchived ? (
                    <button onClick={() => handleUnarchive(p)} data-pwa-tap
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all hover:opacity-70"
                      style={{ color: 'var(--primary)' }}>
                      <ArchiveRestore size={13} /> Restaurar
                    </button>
                  ) : (
                    <>
                      <div className="flex-1" />
                      <button onClick={() => handleEdit(p)} data-pwa-tap
                        aria-label="Editar"
                        title="Editar"
                        className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleArchive(p)} data-pwa-tap
                        aria-label="Arquivar"
                        title="Arquivar"
                        className="px-4 flex items-center justify-center transition-all hover:opacity-70 border-l"
                        style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                        <Archive size={13} />
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ProjectModal open={modal} onClose={() => setModal(false)} editing={editing} />
    </div>
  )
}
