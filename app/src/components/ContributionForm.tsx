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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"

const AREA_OPTIONS = [
  { value: "PRODUCTIVITY", label: "Productivity — meetings, mail, scheduling" },
  { value: "DELIVERABLE", label: "Deliverable — user stories, code, docs" },
  { value: "INNOVATION", label: "Innovation — agentic tools, workflow apps" },
  { value: "OTHER", label: "Other" },
]

const IMPACT_OPTIONS = [
  { value: "LOW", label: "Low — minor time saving" },
  { value: "MEDIUM", label: "Medium — notable efficiency gain" },
  { value: "HIGH", label: "High — significant business value" },
  { value: "TRANSFORMATIVE", label: "Transformative — game-changer" },
]

const SCOPE_OPTIONS = [
  { value: "CAPGEMINI", label: "Capgemini (internal)" },
  { value: "CLIENT", label: "Client-facing" },
  { value: "BOTH", label: "Both" },
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

    toast.success("Contribution submitted! It's now pending validation.")
    reset()
    router.push("/tracker")
  }

  return (
    <Card className="bg-slate-900 border-slate-800 max-w-2xl w-full">
      <CardHeader>
        <CardTitle className="text-white text-xl">Log an AI Contribution</CardTitle>
        <CardDescription className="text-slate-400">
          Share what you built or achieved with AI. A validator will review and rate it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Title</Label>
            <Input
              {...register("title")}
              placeholder="e.g. Used Copilot to generate unit tests for auth module"
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
            />
            {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              {...register("description")}
              rows={4}
              placeholder="Describe what you did, which tools you used, and how it worked..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Area</Label>
              <Select onValueChange={(v) => setValue("area", v as ContributionInput["area"])}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {AREA_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-slate-200">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.area && <p className="text-red-400 text-xs">{errors.area.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Impact Level</Label>
              <Select onValueChange={(v) => setValue("impact", v as ContributionInput["impact"])}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {IMPACT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-slate-200">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.impact && <p className="text-red-400 text-xs">{errors.impact.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Scope</Label>
              <Select onValueChange={(v) => setValue("scope", v as ContributionInput["scope"])}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Capgemini / Client" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {SCOPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-slate-200">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.scope && <p className="text-red-400 text-xs">{errors.scope.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-300">Benefit Realised</Label>
            <Textarea
              {...register("benefit")}
              rows={3}
              placeholder="What benefit did this deliver? Time saved, quality improved, cost reduced..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
            {errors.benefit && <p className="text-red-400 text-xs">{errors.benefit.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Send size={16} className="mr-2" />
            )}
            Submit Contribution
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
