import { db } from '@/services/db'
import { generateId } from '@/lib/utils'
import type { Project } from '@/services/db'
import type { ProjectFormValues } from './schemas'

export const projectService = {
  async list(): Promise<Project[]> {
    const all = await db.projects.orderBy('createdAt').reverse().toArray()
    return all.filter((p) => !p.archivedAt)
  },

  async listArchived(): Promise<Project[]> {
    const all = await db.projects.orderBy('createdAt').reverse().toArray()
    return all.filter((p) => !!p.archivedAt)
  },

  async listByClient(clientId: string): Promise<Project[]> {
    const all = await db.projects.where('clientId').equals(clientId).toArray()
    return all.filter((p) => !p.archivedAt)
  },

  async get(id: string): Promise<Project | undefined> {
    return db.projects.get(id)
  },

  async create(data: ProjectFormValues): Promise<Project> {
    const now = new Date()
    const project: Project = { id: generateId(), ...data, createdAt: now, updatedAt: now }
    await db.projects.put(project)
    return project
  },

  async update(id: string, data: ProjectFormValues): Promise<Project> {
    const existing = await db.projects.get(id)
    if (!existing) throw new Error('Projeto não encontrado.')
    const updated: Project = { ...existing, ...data, updatedAt: new Date() }
    await db.projects.put(updated)
    return updated
  },

  async archive(id: string): Promise<void> {
    const existing = await db.projects.get(id)
    if (!existing) return
    await db.projects.put({ ...existing, archivedAt: new Date(), updatedAt: new Date() })
  },

  async unarchive(id: string): Promise<void> {
    const existing = await db.projects.get(id)
    if (!existing) return
    await db.projects.put({ ...existing, archivedAt: undefined, updatedAt: new Date() })
  },

  async restoreDeleted(project: Project): Promise<void> {
    await db.projects.put(project)
  },

  async delete(id: string): Promise<void> {
    await db.projects.delete(id)
  },

  async totalRevenue(): Promise<number> {
    const projects = await db.projects.where('status').equals('completed').toArray()
    return projects.reduce((sum, p) => sum + p.value, 0)
  },
}
