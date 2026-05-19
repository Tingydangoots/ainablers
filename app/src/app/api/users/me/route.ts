import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      persona: true,
      personaScore: true,
      avatarSeed: true,
      createdAt: true,
      userBadges: {
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      },
      _count: { select: { contributions: true } },
    },
  })

  return NextResponse.json(user)
}
