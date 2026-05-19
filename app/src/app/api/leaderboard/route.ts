import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await db.user.findMany({
    where: { role: "MEMBER" },
    select: {
      id: true,
      name: true,
      email: true,
      persona: true,
      personaScore: true,
      avatarSeed: true,
      userBadges: { include: { badge: true } },
      _count: { select: { contributions: true } },
    },
    orderBy: { personaScore: "desc" },
    take: 20,
  })

  return NextResponse.json(users)
}
