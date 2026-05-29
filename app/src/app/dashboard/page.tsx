import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { DashboardTabs } from "@/components/DashboardTabs"
import { Persona, Rarity } from "@/generated/prisma"
import { calcContributionScore } from "@/lib/gamification"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const [user, leaderboard] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: {
        userBadges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
        _count: { select: { contributions: true } },
      },
    }),
    db.user.findMany({
      where: { role: { not: "ADMIN" } },
      select: {
        id: true, name: true, persona: true, personaScore: true, avatarSeed: true,
        userBadges: { include: { badge: true } },
        _count: { select: { contributions: true } },
      },
      orderBy: { personaScore: "desc" },
      take: 10,
    }),
  ])

  if (!user) redirect("/login")

  // Personal contributions — full detail for tracker + score history
  const userContributions = await db.contribution.findMany({
    where: { submitterId: session.user.id },
    include: { validation: { include: { validator: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  })

  // Personal area breakdown (approved only)
  const areaCount: Record<string, number> = {}
  for (const c of userContributions.filter((c) => c.status === "APPROVED")) {
    areaCount[c.area] = (areaCount[c.area] ?? 0) + 1
  }
  const personalAreaData = Object.entries(areaCount).map(([area, count]) => ({ area, count }))

  // Score history: cumulative score ordered by approval date
  const approvedAsc = [...userContributions]
    .filter((c) => c.status === "APPROVED" && c.validation)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  let cum = 0
  const scoreHistory = approvedAsc.map((c) => {
    cum += calcContributionScore(c.area, c.impact, c.validation!.rating)
    return { date: c.createdAt.toISOString().split("T")[0], score: Math.round(cum) }
  })

  // Counts
  const pendingCount = userContributions.filter((c) => c.status === "PENDING").length
  const approvedCount = userContributions.filter((c) => c.status === "APPROVED").length

  // Team metrics
  const [teamPersonaRaw, teamAreaRaw, teamContribRaw, teamMembers] = await Promise.all([
    db.user.groupBy({ by: ["persona"], where: { role: { not: "ADMIN" } }, _count: { id: true } }),
    db.contribution.groupBy({ by: ["area"], where: { status: "APPROVED" }, _count: { id: true } }),
    db.contribution.groupBy({ by: ["status"], _count: { id: true } }),
    db.user.aggregate({ where: { role: { not: "ADMIN" } }, _count: { id: true }, _avg: { personaScore: true } }),
  ])

  const contribByStatus: Record<string, number> = {}
  for (const r of teamContribRaw) contribByStatus[r.status] = r._count.id

  const rank = leaderboard.findIndex((u) => u.id === user.id) + 1

  return (
    <div className="flex min-h-screen">
      <Nav user={{ name: user.name, role: user.role, persona: user.persona as Persona, avatarSeed: user.avatarSeed, personaScore: user.personaScore }} />

      <main className="flex-1 ml-64 p-8">
        <DashboardTabs
          user={{
            id: user.id,
            name: user.name,
            persona: user.persona as Persona,
            personaScore: user.personaScore,
            avatarSeed: user.avatarSeed,
            userBadges: user.userBadges.map((ub) => ({
              badge: { ...ub.badge, rarity: ub.badge.rarity as Rarity },
              earnedAt: ub.earnedAt.toISOString(),
            })),
            _count: user._count,
          }}
          approvedCount={approvedCount}
          pendingCount={pendingCount}
          rank={rank}
          personalAreaData={personalAreaData}
          scoreHistory={scoreHistory}
          userContributions={userContributions.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            area: c.area,
            impact: c.impact,
            scope: c.scope,
            status: c.status,
            createdAt: c.createdAt.toISOString(),
            validation: c.validation
              ? { rating: c.validation.rating, note: c.validation.note, validatorName: c.validation.validator.name }
              : null,
          }))}
          leaderboard={leaderboard.map((u) => ({
            ...u,
            persona: u.persona as Persona,
            userBadges: u.userBadges.map((ub) => ({
              badge: { ...ub.badge, rarity: ub.badge.rarity as Rarity },
              earnedAt: ub.earnedAt.toISOString(),
            })),
          }))}
          teamStats={{
            totalMembers: teamMembers._count.id,
            totalApproved: contribByStatus["APPROVED"] ?? 0,
            totalPending: contribByStatus["PENDING"] ?? 0,
            totalRejected: contribByStatus["REJECTED"] ?? 0,
            avgScore: teamMembers._avg.personaScore ?? 0,
          }}
          teamPersonaStats={teamPersonaRaw.map((r) => ({ persona: r.persona, count: r._count.id }))}
          teamAreaData={teamAreaRaw.map((r) => ({ area: r.area, count: r._count.id }))}
        />
      </main>
    </div>
  )
}
