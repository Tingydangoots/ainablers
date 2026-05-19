import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { validationSchema } from "@/lib/schemas/validation"
import {
  calcContributionScore,
  derivePersona,
  getEarnedBadgeKeys,
} from "@/lib/gamification"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role === "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const result = validationSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const contribution = await db.contribution.findUnique({
    where: { id },
    include: { validation: true },
  })
  if (!contribution) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (contribution.validation) {
    return NextResponse.json({ error: "Already validated" }, { status: 409 })
  }

  const { decision, rating, note } = result.data

  // Create validation + update contribution status in one transaction
  await db.$transaction(async (tx) => {
    await tx.validation.create({
      data: {
        contributionId: id,
        validatorId: session.user.id,
        decision,
        rating,
        note,
      },
    })

    await tx.contribution.update({
      where: { id },
      data: { status: decision },
    })
  })

  // Recalculate the submitter's score
  const allContributions = await db.contribution.findMany({
    where: { submitterId: contribution.submitterId, status: "APPROVED" },
    include: { validation: true },
  })

  const totalScore = allContributions.reduce((acc, c) => {
    if (!c.validation) return acc
    return acc + calcContributionScore(c.area, c.impact, c.validation.rating)
  }, 0)

  const newPersona = derivePersona(totalScore)

  await db.user.update({
    where: { id: contribution.submitterId },
    data: { personaScore: totalScore, persona: newPersona },
  })

  // Compute badges
  const allUserContributions = await db.contribution.findMany({
    where: { submitterId: contribution.submitterId },
    include: { validation: true },
  })

  const earnedKeys = getEarnedBadgeKeys(
    allUserContributions.map((c) => ({
      area: c.area,
      status: c.status,
      validation: c.validation ? { rating: c.validation.rating } : null,
    })),
    totalScore,
    newPersona
  )

  if (earnedKeys.length > 0) {
    const badges = await db.badge.findMany({
      where: { key: { in: earnedKeys as string[] } },
    })
    const existingUserBadges = await db.userBadge.findMany({
      where: { userId: contribution.submitterId },
      select: { badgeId: true },
    })
    const existingBadgeIds = new Set(existingUserBadges.map((ub) => ub.badgeId))
    const newBadges = badges.filter((b) => !existingBadgeIds.has(b.id))

    for (const badge of newBadges) {
      await db.userBadge.upsert({
        where: { userId_badgeId: { userId: contribution.submitterId, badgeId: badge.id } },
        update: {},
        create: { userId: contribution.submitterId, badgeId: badge.id },
      })
    }
  }

  return NextResponse.json({ success: true, newPersona, totalScore })
}
