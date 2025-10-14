import { NextResponse } from "next/server"
import { generatePortfolioData } from "@/lib/mock-data"

export async function GET() {
  try {
    const data = generatePortfolioData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    )
  }
}
