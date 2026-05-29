import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { Persona } from "@/generated/prisma"
import { LayoutGrid } from "lucide-react"
import { calcContributionScore } from "@/lib/gamification"
import { ContributionGridClient, GridRow } from "./ContributionGridClient"

export default async function ContributionGridPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
  })
  if (!user) redirect("/login")

  const contributions = await db.contribution.findMany({
    where: { status: "APPROVED" },
    include: {
      submitter: { select: { name: true, persona: true, avatarSeed: true } },
      validation: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const rows: GridRow[] = contributions
    .filter((c) => c.validation !== null)
    .map((c) => ({
      id:          c.id,
      title:       c.title,
      description: c.description,
      area:        c.area,
      impact:      c.impact,
      scope:       c.scope,
      rating:      c.validation!.rating,
      score:       calcContributionScore(c.area, c.impact, c.validation!.rating),
      submitter: {
        name:       c.submitter.name,
        persona:    c.submitter.persona,
        avatarSeed: c.submitter.avatarSeed,
      },
    }))

  return (
    <div className="flex min-h-screen">
      <Nav
        user={{
          name:         user.name,
          role:         user.role,
          persona:      user.persona as Persona,
          avatarSeed:   user.avatarSeed,
          personaScore: user.personaScore,
        }}
      />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="text-primary" size={24} />
            Contribution Grid
          </h1>
          <p className="text-muted-foreground mt-1">
            All approved team contributions
            {" · "}
            <span className="text-foreground font-medium">{rows.length}</span> entries
          </p>
        </div>

        <ContributionGridClient rows={rows} />
      </main>
    </div>
  )
}
