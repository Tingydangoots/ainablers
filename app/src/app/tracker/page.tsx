import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Persona } from "@/generated/prisma"
import { ClipboardList, Star, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  PENDING: { label: "Pending", icon: Clock, class: "bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  APPROVED: { label: "Approved", icon: CheckCircle, class: "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" },
  REJECTED: { label: "Rejected", icon: XCircle, class: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
}

const AREA_COLORS: Record<string, string> = {
  PRODUCTIVITY: "bg-primary/8 text-primary border-primary/20",
  DELIVERABLE: "bg-secondary/8 text-secondary dark:text-blue-300 border-secondary/20",
  INNOVATION: "bg-accent/8 text-accent dark:text-green-300 border-accent/20",
  OTHER: "bg-muted text-muted-foreground border-border",
}

export default async function TrackerPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
  })
  if (!user) redirect("/login")

  const isValidator = user.role === "VALIDATOR" || user.role === "ADMIN"

  const contributions = await db.contribution.findMany({
    where: isValidator ? {} : { submitterId: session.user.id },
    include: {
      submitter: { select: { name: true, persona: true } },
      validation: { include: { validator: { select: { name: true } } } },
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
            <ClipboardList className="text-primary" size={24} />
            Contribution Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            {isValidator ? "All team contributions" : "Your contribution history"}
            {" · "}
            <span className="text-foreground font-medium">{contributions.length}</span> total
          </p>
        </div>

        {contributions.length === 0 ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-16 text-center">
              <ClipboardList size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground">No contributions yet.</p>
              <p className="text-muted-foreground/60 text-sm mt-1">
                Head to <span className="text-primary">Submit</span> to log your first AI activity.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG]
              const StatusIcon = statusCfg.icon

              return (
                <Card key={c.id} className="border-border shadow-sm hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-foreground font-semibold text-sm truncate">{c.title}</h3>
                          <Badge className={cn("text-xs border", statusCfg.class)}>
                            <StatusIcon size={10} className="mr-1" />
                            {statusCfg.label}
                          </Badge>
                          <Badge className={cn("text-xs border", AREA_COLORS[c.area])}>
                            {c.area}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{c.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {isValidator && (
                            <span>by <span className="text-foreground font-medium">{c.submitter.name}</span></span>
                          )}
                          <span>Impact: <span className="text-foreground/80">{c.impact}</span></span>
                          <span>Scope: <span className="text-foreground/80">{c.scope}</span></span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {c.validation && (
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 justify-end">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < c.validation!.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">by {c.validation.validator.name}</p>
                          {c.validation.note && (
                            <p className="text-muted-foreground text-xs mt-1 max-w-48 text-right italic">
                              &ldquo;{c.validation.note}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
