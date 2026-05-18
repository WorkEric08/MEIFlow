import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link2, Sun, Moon, ExternalLink, LayoutList, Columns2, Eye, EyeOff } from 'lucide-react'
import { useLinkPage, useUpsertLinkPage, useReorderLinks } from '@/features/link-page/hooks'
import { linkPageService } from '@/features/link-page/service'
import { linkPageSchema } from '@/features/link-page/schemas'
import LinkCard from '@/features/link-page/components/LinkCard'
import AddLinkForm from '@/features/link-page/components/AddLinkForm'
import AccentColorPicker from '@/features/link-page/components/AccentColorPicker'
import LinkPagePreview from '@/features/link-page/components/LinkPagePreview'
import { useProfileStore } from '@/store/profile'
import type { LinkPageFormValues } from '@/features/link-page/types'

function formatPhone(value: string): string {
  // Extrai apenas dígitos, limitado a 11 (DDD + 9 + 8)
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''

  // Auto-insere o 9 após o DDD se o usuário não colocar
  let d = digits
  if (d.length > 2 && d[2] !== '9') {
    d = (d.slice(0, 2) + '9' + d.slice(2)).slice(0, 11)
  }

  const ddd = d.slice(0, 2)
  const nine = d.slice(2, 3)
  const rest = d.slice(3)

  if (d.length <= 2) return `(${ddd}`
  if (d.length === 3) return `(${ddd}) ${nine}`
  return `(${ddd}) ${nine} ${rest}`
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--status-overdue)' }}>{error}</p>}
    </div>
  )
}

