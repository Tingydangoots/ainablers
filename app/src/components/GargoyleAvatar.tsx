"use client"

import { useId } from "react"
import { Persona } from "@/generated/prisma"

interface GargoyleAvatarProps {
  seed: string
  persona: Persona
  className?: string
}

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// ── Stone Imp — ADOPTER ────────────────────────────────────────────────────
// Grey stone, small folded wings, stubby horns, green glowing eyes
function StoneImp({ uid, eyeHue }: { uid: string; eyeHue: number }) {
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#4a4a5a" />
          <stop offset="100%" stopColor="#1a1a24" />
        </radialGradient>
        <radialGradient id={`${uid}body`} cx="35%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#7a7a8a" />
          <stop offset="100%" stopColor="#4a4a58" />
        </radialGradient>
        <radialGradient id={`${uid}head`} cx="38%" cy="33%" r="58%">
          <stop offset="0%" stopColor="#9090a0" />
          <stop offset="100%" stopColor="#585868" />
        </radialGradient>
        <filter id={`${uid}glow`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="100" height="120" rx="16" fill={`url(#${uid}bg)`} />

      {/* Folded bat wings */}
      <path d="M28 74 Q14 60 17 46 Q21 38 30 50 L35 67Z" fill="#38384a" stroke="#555568" strokeWidth="0.6" />
      <path d="M72 74 Q86 60 83 46 Q79 38 70 50 L65 67Z" fill="#38384a" stroke="#555568" strokeWidth="0.6" />
      <path d="M28 72 Q18 58 20 48" fill="none" stroke="#4a4a5e" strokeWidth="0.8" />
      <path d="M72 72 Q82 58 80 48" fill="none" stroke="#4a4a5e" strokeWidth="0.8" />

      {/* Body */}
      <ellipse cx="50" cy="87" rx="21" ry="19" fill={`url(#${uid}body)`} />
      <path d="M42 82 Q50 96 58 82" fill="none" stroke="#606073" strokeWidth="1" />

      {/* Neck */}
      <rect x="43" y="63" width="14" height="12" rx="5" fill="#686878" />

      {/* Head */}
      <ellipse cx="50" cy="53" rx="18" ry="16" fill={`url(#${uid}head)`} />

      {/* Small straight horns */}
      <path d="M40 41 L37 27 L43 41Z" fill="#585870" stroke="#454558" strokeWidth="0.6" />
      <path d="M60 41 L63 27 L57 41Z" fill="#585870" stroke="#454558" strokeWidth="0.6" />

      {/* Brow ridge */}
      <path d="M34 49 Q50 44 66 49" fill="none" stroke="#808090" strokeWidth="1.5" />

      {/* Eyes */}
      <ellipse cx="43" cy="53" rx="5.5" ry="5" fill="#0d0d12" />
      <ellipse cx="57" cy="53" rx="5.5" ry="5" fill="#0d0d12" />
      <ellipse cx="43" cy="53" rx="3.8" ry="3.3" fill={`hsl(${eyeHue},90%,38%)`} filter={`url(#${uid}glow)`} />
      <ellipse cx="57" cy="53" rx="3.8" ry="3.3" fill={`hsl(${eyeHue},90%,38%)`} filter={`url(#${uid}glow)`} />
      <circle cx="43" cy="53" r="1.5" fill={`hsl(${eyeHue},100%,72%)`} />
      <circle cx="57" cy="53" r="1.5" fill={`hsl(${eyeHue},100%,72%)`} />

      {/* Nose */}
      <ellipse cx="50" cy="59" rx="3" ry="2" fill="#606070" />
      <circle cx="48.5" cy="59" r="0.9" fill="#333340" />
      <circle cx="51.5" cy="59" r="0.9" fill="#333340" />

      {/* Mouth + small fangs */}
      <path d="M43 65 Q50 69 57 65" fill="none" stroke="#444450" strokeWidth="1" />
      <line x1="46.5" y1="65" x2="46" y2="68.5" stroke="#d0d0cc" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="53.5" y1="65" x2="54" y2="68.5" stroke="#d0d0cc" strokeWidth="1.6" strokeLinecap="round" />

      {/* Claws */}
      <path d="M32 97 L29 106" stroke="#909090" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M36 99 L33 108" stroke="#909090" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40 100 L38 109" stroke="#909090" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M68 97 L71 106" stroke="#909090" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M64 99 L67 108" stroke="#909090" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M60 100 L62 109" stroke="#909090" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// ── Iron Sentinel — TRANSFORMER ────────────────────────────────────────────
// Dark blue-steel, large spreading wings with ribs, curved ram horns,
// shoulder pauldrons + chest plate, electric blue slit-pupil eyes
function IronSentinel({ uid, eyeHue }: { uid: string; eyeHue: number }) {
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#1a3050" />
          <stop offset="100%" stopColor="#080c18" />
        </radialGradient>
        <radialGradient id={`${uid}body`} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#4a5f7a" />
          <stop offset="100%" stopColor="#1c2738" />
        </radialGradient>
        <radialGradient id={`${uid}head`} cx="35%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#567090" />
          <stop offset="100%" stopColor="#283848" />
        </radialGradient>
        <radialGradient id={`${uid}armor`} cx="28%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#5878a0" />
          <stop offset="100%" stopColor="#263450" />
        </radialGradient>
        <filter id={`${uid}glow`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="100" height="120" rx="16" fill={`url(#${uid}bg)`} />

      {/* Large spreading wings */}
      <path d="M28 76 Q7 56 9 30 Q13 16 25 27 Q30 36 32 50 L36 70Z" fill="#182840" stroke="#28486a" strokeWidth="0.8" />
      <path d="M9 30 L30 50" stroke="#28486a" strokeWidth="0.9" />
      <path d="M10 40 L31 57" stroke="#28486a" strokeWidth="0.9" />
      <path d="M13 50 L32 63" stroke="#28486a" strokeWidth="0.9" />
      <path d="M72 76 Q93 56 91 30 Q87 16 75 27 Q70 36 68 50 L64 70Z" fill="#182840" stroke="#28486a" strokeWidth="0.8" />
      <path d="M91 30 L70 50" stroke="#28486a" strokeWidth="0.9" />
      <path d="M90 40 L69 57" stroke="#28486a" strokeWidth="0.9" />
      <path d="M87 50 L68 63" stroke="#28486a" strokeWidth="0.9" />

      {/* Body */}
      <ellipse cx="50" cy="89" rx="20" ry="18" fill={`url(#${uid}body)`} />

      {/* Chest plate */}
      <path d="M37 72 L50 66 L63 72 L66 92 L50 97 L34 92Z" fill={`url(#${uid}armor)`} stroke="#4870a0" strokeWidth="1.2" />
      <line x1="50" y1="66" x2="50" y2="97" stroke="#3860a0" strokeWidth="1" />
      <path d="M39 79 Q50 75 61 79" fill="none" stroke="#4878a8" strokeWidth="0.9" />
      <path d="M39 85 Q50 81 61 85" fill="none" stroke="#4878a8" strokeWidth="0.7" />

      {/* Shoulder pauldrons */}
      <ellipse cx="28" cy="72" rx="11" ry="7.5" fill={`url(#${uid}armor)`} stroke="#4870a0" strokeWidth="1.1" transform="rotate(-18,28,72)" />
      <ellipse cx="72" cy="72" rx="11" ry="7.5" fill={`url(#${uid}armor)`} stroke="#4870a0" strokeWidth="1.1" transform="rotate(18,72,72)" />

      {/* Neck */}
      <rect x="43" y="60" width="14" height="11" rx="4" fill="#304a68" />
      <path d="M43 64 L57 64" stroke="#486080" strokeWidth="0.8" />
      <path d="M43 67 L57 67" stroke="#486080" strokeWidth="0.8" />

      {/* Head */}
      <ellipse cx="50" cy="50" rx="18" ry="16" fill={`url(#${uid}head)`} />

      {/* Curved ram horns */}
      <path d="M36 40 Q22 26 24 37 Q26 46 36 47" fill="none" stroke="#304868" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M64 40 Q78 26 76 37 Q74 46 64 47" fill="none" stroke="#304868" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M36 40 Q22 26 24 37 Q26 46 36 47" fill="none" stroke="#567898" strokeWidth="2" strokeLinecap="round" />
      <path d="M64 40 Q78 26 76 37 Q74 46 64 47" fill="none" stroke="#567898" strokeWidth="2" strokeLinecap="round" />

      {/* Brow ridge */}
      <path d="M33 46 L43 42 L50 43 L57 42 L67 46" fill="none" stroke="#5888b0" strokeWidth="2.2" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="42" cy="50" rx="5.5" ry="4.5" fill="#040810" />
      <ellipse cx="58" cy="50" rx="5.5" ry="4.5" fill="#040810" />
      <ellipse cx="42" cy="50" rx="4.2" ry="3.2" fill={`hsl(${eyeHue},100%,32%)`} filter={`url(#${uid}glow)`} />
      <ellipse cx="58" cy="50" rx="4.2" ry="3.2" fill={`hsl(${eyeHue},100%,32%)`} filter={`url(#${uid}glow)`} />
      {/* Slit pupils */}
      <rect x="41.2" y="48.3" width="1.6" height="3.4" rx="0.8" fill="#000" />
      <rect x="57.2" y="48.3" width="1.6" height="3.4" rx="0.8" fill="#000" />
      <circle cx="42" cy="50" r="1.2" fill={`hsl(${eyeHue},100%,78%)`} />
      <circle cx="58" cy="50" r="1.2" fill={`hsl(${eyeHue},100%,78%)`} />

      {/* Nose */}
      <path d="M47 57 L50 61 L53 57" fill="none" stroke="#3a5070" strokeWidth="1.6" />

      {/* Jaw + fangs */}
      <path d="M37 62 Q50 68 63 62" fill="#1e3048" stroke="#30486a" strokeWidth="0.9" />
      <line x1="44" y1="62" x2="43.5" y2="66" stroke="#c8e0ff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="63" x2="50" y2="67" stroke="#c8e0ff" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="56" y1="62" x2="56.5" y2="66" stroke="#c8e0ff" strokeWidth="2.2" strokeLinecap="round" />

      {/* Armored claws */}
      <path d="M33 99 L29 108" stroke="#486888" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M37 101 L34 110" stroke="#486888" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M41 102 L39 111" stroke="#486888" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M67 99 L71 108" stroke="#486888" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M63 101 L66 110" stroke="#486888" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M59 102 L61 111" stroke="#486888" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

// ── Ember Warden — INNOVATOR ──────────────────────────────────────────────
// Dark amber/orange, huge spread wings with fire edge glow,
// triple crown horns, full chest plate with gem + rivets,
// large spiked pauldrons, gauntlet claws, fire orange eyes
function EmberWarden({ uid, eyeHue }: { uid: string; eyeHue: number }) {
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#3d1800" />
          <stop offset="100%" stopColor="#0d0400" />
        </radialGradient>
        <radialGradient id={`${uid}body`} cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#6a3010" />
          <stop offset="100%" stopColor="#2a0e05" />
        </radialGradient>
        <radialGradient id={`${uid}head`} cx="35%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#7a3c1c" />
          <stop offset="100%" stopColor="#3c1608" />
        </radialGradient>
        <radialGradient id={`${uid}plate`} cx="25%" cy="18%" r="75%">
          <stop offset="0%" stopColor="#c07030" />
          <stop offset="100%" stopColor="#602808" />
        </radialGradient>
        <filter id={`${uid}glow`}>
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${uid}fglow`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="100" height="120" rx="16" fill={`url(#${uid}bg)`} />

      {/* Large spread wings */}
      <path d="M27 72 Q4 48 7 20 Q11 5 21 18 Q26 29 29 48 L35 67Z" fill="#280e04" stroke="#6a2808" strokeWidth="0.6" />
      <path d="M7 20 L27 46" stroke="#8a3010" strokeWidth="1" />
      <path d="M8 32 L28 54" stroke="#8a3010" strokeWidth="1" />
      <path d="M10 44 L29 62" stroke="#8a3010" strokeWidth="1" />
      {/* Fire edge glow */}
      <path d="M7 20 Q4 27 5 34 Q3 44 7 50 Q5 58 9 61" fill="none" stroke="#ff6010" strokeWidth="2.5" filter={`url(#${uid}fglow)`} opacity="0.75" />
      <path d="M73 72 Q96 48 93 20 Q89 5 79 18 Q74 29 71 48 L65 67Z" fill="#280e04" stroke="#6a2808" strokeWidth="0.6" />
      <path d="M93 20 L73 46" stroke="#8a3010" strokeWidth="1" />
      <path d="M92 32 L72 54" stroke="#8a3010" strokeWidth="1" />
      <path d="M90 44 L71 62" stroke="#8a3010" strokeWidth="1" />
      {/* Fire edge glow */}
      <path d="M93 20 Q96 27 95 34 Q97 44 93 50 Q95 58 91 61" fill="none" stroke="#ff6010" strokeWidth="2.5" filter={`url(#${uid}fglow)`} opacity="0.75" />

      {/* Body */}
      <ellipse cx="50" cy="89" rx="20" ry="18" fill={`url(#${uid}body)`} />

      {/* Full chest plate */}
      <path d="M35 72 L50 65 L65 72 L67 93 L50 99 L33 93Z" fill={`url(#${uid}plate)`} stroke="#e07030" strokeWidth="1.3" />
      <line x1="50" y1="65" x2="50" y2="99" stroke="#ff9040" strokeWidth="1.3" />
      <path d="M37 79 Q50 75 63 79" fill="none" stroke="#e08040" strokeWidth="1" />
      <path d="M38 86 Q50 82 62 86" fill="none" stroke="#e08040" strokeWidth="0.8" />
      {/* Chest gem */}
      <polygon points="50,74 53.5,80 50,86 46.5,80" fill="#ff8020" stroke="#ffb060" strokeWidth="0.6" filter={`url(#${uid}glow)`} />
      {/* Rivets */}
      <circle cx="38" cy="90" r="1.3" fill="#ff7020" />
      <circle cx="42" cy="93" r="1.3" fill="#ff7020" />
      <circle cx="58" cy="90" r="1.3" fill="#ff7020" />
      <circle cx="62" cy="93" r="1.3" fill="#ff7020" />

      {/* Large spiked pauldrons */}
      <ellipse cx="26" cy="71" rx="12" ry="8" fill={`url(#${uid}plate)`} stroke="#e07030" strokeWidth="1.1" transform="rotate(-20,26,71)" />
      <path d="M21 62 L19 52" stroke="#c06020" strokeWidth="3" strokeLinecap="round" />
      <path d="M27 60 L25 49" stroke="#c06020" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="74" cy="71" rx="12" ry="8" fill={`url(#${uid}plate)`} stroke="#e07030" strokeWidth="1.1" transform="rotate(20,74,71)" />
      <path d="M79 62 L81 52" stroke="#c06020" strokeWidth="3" strokeLinecap="round" />
      <path d="M73 60 L75 49" stroke="#c06020" strokeWidth="3" strokeLinecap="round" />

      {/* Neck */}
      <rect x="43" y="59" width="14" height="10" rx="4" fill="#4a1e08" />
      <path d="M43 63 L57 63" stroke="#7a3818" strokeWidth="0.8" />

      {/* Head */}
      <ellipse cx="50" cy="49" rx="18" ry="16" fill={`url(#${uid}head)`} />

      {/* Triple crown horns */}
      <path d="M37 37 L33 22 L40 37Z" fill="#7a3610" stroke="#c05a28" strokeWidth="1" />
      <path d="M50 34 L50 15 L55.5 34Z" fill="#8a4018" stroke="#d06830" strokeWidth="1.2" />
      <path d="M63 37 L67 22 L60 37Z" fill="#7a3610" stroke="#c05a28" strokeWidth="1" />
      <circle cx="33" cy="22" r="1.8" fill="#ff7020" filter={`url(#${uid}glow)`} />
      <circle cx="50.5" cy="15" r="2" fill="#ff8030" filter={`url(#${uid}glow)`} />
      <circle cx="67" cy="22" r="1.8" fill="#ff7020" filter={`url(#${uid}glow)`} />

      {/* Heavy brow ridge */}
      <path d="M32 45 L40 40 L50 41 L60 40 L68 45" fill="none" stroke="#c05828" strokeWidth="2.5" strokeLinecap="round" />

      {/* Eyes */}
      <ellipse cx="41" cy="50" rx="6" ry="5" fill="#060200" />
      <ellipse cx="59" cy="50" rx="6" ry="5" fill="#060200" />
      <ellipse cx="41" cy="50" rx="4.5" ry="3.8" fill={`hsl(${eyeHue},100%,38%)`} filter={`url(#${uid}glow)`} />
      <ellipse cx="59" cy="50" rx="4.5" ry="3.8" fill={`hsl(${eyeHue},100%,38%)`} filter={`url(#${uid}glow)`} />
      {/* Slit pupils */}
      <rect x="40.2" y="48.2" width="1.6" height="3.6" rx="0.8" fill="#000" />
      <rect x="58.2" y="48.2" width="1.6" height="3.6" rx="0.8" fill="#000" />
      <circle cx="41" cy="50" r="1.6" fill={`hsl(${eyeHue},100%,75%)`} />
      <circle cx="59" cy="50" r="1.6" fill={`hsl(${eyeHue},100%,75%)`} />

      {/* Nose */}
      <path d="M47 57 L50 61 L53 57" fill="none" stroke="#6a2e0e" strokeWidth="1.8" />

      {/* Jaw + many fangs */}
      <path d="M36 63 Q50 71 64 63" fill="#280e04" stroke="#6a2808" strokeWidth="0.9" />
      <line x1="41" y1="63" x2="40.5" y2="67" stroke="#ffe0c0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="46" y1="64" x2="45.5" y2="68" stroke="#ffe0c0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="50" y1="64.5" x2="50" y2="68.5" stroke="#ffe0c0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="54" y1="64" x2="54.5" y2="68" stroke="#ffe0c0" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="59" y1="63" x2="59.5" y2="67" stroke="#ffe0c0" strokeWidth="2.2" strokeLinecap="round" />

      {/* Gauntlet claws — glowing fire */}
      <path d="M31 99 L27 109" stroke="#ff7020" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <path d="M35 101 L32 111" stroke="#ff7020" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <path d="M39 103 L37 112" stroke="#ff7020" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <path d="M69 99 L73 109" stroke="#ff7020" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <path d="M65 101 L68 111" stroke="#ff7020" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <path d="M61 103 L63 112" stroke="#ff7020" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}glow)`} />
    </svg>
  )
}

// ── Void Archon — LEGEND ──────────────────────────────────────────────────
// Deep void-purple, 4 wings (2 large lower + 2 upper), crown of 5 horns,
// cosmic starfield eyes, void crystal armor with energy channels + gems,
// energy halo, crystal pauldrons, energy claws, floating particles
function VoidArchon({ uid, eyeHue }: { uid: string; eyeHue: number }) {
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`${uid}bg`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#1a0030" />
          <stop offset="100%" stopColor="#050010" />
        </radialGradient>
        <radialGradient id={`${uid}aura`} cx="50%" cy="44%" r="44%">
          <stop offset="0%" stopColor="#7020b0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1a0030" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}body`} cx="30%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#4a1080" />
          <stop offset="100%" stopColor="#1a0030" />
        </radialGradient>
        <radialGradient id={`${uid}head`} cx="35%" cy="30%" r="62%">
          <stop offset="0%" stopColor="#5c1892" />
          <stop offset="100%" stopColor="#22063c" />
        </radialGradient>
        <radialGradient id={`${uid}crystal`} cx="25%" cy="20%" r="75%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3d0870" />
        </radialGradient>
        <filter id={`${uid}glow`}>
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${uid}hglow`}>
          <feGaussianBlur stdDeviation="5.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width="100" height="120" rx="16" fill={`url(#${uid}bg)`} />
      {/* Stars */}
      <circle cx="14" cy="11" r="0.7" fill="white" opacity="0.5" />
      <circle cx="80" cy="7" r="0.8" fill="white" opacity="0.4" />
      <circle cx="93" cy="28" r="0.7" fill="white" opacity="0.5" />
      <circle cx="4" cy="62" r="0.6" fill="white" opacity="0.3" />
      <circle cx="92" cy="72" r="0.8" fill="white" opacity="0.4" />
      <circle cx="18" cy="102" r="0.7" fill="white" opacity="0.3" />
      <circle cx="77" cy="108" r="0.6" fill="white" opacity="0.4" />
      <circle cx="50" cy="9" r="0.7" fill="white" opacity="0.35" />
      <circle cx="30" cy="17" r="0.6" fill="white" opacity="0.3" />
      <circle cx="68" cy="14" r="0.7" fill="white" opacity="0.35" />

      {/* Void aura */}
      <ellipse cx="50" cy="56" rx="42" ry="48" fill={`url(#${uid}aura)`} />

      {/* Energy halo behind head */}
      <ellipse cx="50" cy="37" rx="23" ry="5.5" fill="none" stroke="#9333ea" strokeWidth="2.8" filter={`url(#${uid}glow)`} opacity="0.85" />
      <ellipse cx="50" cy="37" rx="23" ry="5.5" fill="none" stroke="#d090ff" strokeWidth="1" opacity="0.6" />

      {/* Lower large wings */}
      <path d="M27 79 Q2 58 4 26 Q7 8 19 22 Q25 32 29 53 L35 73Z" fill="#140025" stroke="#5010a0" strokeWidth="0.9" />
      <path d="M4 26 L27 52" stroke="#6010c0" strokeWidth="1" />
      <path d="M5 38 L28 61" stroke="#6010c0" strokeWidth="1" />
      <path d="M7 52 L29 68" stroke="#6010c0" strokeWidth="1" />
      <path d="M4 26 Q2 34 3 43 Q1 54 5 60 Q3 68 7 70" fill="none" stroke="#a020f0" strokeWidth="2.8" filter={`url(#${uid}glow)`} opacity="0.8" />
      <path d="M73 79 Q98 58 96 26 Q93 8 81 22 Q75 32 71 53 L65 73Z" fill="#140025" stroke="#5010a0" strokeWidth="0.9" />
      <path d="M96 26 L73 52" stroke="#6010c0" strokeWidth="1" />
      <path d="M95 38 L72 61" stroke="#6010c0" strokeWidth="1" />
      <path d="M93 52 L71 68" stroke="#6010c0" strokeWidth="1" />
      <path d="M96 26 Q98 34 97 43 Q99 54 95 60 Q97 68 93 70" fill="none" stroke="#a020f0" strokeWidth="2.8" filter={`url(#${uid}glow)`} opacity="0.8" />

      {/* Upper smaller wings */}
      <path d="M34 57 Q17 41 19 21 Q21 11 30 20 L36 52Z" fill="#0f0020" stroke="#4010a0" strokeWidth="0.6" />
      <path d="M66 57 Q83 41 81 21 Q79 11 70 20 L64 52Z" fill="#0f0020" stroke="#4010a0" strokeWidth="0.6" />

      {/* Body */}
      <ellipse cx="50" cy="91" rx="20" ry="18" fill={`url(#${uid}body)`} />

      {/* Void crystal armor */}
      <path d="M35 73 L50 65 L65 73 L67 94 L50 100 L33 94Z" fill={`url(#${uid}crystal)`} stroke="#c060ff" strokeWidth="1.5" />
      <line x1="50" y1="65" x2="50" y2="100" stroke="#d880ff" strokeWidth="1.3" />
      <path d="M36 80 Q50 76 64 80" fill="none" stroke="#c060e0" strokeWidth="1" />
      {/* Energy channel lines */}
      <path d="M35 82 L39 87 L35 92" fill="none" stroke="#c060ff" strokeWidth="0.9" filter={`url(#${uid}glow)`} />
      <path d="M65 82 L61 87 L65 92" fill="none" stroke="#c060ff" strokeWidth="0.9" filter={`url(#${uid}glow)`} />
      {/* Crystal gems */}
      <polygon points="50,73 54,80 50,87 46,80" fill="#e080ff" stroke="#ff90ff" strokeWidth="0.6" filter={`url(#${uid}glow)`} />
      <circle cx="39" cy="88" r="1.6" fill="#c060ff" filter={`url(#${uid}glow)`} />
      <circle cx="61" cy="88" r="1.6" fill="#c060ff" filter={`url(#${uid}glow)`} />

      {/* Crystal pauldrons */}
      <path d="M18 69 L24 58 L32 65 L29 74Z" fill={`url(#${uid}crystal)`} stroke="#c060ff" strokeWidth="1.1" />
      <line x1="24" y1="58" x2="29" y2="74" stroke="#d880ff" strokeWidth="0.9" />
      <path d="M82 69 L76 58 L68 65 L71 74Z" fill={`url(#${uid}crystal)`} stroke="#c060ff" strokeWidth="1.1" />
      <line x1="76" y1="58" x2="71" y2="74" stroke="#d880ff" strokeWidth="0.9" />

      {/* Neck */}
      <rect x="43" y="59" width="14" height="10" rx="4" fill="#2a0550" />
      <path d="M43 64 L57 64" stroke="#8020c0" strokeWidth="0.8" />

      {/* Head */}
      <ellipse cx="50" cy="47" rx="18" ry="16" fill={`url(#${uid}head)`} />

      {/* Crown of 5 horns */}
      <path d="M34 36 L30 19 L38 36Z" fill="#3c0878" stroke="#9030e0" strokeWidth="1" />
      <path d="M66 36 L70 19 L62 36Z" fill="#3c0878" stroke="#9030e0" strokeWidth="1" />
      <path d="M41 33 L38 14 L47 33Z" fill="#4c1088" stroke="#a840f0" strokeWidth="1" />
      <path d="M59 33 L62 14 L53 33Z" fill="#4c1088" stroke="#a840f0" strokeWidth="1" />
      <path d="M50 30 L50 7 L57 30Z" fill="#5c1898" stroke="#b850ff" strokeWidth="1.3" />
      {/* Horn energy tips */}
      <circle cx="30" cy="19" r="2" fill="#b040f0" filter={`url(#${uid}hglow)`} />
      <circle cx="70" cy="19" r="2" fill="#b040f0" filter={`url(#${uid}hglow)`} />
      <circle cx="38" cy="14" r="2" fill="#c050ff" filter={`url(#${uid}hglow)`} />
      <circle cx="62" cy="14" r="2" fill="#c050ff" filter={`url(#${uid}hglow)`} />
      <circle cx="50.5" cy="7" r="2.5" fill="#e070ff" filter={`url(#${uid}hglow)`} />

      {/* Void crystal brow */}
      <path d="M31 43 L40 38 L50 39 L60 38 L69 43" fill="none" stroke="#b040e0" strokeWidth="2.8" strokeLinecap="round" />

      {/* Eyes — cosmic void */}
      <ellipse cx="41" cy="48" rx="6.5" ry="5.5" fill="#000010" />
      <ellipse cx="59" cy="48" rx="6.5" ry="5.5" fill="#000010" />
      <ellipse cx="41" cy="48" rx="5.5" ry="4.5" fill={`hsl(${eyeHue},75%,12%)`} />
      <ellipse cx="59" cy="48" rx="5.5" ry="4.5" fill={`hsl(${eyeHue},75%,12%)`} />
      <ellipse cx="41" cy="48" rx="4" ry="3.5" fill={`hsl(${eyeHue},100%,42%)`} filter={`url(#${uid}glow)`} opacity="0.85" />
      <ellipse cx="59" cy="48" rx="4" ry="3.5" fill={`hsl(${eyeHue},100%,42%)`} filter={`url(#${uid}glow)`} opacity="0.85" />
      {/* Star sparks */}
      <circle cx="39.5" cy="46.8" r="0.7" fill="white" opacity="0.85" />
      <circle cx="42.5" cy="49.2" r="0.55" fill="white" opacity="0.65" />
      <circle cx="57.5" cy="46.8" r="0.7" fill="white" opacity="0.85" />
      <circle cx="60.5" cy="49.2" r="0.55" fill="white" opacity="0.65" />
      <circle cx="41" cy="48" r="1.9" fill={`hsl(${eyeHue},100%,82%)`} />
      <circle cx="59" cy="48" r="1.9" fill={`hsl(${eyeHue},100%,82%)`} />

      {/* Nose */}
      <path d="M47 55 L50 59 L53 55" fill="none" stroke="#5c1090" strokeWidth="1.8" />

      {/* Void jaw + glowing fangs */}
      <path d="M34 61 Q50 70 66 61" fill="#14002a" stroke="#5010a0" strokeWidth="0.9" />
      <line x1="40" y1="61" x2="39.8" y2="65.5" stroke="#e0a0ff" strokeWidth="2.2" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <line x1="45" y1="62.5" x2="44.8" y2="67" stroke="#e0a0ff" strokeWidth="2.2" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <line x1="50" y1="63" x2="50" y2="67.5" stroke="#e0a0ff" strokeWidth="2.2" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <line x1="55" y1="62.5" x2="55.2" y2="67" stroke="#e0a0ff" strokeWidth="2.2" strokeLinecap="round" filter={`url(#${uid}glow)`} />
      <line x1="60" y1="61" x2="60.2" y2="65.5" stroke="#e0a0ff" strokeWidth="2.2" strokeLinecap="round" filter={`url(#${uid}glow)`} />

      {/* Energy claws */}
      <path d="M30 100 L26 110" stroke="#a020f0" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}hglow)`} />
      <path d="M34 102 L31 112" stroke="#a020f0" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}hglow)`} />
      <path d="M38 104 L36 113" stroke="#a020f0" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}hglow)`} />
      <path d="M70 100 L74 110" stroke="#a020f0" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}hglow)`} />
      <path d="M66 102 L69 112" stroke="#a020f0" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}hglow)`} />
      <path d="M62 104 L64 113" stroke="#a020f0" strokeWidth="2.8" strokeLinecap="round" filter={`url(#${uid}hglow)`} />

      {/* Floating void particles */}
      <circle cx="13" cy="76" r="1.6" fill="#8020d0" filter={`url(#${uid}glow)`} opacity="0.7" />
      <circle cx="87" cy="68" r="1.3" fill="#9030e0" filter={`url(#${uid}glow)`} opacity="0.65" />
      <circle cx="16" cy="96" r="1.1" fill="#7010c0" filter={`url(#${uid}glow)`} opacity="0.55" />
      <circle cx="84" cy="92" r="1.4" fill="#8020d0" filter={`url(#${uid}glow)`} opacity="0.6" />
    </svg>
  )
}

// ── Eye hue ranges per persona ─────────────────────────────────────────────
const EYE_HUE: Record<Persona, [number, number]> = {
  ADOPTER:     [128, 155], // green
  TRANSFORMER: [195, 222], // electric blue
  INNOVATOR:   [20,  42],  // fire orange
  LEGEND:      [270, 295], // void violet
}

export function GargoyleAvatar({ seed, persona, className }: GargoyleAvatarProps) {
  const rawId = useId()
  const uid = rawId.replace(/:/g, "g")
  const h = hashSeed(seed)
  const [lo, hi] = EYE_HUE[persona]
  const eyeHue = lo + (h % (hi - lo))

  const props = { uid, eyeHue }

  return (
    <div className={className}>
      {persona === "ADOPTER"     && <StoneImp {...props} />}
      {persona === "TRANSFORMER" && <IronSentinel {...props} />}
      {persona === "INNOVATOR"   && <EmberWarden {...props} />}
      {persona === "LEGEND"      && <VoidArchon {...props} />}
    </div>
  )
}
