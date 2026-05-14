import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from './service'
import type { ProjectFormValues } from './schemas'

export const PROJECTS_KEY = ['projects']

export function useProjects() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: projectService.list })
}

export function useProjectsByClient(clientId: string) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, 'client', clientId],
    queryFn: () => projectService.listByClient(clientId),
    enabled: !!clientId,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectFormValues) => projectService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & ProjectFormValues) => projectService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}
