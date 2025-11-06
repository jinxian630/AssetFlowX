"use client"

// ============================================================================
// AssetFlowX - Floating Chat Button
// Quick access to AI assistant from anywhere
// ============================================================================

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot, X } from "lucide-react"
import { ChatInterface } from "./chat-interface"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function FloatingChatButton() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Don't show on chatbot page itself
  if (pathname === "/chatbot") {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 hover:scale-110 transition-transform bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90"
        >
          <Bot className="h-6 w-6" />
          <span className="sr-only">Open AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[420px] p-0 border-0 shadow-2xl" 
        showOverlay={false}
      >
        <SheetTitle className="sr-only">AI Assistant Chat</SheetTitle>
        <div className="h-full">
          <ChatInterface 
            className="h-full rounded-none border-0"
            onClose={() => setOpen(false)}
            showCloseButton={false}
            userContext={{
              currentPage: pathname
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

