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
]

const VALIDATOR_ITEMS = [
  { href: "/validate", label: "Validate", icon: ShieldCheck },
]

export function Nav({ user }: NavProps) {
  const pathname = usePathname()

  const items = [
    ...NAV_ITEMS,
    ...((user.role === "VALIDATOR" || user.role === "ADMIN") ? VALIDATOR_ITEMS : []),
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="text-blue-400" size={22} />
          <span className="text-white font-bold text-lg tracking-tight">AINABLERS</span>
        </div>
        <p className="text-slate-500 text-xs mt-1">AI Adoption Tracker</p>
      </div>

      {/* User card */}
      <div className="p-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <AvatarEvolution seed={user.avatarSeed} persona={user.persona} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{user.name}</p>
            <PersonaBadge persona={user.persona} size="sm" />
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={14} className="mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
