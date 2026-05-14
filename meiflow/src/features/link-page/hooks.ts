import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { linkPageService } from './service'
import type { LinkFormValues, LinkPageFormValues } from './types'

const KEY = ['link-page']

export function useLinkPage() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => linkPageService.get(),
  })
}

export function useUpsertLinkPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<LinkPageFormValues>) => linkPageService.upsert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useAddLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ label, url }: LinkFormValues) => linkPageService.addLink(label, url),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<LinkFormValues>) =>
      linkPageService.updateLink(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => linkPageService.deleteLink(linkId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useReorderLinks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: linkPageService.reorderLinks,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
