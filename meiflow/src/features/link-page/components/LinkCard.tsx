import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2, GripVertical, Check, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { linkSchema } from '../schemas'
import { useDeleteLink, useUpdateLink } from '../hooks'
import { ConfirmModal } from '@/components/ConfirmModal'
import type { LinkFormValues, LinkPageLink } from '../types'

interface Props {
  link: LinkPageLink
  accentColor: string
  index: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
}

export default function LinkCard({ link, accentColor, index, onDragStart, onDragOver, onDrop }: Props) {
  const [editing, setEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteLink = useDeleteLink()
  const updateLink = useUpdateLink()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: { label: link.label, url: link.url },
  })

  function onSave(values: LinkFormValues) {
    updateLink.mutate({ id: link.id, ...values }, { onSuccess: () => setEditing(false) })
  }

  function onCancel() {
    reset({ label: link.label, url: link.url })
    setEditing(false)
  }

  return (
    <div
      draggable={!editing}
      onDragStart={() => { setIsDragging(true); onDragStart(index) }}
      onDragEnd={() => { setIsDragging(false); setIsOver(false) }}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); onDragOver(index) }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => { setIsOver(false); onDrop() }}
      className="relative flex items-start gap-3 p-3 rounded-card border transition-all duration-fast"
      style={{
        background: 'var(--bg-2)',
        borderColor: isOver ? 'var(--primary)' : 'var(--border)',
        opacity: isDragging ? 0.4 : 1,
        cursor: editing ? 'default' : 'grab',
      }}
    >
      <button
        aria-label="Reordenar"
        className="mt-1 cursor-grab active:cursor-grabbing shrink-0"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <GripVertical size={16} />
      </button>

      {editing ? (
        <form onSubmit={handleSubmit(onSave)} className="flex-1 flex flex-col gap-2">
          <div>
            <input
              {...register('label')}
              placeholder="Nome do link"
              className={cn('w-full px-3 py-1.5 rounded-input text-sm border outline-none transition-all duration-fast',
                errors.label ? 'border-red-400' : '')}
              style={{
                background: 'var(--bg-1)',
                color: 'var(--text-primary)',
                borderColor: errors.label ? undefined : 'var(--border)',
              }}
            />
            {errors.label && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--status-overdue)' }}>
                {errors.label.message}
              </p>
            )}
          </div>
          <div>
            <input
              {...register('url')}
              placeholder="https://exemplo.com"
              className={cn('w-full px-3 py-1.5 rounded-input text-sm border outline-none transition-all duration-fast',
                errors.url ? 'border-red-400' : '')}
              style={{
                background: 'var(--bg-1)',
                color: 'var(--text-primary)',
                borderColor: errors.url ? undefined : 'var(--border)',
              }}
            />
            {errors.url && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--status-overdue)' }}>
                {errors.url.message}
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1 rounded-input text-xs border transition-all duration-fast hover:opacity-80"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
              <X size={12} /> Cancelar
            </button>
            <button type="submit"
              className="flex items-center gap-1 px-3 py-1 rounded-input text-xs text-white font-medium transition-all duration-fast hover:opacity-90"
              style={{ background: accentColor }}>
              <Check size={12} /> Salvar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {link.label}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {link.url}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {link.clicks} clique{link.clicks !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {!editing && (
        <div className="flex items-center gap-1 shrink-0">
          <a href={link.url} target="_blank" rel="noopener noreferrer"
            aria-label="Abrir link"
            className="p-2.5 rounded-input transition-all duration-fast hover:opacity-70"
            style={{ color: 'var(--text-tertiary)' }}>
            <ExternalLink size={14} />
          </a>
          <button onClick={() => setEditing(true)} aria-label="Editar link"
            className="p-2.5 rounded-input transition-all duration-fast hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}>
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleteLink.isPending}
            aria-label="Remover link"
            className="p-2.5 rounded-input transition-all duration-fast hover:opacity-70"
            style={{ color: 'var(--status-overdue)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete}
        title="Remover link?"
        description={`O link "${link.label}" será removido do seu cartão de visitas.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={() => { setConfirmDelete(false); deleteLink.mutate(link.id) }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
