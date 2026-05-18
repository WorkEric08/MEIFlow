import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal, Field, inputCls, inputStyle } from '@/components/shared'
import { useUnsavedConfirm } from '@/hooks/useUnsavedConfirm'
import { clientSchema, type ClientFormValues } from '../schemas'
import { useCreateClient, useUpdateClient } from '../hooks'
import type { Client } from '@/services/db'

interface Props {
  open: boolean
  onClose: () => void
  editing?: Client | null
}

export default function ClientModal({ open, onClose, editing }: Props) {
  const create = useCreateClient()
  const update = useUpdateClient()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', phone: '', company: '', notes: '' },
  })

  const { handleClose, dialog } = useUnsavedConfirm(isDirty, onClose)

  useEffect(() => {
    if (editing) reset({ name: editing.name, email: editing.email, phone: editing.phone ?? '', company: editing.company ?? '', notes: editing.notes ?? '' })
    else reset({ name: '', email: '', phone: '', company: '', notes: '' })
    // reset é referência estável do RHF — omitida intencionalmente das deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, open])

  function onSubmit(values: ClientFormValues) {
    if (editing) {
      update.mutate({ id: editing.id, ...values }, { onSuccess: onClose })
    } else {
      create.mutate(values, { onSuccess: onClose })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <>
      {dialog}
      <Modal open={open} onClose={handleClose} title={editing ? 'Editar cliente' : 'Novo cliente'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5">

        {/* Identidade — quem é o cliente */}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Nome *" error={errors.name?.message}>
            <input {...register('name')} placeholder="Nome completo" className={inputCls(!!errors.name)} style={inputStyle(!!errors.name)} />
          </Field>
          <Field label="Empresa" error={errors.company?.message}>
            <input {...register('company')} placeholder="Nome da empresa" className={inputCls()} style={inputStyle()} />
          </Field>
        </div>

        {/* Contato — como alcançar */}
        <div className="grid grid-cols-2 gap-2.5">
          <Field label="E-mail *" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="email@exemplo.com" className={inputCls(!!errors.email)} style={inputStyle(!!errors.email)} />
          </Field>
          <Field label="Telefone" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="(47) 99999-9999" className={inputCls()} style={inputStyle()} />
          </Field>
        </div>

        {/* Observações — largura total */}
        <Field label="Observações" error={errors.notes?.message}>
          <textarea {...register('notes')} placeholder="Anotações sobre o cliente…" rows={1}
            className={inputCls() + ' resize-none'} style={inputStyle()} />
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
            {isPending ? 'Salvando…' : editing ? 'Salvar' : 'Criar cliente'}
          </button>
        </div>
      </form>
    </Modal>
    </>
  )
}
