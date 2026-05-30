import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { ContributionForm } from "@/components/ContributionForm"
import { Persona } from "@/generated/prisma"
import { PlusCircle, Zap, TrendingUp, Star, ShieldCheck } from "lucide-react"

export default async function SubmitPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
  })
  if (!user) redirect("/login")

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

      <main className="flex-1 ml-64 min-h-screen">
        {/* Page header */}
        <div className="border-b border-border px-10 py-6 bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <PlusCircle className="text-primary" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Log a Contribution</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Share an AI activity. A validator reviews and rates it — higher ratings earn more persona points.
              </p>
            </div>
          </div>
        </div>

        {/* 2-panel body */}
        <div className="px-10 py-8 grid grid-cols-3 gap-8 max-w-7xl">
          {/* Form — takes 2 cols */}
          <div className="col-span-2">
            <ContributionForm />
          </div>

          {/* Sidebar — scoring guide */}
          <div className="space-y-5">
            {/* Score calculator card */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={16} className="text-primary" />
                <h3 className="font-semibold text-foreground text-sm">How Points Are Scored</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Points = <span className="font-semibold text-foreground">Rating × Area × Impact</span>
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Area Weight</p>
                  {[
                    { label: "Innovation", value: "×2.5", color: "bg-brand-green/10 text-brand-green border-brand-green/20" },
                    { label: "Deliverable", value: "×1.5", color: "bg-primary/10 text-primary border-primary/20" },
                    { label: "Productivity", value: "×1.0", color: "bg-muted text-muted-foreground border-border" },
                    { label: "Other", value: "×0.5", color: "bg-muted text-muted-foreground/60 border-border" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 mb-1 border ${color}`}>
                      <span>{label}</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Impact Multiplier</p>
                  {[
                    { label: "Transformative", value: "×3", color: "bg-amber-50 text-amber-800 border-amber-200" },
                    { label: "High", value: "×2", color: "bg-primary/10 text-primary border-primary/20" },
                    { label: "Medium", value: "×1.5", color: "bg-muted text-muted-foreground border-border" },
                    { label: "Low", value: "×1", color: "bg-muted text-muted-foreground border-border" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`flex items-center justify-between text-xs rounded-lg px-2.5 py-1.5 mb-1 border ${color}`}>
                      <span>{label}</span>
                      <span className="font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Persona thresholds */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-brand-green" />
                <h3 className="font-semibold text-foreground text-sm">Persona Milestones</h3>
              </div>
              {[
                { label: "Recruit → Spartan",         sub: "(Adopter → Transformer)",   pts: "500 pts", color: "text-sky-600"    },
                { label: "Spartan → Master Chief",    sub: "(Transformer → Innovator)", pts: "1,000 pts", color: "text-amber-600"  },
                { label: "Master Chief → Forerunner", sub: "(Innovator → Legend)",      pts: "2,000 pts", color: "text-violet-600" },
              ].map(({ label, sub, pts, color }) => (
                <div key={label} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-foreground text-xs font-medium">{label}</p>
                    <p className="text-muted-foreground text-xs">{sub}</p>
                  </div>
                  <span className={`font-bold text-xs ${color}`}>{pts}</span>
                </div>
              ))}
            </div>

            {/* Tier requirements */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-amber-600" />
                <h3 className="font-semibold text-amber-900 text-sm">Tier Requirements</h3>
              </div>
              <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                Score alone isn&apos;t enough. Each tier requires proven depth in the right areas.
              </p>
              {[
                { tier: "Spartan",      req: "≥ 3 Deliverable approvals",  pts: "500 pts",   color: "text-sky-600"    },
                { tier: "Master Chief", req: "≥ 5 Innovation approvals",   pts: "1,000 pts", color: "text-amber-600"  },
                { tier: "Forerunner",   req: "≥ 8 Innovation approvals",   pts: "2,000 pts", color: "text-violet-600" },
              ].map(({ tier, req, pts, color }) => (
                <div key={tier} className="py-2 border-b border-amber-200 last:border-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`font-bold text-xs ${color}`}>{tier}</span>
                    <span className="text-xs font-semibold text-amber-800">{pts}</span>
                  </div>
                  <p className="text-xs text-amber-700">{req}</p>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-amber-200 space-y-1">
                <p className="text-xs font-semibold text-amber-800">Score caps</p>
                <p className="text-xs text-amber-700">Productivity contributions cap at <span className="font-semibold">200 pts</span> total.</p>
                <p className="text-xs text-amber-700">Other contributions cap at <span className="font-semibold">100 pts</span> total.</p>
              </div>
            </div>

            {/* Rating guide */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-yellow-500" />
                <h3 className="font-semibold text-foreground text-sm">Validator Ratings</h3>
              </div>
              {[
                ["★★★★★", "Outstanding"],
                ["★★★★", "Great"],
                ["★★★", "Good"],
                ["★★", "Getting there"],
                ["★", "Needs work"],
              ].map(([stars, label]) => (
                <div key={label} className="flex items-center justify-between text-xs py-1.5">
                  <span className="text-yellow-500">{stars}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
