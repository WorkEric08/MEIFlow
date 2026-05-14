import { create } from 'zustand'
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
  add: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  deleteOne: (id: string) => void
  clear: () => void
  sync: () => Promise<void>
}

function countUnread(list: Notification[]) {
  return list.filter((n) => !n.read).length
}

export const useNotifStore = create<NotifStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  add: (n) => {
    const notif: Notification = {
      ...n,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    }
    set((s) => {
      const notifications = [notif, ...s.notifications].slice(0, 50)
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
    const { notifications, add } = get()
    const existingTitles = new Set(notifications.map((n) => n.title + n.description))

    const accepted = await db.contracts.where('status').equals('accepted').toArray()
    for (const c of accepted) {
      const title = 'Contrato aceito'
      const description = `"${c.title}" foi aceito pelo cliente.`
      if (!existingTitles.has(title + description)) add({ type: 'contract_accepted', title, description })
    }

    const today = new Date().toISOString().slice(0, 10)
    const overdue = await db.payments.where('status').equals('overdue').toArray()
    if (overdue.length > 0) {
      const title = `${overdue.length} pagamento${overdue.length > 1 ? 's' : ''} em atraso`
      const description = 'Acesse Pagamentos para regularizar.'
      const key = title + description + today
      const alreadyToday = notifications.some(
        (n) => n.title === title && n.description === description &&
          new Date(n.createdAt).toISOString().slice(0, 10) === today
      )
      if (!alreadyToday) add({ type: 'payment_overdue', title, description })
    }
  },
}))
