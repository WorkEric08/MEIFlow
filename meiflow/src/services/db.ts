import Dexie, { type Table } from 'dexie'

// ─── Entity base ───────────────────────────────────────────────
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// ─── Client ────────────────────────────────────────────────────
export interface Client extends BaseEntity {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  archivedAt?: Date
}

// ─── Project ───────────────────────────────────────────────────
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface Project extends BaseEntity {
  clientId: string
  name: string
  description?: string
  value: number
  status: ProjectStatus
  startDate: string
  endDate?: string
  archivedAt?: Date
}

// ─── Payment ───────────────────────────────────────────────────
export type PaymentStatus = 'paid' | 'pending' | 'overdue'

export interface Payment extends BaseEntity {
  projectId: string
  clientId: string
  description: string
  amount: number
  dueDate: string
  paidAt?: string
  status: PaymentStatus
}

// ─── Contract ──────────────────────────────────────────────────
export type ContractStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export interface Contract extends BaseEntity {
  projectId: string
  clientId: string
  title: string
  content: string
  status: ContractStatus
  sentAt?: string
  acceptedAt?: string
  slug: string
}

// ─── LinkPage ──────────────────────────────────────────────────
export interface LinkPageLink {
  id: string
  label: string
  url: string
  clicks: number
}

export interface LinkPage extends BaseEntity {
  username: string
  displayName: string
  role?: string
  bio?: string
  phone?: string
  email?: string
  city?: string
  website?: string
  avatarUrl?: string
  theme: 'dark' | 'light'
  accentColor: string
  links: LinkPageLink[]
  showLinks?: boolean
  layout?: 'vertical' | 'horizontal'
}

// ─── Database ──────────────────────────────────────────────────
export class MeiFlowDB extends Dexie {
  clients!: Table<Client>
  projects!: Table<Project>
  payments!: Table<Payment>
  contracts!: Table<Contract>
  linkPages!: Table<LinkPage>

  constructor() {
    super('meiflow-db')

    this.version(1).stores({
      clients: 'id, createdAt, updatedAt, name, email',
      projects: 'id, clientId, createdAt, updatedAt, status, startDate',
      payments: 'id, projectId, clientId, createdAt, status, dueDate',
      contracts: 'id, projectId, clientId, createdAt, status, slug',
      linkPages: 'id, username, createdAt',
    })

    this.version(2).stores({
      linkPages: 'id, username, createdAt',
    })

    // v3 — archivedAt para clientes e projetos (soft-delete / arquivamento).
    this.version(3).stores({
      clients:  'id, createdAt, updatedAt, name, email, archivedAt',
      projects: 'id, clientId, createdAt, updatedAt, status, startDate, archivedAt',
    })
  }
}

export const db = new MeiFlowDB()