export default function LinkPageEditor() {
  const navigate = useNavigate()
  const { data: page, isLoading } = useLinkPage()
  const upsert = useUpsertLinkPage()
  const reorderLinks = useReorderLinks()
  const { profile } = useProfileStore()

  // Sincroniza a foto do perfil de Configurações → avatarUrl do cartão automaticamente
  useEffect(() => {
    if (!page) return
    const incoming = profile.photo ?? ''
    const current  = page.avatarUrl ?? ''
    if (incoming !== current) {
      linkPageService.upsert({ avatarUrl: incoming || undefined })
    }
  }, [profile.photo, page?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } =
    useForm<LinkPageFormValues>({
      resolver: zodResolver(linkPageSchema),
      defaultValues: {
        username: '',
        displayName: '',
        role: '',
        bio: '',
        phone: '',
        email: '',
        city: '',
        website: '',
        accentColor: '#3B8CE8',
        theme: 'dark',
        showLinks: true,
        layout: 'vertical',
      },
    })

  const watchedValues = watch()

  useEffect(() => {
    if (page) {
      reset({
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
      })
    }
  }, [page, reset])

  function onSubmit(values: LinkPageFormValues) { upsert.mutate(values) }

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

  const previewPage = { id: 'preview', createdAt: new Date(), updatedAt: new Date(), links: page?.links ?? [], ...watchedValues }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link2 size={18} style={{ color: 'var(--primary)' }} aria-hidden />
            <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Cartão de Visitas</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Seu cartão digital público de contato e links</p>
        </div>
        {page && (
          <button
            onClick={() => navigate(`/${page.username}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-input border text-sm font-medium transition-all duration-fast hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <ExternalLink size={14} /> Ver página
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="flex flex-col gap-6">
          <section className="p-5 rounded-card border relative overflow-hidden"
            style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
            <div className="blueprint-grid absolute inset-0 pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--blueprint-text)' }}>Perfil</p>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nome de exibição" error={errors.displayName?.message}>
                    <input {...register('displayName')} onBlur={handleDisplayNameBlur} placeholder="Seu Nome"
                      className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.displayName ? 'var(--status-overdue)' : 'var(--border)' }} />
                  </Field>
                  <Field label="Username" error={errors.username?.message}>
                    <div className="flex items-center rounded-input border overflow-hidden"
                      style={{ borderColor: errors.username ? 'var(--status-overdue)' : 'var(--border)' }}>
                      <span className="px-3 py-2 text-sm shrink-0" style={{ color: 'var(--text-tertiary)', background: 'var(--bg-1)' }}>meiflow.com/</span>
                      <input {...register('username')} placeholder="seu-nome"
                        className="flex-1 px-2 py-2 text-sm outline-none"
                        style={{ background: 'var(--bg-2)', color: 'var(--text-primary)' }} />
                    </div>
                  </Field>
                </div>
                <Field label="Bio" error={errors.bio?.message}>
                  <textarea {...register('bio')} placeholder="Uma frase sobre você (máx. 160 caracteres)" rows={2} maxLength={160}
                    className="w-full px-3 py-2 rounded-input text-sm border outline-none resize-none transition-all duration-fast"
                    style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.bio ? 'var(--status-overdue)' : 'var(--border)' }} />
                </Field>

                {/* ── Cargo + Cidade ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Cargo / Especialidade" error={errors.role?.message}>
                    <input {...register('role')} placeholder="Desenvolvedor Web Freelancer"
                      className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.role ? 'var(--status-overdue)' : 'var(--border)' }} />
                  </Field>
                  <Field label="Cidade" error={errors.city?.message}>
                    <input {...register('city')} placeholder="Itajaí, SC"
                      className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.city ? 'var(--status-overdue)' : 'var(--border)' }} />
                  </Field>
                </div>

                {/* ── Telefone + E-mail ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Telefone" error={errors.phone?.message}>
                    <input
                      {...register('phone')}
                      onChange={(e) => {
                        setValue('phone', formatPhone(e.target.value), { shouldDirty: true, shouldValidate: false })
                      }}
                      placeholder="(00) 0 0000-0000"
                      inputMode="tel"
                      className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.phone ? 'var(--status-overdue)' : 'var(--border)' }}
                    />
                  </Field>
                  <Field label="E-mail de contato" error={errors.email?.message}>
                    <input {...register('email')} placeholder="contato@exemplo.com" type="email" inputMode="email"
                      className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
                      style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.email ? 'var(--status-overdue)' : 'var(--border)' }} />
                  </Field>
                </div>

                {/* ── Website (full width) ── */}
                <Field label="Website" error={errors.website?.message}>
                  <input {...register('website')} placeholder="https://meusite.com.br" type="url" inputMode="url"
                    className="w-full px-3 py-2 rounded-input text-sm border outline-none transition-all duration-fast"
                    style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', borderColor: errors.website ? 'var(--status-overdue)' : 'var(--border)' }} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Cor de destaque">
                    <AccentColorPicker value={watchedValues.accentColor} onChange={(c) => setValue('accentColor', c, { shouldDirty: true })} />
                  </Field>
                  <Field label="Tema da página">
                    <div className="flex gap-2">
                      {(['dark', 'light'] as const).map((t) => (
                        <button key={t} type="button" onClick={() => setValue('theme', t, { shouldDirty: true })}
                          className="flex items-center gap-2 px-3 py-2 rounded-input border text-sm font-medium transition-all duration-fast"
                          style={{ background: watchedValues.theme === t ? 'var(--primary-subtle)' : 'var(--bg-2)', borderColor: watchedValues.theme === t ? 'var(--primary)' : 'var(--border)', color: watchedValues.theme === t ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                          {t === 'dark' ? 'Escuro' : 'Claro'}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Layout do cartão">
                    <div className="flex gap-2">
                      {(['vertical', 'horizontal'] as const).map((l) => (
                        <button key={l} type="button" onClick={() => setValue('layout', l, { shouldDirty: true })}
                          className="flex items-center gap-2 px-3 py-2 rounded-input border text-sm font-medium transition-all duration-fast"
                          style={{ background: watchedValues.layout === l ? 'var(--primary-subtle)' : 'var(--bg-2)', borderColor: watchedValues.layout === l ? 'var(--primary)' : 'var(--border)', color: watchedValues.layout === l ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {l === 'vertical' ? <LayoutList size={14} /> : <Columns2 size={14} />}
                          {l === 'vertical' ? 'Vertical' : 'Horizontal'}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Links">
                    <div className="flex gap-2">
                      {([true, false] as const).map((v) => (
                        <button key={String(v)} type="button" onClick={() => setValue('showLinks', v, { shouldDirty: true })}
                          className="flex items-center gap-2 px-3 py-2 rounded-input border text-sm font-medium transition-all duration-fast"
                          style={{ background: watchedValues.showLinks === v ? 'var(--primary-subtle)' : 'var(--bg-2)', borderColor: watchedValues.showLinks === v ? 'var(--primary)' : 'var(--border)', color: watchedValues.showLinks === v ? 'var(--primary)' : 'var(--text-secondary)' }}>
                          {v ? <Eye size={14} /> : <EyeOff size={14} />}
                          {v ? 'Exibir' : 'Ocultar'}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={!isDirty || upsert.isPending}
                    className="px-5 py-2 rounded-input text-sm font-semibold text-white transition-all duration-fast hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'var(--primary)' }}>
                    {upsert.isPending ? 'Salvando…' : 'Salvar perfil'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Links ({page?.links.length ?? 0})
            </p>
            <div className="flex flex-col gap-2 mb-4">
              {(page?.links ?? []).map((link, i) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  accentColor={watchedValues.accentColor}
                  index={i}
                  onDragStart={(idx) => { dragIndex.current = idx }}
                  onDragOver={(idx) => { overIndex.current = idx }}
                  onDrop={handleDrop}
                />
              ))}
            </div>
            <AddLinkForm accentColor={watchedValues.accentColor} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>Preview</p>
          <LinkPagePreview page={previewPage} />
        </aside>
      </div>
    </div>
  )
}
