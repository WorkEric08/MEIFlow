import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Link2, User, Palette, Eye, EyeOff, Sun, Moon, LayoutList, Columns2,
  ExternalLink, Check, Loader2,
  type LucideIcon,
} from 'lucide-react'
import { useLinkPage, useUpsertLinkPage, useReorderLinks } from '@/features/link-page/hooks'
import { linkPageService } from '@/features/link-page/service'
import { linkPageSchema } from '@/features/link-page/schemas'
import LinkCard from '@/features/link-page/components/LinkCard'
import AddLinkForm from '@/features/link-page/components/AddLinkForm'
import AccentColorPicker from '@/features/link-page/components/AccentColorPicker'
import LinkPagePreview from '@/features/link-page/components/LinkPagePreview'
import { Modal } from '@/components/shared'
import PhoneInput from '@/components/PhoneInput'
import { useProfileStore } from '@/store/profile'
import type { LinkPageFormValues } from '@/features/link-page/types'

const AUTOSAVE_DEBOUNCE_MS = 800

// ─── Helpers ────────────────────────────────────────────────────
const INPUT_CLS = 'w-full px-3 py-2.5 rounded-input text-sm border outline-none transition-all duration-fast'
const inputStyle = (err?: unknown): React.CSSProperties => ({
  background: 'var(--bg-2)',
  color: 'var(--text-primary)',
  borderColor: err ? 'var(--status-overdue)' : 'var(--border)',
  fontSize: '16px',
})

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
      {hint && !error && <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{hint}</p>}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--status-overdue)' }}>{error}</p>}
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="p-4 sm:p-6 rounded-card border relative overflow-hidden mb-4"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
      <div className="blueprint-grid absolute inset-0 pointer-events-none" />
      <div className="relative">
        <div className="mb-5">
          <h2 className="text-base font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          {description && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{description}</p>}
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </section>
  )
}

