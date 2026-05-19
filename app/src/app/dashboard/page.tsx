import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { AvatarEvolution } from "@/components/AvatarEvolution"
import { PersonaBadge } from "@/components/PersonaBadge"
import { ScoreProgress } from "@/components/ScoreProgress"
import { BadgeDisplay } from "@/components/BadgeDisplay"
import { LeaderboardTable } from "@/components/LeaderboardTable"
import { AreaBreakdownChart } from "@/components/AreaBreakdownChart"
import { PERSONA_META } from "@/lib/gamification"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Persona, Rarity } from "@/generated/prisma"
import { TrendingUp, Award, Users, Clock } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [user, leaderboard, contributions] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        userBadges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
        _count: { select: { contributions: true } },
      },
    }),
    db.user.findMany({
      where: { role: "MEMBER" },
      select: {
        id: true,
        name: true,
        persona: true,
        personaScore: true,
        avatarSeed: true,
        userBadges: { include: { badge: true } },
        _count: { select: { contributions: true } },
      },
      orderBy: { personaScore: "desc" },
      take: 10,
    }),
    db.contribution.findMany({
      where: { submitterId: session.user.id, status: "APPROVED" },
      select: { area: true },
    }),
  ])

  if (!user) redirect("/login")

  const meta = PERSONA_META[user.persona as Persona]

  // Build area breakdown
  const areaCount: Record<string, number> = {}
  for (const c of contributions) {
    areaCount[c.area] = (areaCount[c.area] ?? 0) + 1
  }
  const areaData = Object.entries(areaCount).map(([area, count]) => ({ area, count }))

  const pendingCount = await db.contribution.count({
    where: { submitterId: session.user.id, status: "PENDING" },
  })

  const approvedCount = await db.contribution.count({
    where: { submitterId: session.user.id, status: "APPROVED" },
  })

  const navUser = {
    name: user.name,
    role: user.role,
    persona: user.persona as Persona,
    avatarSeed: user.avatarSeed,
    personaScore: user.personaScore,
  }

  return (
    <div className="flex min-h-screen">
      <Nav user={navUser} />

      <main className="flex-1 ml-64 p-8 space-y-8">
        {/* Hero — Character Card */}
        <div className={`relative rounded-2xl p-8 overflow-hidden border ${meta.border}`}>
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-10`} />
          {user.persona === "INNOVATOR" && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/5 animate-pulse" />
          )}

          <div className="relative flex items-center gap-8">
            <AvatarEvolution
              seed={user.avatarSeed}
              persona={user.persona as Persona}
              size="xl"
              showLabel
            />

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                <PersonaBadge persona={user.persona as Persona} size="lg" />
              </div>
              <p className={`text-sm mb-4 ${meta.textColor}`}>{meta.description}</p>
              <ScoreProgress persona={user.persona as Persona} score={user.personaScore} />

              {/* Stats row */}
              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{Math.round(user.personaScore)}</p>
                  <p className="text-slate-400 text-xs">Total Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{approvedCount}</p>
                  <p className="text-slate-400 text-xs">Approved</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                  <p className="text-slate-400 text-xs">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user.userBadges.length}</p>
                  <p className="text-slate-400 text-xs">Badges</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: "Score", value: Math.round(user.personaScore), color: "text-blue-400" },
            { icon: Award, label: "Badges Earned", value: user.userBadges.length, color: "text-yellow-400" },
            { icon: Users, label: "Team Rank", value: `#${(leaderboard.findIndex((u) => u.id === user.id) + 1) || "—"}`, color: "text-cyan-400" },
            { icon: Clock, label: "Pending Review", value: pendingCount, color: "text-orange-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-slate-800 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-slate-400 text-xs">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Badge Wall */}
          <div className="col-span-2">
            <Card className="bg-slate-900 border-slate-800 h-full">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  Achievement Vault
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgeDisplay
                  userBadges={user.userBadges.map((ub) => ({
                    badge: { ...ub.badge, rarity: ub.badge.rarity as Rarity },
                    earnedAt: ub.earnedAt.toISOString(),
                  }))}
                  showLocked
                />
              </CardContent>
            </Card>
          </div>

          {/* Area breakdown */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Your Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <AreaBreakdownChart data={areaData} />
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Team Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LeaderboardTable entries={leaderboard.map(u => ({
              ...u,
              persona: u.persona as Persona,
              userBadges: u.userBadges.map(ub => ({
                badge: { ...ub.badge, rarity: ub.badge.rarity as Rarity },
                earnedAt: ub.earnedAt.toISOString(),
              })),
            }))} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
