import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "Error loading data",
  message = "Something went wrong. Please try again.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className="card p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="rounded-full p-3 bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
