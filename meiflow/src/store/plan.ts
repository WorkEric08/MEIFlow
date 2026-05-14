import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Plan = 'free' | 'pro'

export const FREE_LIMITS = {
  clients: 3,
  activeProjects: 2,
  contractTemplates: 1,
} as const

interface PlanStore {
  plan: Plan
  upgradedAt: Date | null
  setPlan: (plan: Plan) => void
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      plan: 'free',
      upgradedAt: null,
      setPlan: (plan) =>
        set({ plan, upgradedAt: plan === 'pro' ? new Date() : null }),
    }),
    { name: 'meiflow-plan' }
  )
)
