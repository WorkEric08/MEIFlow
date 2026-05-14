import { useState, useRef } from 'react'
import { Settings, User, Palette, Database, Info, Sun, Moon, Download, Trash2, CheckCheck, Save } from 'lucide-react'
import { useThemeStore } from '@/store/theme'
import { useProfileStore } from '@/store/profile'
import { db } from '@/services/db'
import { inputCls, inputStyle, Field } from '@/components/shared'
import { cn } from '@/lib/utils'

const APP_VERSION = '0.1.0'

// ─── Section wrapper ────────────────────────────────────────────
function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div
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

// ─── Row de ação (botão perigoso ou neutro) ──────────────────────
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
function ProfileSection({ onDevMode }: { onDevMode: () => void }) {
  const { profile, setProfile } = useProfileStore()
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)
  const devBuffer = useRef('')

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key.length !== 1) { devBuffer.current = ''; return }
    const TARGET = 'devinfo'
    devBuffer.current = (devBuffer.current + e.key).toLowerCase().slice(-TARGET.length)
    if (devBuffer.current === TARGET) {
      onDevMode()
      devBuffer.current = ''
    }
  }

  function handleSave() {
    setProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isDirty =
    form.name !== profile.name ||
    form.email !== profile.email ||
    form.company !== profile.company

  return (
    <Section icon={<User size={16} />} title="Perfil do contratante">
      <div className="flex flex-col gap-4">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
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
              onKeyDown={handleNameKeyDown}
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

// ─── Dados ──────────────────────────────────────────────────────
function DataSection() {
  const [clearing, setClearing] = useState(false)

  async function handleExport() {
    const [clients, projects, payments, contracts] = await Promise.all([
      db.clients.toArray(),
      db.projects.toArray(),
      db.payments.toArray(),
      db.contracts.toArray(),
    ])
    const data = { exportedAt: new Date().toISOString(), clients, projects, payments, contracts }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meiflow-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleClearAll() {
    if (!confirm('Tem certeza? Todos os clientes, projetos, pagamentos e contratos serão removidos permanentemente.')) return
    setClearing(true)
    await Promise.all([
      db.clients.clear(),
      db.projects.clear(),
      db.payments.clear(),
      db.contracts.clear(),
    ])
    setClearing(false)
  }

  return (
    <Section icon={<Database size={16} />} title="Dados">
      <div className="flex flex-col gap-4">
        <ActionRow
          label="Exportar backup"
          description="Baixa um arquivo JSON com todos os seus dados."
          action={
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-input border text-xs font-medium transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <Download size={12} />
              Exportar
            </button>
          }
        />
        <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        <ActionRow
          label="Limpar todos os dados"
          description="Remove permanentemente clientes, projetos, pagamentos e contratos."
          action={
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-input text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{ background: 'var(--status-overdue-bg)', color: 'var(--status-overdue)' }}
            >
              <Trash2 size={12} />
              {clearing ? 'Limpando…' : 'Limpar tudo'}
            </button>
          }
        />
      </div>
    </Section>
  )
}

// ─── Sobre ──────────────────────────────────────────────────────
function AboutSection() {
  return (
    <Section icon={<Info size={16} />} title="Sobre">
      <div className="flex flex-col gap-3">
        {[
          { label: 'Versão', value: APP_VERSION },
          { label: 'Armazenamento', value: 'IndexedDB (local, offline-first)' },
          { label: 'Plataforma', value: 'PWA / Web' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
            <span className="text-xs font-medium font-mono" style={{ color: 'var(--text-secondary)' }}>{value}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ─── Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [devMode, setDevMode] = useState(false)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} style={{ color: 'var(--primary)' }} />
        <h1 className="text-h2 font-bold" style={{ color: 'var(--text-primary)' }}>Configurações</h1>
      </div>

      <div className="flex flex-col gap-4">
        <ProfileSection onDevMode={() => setDevMode(prev => !prev)} />
        <AppearanceSection />
        {devMode && <DataSection />}
        {devMode && <AboutSection />}
      </div>
    </div>
  )
}
