"use client"

import { AlertEvent } from "@/lib/types"
import { AlertCircle } from "lucide-react"

interface AlertEventsTableProps {
  events: AlertEvent[]
}

export function AlertEventsTable({ events }: AlertEventsTableProps) {
  if (events.length === 0) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-1">No Recent Alerts</h3>
        <p className="text-sm text-muted-foreground">
          Alert events will appear here when your rules are triggered
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Recent Alerts</h3>
        <p className="text-sm text-muted-foreground">
          Last {events.length} events
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-sm text-muted-foreground">Time</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground">Rule</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground">Entity</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground">Value</th>
              <th className="pb-3 font-medium text-sm text-muted-foreground">Severity</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                <td className="py-3">
                  <div className="text-sm">
                    {new Date(event.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-sm font-medium">{event.ruleName}</span>
                </td>
                <td className="py-3">
                  <span className="text-sm font-mono text-muted-foreground">
                    {event.entity.length > 20
                      ? `${event.entity.slice(0, 10)}...${event.entity.slice(-6)}`
                      : event.entity}
                  </span>
                </td>
                <td className="py-3">
                  <span className="text-sm">{event.value}</span>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${
                      event.severity === "high"
                        ? "bg-destructive/10 text-destructive"
                        : event.severity === "medium"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {event.severity.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
