import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Printer, FileText } from 'lucide-react'
import RichTextEditor, { type VariableOption } from '@/components/RichTextEditor'
import CustomSelect from '@/components/CustomSelect'
import { Field, inputCls, inputStyle } from '@/components/shared'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'
import {
  useContract,
  useCreateContract,
  useUpdateContract,
} from '@/features/contracts/index'
import { renderMarkdown } from '@/features/contracts/markdown'
import { CONTRACT_TEMPLATES, interpolate } from '@/features/contracts/templates'
import { useProfileStore } from '@/store/profile'
import { formatCurrency, formatDate } from '@/lib/utils'

const AUTOSAVE_DEBOUNCE_MS = 800

/**
 * Detecta conteúdo legado em markdown e converte para HTML, para que
 * contratos criados antes do editor WYSIWYG continuem editáveis sem perda.
 */
function normalizeContent(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trimStart()
  if (trimmed.startsWith('<')) return raw          // já é HTML
  return renderMarkdown(raw)                        // markdown legado → HTML
}

export default function ContractEditor() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const templateId = searchParams.get('template') ?? ''
  const presetClientId = searchParams.get('clientId') ?? ''
  const presetProjectId = searchParams.get('projectId') ?? ''

  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()
  const { data: existing, isLoading: loadingExisting } = useContract(id)
  const create = useCreateContract()
  const update = useUpdateContract()
  const { profile } = useProfileStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showTitleError, setShowTitleError] = useState(false)
  const [contractId, setContractId] = useState<string | null>(null)
  const initializedRef = useRef(false)
  const debounceRef = useRef<number | undefined>(undefined)

  // ─── Hidratação inicial ─────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return
    if (isEditing) {
      if (loadingExisting) return
      if (!existing) return
      setTitle(existing.title)
      setContent(normalizeContent(existing.content))
      setClientId(existing.clientId)
      setProjectId(existing.projectId)
      setContractId(existing.id)
      initializedRef.current = true
      return
    }

    // Novo contrato: pré-seleciona cliente/projeto da URL e aplica template se houver
    if (presetClientId) setClientId(presetClientId)
    if (presetProjectId) setProjectId(presetProjectId)

    if (templateId) {
      const tmpl = CONTRACT_TEMPLATES.find((t) => t.id === templateId)
      if (tmpl) {
        const client = clients.find((c) => c.id === presetClientId)
        const project = projects.find((p) => p.id === presetProjectId)
        const md = interpolate(tmpl.content, {
          client_name: client?.name ?? '[Nome do cliente]',
          client_company: client?.company ?? '',
          contractor_name: profile.name || '[Seu nome]',
          project_name: project?.name ?? '[Nome do projeto]',
          value: project ? formatCurrency(project.value) : '[Valor]',
          start_date: project ? formatDate(project.startDate) : '[Data de início]',
          end_date: project?.endDate ? formatDate(project.endDate) : undefined,
          today: formatDate(new Date()),
        })
        setTitle(tmpl.name)
        setContent(renderMarkdown(md))
      }
    }
    initializedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, existing, loadingExisting])

  // ─── Filtragem de projetos por cliente selecionado ──────────────
  const filteredProjects = useMemo(
    () => projects.filter((p) => !clientId || p.clientId === clientId),
    [projects, clientId],
  )

  // ─── Variáveis disponíveis para inserir no editor ───────────────
  const client = clients.find((c) => c.id === clientId)
  const project = projects.find((p) => p.id === projectId)
  const variables: VariableOption[] = useMemo(() => [
    { key: 'client_name',     label: 'Nome do cliente',     value: client?.name ?? '[Nome do cliente]' },
    { key: 'client_company',  label: 'Empresa do cliente',  value: client?.company ?? '—' },
    { key: 'contractor_name', label: 'Seu nome',            value: profile.name || '[Seu nome]' },
    { key: 'project_name',    label: 'Nome do projeto',     value: project?.name ?? '[Nome do projeto]' },
    { key: 'value',           label: 'Valor do projeto',    value: project ? formatCurrency(project.value) : '[Valor]' },
    { key: 'start_date',      label: 'Data de início',      value: project ? formatDate(project.startDate) : '[Data de início]' },
    { key: 'today',           label: 'Data de hoje',        value: formatDate(new Date()) },
  ], [client, project, profile.name])

  // ─── Autosave ───────────────────────────────────────────────────
  const canSave = title.trim().length >= 2 && content.length >= 10 && clientId && projectId

  useEffect(() => {
    if (!initializedRef.current) return
    if (!canSave) return

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      handleSave({ silent: true })
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, clientId, projectId])

  async function handleSave({ silent = false }: { silent?: boolean } = {}) {
    if (!canSave) {
      if (!silent) setShowTitleError(true)
      return
    }
    setIsSaving(true)
    try {
      if (contractId) {
        await update.mutateAsync({ id: contractId, title, content, clientId, projectId })
      } else {
        const c = await create.mutateAsync({ title, content, clientId, projectId })
        setContractId(c.id)
        // troca a URL para a versão de edição sem recarregar (sem entrar no histórico)
        window.history.replaceState(null, '', `/contracts/${c.id}/edit`)
      }
      setSavedAt(new Date())
    } finally {
      setIsSaving(false)
    }
  }

  function handleBack() {
    navigate('/contracts')
  }

  function handlePrint() {
    window.print()
  }

  if (isEditing && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={22} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="-m-4 md:-m-5 lg:-m-6 min-h-[calc(100dvh-56px)]" style={{ background: 'var(--bg-0)' }}>
      {/* ── Barra superior do editor ── */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{
          background: 'color-mix(in srgb, var(--bg-1) 96%, transparent)',
          borderColor: 'var(--border)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleBack}
            aria-label="Voltar"
            className="p-2 rounded-input transition-all hover:opacity-70 min-h-[40px] min-w-[40px] flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText size={16} style={{ color: 'var(--primary)' }} className="shrink-0" />
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {isEditing ? 'Editar contrato' : 'Novo contrato'}
            </span>
          </div>

          <SaveStatus saving={isSaving} savedAt={savedAt} dirty={initializedRef.current && !savedAt && !!canSave} />

          <button
            onClick={handlePrint}
            aria-label="Imprimir / PDF"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-input border text-sm font-medium transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Printer size={14} /> PDF
          </button>

          <button
            onClick={() => handleSave()}
            disabled={!canSave || isSaving}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 min-h-[40px]"
            style={{ background: 'var(--primary)' }}
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Salvar</span>
          </button>
        </div>
      </header>

      {/* ── Metadados (cliente, projeto, título) ── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-5 pt-4 sm:pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Field label="Cliente">
            <CustomSelect
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Selecione o cliente"
              value={clientId}
              onChange={(v) => { setClientId(v); setProjectId('') }}
            />
          </Field>
          <Field label="Projeto">
            <CustomSelect
              options={filteredProjects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder={clientId ? 'Selecione o projeto' : 'Escolha um cliente antes'}
              value={projectId}
              onChange={setProjectId}
            />
          </Field>
        </div>

        <Field label="Título do contrato" error={showTitleError && title.trim().length < 2 ? 'Informe um título' : undefined}>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (showTitleError) setShowTitleError(false) }}
            placeholder="Ex: Contrato de desenvolvimento web"
            className={inputCls(showTitleError && title.trim().length < 2)}
            style={{ ...inputStyle(showTitleError && title.trim().length < 2), fontSize: '16px' }}
          />
        </Field>
      </div>

      {/* ── Editor WYSIWYG ── */}
      <div className="max-w-5xl mx-auto px-3 sm:px-5 pt-3 pb-12">
        <RichTextEditor
          value={content}
          onChange={setContent}
          variables={variables}
          placeholder="Escreva ou edite o conteúdo do contrato aqui…"
        />
      </div>
    </div>
  )
}

// ─── Indicador de salvamento ─────────────────────────────────────
function SaveStatus({ saving, savedAt, dirty }: { saving: boolean; savedAt: Date | null; dirty: boolean }) {
  let label = ''
  let color = 'var(--text-tertiary)'
  if (saving) { label = 'Salvando…'; color = 'var(--text-secondary)' }
  else if (savedAt) {
    const diff = (Date.now() - savedAt.getTime()) / 1000
    label = diff < 60 ? 'Salvo agora' : `Salvo há ${Math.floor(diff / 60)} min`
    color = 'var(--status-paid)'
  } else if (dirty) { label = 'Não salvo'; color = 'var(--status-pending)' }

  if (!label) return null

  return (
    <span
      className="hidden sm:inline text-xs font-medium tabular-nums whitespace-nowrap"
      style={{ color }}
    >
      {label}
    </span>
  )
}
