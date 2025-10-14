import { Skeleton } from "@/components/ui/skeleton"

export function LoadingKPI() {
  return (
    <div className="card p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-9 w-32 mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
  )
}

export function LoadingChart() {
  return (
    <div className="card p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function LoadingTable() {
  return (
    <div className="card p-6">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
