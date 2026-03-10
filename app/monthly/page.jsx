'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function MonthlyPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-12

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(year, month, 0).getDate()

  // All dates in selected month
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
    const done = allDates.filter(d => completions.some(c => c.habitId === h.id && c.date === d)).length
    const pct = Math.round((done / daysInMonth) * 100)
    return { ...h, done, pct }
  }).sort((a, b) => b.pct - a.pct)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const nm = month === 12 ? 1 : month + 1
    const ny = month === 12 ? year + 1 : year
    if (ny > now.getFullYear() || (ny === now.getFullYear() && nm > now.getMonth() + 1)) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const totalDone = completions.length
  const totalPossible = habits.length * daysInMonth
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: '40px 36px', maxWidth: 800 }} className="ht-main">

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Monthly Stats 📈</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 5 }}>Your habit performance this month</p>
        </div>

        {/* Month nav */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)',
          padding: '16px 22px', marginBottom: 24,
          justifyContent: 'space-between',
        }}>
          <button onClick={prevMonth} style={navBtn}>← Prev</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{monthName}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
              {totalDone} / {totalPossible} completions · {overallPct}% overall
            </div>
          </div>
          <button onClick={nextMonth} disabled={isCurrentMonth} style={{
            ...navBtn, opacity: isCurrentMonth ? 0.3 : 1,
            cursor: isCurrentMonth ? 'default' : 'pointer',
          }}>Next →</button>
        </div>

        {/* Habit progress bars */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading…</div>
        ) : habits.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            background: 'var(--bg2)', borderRadius: 18, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📈</div>
            <p style={{ color: 'var(--muted)' }}>No habits to show. Add habits first.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {habitStats.map(h => (
              <div key={h.id} style={{
                background: 'var(--bg2)', borderRadius: 16,
                border: '1px solid var(--border)', padding: '20px 22px',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: h.color + '22', border: `2px solid ${h.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{h.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{h.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 20, fontWeight: 900,
                      color: h.pct >= 80 ? '#22c55e' : h.pct >= 50 ? '#f59e0b' : 'var(--muted)',
                    }}>{h.pct}%</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{h.done}/{daysInMonth} days</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${h.pct}%`, borderRadius: 8,
                    background: h.pct >= 80 ? '#22c55e' : h.pct >= 50 ? '#f59e0b' : h.color,
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                {/* Mini calendar dots */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 14,
                }}>
                  {allDates.map(d => {
                    const done = completions.some(c => c.habitId === h.id && c.date === d)
                    const isFuture = d > now.toISOString().split('T')[0]
                    return (
                      <div key={d} title={d} style={{
                        width: 10, height: 10, borderRadius: 3,
                        background: isFuture ? 'transparent' : done ? h.color : 'var(--bg3)',
                        border: isFuture ? '1px solid var(--border)' : done ? 'none' : '1px solid var(--border)',
                        opacity: isFuture ? 0.3 : 1,
                      }} />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .ht-main { margin-left: 220px !important; }
        @media (max-width: 768px) {
          .ht-main { margin-left: 0 !important; padding: 24px 16px 90px !important; }
        }
      `}</style>
    </div>
  )
}

const navBtn = {
  padding: '8px 16px', borderRadius: 9,
  background: 'var(--bg3)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
}
