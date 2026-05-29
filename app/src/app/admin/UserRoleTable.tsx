"use client"

import { useState, useTransition } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Cpu, Bot, Crosshair, ShieldCheck } from "lucide-react"

interface UserRow {
  id: string
  name: string
  email: string
  role: string
  persona: string
  personaScore: number
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-amber-100 text-amber-800 border-amber-300",
  VALIDATOR: "bg-sky-100 text-sky-800 border-sky-300",
  MEMBER: "bg-slate-100 text-slate-700 border-slate-300",
}

const PERSONA_ICONS: Record<string, React.ElementType> = {
  ADOPTER: Bot,
  TRANSFORMER: Crosshair,
  INNOVATOR: Cpu,
}

const PERSONA_COLORS: Record<string, string> = {
  ADOPTER: "text-emerald-700",
  TRANSFORMER: "text-sky-700",
  INNOVATOR: "text-amber-600",
}

export function UserRoleTable({ initialUsers, currentUserId }: { initialUsers: UserRow[]; currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [pending, startTransition] = useTransition()

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        toast.error(data.error ?? "Failed to update role")
        return
      }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u))
      toast.success("Role updated")
    })
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Member</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Persona</th>
            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Score</th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const PersonaIcon = PERSONA_ICONS[user.persona] ?? Bot
            const isSelf = user.id === currentUserId
            return (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{user.name}</span>
                    {isSelf && (
                      <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">you</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-1.5 font-medium ${PERSONA_COLORS[user.persona] ?? "text-foreground"}`}>
                    <PersonaIcon size={13} />
                    <span className="text-xs capitalize">{user.persona.toLowerCase()}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-bold text-foreground">{Math.round(user.personaScore)}</td>
                <td className="px-4 py-3">
                  {isSelf ? (
                    <Badge className={`${ROLE_COLORS[user.role] ?? ""} border text-xs font-semibold`} variant="outline">
                      <ShieldCheck size={11} className="mr-1" />
                      {user.role}
                    </Badge>
                  ) : (
                    <Select
                      value={user.role}
                      onValueChange={(val) => { if (val) handleRoleChange(user.id, val) }}
                      disabled={pending}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="VALIDATOR">Validator</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
