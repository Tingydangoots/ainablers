"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Zap, Loader2, Bot, Crosshair, Cpu, Crown, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const DOMAIN = "@ainablers.com"

// ── Atmospheric gargoyle perched in shadows ───────────────────────────────
function ShadowGargoyle() {
  return (
    <svg
      viewBox="0 0 600 640"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ maxHeight: "95vh" }}
      aria-hidden="true"
    >
      <defs>
        <filter id="lgHaloGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="lgEyeGlow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="lgEdgeGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="lgAura" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1a0030" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lgFog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#060010" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <circle cx="48"  cy="44"  r="1.2" fill="white" opacity="0.35" />
      <circle cx="552" cy="36"  r="1"   fill="white" opacity="0.3"  />
      <circle cx="578" cy="198" r="1.2" fill="white" opacity="0.28" />
      <circle cx="18"  cy="278" r="1"   fill="white" opacity="0.25" />
      <circle cx="583" cy="316" r="1.2" fill="white" opacity="0.3"  />
      <circle cx="130" cy="28"  r="0.8" fill="white" opacity="0.25" />
      <circle cx="460" cy="18"  r="1"   fill="white" opacity="0.3"  />

      <ellipse cx="300" cy="280" rx="280" ry="300" fill="url(#lgAura)" />

      <circle cx="300" cy="172" r="122" fill="none" stroke="#9333ea" strokeWidth="14"
        filter="url(#lgHaloGlow)" opacity="0.9" />
      <circle cx="300" cy="172" r="122" fill="none" stroke="#c084fc" strokeWidth="2.5" opacity="0.45" />
      <circle cx="300" cy="172" r="108" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.2" />

      <path d="M 220,242 Q 152,182 82,102 Q 32,62 16,104 Q 5,144 42,178 Q 82,212 132,237 Q 172,256 218,264 Z"
        fill="#060012" stroke="#120026" strokeWidth="0.8" opacity="0.9" />
      <path d="M 16,104 L 192,250" stroke="#0f0022" strokeWidth="1.3" opacity="0.7" />
      <path d="M 42,178 L 202,257" stroke="#0f0022" strokeWidth="1"   opacity="0.7" />
      <path d="M 82,102 L 196,252" stroke="#0f0022" strokeWidth="1"   opacity="0.7" />
      <path d="M 16,104 Q 4,136 32,170 Q 50,194 42,178"
        fill="none" stroke="#7c3aed" strokeWidth="2.5" filter="url(#lgEdgeGlow)" opacity="0.45" />

      <path d="M 380,242 Q 448,182 518,102 Q 568,62 584,104 Q 595,144 558,178 Q 518,212 468,237 Q 428,256 382,264 Z"
        fill="#060012" stroke="#120026" strokeWidth="0.8" opacity="0.9" />
      <path d="M 584,104 L 408,250" stroke="#0f0022" strokeWidth="1.3" opacity="0.7" />
      <path d="M 558,178 L 398,257" stroke="#0f0022" strokeWidth="1"   opacity="0.7" />
      <path d="M 518,102 L 404,252" stroke="#0f0022" strokeWidth="1"   opacity="0.7" />
      <path d="M 584,104 Q 596,136 568,170 Q 550,194 558,178"
        fill="none" stroke="#7c3aed" strokeWidth="2.5" filter="url(#lgEdgeGlow)" opacity="0.45" />

      <path d="M 236,218 Q 180,165 162,106 Q 152,78 178,96 L 232,226 Z"
        fill="#050010" stroke="#0e0022" strokeWidth="0.6" opacity="0.85" />
      <path d="M 364,218 Q 420,165 438,106 Q 448,78 422,96 L 368,226 Z"
        fill="#050010" stroke="#0e0022" strokeWidth="0.6" opacity="0.85" />

      <ellipse cx="300" cy="295" rx="64" ry="82" fill="#060012" opacity="0.95" />
      <path d="M 268,260 L 300,250 L 332,260 L 338,308 L 300,316 L 262,308 Z"
        fill="#0a001e" stroke="#200850" strokeWidth="1" opacity="0.9" />
      <line x1="300" y1="250" x2="300" y2="316" stroke="#1a0044" strokeWidth="1" opacity="0.8" />
      <polygon points="300,268 305,278 300,288 295,278"
        fill="#9333ea" filter="url(#lgEdgeGlow)" opacity="0.65" />

      <ellipse cx="238" cy="260" rx="28" ry="18" fill="#060012" stroke="#150030" strokeWidth="0.6"
        transform="rotate(-15,238,260)" opacity="0.9" />
      <ellipse cx="362" cy="260" rx="28" ry="18" fill="#060012" stroke="#150030" strokeWidth="0.6"
        transform="rotate(15,362,260)" opacity="0.9" />

      <rect x="284" y="218" width="32" height="28" rx="10" fill="#07001a" opacity="0.95" />
      <ellipse cx="300" cy="190" rx="52" ry="48" fill="#070016" opacity="0.95" />

      <path d="M 262,165 L 250,128 L 270,164 Z" fill="#080016" stroke="#250660" strokeWidth="1.2" opacity="0.9" />
      <path d="M 280,155 L 270,108 L 290,155 Z" fill="#09001a" stroke="#350878" strokeWidth="1.3" opacity="0.9" />
      <path d="M 300,150 L 300,94 L 318,150 Z" fill="#0a001e" stroke="#4a0a90" strokeWidth="1.5" opacity="0.95" />
      <path d="M 320,155 L 330,108 L 310,155 Z" fill="#09001a" stroke="#350878" strokeWidth="1.3" opacity="0.9" />
      <path d="M 338,165 L 350,128 L 330,163 Z" fill="#080016" stroke="#250660" strokeWidth="1.2" opacity="0.9" />
      <circle cx="250" cy="128" r="4.5" fill="#a855f7" filter="url(#lgEyeGlow)" opacity="0.75" />
      <circle cx="270" cy="108" r="5"   fill="#b870f7" filter="url(#lgEyeGlow)" opacity="0.80" />
      <circle cx="300" cy="94"  r="6"   fill="#d080ff" filter="url(#lgEyeGlow)" opacity="0.90" />
      <circle cx="330" cy="108" r="5"   fill="#b870f7" filter="url(#lgEyeGlow)" opacity="0.80" />
      <circle cx="350" cy="128" r="4.5" fill="#a855f7" filter="url(#lgEyeGlow)" opacity="0.75" />

      <path d="M 254,178 L 275,170 L 300,172 L 325,170 L 346,178"
        fill="none" stroke="#3d0880" strokeWidth="5.5" strokeLinecap="round" opacity="0.7" />

      <ellipse cx="280" cy="192" rx="16" ry="13" fill="#050010" opacity="0.95" />
      <ellipse cx="320" cy="192" rx="16" ry="13" fill="#050010" opacity="0.95" />
      <ellipse cx="280" cy="192" rx="11" ry="8.5" fill="#8b18d8" filter="url(#lgEyeGlow)" opacity="0.95" />
      <ellipse cx="320" cy="192" rx="11" ry="8.5" fill="#8b18d8" filter="url(#lgEyeGlow)" opacity="0.95" />
      <circle cx="280" cy="192" r="5"  fill="#e8b0ff" />
      <circle cx="320" cy="192" r="5"  fill="#e8b0ff" />
      <circle cx="276" cy="188" r="1.6" fill="white" opacity="0.85" />
      <circle cx="316" cy="188" r="1.6" fill="white" opacity="0.85" />
      <circle cx="283" cy="195" r="1"   fill="white" opacity="0.55" />
      <circle cx="323" cy="195" r="1"   fill="white" opacity="0.55" />

      <rect x="55" y="402" width="490" height="38" rx="5" fill="#060012" stroke="#14002a" strokeWidth="1" opacity="0.9" />
      <rect x="78"  y="406" width="104" height="11" rx="2" fill="#080018" opacity="0.8" />
      <rect x="224" y="404" width="152" height="14" rx="2" fill="#080018" opacity="0.8" />
      <rect x="428" y="406" width="88"  height="11" rx="2" fill="#080018" opacity="0.8" />

      <path d="M 248,358 Q 232,378 228,402" fill="none" stroke="#07001a" strokeWidth="20" strokeLinecap="round" opacity="0.9" />
      <path d="M 352,358 Q 368,378 372,402" fill="none" stroke="#07001a" strokeWidth="20" strokeLinecap="round" opacity="0.9" />

      <path d="M 210,402 L 202,422" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 220,404 L 215,424" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 230,405 L 228,425" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 240,404 L 241,423" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 360,402 L 359,422" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 370,404 L 372,424" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 380,405 L 385,425" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />
      <path d="M 390,404 L 398,422" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" filter="url(#lgEdgeGlow)" opacity="0.55" />

      <rect x="0" y="448" width="600" height="192" fill="url(#lgFog)" />

      <circle cx="118" cy="318" r="3"   fill="#9333ea" filter="url(#lgEdgeGlow)" opacity="0.45" />
      <circle cx="482" cy="288" r="2.5" fill="#a855f7" filter="url(#lgEdgeGlow)" opacity="0.40" />
      <circle cx="78"  cy="398" r="2"   fill="#7c3aed" filter="url(#lgEdgeGlow)" opacity="0.35" />
      <circle cx="512" cy="378" r="3"   fill="#9333ea" filter="url(#lgEdgeGlow)" opacity="0.38" />
    </svg>
  )
}

