import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from './service'
import type { ClientFormValues } from './schemas'

export const CLIENTS_KEY = ['clients']

export function useClients() {
  return useQuery({ queryKey: CLIENTS_KEY, queryFn: clientService.list })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ClientFormValues) => clientService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & ClientFormValues) => clientService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTS_KEY }),
  })
}
