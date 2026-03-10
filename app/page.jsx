import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { habits, completions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import Navbar from '@/components/Navbar'
import WeeklyChart from '@/components/WeeklyChart'
import { calculateStreak, today, last7Days } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const todayStr = today()
  const last7 = last7Days()

  const userHabits = await db.select().from(habits).where(eq(habits.userId, user.id))
  const allCompletions = await db.select().from(completions).where(eq(completions.userId, user.id))

  const todayDone = allCompletions.filter(c => c.date === todayStr).length
  const total = userHabits.length

  const weekStart = last7[0]
  const weekCompletions = allCompletions.filter(c => c.date >= weekStart)
  const weekPct = total > 0 ? Math.round((weekCompletions.length / (total * 7)) * 100) : 0

  const habitsWithStreaks = userHabits.map(h => {
    const dates = allCompletions.filter(c => c.habitId === h.id).map(c => c.date)
    return { ...h, streak: calculateStreak(dates) }
  }).sort((a, b) => b.streak - a.streak)

  // Build chart data for last 7 days
  const chartData = last7.map(date => {
    const dayCompletions = allCompletions.filter(c => c.date === date).length
    const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
    return { day: dayLabel, count: dayCompletions }
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const bestStreak = habitsWithStreaks.length > 0 ? habitsWithStreaks[0].streak : 0

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username={user.username} />
      <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 36px)', maxWidth: 'var(--content-max)' }} className="ht-main">

        {/* ═══ Hero Greeting ═══ */}
        <div className="animate-fadeIn" style={{ marginBottom: 'clamp(24px, 4vw, 36px)' }}>
          <h1 className="page-title" style={{ fontSize: 'clamp(24px, 4vw, 32px)' }}>
            {greeting},{' '}
            <span className="gradient-text">{user.username}</span> 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8, fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* ═══ Stat Cards ═══ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }} className="ht-stats">
          {[
            { label: 'Today', value: `${todayDone}/${total}`, icon: '✅', color: '#22c55e', glowColor: 'rgba(34,197,94,0.15)' },
            { label: 'Weekly Rate', value: `${weekPct}%`, icon: '📊', color: '#6366f1', glowColor: 'rgba(99,102,241,0.15)' },
            { label: 'Habits', value: total, icon: '🎯', color: '#f59e0b', glowColor: 'rgba(245,158,11,0.15)' },
            { label: 'Best Streak', value: `🔥 ${bestStreak}`, icon: '🏆', color: '#ec4899', glowColor: 'rgba(236,72,153,0.15)' },
          ].map((s, i) => (
            <div key={s.label} className={`glass-card animate-fadeIn delay-${i}`} style={{
              padding: '22px 20px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Icon glow */}
              <div style={{
                position: 'absolute', top: -10, right: -10,
                width: 60, height: 60, borderRadius: '50%',
                background: s.glowColor, filter: 'blur(20px)',
              }} />
              <div style={{ fontSize: 28, marginBottom: 10, position: 'relative' }}>{s.icon}</div>
              <div style={{
                fontSize: 26, fontWeight: 900, color: s.color,
                position: 'relative', letterSpacing: '-0.5px',
              }}>{s.value}</div>
              <div style={{
                fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em', position: 'relative',
              }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ Progress Ring + Message ═══ */}
        <div className="glass-card animate-fadeIn delay-3 progress-section" style={{
          padding: 'clamp(20px, 3vw, 28px) clamp(20px, 3vw, 32px)', marginBottom: 20,
          cursor: 'default',
        }}>
          <Ring done={todayDone} total={total} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Today's Progress</div>
            <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.7 }}>
              {total === 0 && 'No habits yet — add some to get started!'}
              {total > 0 && todayDone === 0 && "Let's go! Mark your first habit for today 💪"}
              {todayDone > 0 && todayDone < total && `${total - todayDone} more habit${total - todayDone > 1 ? 's' : ''} to complete today.`}
              {todayDone > 0 && todayDone === total && '🎉 Perfect day! All habits completed!'}
            </div>
            {total === 0 && (
              <a href="/habits" className="btn-primary" style={{
                display: 'inline-block', marginTop: 14, padding: '10px 22px',
                fontSize: 13, borderRadius: 10, textDecoration: 'none',
              }}>➕ Add First Habit</a>
            )}
          </div>
        </div>

        {/* ═══ Weekly Chart ═══ */}
        {total > 0 && <div style={{ marginBottom: 20 }}><WeeklyChart data={chartData} /></div>}

        {/* ═══ Streaks ═══ */}
        {habitsWithStreaks.length > 0 && (
          <div className="glass-card animate-fadeIn delay-5" style={{
            padding: '28px', cursor: 'default',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            }}>
              <span style={{ fontSize: 20 }}>🔥</span>
              <h3 style={{ fontSize: 17, fontWeight: 800 }}>Streaks</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {habitsWithStreaks.map((h, i) => (
                <div key={h.id} className={`animate-fadeIn delay-${Math.min(i, 7)}`} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  background: h.streak > 0
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(239,68,68,0.04))'
                    : 'var(--bg3)',
                  borderRadius: 14,
                  border: `1px solid ${h.streak > 0 ? 'rgba(245,158,11,0.12)' : 'var(--glass-border)'}`,
                  transition: 'all 0.2s ease',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                    background: h.color + '18',
                    border: `1.5px solid ${h.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{h.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{h.category}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 18, fontWeight: 900,
                      color: h.streak > 0 ? '#f59e0b' : 'var(--muted)',
                    }}>
                      {h.streak > 0 ? `🔥 ${h.streak}` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {h.streak > 0 ? 'day streak' : 'no streak'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Ring({ done, total }) {
  const pct = total > 0 ? done / total : 0
  const r = 44, circ = 2 * Math.PI * r
  const pctDisplay = total > 0 ? Math.round(pct * 100) : 0
  return (
    <div style={{ position: 'relative', width: 116, height: 116, flexShrink: 0 }}>
      {/* Glow behind ring */}
      <div style={{
        position: 'absolute', inset: -8,
        background: pct > 0 ? 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' : 'none',
        borderRadius: '50%',
      }} />
      <svg width="116" height="116" style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
        {/* Track */}
        <circle cx="58" cy="58" r={r} fill="none" stroke="var(--bg3)" strokeWidth="8" />
        {/* Progress */}
        <circle cx="58" cy="58" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="8"
          strokeDasharray={`${circ * pct} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>{pctDisplay}%</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>{done}/{total}</div>
      </div>
    </div>
  )
}
