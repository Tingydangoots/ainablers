"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contributionSchema, ContributionInput } from "@/lib/schemas/contribution"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Send, Layers, Target, Gauge, Globe } from "lucide-react"

const AREA_OPTIONS = [
  { value: "PRODUCTIVITY", label: "Productivity", sub: "Meetings, mail, scheduling" },
  { value: "DELIVERABLE", label: "Deliverable", sub: "User stories, code, docs" },
  { value: "INNOVATION", label: "Innovation", sub: "Agentic tools, workflow apps" },
  { value: "OTHER", label: "Other", sub: "" },
]

const IMPACT_OPTIONS = [
  { value: "LOW", label: "Low", sub: "Minor time saving" },
  { value: "MEDIUM", label: "Medium", sub: "Notable efficiency gain" },
  { value: "HIGH", label: "High", sub: "Significant business value" },
  { value: "TRANSFORMATIVE", label: "Transformative", sub: "Game-changer" },
]

const SCOPE_OPTIONS = [
  { value: "CAPGEMINI", label: "Capgemini", sub: "Internal" },
  { value: "CLIENT", label: "Client-facing", sub: "" },
  { value: "BOTH", label: "Both", sub: "" },
]

export function ContributionForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContributionInput>({
    resolver: zodResolver(contributionSchema),
  })

  async function onSubmit(data: ContributionInput) {
    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      toast.error("Failed to submit. Please try again.")
      return
    }
    toast.success("Contribution submitted and pending validation!")
    reset()
    router.push("/tracker")
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Form header */}
      <div className="px-8 py-5 border-b border-border bg-muted/40">
        <h2 className="font-semibold text-foreground text-base">Contribution Details</h2>
        <p className="text-muted-foreground text-xs mt-0.5">
          Be specific — validators rate on clarity, impact and evidence of AI use.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">

        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-foreground font-medium text-sm">Title</Label>
          <Input
            {...register("title")}
            placeholder="e.g. Used Copilot to generate unit tests for auth module — saved 2 hours"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground h-11 text-sm"
          />
          {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-foreground font-medium text-sm">What did you do?</Label>
          <Textarea
            {...register("description")}
            rows={5}
            placeholder="Describe what you did, which AI tools you used, and how it worked. Include any prompts or techniques that were particularly effective..."
            className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none text-sm leading-relaxed"
          />
          {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
        </div>

        {/* Area, Impact, Scope — 3 cols */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
              <Layers size={13} className="text-primary" /> Area
            </Label>
            <Select onValueChange={(v) => setValue("area", v as ContributionInput["area"])}>
              <SelectTrigger className="bg-background border-border text-foreground h-11">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {AREA_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="font-medium">{o.label}</span>
                    {o.sub && <span className="text-muted-foreground text-xs ml-1">— {o.sub}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.area && <p className="text-destructive text-xs">{errors.area.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
              <Gauge size={13} className="text-primary" /> Impact
            </Label>
            <Select onValueChange={(v) => setValue("impact", v as ContributionInput["impact"])}>
              <SelectTrigger className="bg-background border-border text-foreground h-11">
                <SelectValue placeholder="Select impact" />
              </SelectTrigger>
              <SelectContent>
                {IMPACT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="font-medium">{o.label}</span>
                    {o.sub && <span className="text-muted-foreground text-xs ml-1">— {o.sub}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.impact && <p className="text-destructive text-xs">{errors.impact.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
              <Globe size={13} className="text-primary" /> Scope
            </Label>
            <Select onValueChange={(v) => setValue("scope", v as ContributionInput["scope"])}>
              <SelectTrigger className="bg-background border-border text-foreground h-11">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                {SCOPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    <span className="font-medium">{o.label}</span>
                    {o.sub && <span className="text-muted-foreground text-xs ml-1">— {o.sub}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.scope && <p className="text-destructive text-xs">{errors.scope.message}</p>}
          </div>
        </div>

        {/* Benefit */}
        <div className="space-y-1.5">
          <Label className="text-foreground font-medium text-sm flex items-center gap-1.5">
            <Target size={13} className="text-accent" /> Benefit Realised
          </Label>
          <Textarea
            {...register("benefit")}
            rows={3}
            placeholder="What tangible benefit did this deliver? Time saved, quality improved, cost reduced, risk mitigated..."
            className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none text-sm leading-relaxed"
          />
          {errors.benefit && <p className="text-destructive text-xs">{errors.benefit.message}</p>}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Send size={16} className="mr-2" />
            )}
            Submit for Validation
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            A team validator will review and rate your contribution within 1–2 days.
          </p>
        </div>
      </form>
    </div>
  )
}
