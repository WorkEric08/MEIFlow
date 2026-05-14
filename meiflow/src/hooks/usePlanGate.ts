import { usePlanStore, FREE_LIMITS } from '@/store/plan'
import { useClients } from '@/features/clients/hooks'
import { useProjects } from '@/features/projects/hooks'

type Resource = 'client' | 'project' | 'contract-template'

interface GateResult {
  allowed: boolean
  reason: string
}

interface PlanGate {
  check: (resource: Resource, templateIndex?: number) => GateResult
}

export function usePlanGate(): PlanGate {
  const { plan } = usePlanStore()
  const { data: clients = [] } = useClients()
  const { data: projects = [] } = useProjects()

  function check(resource: Resource, templateIndex?: number): GateResult {
    if (plan === 'pro') return { allowed: true, reason: '' }

    switch (resource) {
      case 'client':
        if (clients.length >= FREE_LIMITS.clients) {
          return {
            allowed: false,
            reason: `Você atingiu o limite de ${FREE_LIMITS.clients} clientes no plano gratuito.`,
          }
        }
        break

      case 'project': {
        const activeCount = projects.filter((p) => p.status === 'active').length
        if (activeCount >= FREE_LIMITS.activeProjects) {
          return {
            allowed: false,
            reason: `Você atingiu o limite de ${FREE_LIMITS.activeProjects} projetos ativos no plano gratuito.`,
          }
        }
        break
      }

      case 'contract-template':
        if ((templateIndex ?? 0) >= FREE_LIMITS.contractTemplates) {
          return {
            allowed: false,
            reason: 'O plano gratuito dá acesso a apenas 1 template de contrato. Faça upgrade para usar todos os 4.',
          }
        }
        break
    }

    return { allowed: true, reason: '' }
  }

  return { check }
}
