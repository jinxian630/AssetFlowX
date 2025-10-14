import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar />

      <div className="md:pl-64">
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
