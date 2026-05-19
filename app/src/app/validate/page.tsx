import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { ValidationQueueClient } from "./ValidationQueueClient"
import { Persona } from "@/generated/prisma"
import { ShieldCheck } from "lucide-react"

export default async function ValidatePage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role === "MEMBER") redirect("/dashboard")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
  })
  if (!user) redirect("/login")

  const pending = await db.contribution.findMany({
    where: { status: "PENDING" },
    include: {
      submitter: { select: { name: true, persona: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const serialised = pending.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    area: c.area,
    benefit: c.benefit,
    impact: c.impact,
    scope: c.scope,
    createdAt: c.createdAt.toISOString(),
    submitter: { name: c.submitter.name, persona: c.submitter.persona },
  }))

  return (
    <div className="flex min-h-screen">
      <Nav
        user={{
          name: user.name,
          role: user.role,
          persona: user.persona as Persona,
          avatarSeed: user.avatarSeed,
          personaScore: user.personaScore,
        }}
      />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={24} />
            Validation Queue
          </h1>
          <p className="text-slate-400 mt-1">
            <span className="text-white font-medium">{pending.length}</span> contributions awaiting your review
          </p>
        </div>

        <ValidationQueueClient initialContributions={serialised} />
      </main>
    </div>
  )
}
