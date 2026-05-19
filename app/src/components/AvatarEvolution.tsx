"use client"

import { PERSONA_META } from "@/lib/gamification"
import { Persona } from "@/generated/prisma"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarEvolutionProps {
  seed: string
  persona: Persona
  size?: "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
}

const SIZE_MAP = {
  sm: { px: 48, class: "w-12 h-12" },
  md: { px: 80, class: "w-20 h-20" },
  lg: { px: 120, class: "w-30 h-30" },
  xl: { px: 180, class: "w-44 h-44" },
}

export function AvatarEvolution({
  seed,
  persona,
  size = "md",
  showLabel = false,
}: AvatarEvolutionProps) {
  const meta = PERSONA_META[persona]
  const { px, class: sizeClass } = SIZE_MAP[size]
  const avatarUrl = `https://api.dicebear.com/9.x/${meta.avatarStyle}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`

  const ringClasses = {
    ADOPTER: "ring-2 ring-blue-500/60",
    TRANSFORMER: "ring-2 ring-cyan-400/70 animate-pulse",
    INNOVATOR: "ring-4 ring-yellow-400/80",
  }[persona]

  const glowClasses = {
    ADOPTER: "",
    TRANSFORMER: "shadow-lg shadow-cyan-500/30",
    INNOVATOR: "shadow-xl shadow-yellow-400/50",
  }[persona]

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative rounded-full", glowClasses)}>
        {/* Innovator outer glow ring */}
        {persona === "INNOVATOR" && (
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping" />
        )}
        <div
          className={cn(
            "relative rounded-full overflow-hidden bg-slate-800 border-2",
            sizeClass,
            ringClasses,
            meta.border
          )}
        >
          <Image
            src={avatarUrl}
            alt={`${persona} avatar`}
            width={px}
            height={px}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        {/* Tier badge overlay */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full border",
            "bg-slate-900",
            meta.border,
            meta.textColor
          )}
        >
          {meta.tier}
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className={cn("text-xs font-semibold uppercase tracking-widest", meta.textColor)}>
            {meta.label}
          </p>
        </div>
      )}
    </div>
  )
}
