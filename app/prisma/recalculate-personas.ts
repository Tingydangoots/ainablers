import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { Area } from "../src/generated/prisma/client"
import {
  calcTotalScore,
  derivePersonaWithGates,
  getEarnedBadgeKeys,
} from "../src/lib/gamification"

const url = process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL not set")
const adapter = new PrismaLibSql({ url, authToken: process.env.DATABASE_AUTH_TOKEN })
const db = new PrismaClient({ adapter })

async function main() {
  const users = await db.user.findMany({ select: { id: true, name: true } })
  console.log(`Recalculating personas for ${users.length} users...`)

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

    // Recompute badges
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

    console.log(`  ${user.name}: score=${totalScore.toFixed(1)}, persona=${newPersona}`)
  }

  console.log("Done.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
