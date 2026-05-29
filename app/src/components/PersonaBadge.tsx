import { PERSONA_META } from "@/lib/gamification"
import { Persona } from "@/generated/prisma"
import { cn } from "@/lib/utils"
import { Bot, Crosshair, Cpu, Crown } from "lucide-react"

const PERSONA_ICONS = {
  ADOPTER: Bot,
  TRANSFORMER: Crosshair,
  INNOVATOR: Cpu,
  LEGEND: Crown,
}

interface PersonaBadgeProps {
  persona: Persona
  showTitle?: boolean
  size?: "sm" | "md" | "lg"
}

export function PersonaBadge({ persona, showTitle = true, size = "md" }: PersonaBadgeProps) {
  const meta = PERSONA_META[persona]
  const Icon = PERSONA_ICONS[persona]

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  }[size]

  const iconSizes = { sm: 12, md: 14, lg: 16 }[size]

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        `bg-gradient-to-r ${meta.color}`,
        meta.border,
        sizeClasses,
        persona === "INNOVATOR" && "shadow-md shadow-yellow-400/40",
        persona === "LEGEND" && "shadow-md shadow-violet-400/60"
      )}
    >
      <Icon size={iconSizes} className="text-white" />
      {showTitle && (
        <span className="text-white tracking-wide">
          {meta.label} · {meta.title}
        </span>
      )}
    </div>
  )
}
