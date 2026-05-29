"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { AvatarEvolution } from "./AvatarEvolution"
import { PersonaBadge } from "./PersonaBadge"
import { ScoreProgress } from "./ScoreProgress"
import { AreaBreakdownChart } from "./AreaBreakdownChart"
import { Persona } from "@/generated/prisma"
import { RARITY_META } from "@/lib/gamification"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts"

// ── Types ─────────────────────────────────────────────────────────────────────

interface MemberProfile {
  id: string
  name: string
  persona: string
  personaScore: number
  avatarSeed: string
  totalContributions: number
  userBadges: Array<{ badge: { key: string; name: string; icon: string; rarity: string }; earnedAt: string }>
  areaBreakdown: Array<{ area: string; count: number }>
  scoreHistory: Array<{ date: string; score: number }>
  recentContributions: Array<{
    id: string
    title: string
    description: string
    area: string
    status: string
    impact: string
    createdAt: string
    validation: { rating: number; note: string | null; validatorName: string } | null
  }>
}

const STATUS_CONFIG = {
  PENDING:  { icon: Clock,        cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  APPROVED: { icon: CheckCircle,  cls: "bg-green-50 text-green-800 border-green-200" },
  REJECTED: { icon: XCircle,      cls: "bg-red-50 text-red-800 border-red-200" },
}

const AREA_COLORS: Record<string, string> = {
  PRODUCTIVITY: "bg-primary/8 text-primary border-primary/20",
  DELIVERABLE:  "bg-sky-50 text-sky-700 border-sky-200",
  INNOVATION:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  OTHER:        "bg-muted text-muted-foreground border-border",
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberProfileDialog({
  memberId,
  open,
  onClose,
}: {
  memberId: string | null
  open: boolean
  onClose: () => void
}) {
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!memberId || !open) return
    setProfile(null)
    setLoading(true)
    fetch(`/api/users/${memberId}`)
      .then((r) => r.json() as Promise<MemberProfile>)
      .then(setProfile)
      .finally(() => setLoading(false))
  }, [memberId, open])

  const persona = (profile?.persona ?? "ADOPTER") as Persona
  const rarityOrder: Record<string, number> = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent>
        <div className="flex flex-col h-full">
          {loading || !profile ? (
            <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
              Loading operator profile…
            </div>
          ) : (
            <>
              {/* Sticky hero header */}
              <div className="relative overflow-hidden bg-card border-b border-border px-6 py-5 shrink-0">
                <SheetTitle className="sr-only">{profile.name}</SheetTitle>
                <div className="flex items-center gap-5 pr-8">
                  <AvatarEvolution seed={profile.avatarSeed} persona={persona} size="lg" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-extrabold text-foreground mb-1">{profile.name}</h2>
                    <PersonaBadge persona={persona} size="sm" />
                    <div className="mt-3">
                      <ScoreProgress persona={persona} score={profile.personaScore} />
                    </div>
                    <div className="flex gap-8 mt-3">
                      {[
                        { val: Math.round(profile.personaScore), label: "Score" },
                        { val: profile.totalContributions, label: "Submissions" },
                        { val: profile.userBadges.length, label: "Badges" },
                      ].map(({ val, label }) => (
                        <div key={label} className="text-center">
                          <p className="text-lg font-bold text-foreground">{val}</p>
                          <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Score growth */}
                {profile.scoreHistory.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <TrendingUp size={14} className="text-primary" /> Score Growth
                    </h3>
                    <ResponsiveContainer width="100%" height={170}>
                      <AreaChart data={profile.scoreHistory} margin={{ top: 4, right: 60, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${profile.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#0070AD" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0070AD" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v) => [`${v} pts`, "Score"]} />
                        <ReferenceLine y={20}  stroke="#38bdf8" strokeDasharray="4 2" label={{ value: "Spartan",      position: "right", fontSize: 9, fill: "#38bdf8" }} />
                        <ReferenceLine y={50}  stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Master Chief", position: "right", fontSize: 9, fill: "#f59e0b" }} />
                        <ReferenceLine y={100} stroke="#a855f7" strokeDasharray="4 2" label={{ value: "Forerunner",   position: "right", fontSize: 9, fill: "#a855f7" }} />
                        <Area type="monotone" dataKey="score" stroke="#0070AD" strokeWidth={2} fill={`url(#grad-${profile.id})`} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Area breakdown + badges */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Contribution Areas</h3>
                    <AreaBreakdownChart data={profile.areaBreakdown} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">
                      Badges <span className="text-muted-foreground font-normal">({profile.userBadges.length})</span>
                    </h3>
                    {profile.userBadges.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No badges yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {[...profile.userBadges]
                          .sort((a, b) => (rarityOrder[b.badge.rarity] ?? 0) - (rarityOrder[a.badge.rarity] ?? 0))
                          .map((ub) => {
                            const rm = RARITY_META[ub.badge.rarity as keyof typeof RARITY_META]
                            return (
                              <div
                                key={ub.badge.key}
                                title={ub.badge.name}
                                className={cn("rounded-lg border px-2 py-1 text-xs flex items-center gap-1", rm.bg, rm.border)}
                              >
                                <span>{ub.badge.icon}</span>
                                <span className={cn("font-medium", rm.color)}>{ub.badge.name}</span>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent contributions */}
                {profile.recentContributions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Recent Contributions <span className="text-muted-foreground font-normal">({profile.recentContributions.length})</span>
                    </h3>
                    <div className="space-y-2">
                      {profile.recentContributions.map((c) => {
                        const stCfg = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG]
                        const StIcon = stCfg?.icon ?? Clock
                        return (
                          <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-xs font-semibold text-foreground">{c.title}</span>
                                <Badge className={cn("text-[10px] border py-0", stCfg?.cls ?? "")}>
                                  <StIcon size={9} className="mr-0.5" />
                                  {c.status}
                                </Badge>
                                <Badge className={cn("text-[10px] border py-0", AREA_COLORS[c.area])}>
                                  {c.area}
                                </Badge>
                              </div>
                              {c.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mb-0.5">{c.description}</p>
                              )}
                              <p className="text-[11px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()} · Impact: {c.impact}</p>
                            </div>
                            {c.validation && (
                              <div className="flex flex-col items-end gap-0.5 shrink-0">
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={11} className={i < c.validation!.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"} />
                                  ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground">by {c.validation.validatorName}</p>
                                {c.validation.note && (
                                  <p className="text-[10px] text-muted-foreground italic max-w-[160px] text-right mt-0.5 line-clamp-2">&ldquo;{c.validation.note}&rdquo;</p>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
