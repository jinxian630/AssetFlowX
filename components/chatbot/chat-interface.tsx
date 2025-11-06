"use client"

// ============================================================================
// AssetFlowX - Chat Interface Component
// Clean, minimal chat UI combining ChatGPT simplicity with messaging bubbles
// ============================================================================

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, X, Bot, User, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestedFollowUps?: string[]
}

interface ChatInterfaceProps {
  className?: string
  onClose?: () => void
  showCloseButton?: boolean
  userContext?: {
    currentPage?: string
    userCredentials?: number
    recentJobMatches?: number
  }
}

// Quick help suggestions based on context
const getQuickHelpButtons = (currentPage?: string) => {
  const common = [
    { label: "How to use Job Matching", prompt: "How do I use the job matching feature?" },
    { label: "Portfolio & Analytics", prompt: "How do I use the portfolio and analytics features?" },
    { label: "Navigate Platform", prompt: "How do I navigate and use the AssetFlowX platform?" },
  ]

  if (currentPage?.includes("job-matching")) {
    return [
      { label: "Upload Resume", prompt: "How do I upload and analyze my resume?" },
      { label: "Match Score", prompt: "How is the job match score calculated?" },
      { label: "Improve Resume", prompt: "How can I improve my resume to get better matches?" },
    ]
  }

  if (currentPage?.includes("credentials")) {
    return [
      { label: "View Credentials", prompt: "How do I view my credentials?" },
      { label: "Verify Credential", prompt: "How can I verify a credential?" },
      { label: "Get Credentials", prompt: "How do I earn credentials?" },
    ]
  }

  if (currentPage?.includes("dashboard") || currentPage?.includes("portfolio")) {
    return [
      { label: "View Portfolio", prompt: "How do I view my portfolio performance?" },
      { label: "Track Assets", prompt: "How do I track asset flows?" },
      { label: "Analytics Help", prompt: "How do I use the analytics features?" },
    ]
  }

  if (currentPage?.includes("payments") || currentPage?.includes("checkout")) {
    return [
      { label: "Make Payment", prompt: "How do I make a payment?" },
      { label: "View Orders", prompt: "How do I view my orders?" },
      { label: "Settlement", prompt: "How does payment settlement work?" },
    ]
  }

  if (currentPage?.includes("marketplace") || currentPage?.includes("course")) {
    return [
      { label: "Browse Courses", prompt: "How do I browse and enroll in courses?" },
      { label: "My Courses", prompt: "How do I view my enrolled courses?" },
      { label: "Earn Credentials", prompt: "How do I earn credentials from courses?" },
    ]
  }

  return common
}

// Contextual tips based on current page
const getContextualTip = (currentPage?: string) => {
  if (currentPage?.includes("job-matching")) {
    return "Get AI-powered resume analysis and match scores to find the perfect job fit. Upload your resume and discover how well you match with available positions."
  }
  if (currentPage?.includes("credentials")) {
    return "Track your blockchain-based credentials and certificates. Verify authenticity and showcase your achievements."
  }
  if (currentPage?.includes("marketplace") || currentPage?.includes("course")) {
    return "Browse available courses and enhance your skills. Complete courses to earn credentials and advance your career."
  }
  if (currentPage?.includes("dashboard") || currentPage?.includes("portfolio")) {
    return "Monitor your portfolio performance, track asset flows, and analyze your transactions. Get insights into your financial activities."
  }
  if (currentPage?.includes("payments") || currentPage?.includes("checkout")) {
    return "Manage your payments and settlements efficiently. Process payments for courses and services seamlessly."
  }
  return "I'm your AI assistant for AssetFlowX. I can help you with portfolio management, job matching, credentials, courses, payments, and navigating the platform. Ask me anything!"
}

