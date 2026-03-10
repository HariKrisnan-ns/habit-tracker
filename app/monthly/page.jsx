'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function MonthlyPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [slideDir, setSlideDir] = useState(null) // 'left' | 'right' | null

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month, 0).getDate()

  const allDates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    const m = String(month).padStart(2, '0')
    return `${year}-${m}-${d}`
  })

  const fromDate = allDates[0]
  const toDate = allDates[allDates.length - 1]

  useEffect(() => { loadData() }, [year, month])

  async function loadData() {
    setLoading(true)
    const [hRes, cRes] = await Promise.all([
      fetch('/api/habits'),
      fetch(`/api/completions?from=${fromDate}`),
    ])
    if (hRes.status === 401) { router.push('/login'); return }
    const hData = await hRes.json()
    const cData = await cRes.json()
    if (Array.isArray(hData)) setHabits(hData)
    if (Array.isArray(cData)) setCompletions(cData.filter(c => c.date >= fromDate && c.date <= toDate))
    setLoading(false)
  }

  const habitStats = habits.map(h => {
    const doneDays = allDates.filter(d => completions.some(c => c.habitId === h.id && c.date === d))
    const done = doneDays.length
    const pct = Math.round((done / daysInMonth) * 100)

    // Calculate best streak this month
    let bestStreak = 0, currentStreak = 0
    allDates.forEach(d => {
      if (completions.some(c => c.habitId === h.id && c.date === d)) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    })

    return { ...h, done, pct, bestStreak, doneDays }
  }).sort((a, b) => b.pct - a.pct)

  function prevMonth() {
    setSlideDir('left')
    setTimeout(() => setSlideDir(null), 300)
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const nm = month === 12 ? 1 : month + 1
    const ny = month === 12 ? year + 1 : year
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth() + 1)) return
    setSlideDir('right')
    setTimeout(() => setSlideDir(null), 300)
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const totalDone = completions.length
  const totalPossible = habits.length * daysInMonth
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

  // Radial chart data
  const radialData = habitStats.slice(0, 6).map((h, i) => ({
    name: h.name,
    value: h.pct,
    fill: h.color,
  }))

  // Best performing habit
  const bestHabit = habitStats.length > 0 ? habitStats[0] : null

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 36px)', maxWidth: 'var(--content-max)' }} className="ht-main">

        {/* ═══ Header ═══ */}
        <div className="animate-fadeIn" style={{ marginBottom: 'clamp(20px, 4vw, 28px)' }}>
          <h1 className="page-title" style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>
            Monthly Stats <span style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>📈</span>
          </h1>
          <p className="page-subtitle">
            Your habit performance this month
          </p>
        </div>

        {/* ═══ Month Navigation ═══ */}
        <div className="glass-card animate-fadeIn delay-1" style={{
          padding: 'clamp(14px, 3vw, 18px) clamp(16px, 3vw, 24px)', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'default', flexWrap: 'wrap', gap: 12,
        }}>
          <button onClick={prevMonth} className="btn-ghost" style={{
            padding: '8px 18px', borderRadius: 10, fontSize: 13,
          }}>← Prev</button>

          <div style={{
            textAlign: 'center',
            animation: slideDir === 'left'
              ? 'slideInLeft 0.3s ease' : slideDir === 'right'
              ? 'slideInRight 0.3s ease' : 'none',
          }}>
            <div style={{ fontSize: 19, fontWeight: 900 }}>{monthName}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {totalDone} / {totalPossible} completions · {overallPct}% overall
            </div>
          </div>

          <button onClick={nextMonth} disabled={isCurrentMonth} className="btn-ghost" style={{
            padding: '8px 18px', borderRadius: 10, fontSize: 13,
            opacity: isCurrentMonth ? 0.3 : 1,
            cursor: isCurrentMonth ? 'default' : 'pointer',
          }}>Next →</button>
        </div>

        {/* ═══ Best Streak Badge ═══ */}
        {bestHabit && bestHabit.pct > 0 && (
          <div className="animate-fadeIn delay-2" style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 22px', marginBottom: 24,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))',
            border: '1px solid rgba(245,158,11,0.15)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                Best Performer: <span className="gradient-text-warm">{bestHabit.name}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {bestHabit.pct}% completion · {bestHabit.bestStreak} day best streak
              </div>
            </div>
            <div style={{ fontSize: 24 }}>{bestHabit.icon}</div>
          </div>
        )}

        {/* ═══ Content ═══ */}
        {loading ? (
          <div style={{
            textAlign: 'center', padding: 60,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : habits.length === 0 ? (
          <div className="glass-card animate-fadeIn" style={{
            textAlign: 'center', padding: '60px', cursor: 'default',
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📈</div>
            <p style={{ color: 'var(--muted)' }}>No habits to show. Add habits first.</p>
          </div>
        ) : (
          <>
            {/* Radial Bar Chart */}
            {radialData.length > 0 && (
              <div className="glass-card animate-fadeIn delay-3" style={{
                padding: '24px', marginBottom: 24, cursor: 'default',
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>📊 Monthly Overview</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                  Completion percentage per habit
                </p>
                <div className="radial-chart-wrapper">
                  <ResponsiveContainer width={260} height={260}>
                    <RadialBarChart
                      cx="50%" cy="50%"
                      innerRadius="20%" outerRadius="90%"
                      barSize={14}
                      data={radialData}
                      startAngle={180}
                      endAngle={-180}
                    >
                      <RadialBar
                        background={{ fill: 'var(--bg3)' }}
                        dataKey="value"
                        cornerRadius={8}
                      />
                      <Tooltip
                        content={({ payload }) => {
                          if (!payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <div style={{
                              background: 'rgba(18,18,26,0.85)',
                              backdropFilter: 'blur(16px)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 12, padding: '10px 14px',
                              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{d.name}</div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: d.fill, marginTop: 2 }}>{d.value}%</div>
                            </div>
                          )
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 140 }}>
                    {radialData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: 3,
                          background: d.fill, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
                          {d.name}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: d.fill, marginLeft: 'auto' }}>
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Habit Progress Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {habitStats.map((h, i) => (
                <div key={h.id} className={`glass-card animate-fadeIn delay-${Math.min(i + 3, 7)}`} style={{
                  padding: '22px 24px', cursor: 'default',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: h.color + '15',
                      border: `1.5px solid ${h.color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>{h.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{h.category}</span>
                        {h.bestStreak > 0 && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '2px 8px', borderRadius: 12,
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.15)',
                            fontSize: 10, fontWeight: 700, color: '#f59e0b',
                          }}>🔥 {h.bestStreak}d streak</span>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 22, fontWeight: 900,
                        color: h.pct >= 80 ? '#22c55e' : h.pct >= 50 ? '#f59e0b' : 'var(--muted)',
                      }}>{h.pct}%</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{h.done}/{daysInMonth} days</div>
                    </div>
                  </div>

                  {/* Animated progress bar */}
                  <div style={{ height: 7, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{
                      height: '100%', borderRadius: 8,
                      background: h.pct >= 80
                        ? 'linear-gradient(90deg, #22c55e, #06b6d4)'
                        : h.pct >= 50
                          ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                          : `linear-gradient(90deg, ${h.color}, ${h.color}cc)`,
                      width: `${h.pct}%`,
                      animation: 'progressFill 1s cubic-bezier(0.16, 1, 0.3, 1) both',
                      animationDelay: `${i * 100}ms`,
                    }} />
                  </div>

                  {/* Mini calendar heatmap dots */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 4,
                  }}>
                    {allDates.map(d => {
                      const done = completions.some(c => c.habitId === h.id && c.date === d)
                      const isFuture = d > now.toISOString().split('T')[0]
                      return (
                        <div key={d} title={d} style={{
                          width: 11, height: 11, borderRadius: 3,
                          background: isFuture
                            ? 'transparent'
                            : done
                              ? h.color
                              : 'var(--bg3)',
                          border: isFuture
                            ? '1px solid var(--glass-border)'
                            : done
                              ? 'none'
                              : '1px solid var(--glass-border)',
                          opacity: isFuture ? 0.25 : done ? 1 : 0.5,
                          transition: 'all 0.2s',
                          boxShadow: done ? `0 0 6px ${h.color}30` : 'none',
                        }} />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
