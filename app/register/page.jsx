'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const floatingCards = [
  { icon: '🎯', label: 'Set Goals', color: '#6366f1', x: '10%', y: '12%', delay: '0s', duration: '7s' },
  { icon: '🔥', label: 'Streaks', color: '#f59e0b', x: '60%', y: '8%', delay: '1.2s', duration: '8s' },
  { icon: '📈', label: 'Progress', color: '#22c55e', x: '15%', y: '58%', delay: '0.8s', duration: '6.5s' },
  { icon: '⚡', label: 'Habits', color: '#a78bfa', x: '72%', y: '52%', delay: '2s', duration: '7.5s' },
  { icon: '🏆', label: 'Achieve', color: '#ec4899', x: '45%', y: '80%', delay: '1.5s', duration: '8.5s' },
  { icon: '✨', label: 'Grow', color: '#06b6d4', x: '78%', y: '82%', delay: '0.5s', duration: '6s' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setError('')
    if (!form.username || !form.password) { setError('Fill in all fields'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    router.push('/')
  }

  const fields = [
    { key: 'username', label: 'Username', type: 'text', ph: 'choose_a_username' },
    { key: 'password', label: 'Password', type: 'password', ph: '••••••••' },
    { key: 'confirm', label: 'Confirm Password', type: 'password', ph: '••••••••' },
  ]

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
        {/* Dot grid */}
        <div className="dot-grid-bg" style={{ position: 'absolute', inset: 0 }} />

        {/* Gradient orbs */}
        <div style={{
          position: 'absolute', width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)',
          top: '20%', right: '15%', filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          bottom: '10%', left: '15%', filter: 'blur(50px)',
        }} />

        {/* Floating cards */}
        {floatingCards.map((card, i) => (
          <div key={i} style={{
            position: 'absolute', left: card.x, top: card.y,
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
                <div style={{ fontSize: 11, color: card.color, fontWeight: 600 }}>Track it</div>
              </div>
            </div>
          </div>
        ))}

        {/* Center branding */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌱</div>
          <h2 className="gradient-text" style={{
            fontSize: 36, fontWeight: 900, letterSpacing: '-1px',
          }}>HabitFlow</h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 10 }}>
            Start your journey to better habits
          </p>
        </div>
      </div>

      {/* ═══ RIGHT SIDE — Form ═══ */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 28px)', position: 'relative',
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
            }}>Create Account</h1>
            <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
              Start building better habits today
            </p>
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <div className="gradient-border-wrap">
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handle()}
                    placeholder={f.ph}
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}

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
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{
                color: 'var(--accent2)', fontWeight: 700,
                transition: 'color 0.2s',
              }}>
                Sign in
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
