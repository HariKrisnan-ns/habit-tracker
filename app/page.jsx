import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { habits, completions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import Navbar from '@/components/Navbar'
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

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username={user.username} />
      <main style={{ flex: 1, padding: '40px 36px', maxWidth: 860 }} className="ht-main">

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 900 }}>
            {greeting},{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{user.username}</span> 👋
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }} className="ht-stats">
          {[
            { label: "Today", value: `${todayDone}/${total}`, icon: '✅', color: '#22c55e' },
            { label: "Weekly Rate", value: `${weekPct}%`, icon: '📊', color: '#6366f1' },
            { label: "Habits", value: total, icon: '🎯', color: '#f59e0b' },
            { label: "All Time", value: allCompletions.length, icon: '🏆', color: '#ec4899' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--bg2)', borderRadius: 16,
              border: '1px solid var(--border)', padding: '20px',
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress ring + message */}
        <div style={{
          background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)',
          padding: '28px 32px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 32,
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
              <a href="/habits" style={{
                display: 'inline-block', marginTop: 14, padding: '9px 20px',
                background: 'var(--accent)', color: '#fff', borderRadius: 9,
                textDecoration: 'none', fontSize: 13, fontWeight: 800,
              }}>➕ Add First Habit</a>
            )}
          </div>
        </div>

        {/* Streaks */}
        {habitsWithStreaks.length > 0 && (
          <div style={{
            background: 'var(--bg2)', borderRadius: 20,
            border: '1px solid var(--border)', padding: '28px',
          }}>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>🔥 Streaks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {habitsWithStreaks.map(h => (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 16px', background: 'var(--bg3)',
                  borderRadius: 12, border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: h.color + '22', border: `2px solid ${h.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19,
                  }}>{h.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{h.category}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: h.streak > 0 ? '#f59e0b' : 'var(--muted)' }}>
                      {h.streak > 0 ? `🔥 ${h.streak}` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{h.streak > 0 ? 'day streak' : 'no streak'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .ht-main { margin-left: 220px !important; }
        .ht-stats { grid-template-columns: repeat(4,1fr) !important; }
        @media (max-width: 768px) {
          .ht-main { margin-left: 0 !important; padding: 24px 16px 90px !important; }
          .ht-stats { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  )
}

function Ring({ done, total }) {
  const pct = total > 0 ? done / total : 0
  const r = 42, circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
      <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg3)" strokeWidth="9" />
        <circle cx="55" cy="55" r={r} fill="none" stroke="#6366f1" strokeWidth="9"
          strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{done}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>of {total}</div>
      </div>
    </div>
  )
}
