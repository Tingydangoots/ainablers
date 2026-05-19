import { Area, ImpactLevel, Persona } from "@/generated/prisma"

// ─── Weights ────────────────────────────────────────────────────────────────

export const AREA_WEIGHTS: Record<Area, number> = {
  PRODUCTIVITY: 1,
  DELIVERABLE: 1.5,
  INNOVATION: 2.5,
  OTHER: 0.5,
}

export const IMPACT_MULTIPLIERS: Record<ImpactLevel, number> = {
  LOW: 1,
  MEDIUM: 1.5,
  HIGH: 2,
  TRANSFORMATIVE: 3,
}

export const PERSONA_THRESHOLDS = {
  TRANSFORMER: 20,
  INNOVATOR: 50,
}

// ─── Score ───────────────────────────────────────────────────────────────────

export function calcContributionScore(
  area: Area,
  impact: ImpactLevel,
  rating: number
): number {
  return rating * AREA_WEIGHTS[area] * IMPACT_MULTIPLIERS[impact]
}

export function derivePersona(totalScore: number): Persona {
  if (totalScore >= PERSONA_THRESHOLDS.INNOVATOR) return "INNOVATOR"
  if (totalScore >= PERSONA_THRESHOLDS.TRANSFORMER) return "TRANSFORMER"
  return "ADOPTER"
}

export function nextPersonaThreshold(persona: Persona): number {
  if (persona === "ADOPTER") return PERSONA_THRESHOLDS.TRANSFORMER
  if (persona === "TRANSFORMER") return PERSONA_THRESHOLDS.INNOVATOR
  return PERSONA_THRESHOLDS.INNOVATOR
}

// ─── Badge definitions ───────────────────────────────────────────────────────

export const BADGE_DEFINITIONS = [
  {
    key: "first_steps",
    name: "First Steps",
    description: "Submitted your first AI contribution",
    rarity: "COMMON" as const,
    icon: "🌱",
  },
  {
    key: "ai_enthusiast",
    name: "AI Enthusiast",
    description: "5 approved contributions under your belt",
    rarity: "COMMON" as const,
    icon: "⚡",
  },
  {
    key: "meeting_master",
    name: "Meeting Master",
    description: "Transformed 3 meetings with AI",
    rarity: "COMMON" as const,
    icon: "🎙️",
  },
  {
    key: "code_alchemist",
    name: "Code Alchemist",
    description: "First AI-powered deliverable created",
    rarity: "RARE" as const,
    icon: "⚗️",
  },
  {
    key: "perfect_score",
    name: "Flawless",
    description: "Received a perfect validator rating of 5",
    rarity: "RARE" as const,
    icon: "💎",
  },
  {
    key: "trailblazer",
    name: "Trailblazer",
    description: "Reached Transformer status",
    rarity: "RARE" as const,
    icon: "🔥",
  },
  {
    key: "productivity_pro",
    name: "Productivity Pro",
    description: "10 PRODUCTIVITY contributions approved",
    rarity: "RARE" as const,
    icon: "🚀",
  },
  {
    key: "deliverable_dynamo",
    name: "Deliverable Dynamo",
    description: "10 DELIVERABLE contributions approved",
    rarity: "RARE" as const,
    icon: "⚙️",
  },
  {
    key: "innovation_spark",
    name: "Innovation Spark",
    description: "First INNOVATION contribution approved",
    rarity: "EPIC" as const,
    icon: "✨",
  },
  {
    key: "team_architect",
    name: "Team Architect",
    description: "3 INNOVATION contributions approved",
    rarity: "EPIC" as const,
    icon: "🏛️",
  },
  {
    key: "century",
    name: "Century",
    description: "Scored 100+ total persona points",
    rarity: "EPIC" as const,
    icon: "💯",
  },
  {
    key: "ainabler_legend",
    name: "AINABLER Legend",
    description: "Reached Innovator status — the pinnacle",
    rarity: "LEGENDARY" as const,
    icon: "👑",
  },
] as const

export type BadgeKey = (typeof BADGE_DEFINITIONS)[number]["key"]

// ─── Badge eligibility ────────────────────────────────────────────────────────

interface ContributionSummary {
  area: Area
  status: string
  validation?: { rating: number } | null
}

export function getEarnedBadgeKeys(
  contributions: ContributionSummary[],
  totalScore: number,
  persona: Persona
): BadgeKey[] {
  const approved = contributions.filter((c) => c.status === "APPROVED")
  const earned: BadgeKey[] = []

  if (contributions.length >= 1) earned.push("first_steps")
  if (approved.length >= 5) earned.push("ai_enthusiast")

  const productivity = approved.filter((c) => c.area === "PRODUCTIVITY")
  const deliverable = approved.filter((c) => c.area === "DELIVERABLE")
  const innovation = approved.filter((c) => c.area === "INNOVATION")

  if (productivity.length >= 3) earned.push("meeting_master")
  if (deliverable.length >= 1) earned.push("code_alchemist")
  if (deliverable.length >= 10) earned.push("deliverable_dynamo")
  if (productivity.length >= 10) earned.push("productivity_pro")
  if (innovation.length >= 1) earned.push("innovation_spark")
  if (innovation.length >= 3) earned.push("team_architect")

  const hasPerfect = approved.some((c) => c.validation?.rating === 5)
  if (hasPerfect) earned.push("perfect_score")

  if (persona === "TRANSFORMER" || persona === "INNOVATOR") earned.push("trailblazer")
  if (totalScore >= 100) earned.push("century")
  if (persona === "INNOVATOR") earned.push("ainabler_legend")

  return earned
}

// ─── Persona metadata ────────────────────────────────────────────────────────

export const PERSONA_META = {
  ADOPTER: {
    label: "Squire",
    title: "Adopter",
    description: "Building AI habits and daily efficiency",
    color: "from-blue-600 to-blue-400",
    border: "border-blue-500",
    glow: "shadow-blue-500/40",
    textColor: "text-blue-400",
    avatarStyle: "pixel-art",
    tier: 1,
  },
  TRANSFORMER: {
    label: "Knight",
    title: "Transformer",
    description: "Driving AI-powered productivity on real deliverables",
    color: "from-cyan-500 to-blue-500",
    border: "border-cyan-400",
    glow: "shadow-cyan-400/50",
    textColor: "text-cyan-400",
    avatarStyle: "adventurer",
    tier: 2,
  },
  INNOVATOR: {
    label: "Archmage",
    title: "Innovator",
    description: "Building agentic AI tools that transform the business",
    color: "from-yellow-400 via-orange-400 to-yellow-300",
    border: "border-yellow-400",
    glow: "shadow-yellow-400/60",
    textColor: "text-yellow-400",
    avatarStyle: "rings",
    tier: 3,
  },
} as const

export const RARITY_META = {
  COMMON: {
    label: "Common",
    color: "text-slate-300",
    border: "border-slate-400",
    bg: "bg-slate-800",
    glow: "",
  },
  RARE: {
    label: "Rare",
    color: "text-blue-300",
    border: "border-blue-400",
    bg: "bg-blue-950",
    glow: "shadow-blue-500/30",
  },
  EPIC: {
    label: "Epic",
    color: "text-purple-300",
    border: "border-purple-400",
    bg: "bg-purple-950",
    glow: "shadow-purple-500/40",
  },
  LEGENDARY: {
    label: "Legendary",
    color: "text-yellow-300",
    border: "border-yellow-400",
    bg: "bg-yellow-950",
    glow: "shadow-yellow-400/50",
  },
} as const
