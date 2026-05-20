import { db } from '@/services/db'
import { generateId, generateSlug } from '@/lib/utils'
import type { LinkPage, LinkPageLink } from './types'

const OWNER_ID = 'owner' // MVP: usuário único local

export const linkPageService = {
  async get(): Promise<LinkPage | undefined> {
    return db.linkPages.get(OWNER_ID)
  },

  async upsert(data: Partial<Omit<LinkPage, 'id' | 'createdAt'>>): Promise<LinkPage> {
    const existing = await db.linkPages.get(OWNER_ID)
    const now = new Date()

    if (existing) {
      const updated: LinkPage = { ...existing, ...data, updatedAt: now }
      await db.linkPages.put(updated)
      return updated
    }

    const created: LinkPage = {
      id: OWNER_ID,
      username: data.username ?? 'meiflow',
      displayName: data.displayName ?? 'Meu Nome',
      role: data.role,
      bio: data.bio,
      phone: data.phone,
      email: data.email,
      city: data.city,
      website: data.website,
      avatarUrl: data.avatarUrl,
      theme: data.theme ?? 'dark',
      accentColor: data.accentColor ?? '#3B8CE8',
      showLinks: data.showLinks ?? true,
      layout: data.layout ?? 'vertical',
      links: data.links ?? [],
      createdAt: now,
      updatedAt: now,
    }
    await db.linkPages.put(created)
    return created
  },

  async addLink(label: string, url: string): Promise<LinkPage> {
    const page = await linkPageService.get()
    if (!page) throw new Error('Link Page não configurada.')

    const newLink: LinkPageLink = {
      id: generateId(),
      label,
      url: url.startsWith('http') ? url : `https://${url}`,
      clicks: 0,
    }

    return linkPageService.upsert({ links: [...page.links, newLink] })
  },

  async updateLink(linkId: string, data: Partial<Pick<LinkPageLink, 'label' | 'url'>>): Promise<LinkPage> {
    const page = await linkPageService.get()
    if (!page) throw new Error('Link Page não configurada.')

    const links = page.links.map((l) =>
      l.id === linkId ? { ...l, ...data } : l
    )
    return linkPageService.upsert({ links })
  },

  async deleteLink(linkId: string): Promise<LinkPage> {
    const page = await linkPageService.get()
    if (!page) throw new Error('Link Page não configurada.')

    return linkPageService.upsert({ links: page.links.filter((l) => l.id !== linkId) })
  },

  async reorderLinks(links: LinkPageLink[]): Promise<LinkPage> {
    return linkPageService.upsert({ links })
  },

  async incrementClick(linkId: string): Promise<void> {
    const page = await linkPageService.get()
    if (!page) return

    const links = page.links.map((l) =>
      l.id === linkId ? { ...l, clicks: l.clicks + 1 } : l
    )
    await linkPageService.upsert({ links })
  },

  generateUsername(displayName: string): string {
    return generateSlug(displayName)
  },
}
