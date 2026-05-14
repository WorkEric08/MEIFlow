import { db } from '@/services/db'
import { generateId } from '@/lib/utils'
import type { Project } from '@/services/db'
import type { ProjectFormValues } from './schemas'

export const projectService = {
  async list(): Promise<Project[]> {
    return db.projects.orderBy('createdAt').reverse().toArray()
  },

  async listByClient(clientId: string): Promise<Project[]> {
    return db.projects.where('clientId').equals(clientId).toArray()
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

  async delete(id: string): Promise<void> {
    await db.projects.delete(id)
  },

  async totalRevenue(): Promise<number> {
    const projects = await db.projects.where('status').equals('completed').toArray()
    return projects.reduce((sum, p) => sum + p.value, 0)
  },
}