// Generate contextual follow-up suggestions based on assistant's response
const generateFollowUpSuggestions = (response: string, currentPage?: string): string[] => {
  const suggestions: string[] = []
  const lowerResponse = response.toLowerCase()
  
  // Job matching related suggestions
  if (lowerResponse.includes("resume") || lowerResponse.includes("cv") || lowerResponse.includes("curriculum vitae")) {
    if (lowerResponse.includes("upload") || lowerResponse.includes("analyze")) {
      suggestions.push("How do I improve my resume to get better match scores?")
      suggestions.push("What format should my resume be in?")
    } else {
      suggestions.push("How do I upload my resume for job matching?")
      suggestions.push("What makes a good resume?")
    }
  }
  
  if (lowerResponse.includes("match") || lowerResponse.includes("score") || lowerResponse.includes("qualification")) {
    suggestions.push("How can I improve my match score?")
    suggestions.push("What skills are employers looking for?")
  }
  
  if (lowerResponse.includes("job") || lowerResponse.includes("position") || lowerResponse.includes("opening")) {
    suggestions.push("How do I find jobs that match my skills?")
    suggestions.push("What should I include in my application?")
  }
  
  // Interview related suggestions
  if (lowerResponse.includes("interview") || lowerResponse.includes("interviewing")) {
    suggestions.push("What are common interview questions?")
    suggestions.push("How should I prepare for a technical interview?")
    suggestions.push("What should I wear to an interview?")
  }
  
  // Skills and experience related
  if (lowerResponse.includes("skill") || lowerResponse.includes("experience") || lowerResponse.includes("qualification")) {
    suggestions.push("How can I highlight my skills better?")
    suggestions.push("What experience should I include in my resume?")
  }
  
  // Credentials related
  if (lowerResponse.includes("credential") || lowerResponse.includes("certificate") || lowerResponse.includes("certification")) {
    suggestions.push("How do I view my credentials?")
    suggestions.push("How do I verify a credential?")
    suggestions.push("How do I earn more credentials?")
  }
  
  // Course related
  if (lowerResponse.includes("course") || lowerResponse.includes("learning") || lowerResponse.includes("education")) {
    suggestions.push("What courses are available?")
    suggestions.push("How do I enroll in a course?")
    suggestions.push("How do courses help my career?")
  }
  
  // Portfolio and analytics related
  if (lowerResponse.includes("portfolio") || lowerResponse.includes("asset") || lowerResponse.includes("transaction") || lowerResponse.includes("analytics")) {
    suggestions.push("How do I track my portfolio performance?")
    suggestions.push("How do I view my transaction history?")
    suggestions.push("How do I set up alerts?")
  }
  
  // Payments related
  if (lowerResponse.includes("payment") || lowerResponse.includes("order") || lowerResponse.includes("settlement") || lowerResponse.includes("checkout")) {
    suggestions.push("How do I make a payment?")
    suggestions.push("How do I view my orders?")
    suggestions.push("How does payment settlement work?")
  }
  
  // General fallback suggestions
  if (suggestions.length === 0) {
    if (currentPage?.includes("job-matching")) {
      suggestions.push("Tell me more about job matching")
      suggestions.push("How can I improve my resume?")
      suggestions.push("What are interview best practices?")
    } else if (currentPage?.includes("dashboard") || currentPage?.includes("portfolio")) {
      suggestions.push("How do I view my portfolio?")
      suggestions.push("How do I track assets?")
      suggestions.push("Tell me about analytics features")
    } else if (currentPage?.includes("payments")) {
      suggestions.push("How do I make payments?")
      suggestions.push("How do I view orders?")
      suggestions.push("Tell me about payment features")
    } else {
      suggestions.push("What else can you help me with?")
      suggestions.push("How do I navigate the platform?")
      suggestions.push("Tell me about available features")
    }
  }
  
  // Limit to 3 suggestions
  return suggestions.slice(0, 3)
}

export function ChatInterface({ className, onClose, showCloseButton = true, userContext }: ChatInterfaceProps) {
  const initialButtons = getQuickHelpButtons(userContext?.currentPage)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! 👋 I'm your AssetFlowX AI assistant. I can help you with all aspects of the platform - from portfolio management and analytics, to job matching and career development, credentials, courses, payments, and more. What would you like to know?",
      timestamp: new Date(),
      suggestedFollowUps: initialButtons.map(btn => btn.prompt)
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickHelp, setShowQuickHelp] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const quickHelpButtons = getQuickHelpButtons(userContext?.currentPage)
  const contextualTip = getContextualTip(userContext?.currentPage)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim()
    if (!messageToSend || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setShowQuickHelp(false)
    setIsLoading(true)

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].slice(-10), // Keep last 10 messages
          context: userContext
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to get response")
      }

      const data = await response.json()

      // Generate contextual follow-up suggestions based on the response
      const followUpSuggestions = generateFollowUpSuggestions(data.message, userContext?.currentPage)

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.timestamp || Date.now()),
        suggestedFollowUps: followUpSuggestions
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}. Please try again.`
          : "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const handleQuickHelp = (prompt: string) => {
    setShowQuickHelp(false)
    sendMessage(prompt)
  }

  const handleSend = () => {
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Simple markdown-like formatting for bold text
  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900", className)}>
      {/* Enhanced Header with Branding */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">AI Assistant</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Your complete platform guide</p>
            </div>
          </div>
          {showCloseButton && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Contextual Tip */}
        {showQuickHelp && messages.length === 1 && (
          <div className="px-4 pb-3">
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-900 dark:text-blue-100">{contextualTip}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages - Enhanced with Avatars */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-white dark:bg-gray-900">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-2",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              message.role === "user"
                ? "bg-primary text-white"
                : "bg-primary/10 text-primary dark:bg-primary/20"
            )}>
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            
            {/* Message Bubble */}
            <div className="flex flex-col gap-2 max-w-[75%]">
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm",
                message.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md"
              )}>
                <div className="whitespace-pre-wrap break-words">
                  {formatMessage(message.content)}
                </div>
              </div>
              
              {/* Follow-up Suggestions - Show after the most recent assistant message */}
              {message.role === "assistant" && 
               message.suggestedFollowUps && 
               message.suggestedFollowUps.length > 0 && 
               index === messages.length - 1 && 
               messages[messages.length - 1]?.role === "assistant" &&
               !isLoading && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {message.suggestedFollowUps.map((suggestion, suggestionIdx) => (
                    <Button
                      key={suggestionIdx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickHelp(suggestion)}
                      className="text-xs h-7 px-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-gray-200 dark:bg-gray-700 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input with Better Placeholder */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={userContext?.currentPage?.includes("job-matching") 
              ? "Ask about job matching, resume tips, or interview prep..."
              : userContext?.currentPage?.includes("credentials")
              ? "Ask about credentials, certificates, or verification..."
              : userContext?.currentPage?.includes("dashboard") || userContext?.currentPage?.includes("portfolio")
              ? "Ask about portfolio, analytics, transactions, or asset flows..."
              : userContext?.currentPage?.includes("payments") || userContext?.currentPage?.includes("checkout")
              ? "Ask about payments, orders, or settlements..."
              : userContext?.currentPage?.includes("marketplace") || userContext?.currentPage?.includes("course")
              ? "Ask about courses, enrollment, or learning..."
              : "Ask me anything about AssetFlowX - portfolio, jobs, credentials, courses, payments, or navigation..."
            }
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            disabled={isLoading}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[44px] w-[44px] shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

