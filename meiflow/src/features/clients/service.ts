import { db } from '@/services/db'
import { generateId } from '@/lib/utils'
import type { Client } from '@/services/db'
import type { ClientFormValues } from './schemas'

export const clientService = {
  async list(): Promise<Client[]> {
    const all = await db.clients.orderBy('name').toArray()
    return all.filter((c) => !c.archivedAt)
  },

  async listArchived(): Promise<Client[]> {
    const all = await db.clients.orderBy('name').toArray()
    return all.filter((c) => !!c.archivedAt)
  },

  async get(id: string): Promise<Client | undefined> {
    return db.clients.get(id)
  },

  async create(data: ClientFormValues): Promise<Client> {
    const now = new Date()
    const client: Client = { id: generateId(), ...data, createdAt: now, updatedAt: now }
    await db.clients.put(client)
    return client
  },

  async update(id: string, data: ClientFormValues): Promise<Client> {
    const existing = await db.clients.get(id)
    if (!existing) throw new Error('Cliente não encontrado.')
    const updated: Client = { ...existing, ...data, updatedAt: new Date() }
    await db.clients.put(updated)
    return updated
  },

  async archive(id: string): Promise<void> {
    const existing = await db.clients.get(id)
    if (!existing) return
    await db.clients.put({ ...existing, archivedAt: new Date(), updatedAt: new Date() })
  },

  async unarchive(id: string): Promise<void> {
    const existing = await db.clients.get(id)
    if (!existing) return
    await db.clients.put({ ...existing, archivedAt: undefined, updatedAt: new Date() })
  },

  async restoreDeleted(client: Client): Promise<void> {
    await db.clients.put(client)
  },

  async delete(id: string): Promise<void> {
    await db.clients.delete(id)
  },
}
