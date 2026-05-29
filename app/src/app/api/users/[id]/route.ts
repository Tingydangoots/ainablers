import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { calcContributionScore } from "@/lib/gamification"

const patchSchema = z.object({
  role: z.enum(["MEMBER", "VALIDATOR", "ADMIN"]),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, persona: true, personaScore: true, avatarSeed: true,
      userBadges: { include: { badge: true }, orderBy: { earnedAt: "desc" } },
      _count: { select: { contributions: true } },
      contributions: {
        orderBy: { createdAt: "desc" },
        include: { validation: { include: { validator: { select: { name: true } } } } },
      },
    },
  })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const areaCount: Record<string, number> = {}
  for (const c of user.contributions.filter((c) => c.status === "APPROVED")) {
    areaCount[c.area] = (areaCount[c.area] ?? 0) + 1
  }

  // Score history: cumulative score over time from approved contributions (asc order)
  const approvedAsc = [...user.contributions]
    .filter((c) => c.status === "APPROVED" && c.validation)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  let cum = 0
  const scoreHistory = approvedAsc.map((c) => {
    cum += calcContributionScore(c.area, c.impact, c.validation!.rating)
    return {
      date: c.createdAt.toISOString().split("T")[0],
      score: Math.round(cum),
    }
  })

  return NextResponse.json({
    id: user.id,
    name: user.name,
    persona: user.persona,
    personaScore: user.personaScore,
    avatarSeed: user.avatarSeed,
    totalContributions: user._count.contributions,
    userBadges: user.userBadges.map((ub) => ({
      badge: { key: ub.badge.key, name: ub.badge.name, icon: ub.badge.icon, rarity: ub.badge.rarity },
      earnedAt: ub.earnedAt.toISOString(),
    })),
    areaBreakdown: Object.entries(areaCount).map(([area, count]) => ({ area, count })),
    scoreHistory,
    recentContributions: user.contributions.slice(0, 8).map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      area: c.area,
      status: c.status,
      impact: c.impact,
      createdAt: c.createdAt.toISOString(),
      validation: c.validation
        ? { rating: c.validation.rating, note: c.validation.note, validatorName: c.validation.validator.name }
        : null,
    })),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const result = patchSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  // Prevent admin from demoting themselves
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 })
  }

  const user = await db.user.update({
    where: { id },
    data: { role: result.data.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user)
}
