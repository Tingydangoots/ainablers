"use client"

import { RARITY_META, BADGE_DEFINITIONS } from "@/lib/gamification"
import { Rarity } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserBadge {
  badge: {
    key: string
    name: string
    description: string
    icon: string
    rarity: Rarity
  }
  earnedAt: string
}

interface BadgeDisplayProps {
  userBadges: UserBadge[]
  showLocked?: boolean
}

export function BadgeDisplay({ userBadges, showLocked = true }: BadgeDisplayProps) {
  const earnedKeys = new Set(userBadges.map((ub) => ub.badge.key))

  return (
    <div className="flex flex-wrap gap-3">
      {BADGE_DEFINITIONS.map((def) => {
        const earned = earnedKeys.has(def.key)
        const rarity = RARITY_META[def.rarity]

        if (!earned && !showLocked) return null

        return (
          <Tooltip key={def.key}>
            <TooltipTrigger>
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-xl border-2 w-16 h-16 cursor-pointer transition-all duration-200",
                  rarity.bg,
                  rarity.border,
                  earned
                    ? cn("shadow-md", rarity.glow, "hover:scale-110")
                    : "opacity-30 grayscale",
                  def.rarity === "LEGENDARY" && earned && "animate-pulse"
                )}
              >
                <span className="text-2xl">{def.icon}</span>
                {def.rarity === "LEGENDARY" && earned && (
                  <div className="absolute inset-0 rounded-xl bg-yellow-400/10 animate-ping pointer-events-none" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-48 text-center">
              <p className={cn("font-bold text-sm", rarity.color)}>{def.name}</p>
              <p className="text-xs text-slate-300 mt-0.5">{def.description}</p>
              <p className={cn("text-xs mt-1 font-semibold", rarity.color)}>
                {rarity.label}
              </p>
              {!earned && <p className="text-xs text-slate-500 mt-1">🔒 Locked</p>}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

export function BadgePill({ badge }: { badge: UserBadge["badge"] }) {
  const rarity = RARITY_META[badge.rarity]
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border",
        rarity.bg,
        rarity.border,
        rarity.color,
        badge.rarity === "LEGENDARY" && "shadow-md shadow-yellow-400/30"
      )}
    >
      <span>{badge.icon}</span>
      <span>{badge.name}</span>
    </div>
  )
}
