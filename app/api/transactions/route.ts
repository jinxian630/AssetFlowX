import { NextRequest, NextResponse } from "next/server"
import { generateTransactions } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const chain = searchParams.get("chain")
    const type = searchParams.get("type") as "inflow" | "outflow" | null

    // Generate larger dataset
    let transactions = generateTransactions(200)

    // Apply filters
    if (chain) {
      transactions = transactions.filter(tx => tx.chain === chain)
    }
    if (type) {
      transactions = transactions.filter(tx => tx.type === type)
    }

    // Pagination
    const total = transactions.length
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedTxs = transactions.slice(start, end)

    return NextResponse.json({
      data: paginatedTxs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}
