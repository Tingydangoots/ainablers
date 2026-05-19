"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Loader2, Shield, Swords, Wand2 } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      toast.error("Invalid email or password")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 mb-4">
            <Zap className="text-blue-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AINABLERS</h1>
          <p className="text-slate-400 mt-1">CM Team · AI Adoption Tracker</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to track your AI journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@capgemini.com"
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-300">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-2"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Persona preview */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: Shield, label: "Squire", sub: "Adopter", color: "text-blue-400", bg: "bg-blue-600/10 border-blue-600/20" },
            { icon: Swords, label: "Knight", sub: "Transformer", color: "text-cyan-400", bg: "bg-cyan-600/10 border-cyan-600/20" },
            { icon: Wand2, label: "Archmage", sub: "Innovator", color: "text-yellow-400", bg: "bg-yellow-600/10 border-yellow-500/30" },
          ].map(({ icon: Icon, label, sub, color, bg }) => (
            <div key={label} className={`rounded-xl border p-3 ${bg}`}>
              <Icon className={`mx-auto mb-1 ${color}`} size={20} />
              <p className={`text-xs font-bold ${color}`}>{label}</p>
              <p className="text-slate-500 text-xs">{sub}</p>
            </div>
          ))}
        </div>
        <p className="text-slate-600 text-xs text-center mt-4">
          Your character evolves as you contribute
        </p>
      </div>
    </div>
  )
}
