import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { linkSchema } from '../schemas'
import { useAddLink } from '../hooks'
import type { LinkFormValues } from '../types'

interface Props {
  accentColor: string
}

export default function AddLinkForm({ accentColor }: Props) {
  const addLink = useAddLink()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: { label: '', url: '' },
  })

  function onSubmit(values: LinkFormValues) {
    addLink.mutate(values, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}
      className="p-4 rounded-card border"
      style={{ background: 'var(--bg-2)', borderColor: 'var(--blueprint-border)' }}>

      <p className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: 'var(--blueprint-text)' }}>
        Adicionar link
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <input
            {...register('label')}
            placeholder="Nome (ex: Instagram)"
            className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
            style={{
              background: 'var(--bg-1)',
              color: 'var(--text-primary)',
              borderColor: errors.label ? 'var(--status-overdue)' : 'var(--border)',
            }}
          />
          {errors.label && (
            <p className="text-xs mt-1" style={{ color: 'var(--status-overdue)' }}>
              {errors.label.message}
            </p>
          )}
        </div>

        <div className="flex-[2]">
          <input
            {...register('url')}
            placeholder="https://instagram.com/usuario"
            className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
            style={{
              background: 'var(--bg-1)',
              color: 'var(--text-primary)',
              borderColor: errors.url ? 'var(--status-overdue)' : 'var(--border)',
            }}
          />
          {errors.url && (
            <p className="text-xs mt-1" style={{ color: 'var(--status-overdue)' }}>
              {errors.url.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={addLink.isPending}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white shrink-0 transition-all duration-fast hover:opacity-90 disabled:opacity-50"
          style={{ background: accentColor }}
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>
    </form>
  )
}
