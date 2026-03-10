'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

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

export default function WeeklyPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)

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

  const habitStats = habits.map(h => {
    const count = days.filter(d => isDone(h.id, d)).length
    return { ...h, count, pct: Math.round((count / 7) * 100) }
  })

  const totalPossible = habits.length * 7
  const totalDone = completions.filter(c => days.includes(c.date)).length
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

  const barData = days.map(date => {
    const count = completions.filter(c => c.date === date).length
    const label = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
    return { day: label, count }
  })

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 36px)' }} className="ht-main">

        {/* ═══ Header ═══ */}
        <div className="animate-fadeIn" style={{ marginBottom: 'clamp(20px, 4vw, 28px)' }}>
          <h1 className="page-title" style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>
            Weekly View <span style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>📊</span>
          </h1>
          <p className="page-subtitle">
            Last 7 days performance
          </p>
        </div>

        {/* ═══ Overall % ═══ */}
        <div className="glass-card animate-fadeIn delay-1" style={{
          padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 22, cursor: 'default',
        }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="var(--bg3)" strokeWidth="6" />
              <circle cx="36" cy="36" r="28" fill="none"
                stroke="#6366f1" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 28 * overallPct / 100} ${2 * Math.PI * 28}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 900, color: 'var(--accent2)',
            }}>{overallPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Weekly Completion Rate</div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {totalDone} of {totalPossible} possible completions this week
            </div>
          </div>
        </div>

        {/* ═══ Heatmap Grid ═══ */}
        {habits.length === 0 ? (
          <div className="glass-card animate-fadeIn" style={{
            textAlign: 'center', padding: '60px', cursor: 'default',
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📊</div>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>No habits to show. Add habits first.</p>
          </div>
        ) : (
          <>
            <div className="glass-card animate-fadeIn delay-2" style={{
              padding: 0, overflow: 'hidden', marginBottom: 24, cursor: 'default',
            }}>
              {/* Scrollable container for small screens */}
              <div className="ht-grid-scroll">
              {/* Day headers */}
              <div className="ht-grid-header" style={{
                display: 'grid', padding: '14px 18px 10px',
                borderBottom: '1px solid var(--glass-border)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Habit
                </div>
                {days.map(d => {
                  const isToday = d === new Date().toISOString().split('T')[0]
                  return (
                    <div key={d} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                        {new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                      </div>
                      <div style={{
                        fontSize: 12, fontWeight: 800, marginTop: 2,
                        color: isToday ? 'var(--accent2)' : 'var(--text)',
                      }}>
                        {new Date(d + 'T12:00:00').getDate()}
                      </div>
                    </div>
                  )
                })}
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rate
                </div>
              </div>

              {/* Rows */}
              {habitStats.map((h, i) => (
                <div key={h.id} className="ht-grid-row" style={{
                  display: 'grid', padding: '14px 18px', alignItems: 'center',
                  borderBottom: i < habits.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  transition: 'background 0.15s',
                }}>
                  {/* Habit name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: h.color + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>{h.icon}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{h.category}</div>
                    </div>
                  </div>

                  {/* Day cells — heatmap squares */}
                  {days.map((d, di) => {
                    const done = isDone(h.id, d)
                    const isToday = d === new Date().toISOString().split('T')[0]
                    return (
                      <div key={d} style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 9,
                          background: done
                            ? h.color
                            : isToday
                              ? 'rgba(255,255,255,0.03)'
                              : 'var(--bg3)',
                          border: done
                            ? 'none'
                            : `1px solid ${isToday ? 'var(--border2)' : 'var(--glass-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: done ? 13 : 16,
                          color: done ? '#fff' : 'rgba(255,255,255,0.1)',
                          transition: 'all 0.3s ease',
                          boxShadow: done ? `0 2px 10px ${h.color}30` : 'none',
                          animation: `fadeIn 0.4s ease ${(di * 60) + (i * 40)}ms both`,
                        }}>
                          {done ? '✓' : '·'}
                        </div>
                      </div>
                    )
                  })}

                  {/* Rate */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 14, fontWeight: 900,
                      color: h.pct >= 80 ? '#22c55e' : h.pct >= 50 ? '#f59e0b' : 'var(--muted)',
                    }}>{h.pct}%</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{h.count}/7</div>
                  </div>
                </div>
              ))}
              </div>{/* close ht-grid-scroll */}
            </div>

            {/* ═══ Bar Chart ═══ */}
            <div className="glass-card animate-fadeIn delay-5 chart-container" style={{
              padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 24px) 16px', cursor: 'default',
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>📈 Daily Completions</h3>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                  Number of habits completed each day
                </p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="day" axisLine={false} tickLine={false}
                    tick={{ fill: '#6b6a7a', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fill: '#6b6a7a', fontSize: 11, fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
