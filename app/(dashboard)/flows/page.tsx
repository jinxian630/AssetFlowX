"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Minus, RefreshCw } from "lucide-react"
import { FlowData } from "@/lib/types"
import { NetflowChart } from "@/components/netflow-chart"
import { CounterpartiesTable } from "@/components/counterparties-table"
import { LoadingKPI, LoadingChart, LoadingTable } from "@/components/loading-state"
import { ErrorState } from "@/components/error-state"
import { Button } from "@/components/ui/button"

export default function FlowsPage() {
  const [flowData, setFlowData] = useState<FlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/flows")

      if (!response.ok) {
        throw new Error("Failed to fetch flow data")
      }

      const data = await response.json()
      setFlowData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Flows</h1>
          <p className="text-muted-foreground mt-1">
            Track inflows and outflows across all chains and counterparties
          </p>
        </div>
        <ErrorState
          title="Failed to load flow data"
          message={error}
          onRetry={fetchData}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Flows</h1>
          <p className="text-muted-foreground mt-1">
            Track inflows and outflows across all chains and counterparties
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium">Filters:</p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              Last 30 days
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">
              All chains
            </button>
            <button className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">
              All counterparties
            </button>
          </div>
        </div>
      </div>

      {/* Flow KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <LoadingKPI />
            <LoadingKPI />
            <LoadingKPI />
          </>
        ) : flowData ? (
          <>
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full p-2 bg-green-500/10">
                  <ArrowDownLeft className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Inflow</p>
              </div>
              <p className="text-3xl font-bold text-green-500">
                ${flowData.inflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {flowData.history.filter(h => h.inflow > 0).length} periods
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-full p-2 bg-destructive/10">
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Outflow</p>
              </div>
              <p className="text-3xl font-bold text-destructive">
                ${flowData.outflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {flowData.history.filter(h => h.outflow > 0).length} periods
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`rounded-full p-2 ${
                  flowData.netflow >= 0 ? 'bg-green-500/10' : 'bg-destructive/10'
                }`}>
                  {flowData.netflow >= 0 ? (
                    <ArrowDownLeft className="h-5 w-5 text-green-500" />
                  ) : (
                    <Minus className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">Net Flow</p>
              </div>
              <p className={`text-3xl font-bold ${
                flowData.netflow >= 0 ? 'text-green-500' : 'text-destructive'
              }`}>
                {flowData.netflow >= 0 ? '+' : ''}
                ${flowData.netflow.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {flowData.netflow >= 0 ? 'Positive net flow' : 'Negative net flow'}
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* Net Flow Chart */}
      {loading ? (
        <LoadingChart />
      ) : flowData ? (
        <div className="card p-6">
          <NetflowChart data={flowData.history} />
        </div>
      ) : null}

      {/* Counterparties Table */}
      {loading ? (
        <LoadingTable />
      ) : flowData ? (
        <CounterpartiesTable counterparties={flowData.counterparties} />
      ) : null}
    </div>
  )
}
