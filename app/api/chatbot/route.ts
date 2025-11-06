// ============================================================================
// AssetFlowX - Chatbot API Route
// POST /api/chatbot - Chat with AI assistant
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { generateChatResponse, type ChatMessage } from "@/lib/chatbot/chatbot-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    // Check for API key configuration early
    if (!process.env.GENERATIVE_LANGUAGE_API_KEY) {
      return NextResponse.json(
        { 
          error: "AI service is not configured",
          details: "Generative Language API Key (GENERATIVE_LANGUAGE_API_KEY) environment variable is not set. Please configure it in .env.local"
        },
        { status: 503 }
      )
    }

    // Validate messages format
    const messages: ChatMessage[] = body.messages.map((msg: any) => ({
      role: msg.role || "user",
      content: msg.content || "",
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
    }))

    // Validate last message is from user
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      )
    }

    // Optional user context
    const userContext = body.context ? {
      currentPage: body.context.currentPage,
      userCredentials: body.context.userCredentials,
      recentJobMatches: body.context.recentJobMatches
    } : undefined

    // Generate response
    const response = await generateChatResponse(messages, userContext)

    if (response.error) {
      return NextResponse.json(
        {
          error: "Failed to generate response",
          details: response.error
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: response.message,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Chatbot API error:", error)
    
    // Check if it's a configuration error
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    if (errorMessage.includes("GENERATIVE_LANGUAGE_API_KEY") || 
        errorMessage.includes("Generative Language API Key")) {
      return NextResponse.json(
        {
          error: "AI service is not configured",
          details: "Generative Language API Key (GENERATIVE_LANGUAGE_API_KEY) environment variable is not set. Please configure it in .env.local"
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
