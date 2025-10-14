import { NextRequest, NextResponse } from "next/server"
import { getAlerts, createAlert, updateAlert, generateAlertEvents } from "@/lib/mock-data"
import { Alert } from "@/lib/types"

// GET - Fetch all alerts or alert events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") // "rules" or "events"

    if (type === "events") {
      const events = generateAlertEvents(50)
      return NextResponse.json({ data: events })
    }

    // Default: return alert rules
    const alerts = getAlerts()
    return NextResponse.json({ data: alerts })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}

// POST - Create new alert rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.type || !body.name || !body.severity) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, severity" },
        { status: 400 }
      )
    }

    const newAlert = createAlert({
      type: body.type,
      name: body.name,
      severity: body.severity,
      enabled: body.enabled ?? true,
      conditions: body.conditions || {}
    })

    return NextResponse.json(newAlert, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    )
  }
}

// PATCH - Update existing alert rule
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing alert id" },
        { status: 400 }
      )
    }

    const updated = updateAlert(body.id, body)

    if (!updated) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    )
  }
}
