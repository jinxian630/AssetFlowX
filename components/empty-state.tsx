import { Inbox } from "lucide-react"

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
}

export function EmptyState({
  title = "No data available",
  message = "There's nothing to display yet.",
  icon
}: EmptyStateProps) {
  return (
    <div className="card p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full p-3 bg-muted">
          {icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}
