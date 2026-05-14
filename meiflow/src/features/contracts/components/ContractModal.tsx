import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText } from 'lucide-react'
import { Modal, Field, inputCls, inputStyle } from '@/components/shared'
import CustomSelect from '@/components/CustomSelect'
import { useUnsavedConfirm } from '@/hooks/useUnsavedConfirm'
import MarkdownEditor from '@/components/MarkdownEditor'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import { contractSchema, useCreateContract, type ContractFormValues } from '../index'
import { useProfileStore } from '@/store/profile'
import { CONTRACT_TEMPLATES, interpolate } from '../templates'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Client, Project } from '@/services/db'

interface Props {
  open: boolean
  onClose: () => void
  onCreated?: (id: string) => void
}

export default function ContractModal({ open, onClose, onCreated }: Props) {
  const create = useCreateContract()
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const { profile } = useProfileStore()
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [step, setStep] = useState<'template' | 'form'>('template')

  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors, isDirty } } =
    useForm<ContractFormValues>({
      resolver: zodResolver(contractSchema),
      defaultValues: { projectId: '', clientId: '', title: '', content: '' },
    })

  // No step 'template' não há dados para perder — confirmação só no step 'form'
  const { handleClose, dialog } = useUnsavedConfirm(step === 'form' && isDirty, onClose)

  const watchedClientId  = watch('clientId')
  const watchedProjectId = watch('projectId')
  const filteredProjects = projects.filter((p) => !watchedClientId || p.clientId === watchedClientId)

  useEffect(() => {
    if (!open) {
      setStep('template')
      setSelectedTemplate('')
      reset()
    }
    // reset é estável por referência no RHF — seguro omitir das deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function applyTemplate(templateId: string) {
    const tmpl = CONTRACT_TEMPLATES.find((t) => t.id === templateId)
    if (!tmpl) return

    const client  = clients.find((c) => c.id === watchedClientId) as Client | undefined
    const project = projects.find((p) => p.id === watchedProjectId) as Project | undefined

    const content = interpolate(tmpl.content, {
      client_name:     client?.name ?? '[Nome do cliente]',
      client_company:  client?.company ?? '',
      contractor_name: profile.name || '[Seu nome]',
      project_name:    project?.name ?? '[Nome do projeto]',
      value:           project ? formatCurrency(project.value) : '[Valor]',
      start_date:      project ? formatDate(project.startDate) : '[Data de início]',
      end_date:        project?.endDate ? formatDate(project.endDate) : undefined,
      today:           formatDate(new Date()),
    })

    setValue('title', tmpl.name, { shouldDirty: true })
    setValue('content', content, { shouldDirty: true })
    setSelectedTemplate(templateId)
    setStep('form')
  }

  function onSubmit(values: ContractFormValues) {
    create.mutate(values, {
      onSuccess: (contract) => {
        onCreated?.(contract.id)
        onClose()
      },
    })
  }

  return (
    <>
      {dialog}
      <Modal open={open} onClose={handleClose} title="Novo contrato" size="lg">
      {step === 'template' ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Escolha um template para começar, ou clique em "Em branco" para escrever do zero.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {CONTRACT_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => applyTemplate(t.id)}
                className="flex flex-col items-start gap-1.5 p-4 rounded-card border text-left transition-all duration-fast hover:opacity-80"
                style={{ background: 'var(--bg-2)', borderColor: 'var(--blueprint-border)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={14} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.category}</span>
              </button>
            ))}
          </div>

          <button onClick={() => setStep('form')}
            className="w-full py-2.5 rounded-input border text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            Em branco — escrever do zero
          </button>
        </div>
      ) : (
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

          <Field label="Título do contrato *" error={errors.title?.message}>
            <input {...register('title')} placeholder="Ex: Contrato de desenvolvimento web"
              className={inputCls(!!errors.title)} style={inputStyle(!!errors.title)} />
          </Field>

          {/* Controller garante fonte única de verdade para o MarkdownEditor */}
          <Field label="Conteúdo *" error={errors.content?.message}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.content}
                />
              )}
            />
          </Field>

          <div className="flex justify-between items-center pt-2">
            <button type="button" onClick={() => setStep('template')}
              className="text-sm transition-all hover:opacity-70" style={{ color: 'var(--text-tertiary)' }}>
              ← Trocar template
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={handleClose}
                className="px-4 py-2 rounded-input text-sm border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={create.isPending}
                className="px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--primary)' }}>
                {create.isPending ? 'Criando…' : 'Criar contrato'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
    </>
  )
}
