'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function TodayPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [done, setDone] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const prevDoneCount = useRef(0)
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
    if (Array.isArray(cData)) {
      const doneSet = new Set(cData.filter(c => c.date === todayStr).map(c => c.habitId))
      setDone(doneSet)
      prevDoneCount.current = doneSet.size
    }
    setLoading(false)
  }

  async function toggle(habitId) {
    setDone(prev => {
      const n = new Set(prev)
      n.has(habitId) ? n.delete(habitId) : n.add(habitId)

      // Check if all done — confetti!
      if (n.size === habits.length && habits.length > 0 && prevDoneCount.current < habits.length) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3500)
      }
      prevDoneCount.current = n.size
      return n
    })
    await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId, date: todayStr }),
    })
  }

  const doneCount = done.size
  const total = habits.length
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  // Dynamic motivation
  const getMotivation = () => {
    const h = new Date().getHours()
    if (h < 6) return { msg: 'Early bird catches the worm! 🌅', sub: 'Start your day with intention' }
    if (h < 12) return { msg: 'Rise & grind! ☀️', sub: 'Morning habits set the tone' }
    if (h < 17) return { msg: 'Keep the momentum going! 🚀', sub: 'Your afternoon push matters' }
    if (h < 21) return { msg: 'Evening wind-down 🌙', sub: 'Complete your daily habits' }
    return { msg: 'Night owl mode 🦉', sub: "There's still time to finish" }
  }
  const motivation = getMotivation()

  if (loading) return <Loader />

  // Sort: uncompleted first, completed at bottom
  const sorted = [...habits].sort((a, b) => {
    const aDone = done.has(a.id) ? 1 : 0
    const bDone = done.has(b.id) ? 1 : 0
    return aDone - bDone
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 36px)', maxWidth: 700 }} className="ht-main">

        {/* ═══ Motivational Header ═══ */}
        <div className="animate-fadeIn" style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
          <h1 className="page-title" style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>
            {motivation.msg}
          </h1>
          <p className="page-subtitle">
            {motivation.sub} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* ═══ Circular Progress Ring ═══ */}
        {total > 0 && (
          <div className="glass-card animate-fadeIn delay-1 progress-section" style={{
            padding: 'clamp(18px, 3vw, 28px)', marginBottom: 24,
            cursor: 'default',
          }}>
            <ProgressRing pct={pct} done={doneCount} total={total} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                {doneCount === total ? '🎉 All done!' : `${doneCount} of ${total} completed`}
              </div>
              {/* Mini progress bar */}
              <div style={{
                height: 6, background: 'var(--bg3)', borderRadius: 8, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: pct === 100
                    ? 'linear-gradient(90deg, #22c55e, #06b6d4)'
                    : 'linear-gradient(90deg, #6366f1, #a78bfa)',
                  borderRadius: 8,
                  transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
                {pct === 100 ? 'Perfect day! You crushed it 🎯' : `${total - doneCount} remaining`}
              </div>
            </div>
          </div>
        )}

        {/* ═══ Habit List ═══ */}
        {habits.length === 0 ? (
          <div className="glass-card animate-fadeIn" style={{
            textAlign: 'center', padding: '70px 20px', cursor: 'default',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No habits yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 22, fontSize: 14 }}>
              Add habits first to start tracking
            </p>
            <a href="/habits" className="btn-primary" style={{
              display: 'inline-block', padding: '11px 24px',
              fontSize: 14, textDecoration: 'none', borderRadius: 12,
            }}>➕ Add Habits</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map((h, i) => {
              const isDone = done.has(h.id)
              return (
                <HabitCard
                  key={h.id}
                  habit={h}
                  isDone={isDone}
                  onToggle={() => toggle(h.id)}
                  delay={i}
                />
              )
            })}
          </div>
        )}
      </main>

      {/* ═══ Confetti ═══ */}
      {showConfetti && <Confetti />}
    </div>
  )
}

/* ─── Habit Card with check animation ─── */
function HabitCard({ habit: h, isDone, onToggle, delay }) {
  const [animating, setAnimating] = useState(false)

  function handleClick() {
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)
    onToggle()
  }

  return (
    <button
      onClick={handleClick}
      className={`animate-fadeIn delay-${Math.min(delay, 7)}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 20px', borderRadius: 16, width: '100%',
        border: `1.5px solid ${isDone ? h.color + '30' : 'var(--glass-border)'}`,
        background: isDone
          ? `linear-gradient(135deg, ${h.color}08, ${h.color}04)`
          : 'var(--glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: animating ? 'scale(0.97)' : 'scale(1)',
        boxShadow: isDone ? `0 0 20px ${h.color}10` : 'none',
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        border: `2px solid ${isDone ? h.color : 'var(--border2)'}`,
        background: isDone ? h.color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 14, fontWeight: 900,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: animating ? 'scale(1.2)' : 'scale(1)',
        boxShadow: isDone ? `0 0 12px ${h.color}40` : 'none',
      }}>
        {isDone ? '✓' : ''}
      </div>

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: h.color + '15',
        border: `1px solid ${h.color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>{h.icon}</div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 15, fontWeight: 700,
          color: isDone ? 'var(--muted)' : 'var(--text)',
          textDecoration: isDone ? 'line-through' : 'none',
          transition: 'color 0.2s',
        }}>{h.name}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{h.category}</div>
      </div>

      {/* Status */}
      <div style={{
        fontSize: 12, fontWeight: 700, flexShrink: 0,
        color: isDone ? '#22c55e' : 'var(--muted)',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {isDone ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 20,
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.15)',
          }}>✅ Done</span>
        ) : (
          <span style={{
            padding: '4px 10px', borderRadius: 20,
            background: 'var(--bg3)',
            border: '1px solid var(--glass-border)',
          }}>Tap</span>
        )}
      </div>
    </button>
  )
}

/* ─── Progress Ring ─── */
function ProgressRing({ pct, done, total }) {
  const r = 46, circ = 2 * Math.PI * r
  const frac = pct / 100
  return (
    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', inset: -6,
        background: frac > 0 ? 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' : 'none',
        borderRadius: '50%',
      }} />
      <svg width="120" height="120" style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg3)" strokeWidth="7" />
        <circle cx="60" cy="60" r={r} fill="none"
          stroke={pct === 100 ? '#22c55e' : '#6366f1'}
          strokeWidth="7"
          strokeDasharray={`${circ * frac} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 24, fontWeight: 900 }}>{pct}%</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{done}/{total}</div>
      </div>
    </div>
  )
}

/* ─── CSS Confetti ─── */
function Confetti() {
  const colors = ['#6366f1', '#a78bfa', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#818cf8']
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }))

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`, top: -20,
          width: p.size, height: p.size * 0.6,
          background: p.color,
          borderRadius: 2,
          opacity: 0.9,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
    </div>
  )
}

/* ─── Loader ─── */
function Loader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--bg3)',
        borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
