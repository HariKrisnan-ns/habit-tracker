'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 400, background: 'var(--bg2)',
        borderRadius: 20, border: '1px solid var(--border)', padding: '44px 36px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🔥</div>
          <h1 style={{
            fontSize: 26, fontWeight: 900,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>HabitFlow</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>
            Sign in to continue your streak
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Username" value={form.username}
            onChange={v => setForm(f => ({ ...f, username: v }))}
            placeholder="your_username" onEnter={handle} />
          <Field label="Password" type="password" value={form.password}
            onChange={v => setForm(f => ({ ...f, password: v }))}
            placeholder="••••••••" onEnter={handle} />

          {error && <ErrorBox msg={error} />}

          <button onClick={handle} disabled={loading} style={btnStyle(loading)}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            No account?{' '}
            <Link href="/register" style={{ color: 'var(--accent2)', fontWeight: 700, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, onEnter }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter()}
        placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

function ErrorBox({ msg }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
      color: '#ef4444', fontWeight: 600,
    }}>⚠️ {msg}</div>
  )
}

const labelStyle = {
  fontSize: 11, fontWeight: 800, color: 'var(--muted)',
  display: 'block', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: '0.07em',
}
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid var(--border)', background: 'var(--bg3)',
  color: 'var(--text)', fontSize: 14,
}
const btnStyle = (loading) => ({
  padding: '13px', borderRadius: 12, border: 'none',
  background: 'linear-gradient(135deg, #6366f1, #818cf8)',
  color: '#fff', fontSize: 15, fontWeight: 800,
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.7 : 1, marginTop: 4,
  boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
})
