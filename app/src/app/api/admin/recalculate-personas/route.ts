import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Area } from "@/generated/prisma"
import { calcTotalScore, derivePersonaWithGates, getEarnedBadgeKeys } from "@/lib/gamification"

export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const users = await db.user.findMany({ select: { id: true, name: true } })
  const results: { name: string; score: number; persona: string }[] = []

  for (const user of users) {
    const approved = await db.contribution.findMany({
      where: { submitterId: user.id, status: "APPROVED" },
      include: { validation: true },
      orderBy: { createdAt: "asc" },
    })

    const totalScore = calcTotalScore(
      approved
        .filter((c) => c.validation)
        .map((c) => ({ area: c.area, impact: c.impact, rating: c.validation!.rating }))
    )

    const areaCounts: Partial<Record<Area, number>> = {}
    for (const c of approved) {
      areaCounts[c.area] = (areaCounts[c.area] ?? 0) + 1
    }

    const newPersona = derivePersonaWithGates(totalScore, areaCounts)

    await db.user.update({
      where: { id: user.id },
      data: { personaScore: totalScore, persona: newPersona },
    })

    const allContributions = await db.contribution.findMany({
      where: { submitterId: user.id },
      include: { validation: true },
    })

    const earnedKeys = getEarnedBadgeKeys(
      allContributions.map((c) => ({
        area: c.area,
        status: c.status,
        validation: c.validation ? { rating: c.validation.rating } : null,
      })),
      totalScore,
      newPersona
    )

    if (earnedKeys.length > 0) {
      const badges = await db.badge.findMany({ where: { key: { in: earnedKeys as string[] } } })
      for (const badge of badges) {
        await db.userBadge.upsert({
          where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
          update: {},
          create: { userId: user.id, badgeId: badge.id },
        })
      }
    }

    results.push({ name: user.name ?? user.id, score: totalScore, persona: newPersona })
  }

  return NextResponse.json({ recalculated: results.length, results })
}
