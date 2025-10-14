import { Shield, AlertTriangle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RiskPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk & KYT</h1>
        <p className="text-muted-foreground mt-1">
          Know Your Transaction - Assess address risk and monitor flags
        </p>
      </div>

      {/* Risk KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full p-2 bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">High Risk</p>
          </div>
          <p className="text-3xl font-bold text-destructive">23</p>
          <p className="text-xs text-muted-foreground mt-1">Flagged entities</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full p-2 bg-yellow-500/10">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">87</p>
          <p className="text-xs text-muted-foreground mt-1">Under review</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-full p-2 bg-green-500/10">
              <Shield className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
          </div>
          <p className="text-3xl font-bold text-green-500">1,138</p>
          <p className="text-xs text-muted-foreground mt-1">Verified safe</p>
        </div>
      </div>

      {/* Address Lookup */}
      <div className="card p-6">
        <h3 className="font-semibold text-lg mb-4">Address Risk Lookup</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter wallet address or ENS name..."
              className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button size="lg" variant="brand">
            Analyze
          </Button>
        </div>

        <div className="mt-6 h-48 flex items-center justify-center bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground">
            Risk assessment card placeholder (Phase 9)
          </p>
        </div>
      </div>

      {/* Hit List */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Flagged Entities</h3>
          <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            23 High Risk
          </span>
        </div>
        <div className="h-80 flex items-center justify-center bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground">
            Hit list table placeholder (Phase 9)
          </p>
        </div>
      </div>
    </div>
  )
}
