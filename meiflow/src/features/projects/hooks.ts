import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from './service'
import type { Project } from '@/services/db'
import type { ProjectFormValues } from './schemas'

export const PROJECTS_KEY = ['projects']
export const PROJECTS_ARCHIVED_KEY = ['projects', 'archived']

export function useProjects() {
  return useQuery({ queryKey: PROJECTS_KEY, queryFn: projectService.list })
}

export function useArchivedProjects() {
  return useQuery({ queryKey: PROJECTS_ARCHIVED_KEY, queryFn: projectService.listArchived })
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

export function useArchiveProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
      qc.invalidateQueries({ queryKey: PROJECTS_ARCHIVED_KEY })
    },
  })
}

export function useUnarchiveProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectService.unarchive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROJECTS_KEY })
      qc.invalidateQueries({ queryKey: PROJECTS_ARCHIVED_KEY })
    },
  })
}

export function useRestoreDeletedProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (project: Project) => projectService.restoreDeleted(project),
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
