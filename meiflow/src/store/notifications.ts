import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { db } from '@/services/db'

export type NotifType = 'contract_accepted' | 'payment_overdue' | 'info'

export interface Notification {
  id: string
  type: NotifType
  title: string
  description: string
  createdAt: Date
  read: boolean
}

interface NotifStore {
  notifications: Notification[]
  unreadCount: number
  add: (n: Omit<Notification, 'createdAt' | 'read'> & { id: string }) => void
  markRead: (id: string) => void
  markAllRead: () => void
  deleteOne: (id: string) => void
  clear: () => void
  sync: () => Promise<void>
}

function countUnread(list: Notification[]) {
  return list.filter((n) => !n.read).length
}

export const useNotifStore = create<NotifStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      add: (n) => {
        set((s) => {
          // dedup por ID estável — não recria notificações já existentes
          if (s.notifications.some((existing) => existing.id === n.id)) return s
          const notif: Notification = {
            ...n,
            createdAt: new Date(),
            read: false,
          }
          const notifications = [notif, ...s.notifications].slice(0, 100)
          return { notifications, unreadCount: countUnread(notifications) }
        })
      },

      markRead: (id) => {
        set((s) => {
          const notifications = s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
          return { notifications, unreadCount: countUnread(notifications) }
        })
      },

      markAllRead: () => {
        set((s) => {
          const notifications = s.notifications.map((n) => ({ ...n, read: true }))
          return { notifications, unreadCount: 0 }
        })
      },

      deleteOne: (id) => {
        set((s) => {
          const notifications = s.notifications.filter((n) => n.id !== id)
          return { notifications, unreadCount: countUnread(notifications) }
        })
      },

      clear: () => set({ notifications: [], unreadCount: 0 }),

      sync: async () => {
        const { add } = get()
        const today = new Date().toISOString().slice(0, 10)

        // Uma notificação por contrato aceito — ID estável baseado no ID do contrato
        const accepted = await db.contracts.where('status').equals('accepted').toArray()
        for (const c of accepted) {
          add({
            id: `contract_accepted_${c.id}`,
            type: 'contract_accepted',
            title: 'Contrato aceito',
            description: `"${c.title}" foi aceito pelo cliente.`,
          })
        }

        // Uma notificação de atraso por dia — ID estável: data do dia
        const overdue = await db.payments.where('status').equals('overdue').toArray()
        if (overdue.length > 0) {
          add({
            id: `payment_overdue_${today}`,
            type: 'payment_overdue',
            title: `${overdue.length} pagamento${overdue.length > 1 ? 's' : ''} em atraso`,
            description: 'Acesse Pagamentos para regularizar.',
          })
        }
      },
    }),
    {
      name: 'meiflow-notifications',
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          // restitui objetos Date serializados como string
          if (key === 'createdAt' && typeof value === 'string') return new Date(value)
          return value
        },
      }),
      // não persiste unreadCount — recalculado na reidratação
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        if (state) state.unreadCount = countUnread(state.notifications)
      },
    }
  )
)
