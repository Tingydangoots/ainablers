import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const registerSchema = z.object({
  name:      z.string().min(2, "Full name is required"),
  localPart: z.string()
    .min(3, "Must be at least 3 characters")
    .regex(/^[a-zA-Z]+\.[a-zA-Z]+$/, "Must be firstname.lastname — letters only, no numbers or spaces"),
  password:  z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  const body = await req.json() as unknown
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, localPart, password } = result.data
  const email = `${localPart.toLowerCase()}@ainablers.com`

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "That email is already registered" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await db.user.create({
    data: {
      name,
      email,
      password: hashed,
      avatarSeed: name,
      role:        "MEMBER",
      persona:     "ADOPTER",
      personaScore: 0,
    },
  })

  return NextResponse.json({ ok: true })
}
