"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PersonaBadge } from "./PersonaBadge"
import { Persona } from "@/generated/prisma"
import { toast } from "sonner"
import {
  CheckCircle,
  XCircle,
  Star,
  Clock,
  User,
  Target,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const AREA_LABELS: Record<string, string> = {
  PRODUCTIVITY: "Productivity",
  DELIVERABLE: "Deliverable",
  INNOVATION: "Innovation",
  OTHER: "Other",
}

const IMPACT_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  TRANSFORMATIVE: "Transformative",
}

const IMPACT_COLORS: Record<string, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-primary/10 text-primary",
  HIGH: "bg-secondary/10 text-secondary dark:text-blue-300",
  TRANSFORMATIVE: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400",
}

interface ContributionForValidation {
  id: string
  title: string
  description: string
  area: string
  benefit: string
  impact: string
  scope: string
  createdAt: string
  submitter: {
    name: string
    persona: Persona
  }
}

interface ValidationCardProps {
  contribution: ContributionForValidation
  onValidated: () => void
}

export function ValidationCard({ contribution, onValidated }: ValidationCardProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function submit(decision: "APPROVED" | "REJECTED") {
    if (rating === 0) {
      toast.error("Please give a star rating before submitting")
      return
    }
    setSubmitting(true)
    const res = await fetch(`/api/contributions/${contribution.id}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, rating, note: note || undefined }),
    })

    if (!res.ok) {
      toast.error("Failed to submit validation")
      setSubmitting(false)
      return
    }

    const data = await res.json()
    toast.success(
      decision === "APPROVED"
        ? `Approved! ${contribution.submitter.name} is now a ${data.newPersona}`
        : "Contribution rejected"
    )
    onValidated()
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-foreground text-base">{contribution.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <User size={12} />
                <span>{contribution.submitter.name}</span>
              </div>
              <PersonaBadge persona={contribution.submitter.persona} size="sm" />
              <Badge
                className={cn(
                  "text-xs border-0",
                  IMPACT_COLORS[contribution.impact]
                )}
              >
                {IMPACT_LABELS[contribution.impact]}
              </Badge>
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {AREA_LABELS[contribution.area]}
              </Badge>
              <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                {contribution.scope}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-xs whitespace-nowrap">
            <Clock size={12} />
            {new Date(contribution.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">What they did</p>
          <p className="text-foreground text-sm leading-relaxed">{contribution.description}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
            <Target size={11} /> Benefit realised
          </p>
          <p className="text-foreground text-sm leading-relaxed">{contribution.benefit}</p>
        </div>

        {/* Star Rating */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Validator Rating</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-125"
              >
                <Star
                  size={28}
                  className={cn(
                    "transition-colors",
                    star <= (hoverRating || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold ml-1 self-center">
                {["", "Needs Work", "Getting There", "Good", "Great", "Outstanding"][rating]}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-foreground text-sm">Note (optional)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add feedback for the team member..."
            rows={2}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none text-sm"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            onClick={() => submit("APPROVED")}
            disabled={submitting}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white"
          >
            {submitting ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle size={14} className="mr-2" />}
            Approve
          </Button>
          <Button
            onClick={() => submit("REJECTED")}
            disabled={submitting}
            variant="outline"
            className="flex-1 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <XCircle size={14} className="mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
