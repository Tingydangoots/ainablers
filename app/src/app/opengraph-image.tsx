import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "AINABLERS — AI Adoption Tracker"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #060d1f 0%, #0a1628 50%, #060d1f 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid lines background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,112,173,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,112,173,0.07) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,112,173,0.18) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 64,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,112,173,0.15)",
            border: "1px solid rgba(0,112,173,0.35)",
            borderRadius: 999,
            padding: "8px 20px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
            }}
          />
          <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>
            Capgemini · Change Management
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
          }}
        >
          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
            {/* Zap icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "rgba(0,112,173,0.2)",
                border: "1.5px solid rgba(0,112,173,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 24px rgba(0,112,173,0.3)",
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  fill="#0070AD"
                  stroke="#0070AD"
                  strokeWidth="1"
                />
              </svg>
            </div>

            <span
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: "#f1f5f9",
                letterSpacing: "-1px",
              }}
            >
              AINABLERS
            </span>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: 26,
              color: "#94a3b8",
              fontWeight: 400,
              margin: 0,
              marginBottom: 48,
              lineHeight: 1.4,
              maxWidth: 620,
            }}
          >
            Track, validate &amp; celebrate AI adoption across your team
          </p>

          {/* Persona tier pills */}
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Recruit",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.3)"   },
              { label: "Spartan",      color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.3)"  },
              { label: "Master Chief", color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.3)"  },
              { label: "Forerunner",   color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)" },
            ].map(({ label, color, bg, border }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: 999,
                  padding: "10px 20px",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                />
                <span style={{ color, fontSize: 15, fontWeight: 600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 80px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ color: "#475569", fontSize: 14 }}>ainablers.vercel.app</span>
          <span style={{ color: "#475569", fontSize: 14 }}>AI Adoption Tracker</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
