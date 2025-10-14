import { NextResponse } from "next/server"
import { generateFlowData } from "@/lib/mock-data"

export async function GET() {
  try {
    const data = generateFlowData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch flow data" },
      { status: 500 }
    )
  }
}
