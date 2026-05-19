import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const BADGE_DEFINITIONS = [
  { key: "first_steps", name: "First Steps", description: "Submitted your first AI contribution", rarity: "COMMON" as const, icon: "🌱" },
  { key: "ai_enthusiast", name: "AI Enthusiast", description: "5 approved contributions under your belt", rarity: "COMMON" as const, icon: "⚡" },
  { key: "meeting_master", name: "Meeting Master", description: "Transformed 3 meetings with AI", rarity: "COMMON" as const, icon: "🎙️" },
  { key: "code_alchemist", name: "Code Alchemist", description: "First AI-powered deliverable created", rarity: "RARE" as const, icon: "⚗️" },
  { key: "perfect_score", name: "Flawless", description: "Received a perfect validator rating of 5", rarity: "RARE" as const, icon: "💎" },
  { key: "trailblazer", name: "Trailblazer", description: "Reached Transformer status", rarity: "RARE" as const, icon: "🔥" },
  { key: "productivity_pro", name: "Productivity Pro", description: "10 PRODUCTIVITY contributions approved", rarity: "RARE" as const, icon: "🚀" },
  { key: "deliverable_dynamo", name: "Deliverable Dynamo", description: "10 DELIVERABLE contributions approved", rarity: "RARE" as const, icon: "⚙️" },
  { key: "innovation_spark", name: "Innovation Spark", description: "First INNOVATION contribution approved", rarity: "EPIC" as const, icon: "✨" },
  { key: "team_architect", name: "Team Architect", description: "3 INNOVATION contributions approved", rarity: "EPIC" as const, icon: "🏛️" },
  { key: "century", name: "Century", description: "Scored 100+ total persona points", rarity: "EPIC" as const, icon: "💯" },
  { key: "ainabler_legend", name: "AINABLER Legend", description: "Reached Innovator status — the pinnacle", rarity: "LEGENDARY" as const, icon: "👑" },
]

const url = process.env.DATABASE_URL
if (!url) throw new Error("DATABASE_URL not set — check your .env file")

const adapter = new PrismaLibSql({ url })
const db = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  for (const badge of BADGE_DEFINITIONS) {
    await db.badge.upsert({
      where: { key: badge.key },
      update: { name: badge.name, description: badge.description, icon: badge.icon, rarity: badge.rarity },
      create: badge,
    })
  }
  console.log(`✓ Seeded ${BADGE_DEFINITIONS.length} badges`)

  const adminPassword = await bcrypt.hash("admin123!", 12)
  await db.user.upsert({
    where: { email: "admin@ainablers.com" },
    update: {},
    create: { name: "Admin", email: "admin@ainablers.com", password: adminPassword, role: "ADMIN" },
  })
  console.log("✓ Admin:     admin@ainablers.com     / admin123!")

  const validatorPassword = await bcrypt.hash("validator123!", 12)
  await db.user.upsert({
    where: { email: "validator@ainablers.com" },
    update: {},
    create: { name: "Team Validator", email: "validator@ainablers.com", password: validatorPassword, role: "VALIDATOR" },
  })
  console.log("✓ Validator: validator@ainablers.com / validator123!")

  const memberPassword = await bcrypt.hash("member123!", 12)
  await db.user.upsert({
    where: { email: "ameet@ainablers.com" },
    update: {},
    create: { name: "Ameet", email: "ameet@ainablers.com", password: memberPassword, role: "MEMBER" },
  })
  console.log("✓ Member:    ameet@ainablers.com     / member123!")

  console.log("\n✨ Seed complete!")
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
