import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

/**
 * Pill discreto que aparece no header quando o usuário está sem internet.
 * Como o app funciona inteiro local (Dexie), o objetivo aqui é só
 * tranquilizar o usuário: "tudo bem, suas alterações estão sendo salvas".
 */
export default function OfflineIndicator() {
  const online = useOnlineStatus()
  if (online) return null

  return (
    <span
      role="status"
      aria-live="polite"
      title="Sem conexão — suas alterações são salvas localmente."
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-badge text-[11px] font-semibold whitespace-nowrap"
      style={{
        background: 'var(--status-pending-bg)',
        color: 'var(--status-pending)',
      }}
    >
      <WifiOff size={12} strokeWidth={2.4} />
      <span className="hidden sm:inline">Sem conexão</span>
      <span className="sm:hidden">Offline</span>
    </span>
  )
}
