import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientService } from './service'
import type { Client } from '@/services/db'
import type { ClientFormValues } from './schemas'

export const CLIENTS_KEY = ['clients']
export const CLIENTS_ARCHIVED_KEY = ['clients', 'archived']

export function useClients() {
  return useQuery({ queryKey: CLIENTS_KEY, queryFn: clientService.list })
}

export function useArchivedClients() {
  return useQuery({ queryKey: CLIENTS_ARCHIVED_KEY, queryFn: clientService.listArchived })
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

export function useArchiveClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY })
      qc.invalidateQueries({ queryKey: CLIENTS_ARCHIVED_KEY })
    },
  })
}

export function useUnarchiveClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientService.unarchive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CLIENTS_KEY })
      qc.invalidateQueries({ queryKey: CLIENTS_ARCHIVED_KEY })
    },
  })
}

export function useRestoreDeletedClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (client: Client) => clientService.restoreDeleted(client),
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
