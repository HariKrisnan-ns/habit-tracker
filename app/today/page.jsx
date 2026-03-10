'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TodayPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [done, setDone] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [hRes, cRes] = await Promise.all([
      fetch('/api/habits'),
      fetch(`/api/completions?from=${todayStr}`),
    ])
    if (hRes.status === 401) { router.push('/login'); return }
    const hData = await hRes.json()
    const cData = await cRes.json()
    if (Array.isArray(hData)) setHabits(hData)
    if (Array.isArray(cData)) setDone(new Set(cData.filter(c => c.date === todayStr).map(c => c.habitId)))
    setLoading(false)
  }

  async function toggle(habitId) {
    setDone(prev => { const n = new Set(prev); n.has(habitId) ? n.delete(habitId) : n.add(habitId); return n })
    await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, date: todayStr }),
    })
  }

  const doneCount = done.size
  const total = habits.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  if (loading) return <Loader />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: '40px 36px', maxWidth: 680 }} className="ht-main">

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Today's Habits ✅</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 5 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{
            background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)',
            padding: '18px 22px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {doneCount === total ? '🎉 All done!' : `${doneCount} of ${total} completed`}
              </span>
              <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--accent2)' }}>{pct}%</span>
            </div>
            <div style={{ height: 7, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: 'linear-gradient(90deg, #6366f1, #818cf8)',
                borderRadius: 8, transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        )}

        {/* Habit list */}
        {habits.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'var(--bg2)', borderRadius: 18, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>📋</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>No habits yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>Add habits first to start tracking</p>
            <a href="/habits" style={{
              padding: '10px 22px', background: 'var(--accent)', color: '#fff',
              borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 800,
            }}>➕ Add Habits</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {habits.map(h => {
              const isDone = done.has(h.id)
              return (
                <button key={h.id} onClick={() => toggle(h.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 20px', borderRadius: 14,
                  border: `1.5px solid ${isDone ? h.color + '55' : 'var(--border)'}`,
                  background: isDone ? h.color + '15' : 'var(--bg2)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
                }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                    border: `2px solid ${isDone ? h.color : 'var(--border)'}`,
                    background: isDone ? h.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 13, fontWeight: 900, transition: 'all 0.18s',
                  }}>{isDone ? '✓' : ''}</div>

                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                    background: h.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21,
                  }}>{h.icon}</div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 700,
                      color: isDone ? 'var(--muted)' : 'var(--text)',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{h.category}</div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: isDone ? '#22c55e' : 'var(--muted)', flexShrink: 0 }}>
                    {isDone ? '✅ Done' : 'Tap'}
                  </div>
                </button>
              )
            })}
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

function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading…</div>
    </div>
  )
}
