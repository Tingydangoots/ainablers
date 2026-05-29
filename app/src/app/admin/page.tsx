import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { UserRoleTable } from "./UserRoleTable"
import { Persona } from "@/generated/prisma"
import { Settings, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const [currentUser, allUsers] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
    }),
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        persona: true,
        personaScore: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ])

  if (!currentUser) redirect("/login")

  const roleCounts = { ADMIN: 0, VALIDATOR: 0, MEMBER: 0 }
  for (const u of allUsers) roleCounts[u.role as keyof typeof roleCounts]++

  return (
    <div className="flex min-h-screen">
      <Nav
        user={{
          name: currentUser.name,
          role: currentUser.role,
          persona: currentUser.persona as Persona,
          avatarSeed: currentUser.avatarSeed,
          personaScore: currentUser.personaScore,
        }}
      />

      <main className="flex-1 ml-64 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="text-primary" size={24} />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-1">Manage team member roles and permissions</p>
        </div>

        {/* Role summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Members", count: roleCounts.MEMBER, color: "text-slate-700", bg: "bg-slate-100 border-slate-200" },
            { label: "Validators", count: roleCounts.VALIDATOR, color: "text-sky-700", bg: "bg-sky-50 border-sky-200" },
            { label: "Admins", count: roleCounts.ADMIN, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          ].map(({ label, count, color, bg }) => (
            <Card key={label} className={`border shadow-sm ${bg}`}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-white/60`}>
                    <Users size={18} className={color} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                    <p className="text-muted-foreground text-xs">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User table */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Users size={15} className="text-primary" />
              All Users ({allUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserRoleTable
              initialUsers={allUsers.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                persona: u.persona,
                personaScore: u.personaScore,
              }))}
              currentUserId={session.user.id}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
