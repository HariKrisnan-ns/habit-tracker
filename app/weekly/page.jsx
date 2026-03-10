'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function WeeklyPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)

  // Build last 7 days (oldest → newest)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const from = days[0]
    const [hRes, cRes] = await Promise.all([
      fetch('/api/habits'),
      fetch(`/api/completions?from=${from}`),
    ])
    if (hRes.status === 401) { router.push('/login'); return }
    const hData = await hRes.json()
    const cData = await cRes.json()
    if (Array.isArray(hData)) setHabits(hData)
    if (Array.isArray(cData)) setCompletions(cData)
    setLoading(false)
  }

  const isDone = (habitId, date) => completions.some(c => c.habitId === habitId && c.date === date)

  // Weekly completion % per habit
  const habitStats = habits.map(h => {
    const count = days.filter(d => isDone(h.id, d)).length
    return { ...h, count, pct: Math.round((count / 7) * 100) }
  })

  // Overall weekly rate
  const totalPossible = habits.length * 7
  const totalDone = completions.filter(c => days.includes(c.date)).length
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--muted)' }}>Loading…</div></div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: '40px 36px' }} className="ht-main">

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Weekly View 📊</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 5 }}>Last 7 days performance</p>
        </div>

        {/* Overall % */}
        <div style={{
          background: 'var(--bg2)', borderRadius: 16, border: '1px solid var(--border)',
          padding: '22px 26px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
            background: `conic-gradient(#6366f1 ${overallPct * 3.6}deg, var(--bg3) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 900, color: 'var(--accent2)',
            }}>{overallPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Weekly Completion Rate</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {totalDone} of {totalPossible} possible completions this week
            </div>
          </div>
        </div>

        {/* Grid */}
        {habits.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px', background: 'var(--bg2)',
            borderRadius: 18, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📊</div>
            <p style={{ color: 'var(--muted)' }}>No habits to show. Add habits first.</p>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg2)', borderRadius: 18,
            border: '1px solid var(--border)', overflow: 'hidden',
          }}>
            {/* Day headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '180px repeat(7, 1fr) 80px',
              borderBottom: '1px solid var(--border)',
              padding: '12px 16px',
            }} className="ht-grid-header">
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Habit</div>
              {days.map(d => {
                const isToday = d === new Date().toISOString().split('T')[0]
                return (
                  <div key={d} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
                      {new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 800,
                      color: isToday ? 'var(--accent2)' : 'var(--text)',
                      marginTop: 2,
                    }}>
                      {new Date(d + 'T12:00:00').getDate()}
                    </div>
                  </div>
                )
              })}
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase' }}>Rate</div>
            </div>

            {/* Rows */}
            {habitStats.map((h, i) => (
              <div key={h.id} style={{
                display: 'grid',
                gridTemplateColumns: '180px repeat(7, 1fr) 80px',
                padding: '14px 16px', alignItems: 'center',
                borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none',
                transition: 'background 0.15s',
              }} className="ht-grid-row">
                {/* Habit name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{h.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{h.category}</div>
                  </div>
                </div>

                {/* Day cells */}
                {days.map(d => {
                  const done = isDone(h.id, d)
                  const isToday = d === new Date().toISOString().split('T')[0]
                  return (
                    <div key={d} style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: done ? h.color : isToday ? 'var(--bg3)' : 'transparent',
                        border: `1.5px solid ${done ? h.color : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, color: done ? '#fff' : 'var(--muted)',
                        transition: 'all 0.15s',
                      }}>
                        {done ? '✓' : '·'}
                      </div>
                    </div>
                  )
                })}

                {/* Rate */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 13, fontWeight: 900,
                    color: h.pct >= 80 ? '#22c55e' : h.pct >= 50 ? '#f59e0b' : 'var(--muted)',
                  }}>{h.pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{h.count}/7</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .ht-main { margin-left: 220px !important; }
        @media (max-width: 768px) {
          .ht-main { margin-left: 0 !important; padding: 24px 12px 90px !important; }
          .ht-grid-header, .ht-grid-row {
            grid-template-columns: 120px repeat(7, 1fr) 60px !important;
          }
        }
      `}</style>
    </div>
  )
}
