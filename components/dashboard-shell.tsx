import { LayoutChrome } from "@/components/nav/LayoutChrome"
import { Topbar } from "@/components/topbar"
import { FloatingChatButton } from "@/components/chatbot/floating-chat-button"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <LayoutChrome>
      <Topbar />
      <main className="p-6">
        {children}
      </main>
      <FloatingChatButton />
    </LayoutChrome>
  )
}
