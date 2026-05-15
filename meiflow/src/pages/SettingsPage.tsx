import { useState, useEffect, useRef } from 'react'
import { Settings, User, Palette, Info, Sun, Moon, CheckCheck, Save, RefreshCw, Camera } from 'lucide-react'

declare const __COMMIT_HASH__: string
declare const __COMMIT_DATE__: string
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/theme'
import { useProfileStore } from '@/store/profile'
import { inputCls, inputStyle, Field } from '@/components/shared'
import { cn } from '@/lib/utils'


// ─── Section wrapper ────────────────────────────────────────────
function Section({
  id,
  icon,
  title,
  children,
}: {
  id?: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      id={id}
      className="rounded-card border overflow-hidden"
      style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <span style={{ color: 'var(--primary)' }}>{icon}</span>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

// ─── Row de ação ─────────────────────────────────────────────────
function ActionRow({
  label,
  description,
  action,
}: {
  label: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}


// ─── Perfil ─────────────────────────────────────────────────────
function ProfileSection() {
  const { profile, setProfile } = useProfileStore()
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleSave() {
    setProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const photo = ev.target?.result as string
      setForm((f) => ({ ...f, photo }))
    }
    reader.readAsDataURL(file)
  }

  const isDirty =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.company !== profile.company ||
    form.photo !== profile.photo

  return (
    <Section icon={<User size={16} />} title="Perfil">
      <div className="flex flex-col gap-4">
        {/* Foto de perfil */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative group w-20 h-20 rounded-full overflow-hidden border-2 transition-all hover:opacity-90"
            style={{ borderColor: 'var(--border)' }}
            aria-label="Alterar foto de perfil"
          >
            {form.photo ? (
              <img src={form.photo} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--bg-2)' }}>
                <User size={32} style={{ color: 'var(--text-tertiary)' }} />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <p className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
          Esses dados preenchem automaticamente os contratos gerados pelo MEIFlow.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome completo *">
            <input
              className={inputCls()}
              style={inputStyle()}
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="E-mail">
            <input
              className={inputCls()}
              style={inputStyle()}
              placeholder="seu@email.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <Field label="Empresa / Marca">
            <input
              className={inputCls()}
              style={inputStyle()}
              placeholder="Nome da sua empresa (opcional)"
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={!isDirty && !saved}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-input text-sm font-semibold text-white transition-all',
              isDirty ? 'hover:opacity-90' : 'opacity-50 cursor-default'
            )}
            style={{ background: saved ? 'var(--status-paid)' : 'var(--primary)' }}
          >
            {saved ? <CheckCheck size={14} /> : <Save size={14} />}
            {saved ? 'Salvo!' : 'Salvar perfil'}
          </button>
        </div>
      </div>
    </Section>
  )
}

// ─── Aparência ──────────────────────────────────────────────────
function AppearanceSection() {
  const { theme, setTheme } = useThemeStore()

  return (
    <Section icon={<Palette size={16} />} title="Aparência">
      <div className="flex flex-col gap-3">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Escolha o tema da interface.
        </p>
        <div className="flex gap-3">
          {([
            { value: 'dark', label: 'Escuro', Icon: Moon },
            { value: 'light', label: 'Claro', Icon: Sun },
          ] as const).map(({ value, label, Icon }) => {
            const active = theme === value
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-card border text-sm font-medium transition-all duration-fast hover:opacity-80"
                style={{
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                  background: active ? 'var(--primary-subtle)' : 'var(--bg-2)',
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </Section>
  )
}


// ─── Sobre ──────────────────────────────────────────────────────
function AboutSection() {
  const [updating, setUpdating] = useState(false)
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'done' | 'error'>('idle')

  const commitDate = __COMMIT_DATE__
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(__COMMIT_DATE__))
    : '—'

  async function handleUpdate() {
    setUpdating(true)
    setUpdateStatus('idle')
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        }, { once: true })
        await reg.update()
      }
      setUpdateStatus('done')
    } catch {
      setUpdateStatus('error')
    } finally {
      setUpdating(false)
      setTimeout(() => setUpdateStatus('idle'), 3000)
    }
  }

  return (
    <Section icon={<Info size={16} />} title="Sobre">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Último commit</span>
            <span className="text-xs font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>{__COMMIT_HASH__ || '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Data do commit</span>
            <span className="text-xs font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>{commitDate}</span>
          </div>
        </div>
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        <ActionRow
          label="Atualização"
          description="Força a busca pela versão mais recente da aplicação."
          action={
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-input border text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                borderColor: updateStatus === 'done' ? 'var(--status-paid)' : 'var(--border)',
                color: updateStatus === 'done' ? 'var(--status-paid)' : 'var(--text-secondary)',
              }}
            >
              <RefreshCw size={12} className={updating ? 'animate-spin' : ''} />
              {updating ? 'Verificando…' : updateStatus === 'done' ? 'Atualizado!' : 'Atualizar'}
            </button>
          }
        />
      </div>
    </Section>
  )
}

const DEV_NAME = 'devinfo'

function isDevMode(name: string) {
  return name.trim().toLowerCase() === DEV_NAME
}

// ─── Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const navigate = useNavigate()
  const { profile } = useProfileStore()
  const devMode = isDevMode(profile.name)

  useEffect(() => {
    if (window.location.hash === '#upgrade') {
      const el = document.getElementById('upgrade')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      navigate('/settings', { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} style={{ color: 'var(--primary)' }} />
        <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
      </div>

      <div className="flex flex-col gap-4">
        <ProfileSection />
        <AppearanceSection />
        {devMode && <AboutSection />}
      </div>
    </div>
  )
}
