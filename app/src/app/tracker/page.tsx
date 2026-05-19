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
  PENDING: { label: "Pending", icon: Clock, class: "bg-yellow-900/50 text-yellow-400 border-yellow-700" },
  APPROVED: { label: "Approved", icon: CheckCircle, class: "bg-green-900/50 text-green-400 border-green-700" },
  REJECTED: { label: "Rejected", icon: XCircle, class: "bg-red-900/50 text-red-400 border-red-700" },
}

const AREA_COLORS: Record<string, string> = {
  PRODUCTIVITY: "bg-blue-900/50 text-blue-300 border-blue-700",
  DELIVERABLE: "bg-cyan-900/50 text-cyan-300 border-cyan-700",
  INNOVATION: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
  OTHER: "bg-slate-700 text-slate-300 border-slate-600",
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-blue-400" size={24} />
            Contribution Tracker
          </h1>
          <p className="text-slate-400 mt-1">
            {isValidator ? "All team contributions" : "Your contribution history"}
            {" · "}
            <span className="text-white font-medium">{contributions.length}</span> total
          </p>
        </div>

        {contributions.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-16 text-center">
              <ClipboardList size={40} className="mx-auto mb-3 text-slate-600" />
              <p className="text-slate-400">No contributions yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Head to <span className="text-blue-400">Submit</span> to log your first AI activity.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contributions.map((c) => {
              const statusCfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG]
              const StatusIcon = statusCfg.icon

              return (
                <Card key={c.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-white font-semibold text-sm truncate">{c.title}</h3>
                          <Badge className={cn("text-xs border", statusCfg.class)}>
                            <StatusIcon size={10} className="mr-1" />
                            {statusCfg.label}
                          </Badge>
                          <Badge className={cn("text-xs border", AREA_COLORS[c.area])}>
                            {c.area}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-xs line-clamp-2 mb-2">{c.description}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          {isValidator && (
                            <span className="text-slate-400">by <span className="text-white">{c.submitter.name}</span></span>
                          )}
                          <span>Impact: <span className="text-slate-300">{c.impact}</span></span>
                          <span>Scope: <span className="text-slate-300">{c.scope}</span></span>
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
                                className={i < c.validation!.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}
                              />
                            ))}
                          </div>
                          <p className="text-slate-500 text-xs mt-1">by {c.validation.validator.name}</p>
                          {c.validation.note && (
                            <p className="text-slate-400 text-xs mt-1 max-w-48 text-right italic">
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
