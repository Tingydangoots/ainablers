"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { AvatarEvolution } from "./AvatarEvolution"
import { PersonaBadge } from "./PersonaBadge"
import { Persona } from "@/generated/prisma"
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  ShieldCheck,
  LogOut,
  Zap,
  Settings,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavProps {
  user: {
    name: string
    role: string
    persona: Persona
    avatarSeed: string
    personaScore: number
  }
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/submit", label: "Submit", icon: PlusCircle },
  { href: "/tracker", label: "Tracker", icon: ClipboardList },
  { href: "/contribution-grid", label: "Contribution Grid", icon: LayoutGrid },
  { href: "/validate", label: "Validate", icon: ShieldCheck },
]

const ADMIN_ITEMS = [
  { href: "/admin", label: "Admin", icon: Settings },
]

export function Nav({ user }: NavProps) {
  const pathname = usePathname()

  const items = [
    ...NAV_ITEMS,
    ...(user.role === "ADMIN" ? ADMIN_ITEMS : []),
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col z-50 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Zap className="text-primary" size={18} />
          </div>
          <span className="text-foreground font-bold text-base tracking-tight">AINABLERS</span>
        </div>
        <p className="text-muted-foreground text-xs mt-1.5 ml-0.5">AI Adoption Tracker</p>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity rounded-lg p-1">
          <AvatarEvolution seed={user.avatarSeed} persona={user.persona} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm truncate">{user.name}</p>
            <PersonaBadge persona={user.persona} size="sm" />
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-3 space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary/10 text-primary border border-primary/15 shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Score display */}
      <div className="px-4 py-3 mx-3 mb-2 rounded-xl bg-muted border border-border">
        <p className="text-xs text-muted-foreground font-medium">Persona Score</p>
        <p className="text-xl font-bold text-foreground">{Math.round(user.personaScore)}<span className="text-xs text-muted-foreground font-normal ml-1">pts</span></p>
      </div>

      {/* Sign out */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-border text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