function PillToggle<T extends string | boolean>({
  options, value, onChange,
}: {
  options: { value: T; label: string; icon: LucideIcon }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = value === v
        return (
          <button key={String(v)} type="button" data-pwa-tap onClick={() => onChange(v)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-input border text-sm font-semibold transition-all active:scale-[0.98]"
            style={{
              background: active ? 'var(--primary-subtle)' : 'var(--bg-2)',
              borderColor: active ? 'var(--primary)' : 'var(--border)',
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
            }}>
            <Icon size={16} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ─── Indicador de save ──────────────────────────────────────────
function SaveStatus({ saving, savedAt }: { saving: boolean; savedAt: Date | null }) {
  const [recent, setRecent] = useState(false)
  useEffect(() => {
    if (!savedAt) return
    setRecent(true)
    const t = window.setTimeout(() => setRecent(false), 2200)
    return () => window.clearTimeout(t)
  }, [savedAt])

  if (saving) return (
    <span className="hidden xs:flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
      <Loader2 size={12} className="animate-spin" />
      Salvando…
    </span>
  )
  if (recent) return (
    <span className="hidden xs:flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--status-paid)' }}>
      <Check size={12} />
      Salvo
    </span>
  )
  return null
}

type Tab = 'perfil' | 'aparencia' | 'links'

const TABS: { value: Tab; label: string; icon: LucideIcon }[] = [
  { value: 'perfil',    label: 'Perfil',    icon: User },
  { value: 'aparencia', label: 'Aparência', icon: Palette },
  { value: 'links',     label: 'Links',     icon: Link2 },
]

// ─── Página ─────────────────────────────────────────────────────
export default function LinkPageEditor() {
  const navigate = useNavigate()
  const { data: page, isLoading } = useLinkPage()
  const upsert = useUpsertLinkPage()
  const reorderLinks = useReorderLinks()
  const { profile } = useProfileStore()

  const [tab, setTab] = useState<Tab>('perfil')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  // Sync foto do perfil → avatarUrl
  useEffect(() => {
    if (!page) return
    const incoming = profile.photo ?? ''
    const current = page.avatarUrl ?? ''
    if (incoming !== current) linkPageService.upsert({ avatarUrl: incoming || undefined })
  }, [profile.photo, page?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { register, watch, setValue, reset, control, formState: { errors } } = useForm<LinkPageFormValues>({
    resolver: zodResolver(linkPageSchema),
    mode: 'onChange',
    defaultValues: {
      username: '', displayName: '', role: '', bio: '',
      phone: '', email: '', city: '', website: '',
      accentColor: '#3B8CE8', theme: 'dark',
      showLinks: true, layout: 'vertical',
    },
  })

  const watchedValues = watch()

  // ─── Inicialização (apenas uma vez) ───────────────────────────
  const initRef = useRef(false)
  const lastSavedRef = useRef<string>('')
  const debounceRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!page || initRef.current) return
    const values: LinkPageFormValues = {
      username: page.username,
      displayName: page.displayName,
      role: page.role ?? '',
      bio: page.bio ?? '',
      phone: page.phone ?? '',
      email: page.email ?? '',
      city: page.city ?? '',
      website: page.website ?? '',
      accentColor: page.accentColor,
      theme: page.theme,
      showLinks: page.showLinks !== false,
      layout: page.layout ?? 'vertical',
    }
    reset(values)
    lastSavedRef.current = JSON.stringify(values)
    initRef.current = true
  }, [page, reset])

  // ─── Auto-save com debounce ────────────────────────────────────
  useEffect(() => {
    if (!initRef.current) return
    const parsed = linkPageSchema.safeParse(watchedValues)
    if (!parsed.success) return

    const serialized = JSON.stringify(parsed.data)
    if (serialized === lastSavedRef.current) return

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      upsert.mutate(parsed.data, {
        onSuccess: () => {
          lastSavedRef.current = serialized
          setSavedAt(new Date())
        },
      })
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [watchedValues]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Ver página: garante save antes de navegar ────────────────
  async function handleViewPage() {
    if (!page) return
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
      debounceRef.current = undefined
    }
    const parsed = linkPageSchema.safeParse(watchedValues)
    if (parsed.success && JSON.stringify(parsed.data) !== lastSavedRef.current) {
      await upsert.mutateAsync(parsed.data)
      lastSavedRef.current = JSON.stringify(parsed.data)
    }
    navigate(`/${watchedValues.username || page.username}?preview=1`)
  }

  // ─── Drag-and-drop dos links ──────────────────────────────────
  const dragIndex = useRef<number>(-1)
  const overIndex = useRef<number>(-1)

  function handleDrop() {
    const links = [...(page?.links ?? [])]
    if (dragIndex.current < 0 || overIndex.current < 0 || dragIndex.current === overIndex.current) return
    const [moved] = links.splice(dragIndex.current, 1)
    links.splice(overIndex.current, 0, moved)
    reorderLinks.mutate(links)
    dragIndex.current = -1
    overIndex.current = -1
  }

  function handleDisplayNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    const current = watch('username')
    if (!current) setValue('username', linkPageService.generateUsername(e.target.value), { shouldDirty: true })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const previewPage = {
    id: 'preview',
    createdAt: new Date(),
    updatedAt: new Date(),
    links: page?.links ?? [],
    ...watchedValues,
    // avatarUrl vem do perfil das Configurações, não do form
    avatarUrl: page?.avatarUrl,
  }

  return (
    <div className="-m-4 md:-m-5 lg:-m-6 min-h-[calc(100dvh-56px)]"
      style={{ background: 'var(--bg-0)' }}>

      {/* ── Header sticky com título + status + Ver página + abas ── */}
      <header className="sticky top-0 z-30 backdrop-blur border-b"
        style={{
          background: 'color-mix(in srgb, var(--bg-1) 92%, transparent)',
          borderColor: 'var(--border)',
          paddingTop: 'env(safe-area-inset-top)',
        }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link2 size={18} style={{ color: 'var(--primary)' }} className="shrink-0" />
            <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              Cartão de Visitas
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SaveStatus saving={upsert.isPending} savedAt={savedAt} />
            <button onClick={handleViewPage} disabled={!page} data-pwa-tap
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 min-h-[38px]"
              style={{ background: 'var(--primary)' }}>
              <ExternalLink size={14} />
              <span className="hidden xs:inline">Ver página</span>
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-6 pb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {TABS.map(({ value, label, icon: Icon }) => {
              const active = tab === value
              return (
                <button key={value} type="button" data-pwa-tap onClick={() => setTab(value)}
                  className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-input text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: active ? 'var(--primary-subtle)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--primary)' : 'transparent'}`,
                  }}>
                  <Icon size={14} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Conteúdo + preview ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-6 py-5 sm:py-6 grid lg:grid-cols-[1fr_320px] gap-6">

        <main className="min-w-0">
          {/* Tab: Perfil */}
          {tab === 'perfil' && (
            <Section title="Identidade" description="Como você quer ser apresentado no seu cartão">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome de exibição" error={errors.displayName?.message}>
                  <input {...register('displayName')} onBlur={handleDisplayNameBlur} placeholder="Seu Nome"
                    className={INPUT_CLS} style={inputStyle(errors.displayName)} />
                </Field>
                <Field label="Username" error={errors.username?.message} hint="Aparece na URL do cartão">
                  <div className="flex items-center rounded-input border overflow-hidden"
                    style={{ borderColor: errors.username ? 'var(--status-overdue)' : 'var(--border)' }}>
                    <span className="px-3 py-2.5 text-sm shrink-0" style={{ color: 'var(--text-tertiary)', background: 'var(--bg-1)' }}>
                      meiflow.com/
                    </span>
                    <input {...register('username')} placeholder="seu-nome"
                      className="flex-1 px-2 py-2.5 text-sm outline-none min-w-0"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', fontSize: '16px' }} />
                  </div>
                </Field>
              </div>

              <Field label="Bio" error={errors.bio?.message} hint="Até 160 caracteres">
                <textarea {...register('bio')} placeholder="Uma frase sobre você" rows={2} maxLength={160}
                  className={INPUT_CLS + ' resize-none'} style={inputStyle(errors.bio)} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Cargo / Especialidade" error={errors.role?.message}>
                  <input {...register('role')} placeholder="Desenvolvedor Web"
                    className={INPUT_CLS} style={inputStyle(errors.role)} />
                </Field>
                <Field label="Cidade" error={errors.city?.message}>
                  <input {...register('city')} placeholder="Itajaí, SC"
                    className={INPUT_CLS} style={inputStyle(errors.city)} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Telefone" error={errors.phone?.message}>
                  <Controller name="phone" control={control} render={({ field }) => (
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className={INPUT_CLS}
                      style={inputStyle(errors.phone)}
                    />
                  )} />
                </Field>
                <Field label="E-mail" error={errors.email?.message}>
                  <input {...register('email')} placeholder="contato@exemplo.com" type="email" inputMode="email"
                    className={INPUT_CLS} style={inputStyle(errors.email)} />
                </Field>
              </div>

              <Field label="Website" error={errors.website?.message}>
                <input {...register('website')} placeholder="https://meusite.com.br" type="url" inputMode="url"
                  className={INPUT_CLS} style={inputStyle(errors.website)} />
              </Field>
            </Section>
          )}

          {/* Tab: Aparência */}
          {tab === 'aparencia' && (
            <Section title="Aparência" description="Como o cartão é apresentado visualmente">
              <Field label="Cor de destaque">
                <AccentColorPicker
                  value={watchedValues.accentColor}
                  onChange={(c) => setValue('accentColor', c, { shouldDirty: true })}
                />
              </Field>

              <Field label="Tema da página">
                <PillToggle<'dark' | 'light'>
                  options={[
                    { value: 'dark', label: 'Escuro', icon: Moon },
                    { value: 'light', label: 'Claro', icon: Sun },
                  ]}
                  value={watchedValues.theme}
                  onChange={(v) => setValue('theme', v, { shouldDirty: true })}
                />
              </Field>

              <Field label="Layout do cartão">
                <PillToggle<'vertical' | 'horizontal'>
                  options={[
                    { value: 'vertical', label: 'Vertical', icon: LayoutList },
                    { value: 'horizontal', label: 'Horizontal', icon: Columns2 },
                  ]}
                  value={watchedValues.layout}
                  onChange={(v) => setValue('layout', v, { shouldDirty: true })}
                />
              </Field>
            </Section>
          )}

          {/* Tab: Links */}
          {tab === 'links' && (
            <>
              <Section title="Exibição dos links" description={watchedValues.showLinks ? 'Os links estão visíveis no cartão' : 'Os links estão ocultos no cartão'}>
                <PillToggle<boolean>
                  options={[
                    { value: true, label: 'Exibir', icon: Eye },
                    { value: false, label: 'Ocultar', icon: EyeOff },
                  ]}
                  value={watchedValues.showLinks}
                  onChange={(v) => setValue('showLinks', v, { shouldDirty: true })}
                />
              </Section>

              <Section
                title={`Meus links (${page?.links.length ?? 0})`}
                description={(page?.links.length ?? 0) > 1 ? 'Arraste para reordenar' : 'Adicione um link abaixo'}
              >
                {(page?.links.length ?? 0) > 0 && (
                  <div className="flex flex-col gap-2 mb-2">
                    {(page?.links ?? []).map((link, i) => (
                      <LinkCard
                        key={link.id} link={link}
                        accentColor={watchedValues.accentColor}
                        index={i}
                        onDragStart={(idx) => { dragIndex.current = idx }}
                        onDragOver={(idx) => { overIndex.current = idx }}
                        onDrop={handleDrop}
                      />
                    ))}
                  </div>
                )}
                <AddLinkForm accentColor={watchedValues.accentColor} />
              </Section>
            </>
          )}
        </main>

        {/* Preview desktop — sticky lateral */}
        <aside className="hidden lg:block lg:sticky lg:top-[136px] lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Preview ao vivo
          </p>
          <LinkPagePreview page={previewPage} />
        </aside>
      </div>

      {/* ── Botão flutuante mobile para abrir o preview ── */}
      <button onClick={() => setPreviewOpen(true)} data-pwa-tap
        aria-label="Ver preview do cartão"
        className="lg:hidden fixed right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{
          background: 'var(--primary)',
          bottom: 'calc(env(safe-area-inset-bottom) + 80px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        }}>
        <Eye size={16} />
        Preview
      </button>

      {/* ── Sheet mobile com preview ── */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview ao vivo" size="md">
        <div className="p-4 sm:p-5 overflow-y-auto" style={{ maxHeight: '70dvh' }}>
          <LinkPagePreview page={previewPage} />
        </div>
      </Modal>
    </div>
  )
}
