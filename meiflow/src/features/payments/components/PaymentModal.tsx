import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Field } from '@/components/shared'
import { useUnsavedConfirm } from '@/hooks/useUnsavedConfirm'
import CustomSelect from '@/components/CustomSelect'
import DateInput from '@/components/DateInput'
import CurrencyInput from '@/components/CurrencyInput'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { paymentSchema, useCreatePayment, useUpdatePayment, type PaymentFormValues } from '../index'
import type { Payment } from '@/services/db'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Payment | null
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid',    label: 'Pago' },
  { value: 'overdue', label: 'Atrasado' },
]

export default function PaymentModal({ open, onClose, editing }: Props) {
  const create = useCreatePayment()
  const update = useUpdatePayment()
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()

  const { handleSubmit, reset, watch, control, formState: { errors, isDirty } } =
    useForm<PaymentFormValues>({
      resolver: zodResolver(paymentSchema),
      defaultValues: { projectId: '', clientId: '', description: '', amount: 0, dueDate: new Date().toISOString().slice(0, 10), status: 'pending', paidAt: '' },
    })

  const { handleClose, dialog } = useUnsavedConfirm(isDirty, onClose)
  const watchedClientId = watch('clientId')
  const filteredProjects = projects.filter((p) => !watchedClientId || p.clientId === watchedClientId)

  useEffect(() => {
    if (editing) reset({ projectId: editing.projectId, clientId: editing.clientId, description: editing.description, amount: editing.amount, dueDate: editing.dueDate, status: editing.status, paidAt: editing.paidAt ?? '' })
    else reset({ projectId: '', clientId: '', description: '', amount: 0, dueDate: new Date().toISOString().slice(0, 10), status: 'pending', paidAt: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, open])

  function onSubmit(values: PaymentFormValues) {
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
      <Modal open={open} onClose={handleClose} title={editing ? 'Editar pagamento' : 'Novo pagamento'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5">

        {/* Cliente + Projeto — 2 colunas */}
        <div className="grid grid-cols-2 gap-2.5">
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
          <Field label="Projeto *" error={errors.projectId?.message}>
            <Controller name="projectId" control={control} render={({ field }) => (
              <CustomSelect
                options={filteredProjects.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="Selecione…"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.projectId}
              />
            )} />
          </Field>
        </div>

        {/* Descrição — largura total */}
        <Field label="Descrição *" error={errors.description?.message}>
          <Controller name="description" control={control} render={({ field }) => (
            <input
              {...field}
              placeholder="Ex: Parcela 1 — Desenvolvimento"
              className={inputBase}
              style={inputStyle(!!errors.description)}
            />
          )} />
        </Field>

        {/* Valor + Vencimento — 2 colunas */}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Valor (R$) *" error={errors.amount?.message}>
            <Controller name="amount" control={control} render={({ field }) => (
              <CurrencyInput
                value={Number(field.value)}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.amount}
              />
            )} />
          </Field>
          <Field label="Vencimento *" error={errors.dueDate?.message}>
            <Controller name="dueDate" control={control} render={({ field }) => (
              <DateInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors.dueDate}
              />
            )} />
          </Field>
        </div>

        {/* Status — largura total */}
        <Field label="Status">
          <Controller name="status" control={control} render={({ field }) => (
            <CustomSelect
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )} />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={handleClose}
            className="px-4 py-2 rounded-input text-sm border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            className="px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--primary)' }}>
            {isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar pagamento'}
          </button>
        </div>
      </form>
    </Modal>
    </>
  )
}
