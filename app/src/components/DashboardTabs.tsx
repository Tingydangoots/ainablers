"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AvatarEvolution } from "@/components/AvatarEvolution"
import { PersonaBadge } from "@/components/PersonaBadge"
import { ScoreProgress } from "@/components/ScoreProgress"
import { BadgeDisplay } from "@/components/BadgeDisplay"
import { AreaBreakdownChart } from "@/components/AreaBreakdownChart"
import { MemberProfileDialog } from "@/components/MemberProfileDialog"
import { PERSONA_META } from "@/lib/gamification"
import { Persona, Rarity } from "@/generated/prisma"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area, ReferenceLine,
} from "recharts"
import {
  TrendingUp, Award, Users, Clock, Target, CheckCircle, XCircle,
  LayoutDashboard, User, Star, ChevronRight, Zap, Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeaderEntry {
  id: string
  name: string
  persona: Persona
  personaScore: number
  avatarSeed: string
  userBadges: Array<{ badge: { key: string; name: string; description: string; icon: string; rarity: Rarity }; earnedAt: string }>
  _count: { contributions: number }
}

interface UserData {
  id: string
  name: string
  persona: Persona
  personaScore: number
  avatarSeed: string
  userBadges: Array<{ badge: { key: string; name: string; description: string; icon: string; rarity: Rarity }; earnedAt: string }>
  _count: { contributions: number }
}

interface TeamStats {
  totalMembers: number
  totalApproved: number
  totalPending: number
  totalRejected: number
  avgScore: number
}

interface ContribItem {
  id: string
  title: string
  description: string
  area: string
  impact: string
  scope: string
  status: string
  createdAt: string
  validation: { rating: number; note: string | null; validatorName: string } | null
}

interface DashboardTabsProps {
  user: UserData
  approvedCount: number
  pendingCount: number
  rank: number
  personalAreaData: Array<{ area: string; count: number }>
  scoreHistory: Array<{ date: string; score: number }>
  userContributions: ContribItem[]
  leaderboard: LeaderEntry[]
  teamStats: TeamStats
  teamPersonaStats: Array<{ persona: string; count: number }>
  teamAreaData: Array<{ area: string; count: number }>
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERSONA_BAR_COLORS: Record<string, string> = {
  ADOPTER: "#10b981", TRANSFORMER: "#38bdf8", INNOVATOR: "#f59e0b", LEGEND: "#a855f7",
}
const PERSONA_LABELS: Record<string, string> = {
  ADOPTER: "Recruit", TRANSFORMER: "Spartan", INNOVATOR: "Master Chief", LEGEND: "Forerunner",
}
const STATUS_CONFIG = {
  PENDING:  { icon: Clock,       cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  APPROVED: { icon: CheckCircle, cls: "bg-green-50 text-green-800 border-green-200" },
  REJECTED: { icon: XCircle,     cls: "bg-red-50 text-red-800 border-red-200" },
}
const AREA_COLORS: Record<string, string> = {
  PRODUCTIVITY: "bg-primary/8 text-primary border-primary/20",
  DELIVERABLE:  "bg-sky-50 text-sky-700 border-sky-200",
  INNOVATION:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  OTHER:        "bg-muted text-muted-foreground border-border",
}

const RANK_BADGES = ["🥇", "🥈", "🥉"]

const PERSONA_ORDER = ["ADOPTER", "TRANSFORMER", "INNOVATOR", "LEGEND"]

const AREA_WEIGHTS: Record<string, number> = {
  INNOVATION: 2.5, DELIVERABLE: 1.5, PRODUCTIVITY: 1.0, OTHER: 0.5,
}
const AREA_ORDER = ["INNOVATION", "DELIVERABLE", "PRODUCTIVITY", "OTHER"]
const AREA_BAR_COLORS: Record<string, { solid: string; fade: string }> = {
  INNOVATION:   { solid: "#10b981", fade: "#6ee7b7" },
  DELIVERABLE:  { solid: "#0070AD", fade: "#7dd3fc" },
  PRODUCTIVITY: { solid: "#64748b", fade: "#cbd5e1" },
  OTHER:        { solid: "#94a3b8", fade: "#e2e8f0" },
}

// ── Command Center ────────────────────────────────────────────────────────────

function CommandCenter({
  leaderboard, teamStats, teamPersonaStats, teamAreaData,
}: Pick<DashboardTabsProps, "leaderboard" | "teamStats" | "teamPersonaStats" | "teamAreaData">) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const personaChartData = [...teamPersonaStats]
    .sort((a, b) => PERSONA_ORDER.indexOf(a.persona) - PERSONA_ORDER.indexOf(b.persona))
    .map((s) => ({
      name: PERSONA_LABELS[s.persona] ?? s.persona,
      persona: s.persona,
      count: s.count,
    }))

  const areaChartData = AREA_ORDER
    .map((area) => {
      const found = teamAreaData.find((d) => d.area === area)
      const count = found?.count ?? 0
      return {
        area: area.charAt(0) + area.slice(1).toLowerCase(),
        rawArea: area,
        count,
        weighted: parseFloat((count * (AREA_WEIGHTS[area] ?? 1)).toFixed(1)),
        weight: AREA_WEIGHTS[area] ?? 1,
      }
    })
    .filter((d) => d.count > 0)

  const totalWeightedOutput = areaChartData.reduce((s, d) => s + d.weighted, 0)

  const statusData = [
    { name: "Approved", value: teamStats.totalApproved, color: "#10b981" },
    { name: "Pending",  value: teamStats.totalPending,  color: "#f59e0b" },
    { name: "Rejected", value: teamStats.totalRejected, color: "#ef4444" },
  ].filter((d) => d.value > 0)

  // Near-upgrade: members within 10 pts of next threshold
  const nearUpgrade = leaderboard.filter((u) => {
    const score = u.personaScore
    if (u.persona === "ADOPTER")     return score >= 12  && score < 20
    if (u.persona === "TRANSFORMER") return score >= 42  && score < 50
    if (u.persona === "INNOVATOR")   return score >= 90  && score < 100
    return false
  })

  // Top 3 podium data
  const podium = leaderboard.slice(0, 3)
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) // 2nd, 1st, 3rd
  const podiumHeights = [64, 96, 48] // platform heights in px for 2nd, 1st, 3rd
  const podiumGold = ["bg-slate-200 border-slate-300", "bg-yellow-100 border-yellow-300", "bg-orange-100 border-orange-300"]
  const podiumRankLabel = ["🥈 2nd", "🥇 1st", "🥉 3rd"]
  const podiumTextColor = ["text-slate-500", "text-yellow-600", "text-orange-600"]
  const podiumAvatarSize = ["md", "lg", "md"] as const

  return (
    <div className="space-y-6">
      {/* Top 3 Operators Podium */}
      {podium.length > 0 && (
        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Trophy size={15} className="text-yellow-500" /> Top 3 Operators
              <span className="text-xs text-muted-foreground font-normal ml-1">— click to inspect</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex items-end justify-center gap-3 px-4">
              {podiumOrder.map((entry, slot) => {
                if (!entry) return <div key={slot} className="flex-1 max-w-[180px]" />
                const actualRank = leaderboard.indexOf(entry) // 0=1st, 1=2nd, 2=3rd
                const h = podiumHeights[slot]
                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedMember(entry.id)}
                    className="flex-1 max-w-[200px] flex flex-col items-center gap-2 group focus:outline-none"
                  >
                    {/* Above-platform content */}
                    <div className="flex flex-col items-center gap-1.5 pb-3">
                      <div className={cn(
                        "transition-transform group-hover:scale-105",
                        slot === 1 && "drop-shadow-lg"
                      )}>
                        <AvatarEvolution seed={entry.avatarSeed} persona={entry.persona} size={podiumAvatarSize[slot]} />
                      </div>
                      <div className="text-center">
                        <p className={cn("font-bold text-foreground truncate max-w-[160px]", slot === 1 ? "text-sm" : "text-xs")}>
                          {entry.name}
                        </p>
                        <div className="flex justify-center mt-0.5">
                          <PersonaBadge persona={entry.persona} size="sm" showTitle={false} />
                        </div>
                        <p className={cn("font-bold mt-1", slot === 1 ? "text-base text-foreground" : "text-sm text-muted-foreground")}>
                          {Math.round(entry.personaScore)} pts
                        </p>
                      </div>
                    </div>

                    {/* Platform block */}
                    <div
                      className={cn(
                        "w-full rounded-t-xl border-t border-x flex flex-col items-center justify-center gap-1 transition-all group-hover:opacity-90",
                        podiumGold[slot]
                      )}
                      style={{ height: h }}
                    >
                      <span className={cn("text-sm font-bold", podiumTextColor[slot])}>{podiumRankLabel[slot]}</span>
                      <span className="text-[10px] text-muted-foreground">{entry._count.contributions} contributions</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { icon: Users,       label: "Team Members",           value: teamStats.totalMembers,             iconClass: "text-primary bg-primary/10" },
          { icon: CheckCircle, label: "Approved Contributions", value: teamStats.totalApproved,            iconClass: "text-emerald-600 bg-emerald-50" },
          { icon: TrendingUp,  label: "Avg Persona Score",      value: Math.round(teamStats.avgScore),     iconClass: "text-sky-600 bg-sky-50" },
          { icon: Clock,       label: "Pending Reviews",        value: teamStats.totalPending,             iconClass: "text-amber-600 bg-amber-50" },
          { icon: XCircle,     label: "Rejected",               value: teamStats.totalRejected,            iconClass: "text-red-600 bg-red-50" },
        ].map(({ icon: Icon, label, value, iconClass }) => (
          <Card key={label} className="border-border shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${iconClass}`}><Icon size={18} /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Near-upgrade alert */}
      {nearUpgrade.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-amber-800 text-xs font-semibold flex items-center gap-1.5">
              <Zap size={13} className="text-amber-600" /> Close to Next Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex flex-wrap gap-3">
              {nearUpgrade.map((u) => {
                const next = u.persona === "ADOPTER" ? 20 : u.persona === "TRANSFORMER" ? 50 : 100
                const nextLabel = u.persona === "ADOPTER" ? "Spartan" : u.persona === "TRANSFORMER" ? "Master Chief" : "Forerunner"
                const gap = next - Math.round(u.personaScore)
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedMember(u.id)}
                    className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity bg-white/60 rounded-xl px-3 py-2 border border-amber-200"
                  >
                    <AvatarEvolution seed={u.avatarSeed} persona={u.persona} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-900 truncate">{u.name}</p>
                      <p className="text-[10px] text-amber-700">{gap} pts to {nextLabel}</p>
                    </div>
                    <ChevronRight size={12} className="text-amber-600 shrink-0" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Persona histogram + status donut */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Target size={15} className="text-primary" /> Team Journey Distribution
            </CardTitle>
            <p className="text-xs text-muted-foreground">Operators per tier</p>
          </CardHeader>
          <CardContent>
            {personaChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={personaChartData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} operators`, "Count"]} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80}>
                    {personaChartData.map((e) => <Cell key={e.persona} fill={PERSONA_BAR_COLORS[e.persona] ?? "#94a3b8"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Award size={15} className="text-primary" /> Contribution Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No contributions yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={155}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value">
                      {statusData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Always-visible stat row */}
                <div className="flex justify-around mt-3 pt-3 border-t border-border">
                  {[
                    { label: "Approved", value: teamStats.totalApproved, color: "#10b981" },
                    { label: "Pending",  value: teamStats.totalPending,  color: "#f59e0b" },
                    { label: "Rejected", value: teamStats.totalRejected, color: "#ef4444" },
                  ].map((d) => (
                    <div key={d.label} className="flex flex-col items-center gap-0.5">
                      <span className="text-2xl font-bold tabular-nums" style={{ color: d.color }}>{d.value}</span>
                      <span className="text-[10px] text-muted-foreground">{d.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area breakdown + clickable leaderboard */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold">Team Area Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Contributions vs weighted value — sorted by impact</p>
          </CardHeader>
          <CardContent>
            {areaChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No approved contributions yet</div>
            ) : (
              <>
                {/* Donut */}
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={areaChartData} cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={3} dataKey="count">
                      {areaChartData.map((d) => (
                        <Cell key={d.rawArea} fill={AREA_BAR_COLORS[d.rawArea]?.solid ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(v, _n, props) => [`${v} contributions`, props.payload?.area ?? ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Bar chart: count vs weighted */}
                <div className="border-t border-border pt-3">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={areaChartData} barGap={3} barCategoryGap="22%">
                    <XAxis dataKey="area" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(value, name) =>
                        name === "count"
                          ? [`${value} submissions`, "Contributions"]
                          : [`${value} pts equivalent`, "Weighted Value"]
                      }
                      labelFormatter={(label) => {
                        const d = areaChartData.find((x) => x.area === label)
                        return `${label}  ×${d?.weight ?? 1} area weight`
                      }}
                    />
                    <Legend
                      formatter={(v) =>
                        <span style={{ color: "#64748b", fontSize: 11 }}>
                          {v === "count" ? "Contributions" : "Weighted Value"}
                        </span>
                      }
                    />
                    <Bar dataKey="count" name="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                      {areaChartData.map((d) => (
                        <Cell key={d.rawArea} fill={AREA_BAR_COLORS[d.rawArea]?.solid ?? "#94a3b8"} />
                      ))}
                    </Bar>
                    <Bar dataKey="weighted" name="weighted" radius={[4, 4, 0, 0]} maxBarSize={32}>
                      {areaChartData.map((d) => (
                        <Cell key={d.rawArea} fill={AREA_BAR_COLORS[d.rawArea]?.fade ?? "#e2e8f0"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {/* Per-area impact metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                  {areaChartData.map((d) => {
                    const pct = totalWeightedOutput > 0
                      ? Math.round((d.weighted / totalWeightedOutput) * 100)
                      : 0
                    const colors = AREA_BAR_COLORS[d.rawArea]
                    return (
                      <div
                        key={d.rawArea}
                        className="rounded-lg p-2.5 border"
                        style={{
                          backgroundColor: (colors?.solid ?? "#94a3b8") + "12",
                          borderColor:     (colors?.solid ?? "#94a3b8") + "38",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: colors?.solid }}>{d.area}</span>
                          <span className="text-[11px] font-extrabold tabular-nums text-foreground">{pct}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span><span className="font-semibold text-foreground tabular-nums">{d.count}</span> submissions</span>
                          <span><span className="font-semibold tabular-nums" style={{ color: colors?.solid }}>{d.weighted}</span> pts</span>
                        </div>
                        {/* Mini progress bar showing % share */}
                        <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors?.solid }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                </div>{/* end bar + metrics section */}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2 border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Users size={15} className="text-primary" /> Team Leaderboard
              <span className="text-xs text-muted-foreground font-normal ml-1">— click any row for full profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, i) => {
                const topBadge = [...entry.userBadges].sort((a, b) => {
                  const order: Record<string, number> = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 }
                  return (order[b.badge.rarity] ?? 0) - (order[a.badge.rarity] ?? 0)
                })[0]

                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedMember(entry.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left group",
                      i === 0
                        ? "bg-yellow-50 border-yellow-200 hover:border-yellow-400"
                        : "bg-card border-border hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn("w-7 text-center font-bold text-base", ["text-yellow-500", "text-muted-foreground", "text-orange-500"][i] ?? "text-muted-foreground")}>
                      {i < 3 ? RANK_BADGES[i] : `#${i + 1}`}
                    </div>
                    <AvatarEvolution seed={entry.avatarSeed} persona={entry.persona} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground font-semibold text-sm truncate">{entry.name}</span>
                        <PersonaBadge persona={entry.persona} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-muted-foreground text-xs">{entry._count.contributions} contributions</span>
                        {topBadge && (
                          <span className="text-xs text-muted-foreground">{topBadge.badge.icon} {topBadge.badge.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-foreground font-bold">{Math.round(entry.personaScore)}</p>
                      <p className="text-muted-foreground text-xs">pts</p>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member profile dialog */}
      <MemberProfileDialog
        memberId={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  )
}

// ── My Journey ────────────────────────────────────────────────────────────────

function MyJourney({
  user, approvedCount, pendingCount, rank, personalAreaData, scoreHistory, userContributions,
}: Pick<DashboardTabsProps, "user" | "approvedCount" | "pendingCount" | "rank" | "personalAreaData" | "scoreHistory" | "userContributions">) {
  const meta = PERSONA_META[user.persona]

  const personalAreaChartData = AREA_ORDER
    .map((area) => {
      const found = personalAreaData.find((d) => d.area === area)
      const count = found?.count ?? 0
      return {
        area: area.charAt(0) + area.slice(1).toLowerCase(),
        rawArea: area,
        count,
        weighted: parseFloat((count * (AREA_WEIGHTS[area] ?? 1)).toFixed(1)),
        weight: AREA_WEIGHTS[area] ?? 1,
      }
    })
    .filter((d) => d.count > 0)

  const personalTotalWeighted = personalAreaChartData.reduce((s, d) => s + d.weighted, 0)

  return (
    <div className="space-y-6">
      {/* Hero character card */}
      <div className={`relative rounded-2xl overflow-hidden border-2 bg-card ${meta.border}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-8`} />
        {user.persona === "INNOVATOR" && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-200/20 via-transparent to-orange-100/20 animate-pulse" />
        )}
        {user.persona === "LEGEND" && (
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-200/20 via-transparent to-fuchsia-100/20 animate-pulse" />
        )}
        <div className="relative flex items-center gap-10 p-8">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <AvatarEvolution seed={user.avatarSeed} persona={user.persona} size="xl" />
            <PersonaBadge persona={user.persona} size="sm" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-foreground mb-1">{user.name}</h1>
            <p className={`text-sm mb-5 font-medium ${meta.textColor}`}>{meta.description}</p>
            <ScoreProgress persona={user.persona} score={user.personaScore} />
            <div className="flex gap-8 mt-5">
              {[
                { val: Math.round(user.personaScore), label: "Total Score" },
                { val: approvedCount, label: "Approved" },
                { val: pendingCount, label: "Pending", highlight: true },
                { val: user.userBadges.length, label: "Badges" },
              ].map(({ val, label, highlight }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${highlight ? "text-amber-600" : "text-foreground"}`}>{val}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Score",       value: Math.round(user.personaScore), iconClass: "text-primary bg-primary/10" },
          { icon: Award,      label: "Badges",      value: user.userBadges.length,        iconClass: "text-amber-600 bg-amber-50" },
          { icon: Users,      label: "Team Rank",   value: rank ? `#${rank}` : "—",       iconClass: "text-sky-600 bg-sky-50" },
          { icon: Clock,      label: "Pending",     value: pendingCount,                   iconClass: "text-orange-600 bg-orange-50" },
        ].map(({ icon: Icon, label, value, iconClass }) => (
          <Card key={label} className="border-border shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${iconClass}`}><Icon size={18} /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-muted-foreground text-xs">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Score growth chart */}
      {scoreHistory.length > 0 && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" /> Score Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={scoreHistory} margin={{ top: 4, right: 24, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="myScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0070AD" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0070AD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(d: string) => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} formatter={(v) => [`${v} pts`, "Score"]} />
                <ReferenceLine y={20}  stroke="#38bdf8" strokeDasharray="5 3" label={{ value: "Spartan",      position: "insideTopRight", fontSize: 10, fill: "#38bdf8" }} />
                <ReferenceLine y={50}  stroke="#f59e0b" strokeDasharray="5 3" label={{ value: "Master Chief", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
                <ReferenceLine y={100} stroke="#a855f7" strokeDasharray="5 3" label={{ value: "Forerunner",   position: "insideTopRight", fontSize: 10, fill: "#a855f7" }} />
                <Area type="monotone" dataKey="score" stroke="#0070AD" strokeWidth={2.5} fill="url(#myScoreGrad)" dot={{ r: 3, fill: "#0070AD", strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Badges + area breakdown */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="border-border shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
                <Award size={15} className="text-amber-500" /> Achievement Vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BadgeDisplay userBadges={user.userBadges} showLocked />
            </CardContent>
          </Card>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm font-semibold">Area Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Contributions vs weighted value</p>
          </CardHeader>
          <CardContent>
            {personalAreaChartData.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No approved contributions yet</div>
            ) : (
              <div className="space-y-3">
                {/* Donut */}
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={personalAreaChartData} cx="50%" cy="50%" innerRadius={36} outerRadius={54} paddingAngle={3} dataKey="count">
                      {personalAreaChartData.map((d) => (
                        <Cell key={d.rawArea} fill={AREA_BAR_COLORS[d.rawArea]?.solid ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(v, _n, props) => [`${v} contributions`, props.payload?.area ?? ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Bar chart: count vs weighted */}
                <div className="border-t border-border pt-3">
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={personalAreaChartData} barGap={3} barCategoryGap="25%">
                      <XAxis dataKey="area" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={20} />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                        formatter={(value, name) =>
                          name === "count"
                            ? [`${value} submissions`, "Contributions"]
                            : [`${value} pts equivalent`, "Weighted Value"]
                        }
                        labelFormatter={(label) => {
                          const d = personalAreaChartData.find((x) => x.area === label)
                          return `${label}  ×${d?.weight ?? 1} weight`
                        }}
                      />
                      <Bar dataKey="count" name="count" radius={[4, 4, 0, 0]} maxBarSize={28}>
                        {personalAreaChartData.map((d) => (
                          <Cell key={d.rawArea} fill={AREA_BAR_COLORS[d.rawArea]?.solid ?? "#94a3b8"} />
                        ))}
                      </Bar>
                      <Bar dataKey="weighted" name="weighted" radius={[4, 4, 0, 0]} maxBarSize={28}>
                        {personalAreaChartData.map((d) => (
                          <Cell key={d.rawArea} fill={AREA_BAR_COLORS[d.rawArea]?.fade ?? "#e2e8f0"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Per-area metrics */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border">
                  {personalAreaChartData.map((d) => {
                    const pct = personalTotalWeighted > 0
                      ? Math.round((d.weighted / personalTotalWeighted) * 100)
                      : 0
                    const colors = AREA_BAR_COLORS[d.rawArea]
                    return (
                      <div
                        key={d.rawArea}
                        className="rounded-lg p-2 border"
                        style={{
                          backgroundColor: (colors?.solid ?? "#94a3b8") + "12",
                          borderColor:     (colors?.solid ?? "#94a3b8") + "38",
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: colors?.solid }}>{d.area}</span>
                          <span className="text-[10px] font-extrabold tabular-nums text-foreground">{pct}%</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                          <span><span className="font-semibold text-foreground tabular-nums">{d.count}</span> sub</span>
                          <span><span className="font-semibold tabular-nums" style={{ color: colors?.solid }}>{d.weighted}</span> pts</span>
                        </div>
                        <div className="mt-1 h-0.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors?.solid }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contribution tracker */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-sm font-semibold flex items-center gap-2">
              <Target size={15} className="text-primary" /> Your Contributions
            </CardTitle>
            <Link href="/tracker" className="text-xs text-primary hover:underline font-medium">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {userContributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No contributions yet.{" "}
              <Link href="/submit" className="text-primary hover:underline">Log your first AI activity →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {userContributions.slice(0, 8).map((c) => {
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
                          <p className="text-[10px] text-muted-foreground italic max-w-44 text-right mt-0.5 line-clamp-2">
                            &ldquo;{c.validation.note}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {userContributions.length > 8 && (
                <Link href="/tracker" className="block text-center text-xs text-primary hover:underline pt-1">
                  + {userContributions.length - 8} more contributions — view full tracker
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function DashboardTabs(props: DashboardTabsProps) {
  return (
    <Tabs defaultValue="command" className="space-y-6">
      <TabsList className="bg-muted border border-border h-10">
        <TabsTrigger value="command" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <LayoutDashboard size={14} /> Command Center
        </TabsTrigger>
        <TabsTrigger value="journey" className="gap-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <User size={14} /> My Journey
        </TabsTrigger>
      </TabsList>

      <TabsContent value="command" className="mt-0">
        <CommandCenter leaderboard={props.leaderboard} teamStats={props.teamStats} teamPersonaStats={props.teamPersonaStats} teamAreaData={props.teamAreaData} />
      </TabsContent>

      <TabsContent value="journey" className="mt-0">
        <MyJourney user={props.user} approvedCount={props.approvedCount} pendingCount={props.pendingCount} rank={props.rank} personalAreaData={props.personalAreaData} scoreHistory={props.scoreHistory} userContributions={props.userContributions} />
      </TabsContent>
    </Tabs>
  )
}
