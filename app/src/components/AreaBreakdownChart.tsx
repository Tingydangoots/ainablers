"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const COLORS: Record<string, string> = {
  PRODUCTIVITY: "#0070AD",
  DELIVERABLE: "#00a3e8",
  INNOVATION: "#FFD700",
  OTHER: "#64748b",
}

const LABELS: Record<string, string> = {
  PRODUCTIVITY: "Productivity",
  DELIVERABLE: "Deliverable",
  INNOVATION: "Innovation",
  OTHER: "Other",
}

interface AreaData {
  area: string
  count: number
}

export function AreaBreakdownChart({ data }: { data: AreaData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        No approved contributions yet
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: LABELS[d.area] ?? d.area,
    value: d.count,
    area: d.area,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry) => (
            <Cell key={entry.area} fill={COLORS[entry.area] ?? "#64748b"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            color: "#0f172a",
            fontSize: 12,
          }}
        />
        <Legend
          formatter={(value) => <span style={{ color: "#64748b", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
