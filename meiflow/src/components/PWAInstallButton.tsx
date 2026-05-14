import { Download, CheckCircle } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

/**
 * Renderiza nada quando:
 * - O app já está instalado (state === 'installed')
 * - O navegador não suportou beforeinstallprompt (state === 'idle' após mount)
 *
 * Quando disponível: botão minimalista que chama o prompt nativo do navegador.
 * O usuário só precisa aceitar — nenhuma etapa adicional.
 */
export default function PWAInstallButton() {
  const { state, install } = usePWAInstall()

  if (state === 'installed' || state === 'idle') return null

  return (
    <button
      onClick={install}
      disabled={state === 'installing'}
      aria-label="Instalar MEIFlow como aplicativo"
      title="Instalar MEIFlow"
      className="flex items-center gap-2 px-3 py-2 rounded-input border text-sm font-medium transition-all duration-fast hover:opacity-80 disabled:opacity-50"
      style={{
        borderColor: 'var(--blueprint-border)',
        color: 'var(--blueprint-text)',
        background: 'transparent',
      }}
    >
      {state === 'installing'
        ? <CheckCircle size={14} aria-hidden />
        : <Download size={14} aria-hidden />}
      <span className="hidden xs:inline">
        {state === 'installing' ? 'Aguarde…' : 'Instalar app'}
      </span>
    </button>
  )
}
