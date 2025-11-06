// ============================================================================
// AssetFlowX - Chatbot Service
// AI-powered assistant for application help and guidance
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini client
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GENERATIVE_LANGUAGE_API_KEY
  
  if (!apiKey) {
    throw new Error(
      "Generative Language API Key (GENERATIVE_LANGUAGE_API_KEY) environment variable is not set. Please configure it in .env.local"
    )
  }
  
  return new GoogleGenerativeAI(apiKey)
}

// Application context and knowledge base
const APPLICATION_CONTEXT = `You are a helpful AI assistant for AssetFlowX, a comprehensive asset flow tracking and career development platform.

## Available Modules:

### 1. Portfolio & Analytics
- **Dashboard**: Overview of portfolio performance, charts, and KPIs
- **Flows**: Track asset flows across different chains
- **Transactions**: View detailed transaction history
- **Alerts**: Set up alerts for important events
- **Risk**: Analyze risk metrics

### 2. Payments & Settlement
- **Payments Dashboard**: Manage payments and settlements
- **Checkout**: Process payments for courses/services
- **Orders**: View and manage orders

### 3. Credentials
- **Credentials**: View blockchain-based credentials and certificates
- **Verify**: Verify credential authenticity

### 4. Job Matching
- **Job Matching**: AI-powered resume to job position matching
  - Upload resume (PDF, DOCX, or TXT)
  - Select a job position
  - Get AI analysis with match scores:
    - Skills Match (0-100%)
    - Experience Match (0-100%)
    - Education Match (0-100%)
    - Overall Match Score
  - Receive recommendations for improvement
  - If qualified (≥70% match), resume is automatically sent

### 5. Course & Task Management
- **Course Management**: Create and manage educational courses
- **Marketplace**: Browse available courses
- **My Course**: View enrolled courses

## Job Matching Guidance:

When users ask about job matching, provide specific advice:
- **Skills**: List all required skills and suggest how to highlight them in resume
- **Experience**: Explain how to quantify and present experience effectively
- **Education**: Discuss how to emphasize relevant education
- **Improvement**: Suggest specific actions to improve match score
- **Resume Tips**: Provide formatting and content recommendations

## General Guidelines:
- Be friendly, helpful, and professional
- Provide specific, actionable advice
- Use examples when helpful
- For job matching questions, give detailed guidance
- Explain features clearly and step-by-step
- Help users understand how to navigate the application
- Provide troubleshooting help when needed`

// Build system prompt with context
function buildSystemPrompt(userContext?: {
  currentPage?: string
  userCredentials?: number
  recentJobMatches?: number
}): string {
  let contextInfo = APPLICATION_CONTEXT

  if (userContext) {
    contextInfo += `\n\n## Current User Context:\n`
    if (userContext.currentPage) {
      contextInfo += `- User is currently on: ${userContext.currentPage}\n`
    }
    if (userContext.userCredentials) {
      contextInfo += `- User has ${userContext.userCredentials} credentials\n`
    }
    if (userContext.recentJobMatches) {
      contextInfo += `- User has performed ${userContext.recentJobMatches} job matches\n`
    }
  }

  return contextInfo
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
}

export interface ChatResponse {
  message: string
  error?: string
  suggestedFollowUps?: string[]
}

// Generate chatbot response
export async function generateChatResponse(
  messages: ChatMessage[],
  userContext?: {
    currentPage?: string
    userCredentials?: number
    recentJobMatches?: number
  }
): Promise<ChatResponse> {
  try {
    const genAI = getGeminiClient()
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash"
    
    const generationConfig = {
      temperature: 0.7, // Balanced for conversational AI
      topP: 0.95,
      topK: 50,
      maxOutputTokens: 2048,
    }
    
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig 
    })
    
    // Build conversation history
    const systemPrompt = buildSystemPrompt(userContext)
    
    // Format messages for Gemini
    const conversationHistory = messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => {
        if (msg.role === "user") {
          return `User: ${msg.content}`
        } else {
          return `Assistant: ${msg.content}`
        }
      })
      .join("\n\n")
    
    const prompt = `${systemPrompt}

## Conversation History:
${conversationHistory || "No previous messages"}

## Instructions:
- You are a comprehensive AI assistant for AssetFlowX, helping users with ALL aspects of the platform
- Respond naturally and helpfully to questions about ANY module or feature
- Be concise but thorough in your explanations
- Help users navigate and understand:
  - Portfolio management and analytics features
  - Job matching and career development
  - Credentials and certificates
  - Course management and marketplace
  - Payments and settlements
  - Any other platform functionality
- For job matching questions, provide detailed, actionable advice
- For portfolio/analytics questions, explain features clearly
- For payment questions, guide users through the process
- For course questions, explain enrollment and learning features
- Always be friendly, professional, and comprehensive
- If you don't know something specific, guide users to the relevant section or suggest how to find the information

## Current User Message:
User: ${messages[messages.length - 1]?.content || ""}

Please respond as the comprehensive AssetFlowX AI assistant, helping with any aspect of the platform:`

    // Generate response with retry logic
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        return {
          message: text.trim()
        }
      } catch (retryError) {
        attempts++
        if (attempts >= maxAttempts) {
          throw retryError
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
      }
    }
    
    throw new Error("Failed to generate response after retries")
  } catch (error) {
    console.error("Chatbot error:", error)
    
    return {
      message: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

