import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/services/db'
import { generateId } from '@/lib/utils'
import type { Payment } from '@/services/db'

// ─── Schema ────────────────────────────────────────────────────
export const paymentSchema = z.object({
  projectId:   z.string().min(1, 'Selecione um projeto'),
  clientId:    z.string().min(1, 'Selecione um cliente'),
  description: z.string().min(2, 'Informe uma descrição').max(100),
  amount:      z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  dueDate:     z.string().min(1, 'Informe a data de vencimento'),
  status:      z.enum(['paid', 'pending', 'overdue']),
  paidAt:      z.string().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>

// ─── Service ───────────────────────────────────────────────────
export const paymentService = {
  async list(): Promise<Payment[]> {
    return db.payments.orderBy('dueDate').reverse().toArray()
  },

  async listByProject(projectId: string): Promise<Payment[]> {
    return db.payments.where('projectId').equals(projectId).toArray()
  },

  async create(data: PaymentFormValues): Promise<Payment> {
    const now = new Date()
    const payment: Payment = { id: generateId(), ...data, createdAt: now, updatedAt: now }
    await db.payments.put(payment)
    return payment
  },

  async update(id: string, data: Partial<PaymentFormValues>): Promise<Payment> {
    const existing = await db.payments.get(id)
    if (!existing) throw new Error('Pagamento não encontrado.')
    const updated: Payment = { ...existing, ...data, updatedAt: new Date() }
    await db.payments.put(updated)
    return updated
  },

  async markAsPaid(id: string): Promise<Payment> {
    return paymentService.update(id, { status: 'paid', paidAt: new Date().toISOString() })
  },

  async delete(id: string): Promise<void> {
    await db.payments.delete(id)
  },

  async updateOverdue(): Promise<void> {
    const STORAGE_KEY = 'meiflow-overdue-check'
    const today = new Date().toISOString().slice(0, 10)
    const lastRun = localStorage.getItem(STORAGE_KEY)

    // Executa no máximo uma vez por dia
    if (lastRun === today) return

    const pending = await db.payments.where('status').equals('pending').toArray()
    const overdue = pending.filter((p) => p.dueDate < today)
    await Promise.all(overdue.map((p) => paymentService.update(p.id, { status: 'overdue' })))

    localStorage.setItem(STORAGE_KEY, today)
  },

  async summary() {
    const all = await db.payments.toArray()
    return {
      totalPaid:    all.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      totalPending: all.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
      totalOverdue: all.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0),
      countOverdue: all.filter((p) => p.status === 'overdue').length,
    }
  },
}

// ─── Hooks ─────────────────────────────────────────────────────
export const PAYMENTS_KEY = ['payments']

export function usePayments() {
  return useQuery({ queryKey: PAYMENTS_KEY, queryFn: async () => { await paymentService.updateOverdue(); return paymentService.list() } })
}

export function usePaymentSummary() {
  return useQuery({ queryKey: [...PAYMENTS_KEY, 'summary'], queryFn: paymentService.summary })
}

export function useCreatePayment() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (data: PaymentFormValues) => paymentService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENTS_KEY }) })
}

export function useUpdatePayment() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, ...data }: { id: string } & Partial<PaymentFormValues>) => paymentService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENTS_KEY }) })
}

export function useMarkAsPaid() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => paymentService.markAsPaid(id), onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENTS_KEY }) })
}

export function useDeletePayment() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => paymentService.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: PAYMENTS_KEY }) })
}
