"use client"

import { PERSONA_META } from "@/lib/gamification"
import { Persona } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { GargoyleAvatar } from "./GargoyleAvatar"

const TIER_STYLE: Record<Persona, {
  bg: string; ring: string; glow: string; badgeBg: string
  ping: boolean; pingColor: string
  orbitColors: [string, string] | null
}> = {
  ADOPTER: {
    bg: "from-green-900 via-green-800 to-emerald-900",
    ring: "ring-2 ring-emerald-500/60",
    glow: "",
    badgeBg: "bg-emerald-700",
    ping: false, pingColor: "", orbitColors: null,
  },
  TRANSFORMER: {
    bg: "from-slate-800 via-blue-900 to-slate-900",
    ring: "ring-2 ring-sky-400/70",
    glow: "shadow-lg shadow-sky-500/40",
    badgeBg: "bg-sky-700",
    ping: false, pingColor: "", orbitColors: null,
  },
  INNOVATOR: {
    bg: "from-orange-900 via-amber-800 to-orange-800",
    ring: "ring-[3px] ring-amber-400/90",
    glow: "shadow-xl shadow-amber-400/50",
    badgeBg: "bg-amber-600",
    ping: true, pingColor: "bg-amber-400/20",
    orbitColors: ["bg-amber-400", "bg-orange-400"],
  },
  LEGEND: {
    bg: "from-purple-900 via-violet-900 to-fuchsia-900",
    ring: "ring-[4px] ring-violet-400/90",
    glow: "shadow-2xl shadow-violet-500/60",
    badgeBg: "bg-violet-600",
    ping: true, pingColor: "bg-violet-400/20",
    orbitColors: ["bg-violet-400", "bg-fuchsia-400"],
  },
}

const SIZE_CONFIG = {
  sm: { outer: "w-12 h-12",  badgeText: "text-[9px]", badgePad: "px-1 py-px",    orbitSize: 5,  orbitR: 22 },
  md: { outer: "w-20 h-20",  badgeText: "text-xs",    badgePad: "px-1.5 py-0.5", orbitSize: 6,  orbitR: 30 },
  lg: { outer: "w-28 h-28",  badgeText: "text-xs",    badgePad: "px-1.5 py-0.5", orbitSize: 7,  orbitR: 42 },
  xl: { outer: "w-44 h-44",  badgeText: "text-xs",    badgePad: "px-2 py-1",     orbitSize: 9,  orbitR: 66 },
}

interface AvatarEvolutionProps {
  seed: string
  persona: Persona
  size?: "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
}

export function AvatarEvolution({
  seed,
  persona,
  size = "md",
  showLabel = false,
}: AvatarEvolutionProps) {
  const meta = PERSONA_META[persona]
  const tier = TIER_STYLE[persona]
  const cfg  = SIZE_CONFIG[size]

  const showOrbits = tier.orbitColors !== null && size !== "sm"

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Floating wrapper */}
      <div className={cn("relative avatar-float", tier.glow)}>

        {/* Legendary outer ping */}
        {tier.ping && (
          <div className={`absolute inset-0 rounded-2xl ${tier.pingColor} animate-ping pointer-events-none`} />
        )}

        {/* Orbiting energy nodes — Innovator / Legend */}
        {showOrbits && tier.orbitColors && (
          <>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: 0, height: 0 }}
            >
              <div
                className={`avatar-orbit-a rounded-full ${tier.orbitColors[0]} avatar-glow-pulse`}
                style={{ width: cfg.orbitSize, height: cfg.orbitSize, position: "absolute", top: -cfg.orbitSize / 2, left: -cfg.orbitSize / 2 }}
              />
            </div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: 0, height: 0 }}
            >
              <div
                className={`avatar-orbit-b rounded-full ${tier.orbitColors[1]} avatar-glow-pulse`}
                style={{ width: cfg.orbitSize - 2, height: cfg.orbitSize - 2, position: "absolute", top: -(cfg.orbitSize - 2) / 2, left: -(cfg.orbitSize - 2) / 2 }}
              />
            </div>
          </>
        )}

        {/* Main portrait */}
        <div className={cn(
          "relative flex items-center justify-center rounded-2xl overflow-hidden",
          tier.ring,
          cfg.outer,
          persona === "ADOPTER" && "avatar-breathe",
        )}>
          {/* Scan-line sweep — Spartan only */}
          {persona === "TRANSFORMER" && (
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-10">
              <div
                className="avatar-scan-line absolute w-full"
                style={{ height: 3, background: "linear-gradient(to right, transparent, rgba(56,189,248,0.9), transparent)" }}
              />
            </div>
          )}

          {/* Energy shimmer — Innovator / Legend */}
          {persona === "INNOVATOR" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/15 via-transparent to-orange-300/15 animate-pulse pointer-events-none z-10" />
          )}
          {persona === "LEGEND" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-400/15 via-transparent to-fuchsia-300/15 animate-pulse pointer-events-none z-10" />
          )}

          {/* Gargoyle SVG — fills the portrait */}
          <GargoyleAvatar seed={seed} persona={persona} className="w-full h-full" />
        </div>

        {/* Tier badge */}
        <div className={cn(
          "absolute -bottom-1.5 -right-1.5 rounded-full border-2 border-white font-bold text-white shadow-sm",
          tier.badgeBg,
          cfg.badgeText,
          cfg.badgePad,
        )}>
          {meta.tier}
        </div>
      </div>

      {showLabel && (
        <p className={cn("text-xs font-semibold uppercase tracking-widest", meta.textColor)}>
          {meta.label}
        </p>
      )}
    </div>
  )
}
