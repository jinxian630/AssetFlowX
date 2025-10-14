"use client"

import { Alert } from "@/lib/types"
import { AlertCircle, DollarSign, ArrowRightLeft, ShieldAlert, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlertRuleCardProps {
  alert: Alert
  onToggle: (id: string, enabled: boolean) => void
  onEdit?: (alert: Alert) => void
}

export function AlertRuleCard({ alert, onToggle, onEdit }: AlertRuleCardProps) {
  const getIcon = () => {
    switch (alert.type) {
      case "price_threshold":
        return <DollarSign className="h-5 w-5" />
      case "large_transfer":
        return <ArrowRightLeft className="h-5 w-5" />
      case "risky_address":
        return <ShieldAlert className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getSeverityColor = () => {
    switch (alert.severity) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityBg = () => {
    switch (alert.severity) {
      case "high":
        return "bg-destructive/10"
      case "medium":
        return "bg-yellow-500/10"
      case "low":
        return "bg-blue-500/10"
      default:
        return "bg-muted"
    }
  }

  const formatConditions = () => {
    const { type, conditions } = alert
    if (type === "price_threshold") {
      const operator = conditions?.operator ?? conditions?.direction ?? "above"
      const thresholdVal = conditions?.threshold ?? conditions?.price
      return thresholdVal != null
        ? `Price ${operator} $${Number(thresholdVal).toLocaleString()}`
        : "Price threshold"
    } else if (type === "large_transfer") {
      const amountVal = conditions?.amount ?? conditions?.threshold
      return amountVal != null
        ? `Amount > $${Number(amountVal).toLocaleString()}`
        : "Large transfer"
    } else if (type === "risky_address") {
      const risk = conditions?.riskThreshold ?? conditions?.minRiskScore
      return risk != null ? `Risk score > ${risk}` : "Risky address"
    }
    return JSON.stringify(conditions)
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${getSeverityBg()}`}>
            <div className={getSeverityColor()}>{getIcon()}</div>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{alert.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {formatConditions()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(alert)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}

          {/* Toggle Switch */}
          <button
            onClick={() => onToggle(alert.id, !alert.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              alert.enabled ? "bg-primary" : "bg-muted"
            }`}
            role="switch"
            aria-checked={alert.enabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                alert.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className={`inline-flex px-2 py-1 rounded-md font-medium ${getSeverityBg()} ${getSeverityColor()}`}>
          {alert.severity.toUpperCase()}
        </span>
        <span className="text-muted-foreground">
          Created {new Date(alert.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
        <span className={`ml-auto text-xs font-medium ${
          alert.enabled ? "text-green-500" : "text-muted-foreground"
        }`}>
          {alert.enabled ? "Active" : "Disabled"}
        </span>
      </div>
    </div>
  )
}
