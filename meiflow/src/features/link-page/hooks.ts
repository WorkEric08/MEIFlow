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

/** Invalida tanto o cache do editor quanto o cache público (qualquer username). */
function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY })
  qc.invalidateQueries({ queryKey: ['link-page-public'] })
}

export function useUpsertLinkPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<LinkPageFormValues>) => linkPageService.upsert(data),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useAddLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ label, url }: LinkFormValues) => linkPageService.addLink(label, url),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useUpdateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<LinkFormValues>) =>
      linkPageService.updateLink(id, data),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useDeleteLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (linkId: string) => linkPageService.deleteLink(linkId),
    onSuccess: () => invalidateAll(qc),
  })
}

export function useReorderLinks() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: linkPageService.reorderLinks,
    onSuccess: () => invalidateAll(qc),
  })
}