// ── Split email input: [localPart] @ainablers.com ─────────────────────────
function EmailInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s/g, ""))}
        placeholder="firstname.lastname"
        disabled={disabled}
        autoComplete="username"
        className="h-11 rounded-r-none border-r-0 border-violet-900/50 bg-violet-950/30 text-white placeholder:text-white/25 focus:border-violet-500/60 focus:ring-0 flex-1 min-w-0"
      />
      <div className="h-11 px-3 flex items-center rounded-r-lg border border-violet-900/50 bg-violet-900/20 text-violet-400/70 text-sm font-medium whitespace-nowrap select-none">
        {DOMAIN}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "register">("signin")

  // shared
  const [localPart, setLocalPart]   = useState("")
  const [password, setPassword]     = useState("")
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)

  // register only
  const [name, setName]             = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  function switchMode(next: "signin" | "register") {
    setMode(next)
    setLocalPart("")
    setPassword("")
    setConfirmPass("")
    setName("")
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!localPart) { toast.error("Enter your email"); return }
    setLoading(true)
    const email = `${localPart}${DOMAIN}`
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      toast.error("Invalid email or password")
      setLoading(false)
      return
    }
    router.push("/dashboard")
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim())  { toast.error("Enter your full name"); return }
    if (!localPart)    { toast.error("Enter your email"); return }
    if (!/^[a-zA-Z]+\.[a-zA-Z]+$/.test(localPart)) {
      toast.error("Email must be firstname.lastname — letters only")
      return
    }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return }
    if (password !== confirmPass) { toast.error("Passwords don't match"); return }

    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), localPart, password }),
    })

    if (!res.ok) {
      const data = await res.json() as { error: string | Record<string, string[]> }
      const msg = typeof data.error === "string"
        ? data.error
        : "Registration failed — check your details"
      toast.error(msg)
      setLoading(false)
      return
    }

    // Auto sign-in after successful registration
    toast.success("Account created — signing you in…")
    const email = `${localPart}${DOMAIN}`
    await signIn("credentials", { email, password, redirect: false })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#060010] flex items-center justify-center p-4 overflow-hidden relative">

      {/* Atmospheric violet bloom */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[560px] bg-violet-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 inset-x-0 h-[240px] bg-gradient-to-t from-[#060010]/90 to-transparent" />
      </div>

      {/* Gargoyle backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-full max-w-3xl">
          <ShadowGargoyle />
        </div>
      </div>

      {/* Login / Register card */}
      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-950/60 border border-violet-500/30 mb-4 shadow-lg shadow-violet-900/50">
            <Zap className="text-violet-400" size={26} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AINABLERS</h1>
          <p className="mt-1.5 text-sm font-medium text-white/90 drop-shadow-[0_2px_16px_rgba(0,0,0,1)] [text-shadow:0_0_20px_rgba(0,0,0,0.9)]">
            CM Team · AI Adoption Tracker
          </p>
        </div>

        <Card className="border-violet-900/50 shadow-2xl shadow-violet-950/60 bg-black/65 backdrop-blur-md">
          <CardHeader className="pb-4">
            {/* Mode toggle */}
            <div className="flex rounded-xl bg-violet-950/50 border border-violet-900/40 p-1 mb-3">
              {(["signin", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
                    mode === m
                      ? "bg-violet-700 text-white shadow-sm"
                      : "text-violet-400/60 hover:text-violet-300"
                  )}
                >
                  {m === "signin" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <CardTitle className="text-white text-lg font-bold">
              {mode === "signin" ? "Welcome back, Operator" : "Join the Field"}
            </CardTitle>
            <CardDescription className="text-violet-300/55">
              {mode === "signin"
                ? "Authenticate to enter the field"
                : "Create your account to start your AI journey"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {mode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm font-medium">Email</Label>
                  <EmailInput value={localPart} onChange={setLocalPart} disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="h-11 border-violet-900/50 bg-violet-950/30 text-white placeholder:text-white/25 focus:border-violet-500/60 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400/50 hover:text-violet-300"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-violet-700 hover:bg-violet-600 text-white font-semibold mt-2 shadow-lg shadow-violet-900/50 border border-violet-500/40"
                >
                  {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                  Enter the Field
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm font-medium">Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ameet Gudka"
                    required
                    disabled={loading}
                    className="h-11 border-violet-900/50 bg-violet-950/30 text-white placeholder:text-white/25 focus:border-violet-500/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm font-medium">Email</Label>
                  <EmailInput value={localPart} onChange={setLocalPart} disabled={loading} />
                  <p className="text-[11px] text-violet-400/50">Use firstname.lastname — letters only, no spaces</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      disabled={loading}
                      className="h-11 border-violet-900/50 bg-violet-950/30 text-white placeholder:text-white/25 focus:border-violet-500/60 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400/50 hover:text-violet-300"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/80 text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                      className="h-11 border-violet-900/50 bg-violet-950/30 text-white placeholder:text-white/25 focus:border-violet-500/60 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400/50 hover:text-violet-300"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-violet-700 hover:bg-violet-600 text-white font-semibold mt-2 shadow-lg shadow-violet-900/50 border border-violet-500/40"
                >
                  {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                  Join the Field
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Persona tier cards */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {([
            { icon: Bot,       label: "Recruit",      sub: "Adopter",     color: "text-emerald-400", bg: "bg-emerald-950/50 border-emerald-800/40" },
            { icon: Crosshair, label: "Spartan",      sub: "Transformer", color: "text-sky-400",     bg: "bg-sky-950/50 border-sky-800/40"         },
            { icon: Cpu,       label: "Master Chief", sub: "Innovator",   color: "text-amber-400",   bg: "bg-amber-950/50 border-amber-800/40"     },
            { icon: Crown,     label: "Forerunner",   sub: "Legend",      color: "text-violet-400",  bg: "bg-violet-950/60 border-violet-700/50"   },
          ] as const).map(({ icon: Icon, label, sub, color, bg }) => (
            <div key={label} className={`rounded-xl border p-2.5 text-center ${bg}`}>
              <Icon className={`mx-auto mb-1 ${color}`} size={16} />
              <p className={`text-[10px] font-bold leading-tight ${color}`}>{label}</p>
              <p className="text-white/30 text-[9px] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <p className="text-violet-500/45 text-xs text-center mt-3">
          Your gargoyle evolves as you conquer ✦
        </p>
      </div>
    </div>
  )
}
