"use client"

import { useState } from "react"
import { ValidationCard } from "@/components/ValidationCard"
import { Persona } from "@/generated/prisma"
import { CheckCircle } from "lucide-react"

interface Contribution {
  id: string
  title: string
  description: string
  area: string
  benefit: string
  impact: string
  scope: string
  createdAt: string
  submitter: { name: string; persona: Persona }
}

export function ValidationQueueClient({
  initialContributions,
}: {
  initialContributions: Contribution[]
}) {
  const [queue, setQueue] = useState(initialContributions)

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((c) => c.id !== id))
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-24 text-slate-500">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-500/40" />
        <p className="text-lg font-semibold text-slate-400">Queue is clear!</p>
        <p className="text-sm mt-1">All contributions have been reviewed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {queue.map((c) => (
        <ValidationCard
          key={c.id}
          contribution={c}
          onValidated={() => removeFromQueue(c.id)}
        />
      ))}
    </div>
  )
}
