import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Nav } from "@/components/Nav"
import { ContributionForm } from "@/components/ContributionForm"
import { Persona } from "@/generated/prisma"
import { PlusCircle } from "lucide-react"

export default async function SubmitPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true, persona: true, avatarSeed: true, personaScore: true },
  })
  if (!user) redirect("/login")

  return (
    <div className="flex min-h-screen">
      <Nav
        user={{
          name: user.name,
          role: user.role,
          persona: user.persona as Persona,
          avatarSeed: user.avatarSeed,
          personaScore: user.personaScore,
        }}
      />

      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PlusCircle className="text-blue-400" size={24} />
            Log a Contribution
          </h1>
          <p className="text-slate-400 mt-1">
            Record an AI activity you&apos;ve done. A validator will review and rate it — the higher the rating, the more persona points you earn.
          </p>
        </div>

        <ContributionForm />
      </main>
    </div>
  )
}
