"use client"

import { useState } from "react"
import { Shield, AlertTriangle, Search, Loader2, TrendingUp, TrendingDown, Info, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { RiskAssessmentResult } from "@/types/ai-scoring"

export default function RiskPage() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [assessment, setAssessment] = useState<RiskAssessmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!address.trim()) {
      setError("Please enter an address")
      return
    }

    setLoading(true)
    setError(null)
    setAssessment(null)

    try {
      const response = await fetch(`/api/risk?address=${encodeURIComponent(address)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze address")
      }

      const data = await response.json()
      setAssessment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "text-green-600 dark:text-green-400"
      case "good":
        return "text-blue-600 dark:text-blue-400"
      case "moderate":
        return "text-yellow-600 dark:text-yellow-400"
      case "high":
        return "text-orange-600 dark:text-orange-400"
      case "critical":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case "excellent":
        return "bg-green-500/10 border-green-500/20"
      case "good":
        return "bg-blue-500/10 border-blue-500/20"
      case "moderate":
        return "bg-yellow-500/10 border-yellow-500/20"
      case "high":
        return "bg-orange-500/10 border-orange-500/20"
      case "critical":
        return "bg-red-500/10 border-red-500/20"
      default:
        return "bg-muted"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 75) return "text-blue-600 dark:text-blue-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    if (score >= 40) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Risk & KYT</h1>
        <p className="text-muted-foreground mt-1">
          Know Your Transaction - AI-powered TrustScore™ assessment powered by FICO Crypto + EY Pillars + NIST
        </p>
      </div>

      {/* Risk KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full p-2 bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">High Risk</p>
            </div>
            <p className="text-3xl font-bold text-destructive">23</p>
            <p className="text-xs text-muted-foreground mt-1">Flagged entities</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full p-2 bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
            </div>
            <p className="text-3xl font-bold text-yellow-600">87</p>
            <p className="text-xs text-muted-foreground mt-1">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full p-2 bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
            </div>
            <p className="text-3xl font-bold text-green-500">1,138</p>
            <p className="text-xs text-muted-foreground mt-1">Verified safe</p>
          </CardContent>
        </Card>
      </div>

      {/* Address Lookup & TrustScore™ Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>TrustScore™ Assessment</CardTitle>
          <CardDescription>
            AI-powered risk scoring based on FICO Crypto (40%), EY Pillars (35%), and NIST AI Governance (25%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Enter wallet address (0x...) or ENS name..."
                className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button 
              size="lg" 
              variant="brand"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {assessment && (
            <div className="space-y-6">
              {/* Main TrustScore Display */}
              <div className={`rounded-xl border p-6 ${getRiskBgColor(assessment.riskLevel)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">TrustScore™</h3>
                      <Badge variant="outline" className={getRiskColor(assessment.riskLevel)}>
                        {assessment.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assessed at {new Date(assessment.assessedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-5xl font-bold ${getScoreColor(assessment.trustScore.score)}`}>
                      {assessment.trustScore.score.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">out of 100</p>
                  </div>
                </div>
                <Progress value={assessment.trustScore.score} className="h-3" />
                <p className="text-sm text-muted-foreground mt-3">{assessment.explanation}</p>
              </div>

              {/* Component Breakdown */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="fico">FICO Crypto</TabsTrigger>
                  <TabsTrigger value="ey">EY Pillars</TabsTrigger>
                  <TabsTrigger value="nist">NIST</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">FICO Crypto</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(assessment.trustScore.components.ficoCrypto.score)}`}>
                            {assessment.trustScore.components.ficoCrypto.score.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">40% weight</span>
                        </div>
                        <Progress value={assessment.trustScore.components.ficoCrypto.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Escrow history, DeFi activity, transaction patterns
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">EY Pillars</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(assessment.trustScore.components.eyPillars.score)}`}>
                            {assessment.trustScore.components.eyPillars.score.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">35% weight</span>
                        </div>
                        <Progress value={assessment.trustScore.components.eyPillars.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Sanctions, fraud detection, regulatory compliance
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">NIST Governance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(assessment.trustScore.components.nistGovernance.score)}`}>
                            {assessment.trustScore.components.nistGovernance.score.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">25% weight</span>
                        </div>
                        <Progress value={assessment.trustScore.components.nistGovernance.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          Transparency, fairness, reliability, privacy
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Flags & Recommendations */}
                  {assessment.flags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Risk Flags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {assessment.flags.map((flag, idx) => (
                            <Badge key={idx} variant="destructive">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {assessment.recommendations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {assessment.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="fico" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Escrow History (40% of FICO)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.ficoCrypto.factors.escrowHistory.score)}`}>
                            {assessment.trustScore.components.ficoCrypto.factors.escrowHistory.score.toFixed(1)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Escrows:</span>
                            <span className="ml-2 font-medium">{assessment.trustScore.components.ficoCrypto.factors.escrowHistory.metrics.totalEscrows}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completion Rate:</span>
                            <span className="ml-2 font-medium">{assessment.trustScore.components.ficoCrypto.factors.escrowHistory.metrics.completionRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Dispute Rate:</span>
                            <span className="ml-2 font-medium">{assessment.trustScore.components.ficoCrypto.factors.escrowHistory.metrics.disputeRate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Wallet Age:</span>
                            <span className="ml-2 font-medium">{assessment.trustScore.components.ficoCrypto.factors.escrowHistory.metrics.oldestEscrowAge} days</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">DeFi Activity (30% of FICO)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.ficoCrypto.factors.defiActivity.score)}`}>
                            {assessment.trustScore.components.ficoCrypto.factors.defiActivity.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.ficoCrypto.factors.defiActivity.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Transaction Patterns (20% of FICO)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.ficoCrypto.factors.transactionPatterns.score)}`}>
                            {assessment.trustScore.components.ficoCrypto.factors.transactionPatterns.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.ficoCrypto.factors.transactionPatterns.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Wallet Stability (10% of FICO)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.ficoCrypto.factors.walletStability.score)}`}>
                            {assessment.trustScore.components.ficoCrypto.factors.walletStability.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.ficoCrypto.factors.walletStability.score} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="ey" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Sanctions & AML (40% of EY)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.eyPillars.factors.sanctionsCompliance.score)}`}>
                            {assessment.trustScore.components.eyPillars.factors.sanctionsCompliance.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.eyPillars.factors.sanctionsCompliance.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Fraud Detection (30% of EY)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.eyPillars.factors.fraudDetection.score)}`}>
                            {assessment.trustScore.components.eyPillars.factors.fraudDetection.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.eyPillars.factors.fraudDetection.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Regulatory Compliance (20% of EY)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.eyPillars.factors.regulatoryCompliance.score)}`}>
                            {assessment.trustScore.components.eyPillars.factors.regulatoryCompliance.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.eyPillars.factors.regulatoryCompliance.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Operational Risk (10% of EY)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.eyPillars.factors.operationalRisk.score)}`}>
                            {assessment.trustScore.components.eyPillars.factors.operationalRisk.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.eyPillars.factors.operationalRisk.score} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="nist" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Transparency (40% of NIST)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.nistGovernance.factors.transparency.score)}`}>
                            {assessment.trustScore.components.nistGovernance.factors.transparency.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.nistGovernance.factors.transparency.score} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {assessment.trustScore.components.nistGovernance.factors.transparency.metrics.scoreExplanation}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Fairness (30% of NIST)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.nistGovernance.factors.fairness.score)}`}>
                            {assessment.trustScore.components.nistGovernance.factors.fairness.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.nistGovernance.factors.fairness.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Reliability (20% of NIST)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.nistGovernance.factors.reliability.score)}`}>
                            {assessment.trustScore.components.nistGovernance.factors.reliability.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.nistGovernance.factors.reliability.score} className="h-2" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Privacy (10% of NIST)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Score</span>
                          <span className={`font-bold ${getScoreColor(assessment.trustScore.components.nistGovernance.factors.privacy.score)}`}>
                            {assessment.trustScore.components.nistGovernance.factors.privacy.score.toFixed(1)}
                          </span>
                        </div>
                        <Progress value={assessment.trustScore.components.nistGovernance.factors.privacy.score} className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hit List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flagged Entities</CardTitle>
            <Badge variant="destructive">23 High Risk</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground">
              Hit list table placeholder (Phase 9)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
