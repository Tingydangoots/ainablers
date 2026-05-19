import { AvatarEvolution } from "./AvatarEvolution"
import { PersonaBadge } from "./PersonaBadge"
import { BadgePill } from "./BadgeDisplay"
import { Persona, Rarity } from "@/generated/prisma"
import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeaderEntry {
  id: string
  name: string
  persona: Persona
  personaScore: number
  avatarSeed: string
  userBadges: Array<{
    badge: {
      key: string
      name: string
      description: string
      icon: string
      rarity: Rarity
    }
    earnedAt: string
  }>
  _count: { contributions: number }
}

const RANK_COLORS = ["text-yellow-400", "text-slate-300", "text-orange-400"]
const RANK_BADGES = ["🥇", "🥈", "🥉"]

export function LeaderboardTable({ entries }: { entries: LeaderEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Trophy size={40} className="mx-auto mb-3 opacity-30" />
        <p>No entries yet. Be the first to submit a contribution!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => {
        const topBadge = entry.userBadges
          .sort((a, b) => {
            const order = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 }
            return order[b.badge.rarity] - order[a.badge.rarity]
          })[0]

        return (
          <div
            key={entry.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all",
              i === 0
                ? "bg-yellow-950/30 border-yellow-800/50"
                : "bg-slate-900 border-slate-800"
            )}
          >
            {/* Rank */}
            <div className={cn("w-8 text-center font-bold text-lg", RANK_COLORS[i] ?? "text-slate-500")}>
              {i < 3 ? RANK_BADGES[i] : `#${i + 1}`}
            </div>

            {/* Avatar */}
            <AvatarEvolution seed={entry.avatarSeed} persona={entry.persona} size="sm" />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-semibold text-sm truncate">{entry.name}</span>
                <PersonaBadge persona={entry.persona} size="sm" />
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-slate-500 text-xs">{entry._count.contributions} contributions</span>
                {topBadge && <BadgePill badge={topBadge.badge} />}
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="text-white font-bold text-lg">{Math.round(entry.personaScore)}</p>
              <p className="text-slate-500 text-xs">pts</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
