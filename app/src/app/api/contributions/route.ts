import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { contributionSchema } from "@/lib/schemas/contribution"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const userId = searchParams.get("userId")
  const status = searchParams.get("status")
  const area = searchParams.get("area")

  const where: Record<string, unknown> = {}

  // Members only see their own; validators/admins see all
  if (session.user.role === "MEMBER") {
    where.submitterId = session.user.id
  } else if (userId) {
    where.submitterId = userId
  }

  if (status) where.status = status
  if (area) where.area = area

  const contributions = await db.contribution.findMany({
    where,
    include: {
      submitter: { select: { id: true, name: true, email: true, persona: true } },
      validation: { include: { validator: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(contributions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const result = contributionSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const contribution = await db.contribution.create({
    data: { ...result.data, submitterId: session.user.id },
  })

  return NextResponse.json(contribution, { status: 201 })
}
