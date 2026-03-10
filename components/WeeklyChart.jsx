'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(18, 18, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f0f5', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: '#818cf8' }}>
        {payload[0].value} completed
      </div>
    </div>
  )
}

export default function WeeklyChart({ data }) {
  return (
    <div className="animate-fadeIn delay-4 chart-container" style={{
      background: 'var(--glass)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      borderRadius: 20, padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) 16px',
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800 }}>📊 7-Day Trend</h3>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Daily completions over the past week</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b6a7a', fontSize: 11, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b6a7a', fontSize: 11, fontWeight: 600 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={{ r: 4, fill: '#6366f1', stroke: '#0a0a0f', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#818cf8', stroke: '#0a0a0f', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
