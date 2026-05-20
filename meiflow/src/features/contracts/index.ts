import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/services/db'
import { generateId, generateSlug } from '@/lib/utils'
import type { Contract } from '@/services/db'

// ─── Schema ────────────────────────────────────────────────────
export const contractSchema = z.object({
  projectId: z.string().min(1, 'Selecione um projeto'),
  clientId:  z.string().min(1, 'Selecione um cliente'),
  title:     z.string().min(2, 'Informe o título').max(100),
  content:   z.string().min(10, 'Conteúdo muito curto'),
})

export type ContractFormValues = z.infer<typeof contractSchema>

// ─── Service ───────────────────────────────────────────────────
export const contractService = {
  async list(): Promise<Contract[]> {
    return db.contracts.orderBy('createdAt').reverse().toArray()
  },

  async getBySlug(slug: string): Promise<Contract | undefined> {
    return db.contracts.where('slug').equals(slug).first()
  },

  async create(data: ContractFormValues): Promise<Contract> {
    const now  = new Date()
    const slug = `${generateSlug(data.title)}-${Date.now()}`
    const contract: Contract = {
      id: generateId(), ...data, status: 'draft',
      slug, createdAt: now, updatedAt: now,
    }
    await db.contracts.put(contract)
    return contract
  },

  async update(id: string, data: Partial<ContractFormValues>): Promise<Contract> {
    const existing = await db.contracts.get(id)
    if (!existing) throw new Error('Contrato não encontrado.')
    const updated: Contract = { ...existing, ...data, updatedAt: new Date() }
    await db.contracts.put(updated)
    return updated
  },

  async send(id: string): Promise<Contract> {
    const existing = await db.contracts.get(id)
    if (!existing) throw new Error('Contrato não encontrado.')
    const updated: Contract = { ...existing, status: 'sent', sentAt: new Date().toISOString(), updatedAt: new Date() }
    await db.contracts.put(updated)
    return updated
  },

  async accept(slug: string): Promise<Contract> {
    const existing = await contractService.getBySlug(slug)
    if (!existing) throw new Error('Contrato não encontrado.')
    const updated: Contract = { ...existing, status: 'accepted', acceptedAt: new Date().toISOString(), updatedAt: new Date() }
    await db.contracts.put(updated)
    return updated
  },

  async delete(id: string): Promise<void> {
    await db.contracts.delete(id)
  },

  async restoreDeleted(contract: Contract): Promise<void> {
    await db.contracts.put(contract)
  },
}

// ─── Hooks ─────────────────────────────────────────────────────
export const CONTRACTS_KEY = ['contracts']

export function useContracts() {
  return useQuery({ queryKey: CONTRACTS_KEY, queryFn: contractService.list })
}

export function useContract(id: string | undefined) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, 'id', id],
    queryFn: async () => (id ? db.contracts.get(id) : undefined),
    enabled: !!id,
  })
}

export function useContractBySlug(slug: string) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, 'slug', slug],
    queryFn: () => contractService.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useCreateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ContractFormValues) => contractService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTRACTS_KEY }),
  })
}

export function useUpdateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<ContractFormValues>) => contractService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTRACTS_KEY }),
  })
}

export function useSendContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractService.send(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTRACTS_KEY }),
  })
}

export function useAcceptContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => contractService.accept(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTRACTS_KEY }),
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTRACTS_KEY }),
  })
}

export function useRestoreDeletedContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (contract: Contract) => contractService.restoreDeleted(contract),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTRACTS_KEY }),
  })
}
