'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
          <div style={{ fontSize: 52, marginBottom: 14 }}>🌱</div>
          <h1 style={{
            fontSize: 26, fontWeight: 900,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8 }}>
            Start building better habits today
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'username', label: 'Username', type: 'text', ph: 'choose_a_username' },
            { key: 'password', label: 'Password', type: 'password', ph: '••••••••' },
            { key: 'confirm',  label: 'Confirm Password', type: 'password', ph: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handle()}
                placeholder={f.ph} style={inputStyle} />
            </div>
          ))}

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', fontSize: 13,
              color: '#ef4444', fontWeight: 600,
            }}>⚠️ {error}</div>
          )}

          <button onClick={handle} disabled={loading} style={{
            padding: '13px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            color: '#fff', fontSize: 15, fontWeight: 800,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: 4,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            {loading ? 'Creating account…' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent2)', fontWeight: 700, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
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
