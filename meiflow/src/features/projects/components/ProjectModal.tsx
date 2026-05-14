import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Field } from '@/components/shared'
import { useUnsavedConfirm } from '@/hooks/useUnsavedConfirm'
import CustomSelect from '@/components/CustomSelect'
import DateInput from '@/components/DateInput'
import CurrencyInput from '@/components/CurrencyInput'
import { useClients } from '@/features/clients/hooks'
import { projectSchema, type ProjectFormValues } from '../schemas'
import { useCreateProject, useUpdateProject } from '../hooks'
import type { Project } from '@/services/db'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Project | null
  defaultClientId?: string
}

const STATUS_OPTIONS = [
  { value: 'active',     label: 'Em andamento' },
  { value: 'completed',  label: 'Concluído' },
  { value: 'paused',     label: 'Pausado' },
  { value: 'cancelled',  label: 'Cancelado' },
]

export default function ProjectModal({ open, onClose, editing, defaultClientId }: Props) {
  const create = useCreateProject()
  const update = useUpdateProject()
  const { data: clients = [] } = useClients()

  const { handleSubmit, reset, control, formState: { errors, isDirty } } =
    useForm<ProjectFormValues>({
      resolver: zodResolver(projectSchema),
      defaultValues: { clientId: defaultClientId ?? '', name: '', description: '', value: 0, status: 'active', startDate: new Date().toISOString().slice(0, 10), endDate: '' },
    })

  const { handleClose, dialog } = useUnsavedConfirm(isDirty, onClose)

  useEffect(() => {
    if (editing) reset({ clientId: editing.clientId, name: editing.name, description: editing.description ?? '', value: editing.value, status: editing.status, startDate: editing.startDate, endDate: editing.endDate ?? '' })
    else reset({ clientId: defaultClientId ?? '', name: '', description: '', value: 0, status: 'active', startDate: new Date().toISOString().slice(0, 10), endDate: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, open, defaultClientId])

  function onSubmit(values: ProjectFormValues) {
    if (editing) update.mutate({ id: editing.id, ...values }, { onSuccess: onClose })
    else create.mutate(values, { onSuccess: onClose })
  }

  const isPending = create.isPending || update.isPending

  const inputBase = 'w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast focus:ring-1'
  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: 'var(--bg-2)',
    color: 'var(--text-primary)',
    borderColor: hasError ? 'var(--status-overdue)' : 'var(--border)',
  })

  return (
    <>
      {dialog}
      <Modal open={open} onClose={handleClose} title={editing ? 'Editar projeto' : 'Novo projeto'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Cliente *" error={errors.clientId?.message}>
            <Controller name="clientId" control={control} render={({ field }) => (
              <CustomSelect
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Selecione…"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.clientId}
              />
            )} />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <Controller name="status" control={control} render={({ field }) => (
              <CustomSelect
                options={STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )} />
          </Field>
        </div>

        <Field label="Nome do projeto *" error={errors.name?.message}>
          <Controller name="name" control={control} render={({ field }) => (
            <input
              {...field}
              placeholder="Ex: Site institucional"
              className={inputBase}
              style={inputStyle(!!errors.name)}
            />
          )} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Valor (R$) *" error={errors.value?.message}>
            <Controller name="value" control={control} render={({ field }) => (
              <CurrencyInput
                value={Number(field.value)}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.value}
              />
            )} />
          </Field>
          <Field label="Início *" error={errors.startDate?.message}>
            <Controller name="startDate" control={control} render={({ field }) => (
              <DateInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.startDate}
              />
            )} />
          </Field>
          <Field label="Entrega">
            <Controller name="endDate" control={control} render={({ field }) => (
              <DateInput
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )} />
          </Field>
        </div>

        <Field label="Descrição" error={errors.description?.message}>
          <Controller name="description" control={control} render={({ field }) => (
            <textarea
              {...field}
              placeholder="Escopo do projeto…"
              rows={2}
              className={inputBase + ' resize-none'}
              style={inputStyle(!!errors.description)}
            />
          )} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={handleClose}
            className="px-4 py-2 rounded-input text-sm border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            className="px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--primary)' }}>
            {isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar projeto'}
          </button>
        </div>
      </form>
    </Modal>
    </>
  )
}
