import { NextRequest, NextResponse } from "next/server"
import { generateRiskData, assessAddressRisk } from "@/lib/mock-data"

// GET - Fetch risk data or assess specific address
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    // If address provided, return risk assessment
    if (address) {
      const assessment = assessAddressRisk(address)
      return NextResponse.json(assessment)
    }

    // Otherwise return general risk data
    const data = generateRiskData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch risk data" },
      { status: 500 }
    )
  }
}
