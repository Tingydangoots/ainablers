import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Persona } from "@/generated/prisma"
import { LayoutGrid, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { calcContributionScore, AREA_WEIGHTS, IMPACT_MULTIPLIERS } from "@/lib/gamification"

const AREA_COLORS: Record<string, string> = {
  PRODUCTIVITY: "bg-primary/8 text-primary border-primary/20",
  DELIVERABLE: "bg-secondary/8 text-secondary dark:text-blue-300 border-secondary/20",
  INNOVATION: "bg-accent/8 text-accent dark:text-green-300 border-accent/20",
  OTHER: "bg-muted text-muted-foreground border-border",
}

const IMPACT_COLORS: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-blue-500",
  HIGH: "text-orange-500",
  TRANSFORMATIVE: "text-purple-500 font-semibold",
}

const SCOPE_LABELS: Record<string, string> = {
  CAPGEMINI: "Capgemini",
  CLIENT: "Client",
  BOTH: "Both",
}

export default async function ContributionGridPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
  })
  if (!user) redirect("/login")

  const isValidator = user.role === "VALIDATOR" || user.role === "ADMIN"

  const contributions = await db.contribution.findMany({
    where: isValidator ? { status: "APPROVED" } : { submitterId: session.user.id, status: "APPROVED" },
    include: {
      submitter: { select: { name: true } },
      validation: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  })

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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LayoutGrid className="text-primary" size={24} />
            Contribution Grid
          </h1>
          <p className="text-muted-foreground mt-1">
            {isValidator ? "All approved contributions" : "Your approved contributions"}
            {" · "}
            <span className="text-foreground font-medium">{contributions.length}</span> entries
          </p>
        </div>

        {contributions.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-16 text-center">
              <LayoutGrid size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground">No approved contributions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {isValidator && (
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-36">
                          Name
                        </th>
                      )}
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Summary of Contribution
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">
                        Area
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">
                        Impact
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">
                        Scope
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">
                        Star Rating
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map((c, idx) => {
                      const score = c.validation
                        ? calcContributionScore(c.area, c.impact, c.validation.rating)
                        : null

                      return (
                        <tr
                          key={c.id}
                          className={cn(
                            "border-b border-border/60 hover:bg-muted/30 transition-colors",
                            idx === contributions.length - 1 && "border-b-0"
                          )}
                        >
                          {isValidator && (
                            <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                              {c.submitter.name}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{c.title}</p>
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{c.description}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={cn("text-xs border", AREA_COLORS[c.area])}>
                              {c.area}
                            </Badge>
                          </td>
                          <td className={cn("px-4 py-3 text-xs", IMPACT_COLORS[c.impact])}>
                            {c.impact}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {SCOPE_LABELS[c.scope]}
                          </td>
                          <td className="px-4 py-3">
                            {c.validation ? (
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={13}
                                    className={i < c.validation!.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/25"}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {score !== null ? (
                              <span className="font-bold text-primary text-sm">
                                {score % 1 === 0 ? score : score.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
