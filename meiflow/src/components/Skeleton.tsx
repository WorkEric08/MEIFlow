import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md', className)}
      style={{ background: 'var(--bg-2)' }}
    />
  )
}

export function ClientCardSkeleton() {
  return (
    <div className="rounded-card border overflow-hidden" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Skeleton className="w-11 h-11 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <Skeleton className="h-3.5 w-36" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <div className="h-px" style={{ background: 'var(--border)' }} />
      <div className="flex px-4 py-2.5 gap-6">
        <Skeleton className="h-3.5 w-10" />
        <Skeleton className="h-3.5 w-14" />
      </div>
    </div>
  )
}

export function GenericCardSkeleton() {
  return (
    <div className="rounded-card border overflow-hidden" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3 px-4 py-4">
        <Skeleton className="w-9 h-9 rounded-md shrink-0" />
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-16 rounded-badge shrink-0" />
      </div>
    </div>
  )
}

export function PaymentCardSkeleton() {
  return (
    <div className="rounded-card border overflow-hidden flex" style={{ background: 'var(--bg-1)', borderColor: 'var(--border)' }}>
      <div className="w-1 shrink-0 rounded-l-card" style={{ background: 'var(--bg-2)' }} />
      <div className="flex-1 px-4 py-4 flex flex-col gap-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-32" />
        <div className="flex justify-between mt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16 rounded-badge" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3, variant = 'generic' }: {
  count?: number
  variant?: 'client' | 'generic' | 'payment'
}) {
  const Card = variant === 'client' ? ClientCardSkeleton
    : variant === 'payment' ? PaymentCardSkeleton
    : GenericCardSkeleton

  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, i) => <Card key={i} />)}
    </div>
  )
}
