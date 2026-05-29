"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AvatarEvolution } from "@/components/AvatarEvolution"
import { PersonaBadge } from "@/components/PersonaBadge"
import { Persona } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { Star, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

const AREA_COLORS: Record<string, string> = {
  PRODUCTIVITY: "bg-primary/8 text-primary border-primary/20",
  DELIVERABLE:  "bg-secondary/8 text-secondary dark:text-blue-300 border-secondary/20",
  INNOVATION:   "bg-accent/8 text-accent dark:text-green-300 border-accent/20",
  OTHER:        "bg-muted text-muted-foreground border-border",
}

const IMPACT_ORDER: Record<string, number> = {
  LOW: 1, MEDIUM: 2, HIGH: 3, TRANSFORMATIVE: 4,
}

const IMPACT_COLORS: Record<string, string> = {
  LOW:           "text-slate-500",
  MEDIUM:        "text-blue-500",
  HIGH:          "text-orange-500",
  TRANSFORMATIVE:"text-purple-500 font-semibold",
}

const SCOPE_LABELS: Record<string, string> = {
  CAPGEMINI: "Capgemini",
  CLIENT:    "Client",
  BOTH:      "Both",
}

export interface GridRow {
  id: string
  title: string
  description: string
  area: string
  impact: string
  scope: string
  score: number
  rating: number
  submitter: { name: string; persona: string; avatarSeed: string }
}

type SortKey = "name" | "area" | "impact" | "scope" | "rating" | "score"
type SortDir = "asc" | "desc"

interface SortState { key: SortKey; dir: SortDir }

function sortRows(rows: GridRow[], sort: SortState): GridRow[] {
  return [...rows].sort((a, b) => {
    let cmp = 0
    switch (sort.key) {
      case "name":   cmp = a.submitter.name.localeCompare(b.submitter.name); break
      case "area":   cmp = a.area.localeCompare(b.area); break
      case "impact": cmp = IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]; break
      case "scope":  cmp = a.scope.localeCompare(b.scope); break
      case "rating": cmp = a.rating - b.rating; break
      case "score":  cmp = a.score - b.score; break
    }
    return sort.dir === "asc" ? cmp : -cmp
  })
}

function SortIcon({ col, sort }: { col: SortKey; sort: SortState }) {
  if (sort.key !== col) return <ArrowUpDown size={12} className="ml-1 text-muted-foreground/50 inline" />
  return sort.dir === "asc"
    ? <ArrowUp size={12} className="ml-1 text-primary inline" />
    : <ArrowDown size={12} className="ml-1 text-primary inline" />
}

export function ContributionGridClient({ rows }: { rows: GridRow[] }) {
  const [sort, setSort] = useState<SortState>({ key: "score", dir: "desc" })

  function handleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "score" || key === "rating" ? "desc" : "asc" }
    )
  }

  const sorted = sortRows(rows, sort)

  function th(label: string, key: SortKey, align: "left" | "right" = "left") {
    return (
      <th
        className={cn(
          "px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap",
          align === "right" ? "text-right" : "text-left"
        )}
        onClick={() => handleSort(key)}
      >
        {label}
        <SortIcon col={key} sort={sort} />
      </th>
    )
  }

  if (rows.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">No approved contributions yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {/* Member — sortable by name */}
                <th
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors w-52"
                  onClick={() => handleSort("name")}
                >
                  Member
                  <SortIcon col="name" sort={sort} />
                </th>
                {/* Contribution — not sortable */}
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Summary of Contribution
                </th>
                {th("Area",   "area")}
                {th("Impact", "impact")}
                {th("Scope",  "scope")}
                {th("Rating", "rating")}
                {th("Score",  "score", "right")}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, idx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/60 hover:bg-muted/30 transition-colors",
                    idx === sorted.length - 1 && "border-b-0"
                  )}
                >
                  {/* Member */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <AvatarEvolution
                          seed={row.submitter.avatarSeed}
                          persona={row.submitter.persona as Persona}
                          size="sm"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{row.submitter.name}</p>
                        <div className="mt-0.5">
                          <PersonaBadge persona={row.submitter.persona as Persona} size="sm" />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contribution */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-foreground text-sm">{row.title}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">{row.description}</p>
                  </td>

                  {/* Area */}
                  <td className="px-4 py-3">
                    <Badge className={cn("text-xs border", AREA_COLORS[row.area])}>
                      {row.area}
                    </Badge>
                  </td>

                  {/* Impact */}
                  <td className={cn("px-4 py-3 text-xs", IMPACT_COLORS[row.impact])}>
                    {row.impact}
                  </td>

                  {/* Scope */}
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {SCOPE_LABELS[row.scope] ?? row.scope}
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          className={i < row.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/25"}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-primary text-sm">
                      {row.score % 1 === 0 ? row.score : row.score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
