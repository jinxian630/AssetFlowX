// ============================================================================
// AssetFlowX - Risk Assessment API Route
// GET /api/risk - Risk data overview or address-specific TrustScore™ assessment
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { generateRiskData, assessAddressRisk } from "@/lib/mock-data"
import { calculateTrustScore } from "@/lib/ai-scoring/trust-score-service"
import { aggregateTrustScoreData } from "@/lib/ai-scoring/data-aggregator"
import type { RiskAssessmentResult } from "@/types/ai-scoring"

// GET - Fetch risk data or assess specific address with AI TrustScore™
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")
    const useAI = searchParams.get("ai") !== "false" // Default to true, can disable with ?ai=false

    // If address provided, return AI-powered TrustScore™ assessment
    if (address) {
      // Validate address format (basic check)
      if (!address.match(/^0x[a-fA-F0-9]{40}$/) && !address.match(/^[a-zA-Z0-9]{26,35}$/)) {
        return NextResponse.json(
          { error: "Invalid address format" },
          { status: 400 }
        )
      }

      try {
        if (useAI) {
          // Use AI-powered TrustScore™ calculation
          const inputData = aggregateTrustScoreData(address)
          const trustScore = await calculateTrustScore(inputData)
          
          // Build comprehensive risk assessment result
          const assessment: RiskAssessmentResult = {
            address,
            trustScore,
            riskLevel: trustScore.riskLevel,
            flags: [
              ...trustScore.components.eyPillars.factors.sanctionsCompliance.flags,
              ...trustScore.components.eyPillars.factors.fraudDetection.flags,
              ...trustScore.components.eyPillars.factors.regulatoryCompliance.flags,
              ...trustScore.components.eyPillars.factors.operationalRisk.flags
            ],
            explanation: trustScore.explanation,
            recommendations: trustScore.recommendations,
            assessedAt: trustScore.assessedAt
          }
          
          return NextResponse.json(assessment)
        } else {
          // Fallback to legacy assessment
          const assessment = assessAddressRisk(address)
          return NextResponse.json(assessment)
        }
      } catch (aiError) {
        console.error("AI scoring error:", aiError)
        // Fallback to legacy assessment if AI fails
        const assessment = assessAddressRisk(address)
        return NextResponse.json({
          ...assessment,
          warning: "AI scoring unavailable, using legacy assessment"
        })
      }
    }

    // Otherwise return general risk data overview
    const data = generateRiskData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Risk API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch risk data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
