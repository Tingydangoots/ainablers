import { PERSONA_META, PERSONA_THRESHOLDS, nextPersonaThreshold } from "@/lib/gamification"
import { Persona } from "@/generated/prisma"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ScoreProgressProps {
  persona: Persona
  score: number
}

export function ScoreProgress({ persona, score }: ScoreProgressProps) {
  const meta = PERSONA_META[persona]
  const isMaxed = persona === "INNOVATOR"
  const threshold = nextPersonaThreshold(persona)
  const prevThreshold = persona === "TRANSFORMER" ? PERSONA_THRESHOLDS.TRANSFORMER : 0
  const range = threshold - prevThreshold
  const progress = isMaxed ? 100 : Math.min(100, ((score - prevThreshold) / range) * 100)

  const nextMeta = isMaxed ? null : persona === "ADOPTER" ? PERSONA_META.TRANSFORMER : PERSONA_META.INNOVATOR

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={cn("font-semibold", meta.textColor)}>
          {meta.label} · {Math.round(score)} pts
        </span>
        {!isMaxed && nextMeta && (
          <span className="text-slate-400 text-xs">
            Next: <span className={cn("font-semibold", nextMeta.textColor)}>{nextMeta.label}</span>
            {" "}at {threshold} pts
          </span>
        )}
        {isMaxed && (
          <span className="text-yellow-400 text-xs font-semibold animate-pulse">MAX LEVEL ✦</span>
        )}
      </div>
      <div className="relative">
        <Progress
          value={progress}
          className={cn(
            "h-3 bg-slate-800",
            persona === "INNOVATOR" && "shadow-sm shadow-yellow-400/30"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 h-3 rounded-full bg-gradient-to-r opacity-80 pointer-events-none",
            meta.color
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
