'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const floatingCards = [
  { icon: '💪', label: 'Workout', color: '#6366f1', x: '8%', y: '15%', delay: '0s', duration: '7s' },
  { icon: '📚', label: 'Read', color: '#22c55e', x: '65%', y: '10%', delay: '1s', duration: '8s' },
  { icon: '🧘', label: 'Meditate', color: '#f59e0b', x: '20%', y: '55%', delay: '2s', duration: '6s' },
  { icon: '💧', label: 'Hydrate', color: '#06b6d4', x: '70%', y: '50%', delay: '0.5s', duration: '9s' },
  { icon: '😴', label: 'Sleep 8h', color: '#a78bfa', x: '40%', y: '75%', delay: '1.5s', duration: '7.5s' },
  { icon: '🏃', label: 'Run', color: '#ec4899', x: '80%', y: '78%', delay: '3s', duration: '6.5s' },
]

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!form.username || !form.password) { setError('Fill in all fields'); return }
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.push('/')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg)',
    }}>
      {/* ═══ LEFT SIDE — Decorative ═══ */}
      <div className="auth-left" style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Dot grid background */}
        <div className="dot-grid-bg" style={{
          position: 'absolute', inset: 0,
        }} />

        {/* Gradient orbs */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '10%', left: '20%',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
          bottom: '15%', right: '10%',
          filter: 'blur(50px)',
        }} />

        {/* Floating habit cards */}
        {floatingCards.map((card, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: card.x, top: card.y,
            animation: `float ${card.duration} ease-in-out infinite`,
            animationDelay: card.delay,
          }}>
            <div style={{
              background: 'rgba(18, 18, 26, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: card.color + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{card.label}</div>
                <div style={{ fontSize: 11, color: card.color, fontWeight: 600 }}>Daily</div>
              </div>
            </div>
          </div>
        ))}

        {/* Center branding */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔥</div>
          <h2 className="gradient-text" style={{
            fontSize: 36, fontWeight: 900, letterSpacing: '-1px',
          }}>HabitFlow</h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 10 }}>
            Build better habits, one day at a time
          </p>
        </div>
      </div>

      {/* ═══ RIGHT SIDE — Form ═══ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 28px)',
        position: 'relative',
      }}>
        <div className="animate-fadeIn auth-form" style={{
          width: '100%', maxWidth: 420,
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 24, padding: '48px 36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{
              fontSize: 28, fontWeight: 900, marginBottom: 8,
              letterSpacing: '-0.5px',
            }}>Welcome back</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
              Sign in to continue your streak
            </p>
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Username</label>
              <div className="gradient-border-wrap">
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                  placeholder="your_username"
                  style={inputStyle}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div className="gradient-border-wrap">
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handle()}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
            </div>

            {error && (
              <div className="animate-scaleIn" style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12, padding: '12px 16px',
                fontSize: 13, color: '#ef4444', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              onClick={handle}
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '14px', fontSize: 15, fontWeight: 800,
                borderRadius: 14, marginTop: 4,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
              No account?{' '}
              <Link href="/register" style={{
                color: 'var(--accent2)', fontWeight: 700,
                transition: 'color 0.2s',
              }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}

const labelStyle = {
  fontSize: 11, fontWeight: 800, color: 'var(--muted)',
  display: 'block', marginBottom: 8,
  textTransform: 'uppercase', letterSpacing: '0.08em',
}
const inputStyle = {
  width: '100%', padding: '13px 16px', borderRadius: 10,
  border: '1.5px solid var(--border)',
  background: 'var(--bg3)', color: 'var(--text)', fontSize: 14,
}
