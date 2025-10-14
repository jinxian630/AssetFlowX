"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Bell,
  Shield,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Flows",
    href: "/flows",
    icon: ArrowLeftRight,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    title: "Risk",
    href: "/risk",
    icon: Shield,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card transition-transform duration-200",
          "md:translate-x-0",
          collapsed ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/assetflowx-logo.png"
                alt="AssetFlowX logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="text-xl font-bold brand-gradient-text">
                AssetFlowX
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="rounded-xl bg-brand-500/10 p-4">
              <p className="text-xs font-semibold text-brand-500">
                Phase 3 Active
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Navigation shell ready
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  )
}
