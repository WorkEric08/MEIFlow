import { useEffect, useState } from 'react'
import { Bell, FileText, CreditCard, Info, X, BellOff, CheckCheck, Trash2 } from 'lucide-react'
import { useNotifStore, type Notification, type NotifType } from '@/store/notifications'
import { Modal } from '@/components/shared'
import { timeAgo } from '@/lib/utils'

const ICON_MAP: Record<NotifType, React.ReactNode> = {
  contract_accepted: <FileText size={13} />,
  payment_overdue:   <CreditCard size={13} />,
  info:              <Info size={13} />,
}

const COLOR_MAP: Record<NotifType, string> = {
  contract_accepted: 'var(--status-paid)',
  payment_overdue:   'var(--status-overdue)',
  info:              'var(--status-active)',
}

// ─── Item individual ─────────────────────────────────────────────
function NotifItem({
  n,
  onMarkRead,
  onDelete,
}: {
  n: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="group relative flex items-start gap-3 px-5 py-3.5 transition-all duration-fast border-b last:border-b-0"
      style={{
        background: n.read ? 'transparent' : 'var(--primary-subtle)',
        borderLeftWidth: '2px',
        borderLeftStyle: 'solid',
        borderLeftColor: n.read ? 'transparent' : 'var(--primary)',
        borderBottomColor: 'var(--border)',
        cursor: n.read ? 'default' : 'pointer',
      }}
      onClick={() => !n.read && onMarkRead(n.id)}
    >
      {/* Ícone */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: `${COLOR_MAP[n.type]}22`,
          color: n.read ? 'var(--text-tertiary)' : COLOR_MAP[n.type],
        }}
      >
        {ICON_MAP[n.type]}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1.5 mb-0.5">
          {!n.read && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'var(--primary)' }}
            />
          )}
          <p
            className="text-xs truncate"
            style={{
              color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)',
              fontWeight: n.read ? 400 : 600,
            }}
          >
            {n.title}
          </p>
        </div>
        <p
          className="text-xs line-clamp-2 leading-relaxed"
          style={{ color: n.read ? 'var(--text-tertiary)' : 'var(--text-secondary)' }}
        >
          {n.description}
        </p>
        <p
          className="text-[10px] mt-1 font-medium"
          style={{ color: n.read ? 'var(--text-tertiary)' : 'var(--primary)' }}
        >
          {timeAgo(n.createdAt)}
        </p>
      </div>

      {/* Deletar */}
      <button
        aria-label="Remover notificação"
        onClick={(e) => { e.stopPropagation(); onDelete(n.id) }}
        className="absolute top-3 right-3 p-1 rounded-input transition-all opacity-0 group-hover:opacity-100 hover:opacity-70"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <X size={11} />
      </button>
    </div>
  )
}

// ─── Separador de seção ──────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <div
      className="px-5 py-1.5 border-b"
      style={{ background: 'var(--bg-0)', borderColor: 'var(--border)' }}
    >
      <span
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Bell + painel principal ─────────────────────────────────────
export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markRead, markAllRead, deleteOne, clear, sync } =
    useNotifStore()

  useEffect(() => { sync() }, [sync])

  const unread = notifications.filter((n) => !n.read)
  const read   = notifications.filter((n) => n.read)
  const hasAny = notifications.length > 0

  return (
    <>
      {/* Sino com badge de contagem */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Notificações"
        className="relative p-2 rounded-input transition-all hover:opacity-70"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white leading-none"
            style={{ background: 'var(--status-overdue)' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Notificações" size="sm" className="!max-w-[500px]">
        <div className="-mx-5 -my-4 flex flex-col">

          {/* Sub-header: contagem + ações */}
          {hasAny && (
            <div
              className="flex items-center justify-between px-5 py-2.5 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-medium" style={{ color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-tertiary)' }}>
                {unreadCount > 0
                  ? `${unreadCount} nova${unreadCount > 1 ? 's' : ''}`
                  : 'Todas lidas'}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs transition-all hover:opacity-70"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <CheckCheck size={12} />
                  Marcar todas como lidas
                </button>
              )}
            </div>
          )}

          {/* Lista */}
          {!hasAny ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-2)', color: 'var(--text-tertiary)' }}
              >
                <BellOff size={20} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Nenhuma notificação
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  Você está em dia com tudo!
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '550px' }}>
              {/* Não lidas */}
              {unread.length > 0 && (
                <>
                  {read.length > 0 && <SectionLabel label="Novas" />}
                  {unread.map((n) => (
                    <NotifItem key={n.id} n={n} onMarkRead={markRead} onDelete={deleteOne} />
                  ))}
                </>
              )}

              {/* Lidas */}
              {read.length > 0 && (
                <>
                  {unread.length > 0 && <SectionLabel label="Anteriores" />}
                  {read.map((n) => (
                    <NotifItem key={n.id} n={n} onMarkRead={markRead} onDelete={deleteOne} />
                  ))}
                </>
              )}
            </div>
          )}

          {/* Footer: limpar tudo */}
          {hasAny && (
            <div
              className="flex justify-center px-5 py-2.5 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={clear}
                className="flex items-center gap-1.5 text-xs transition-all hover:opacity-70"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <Trash2 size={11} />
                Limpar todas
              </button>
            </div>
          )}

        </div>
      </Modal>
    </>
  )
}
