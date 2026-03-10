'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/',        icon: '🏠', label: 'Dashboard' },
  { href: '/today',   icon: '✅', label: 'Today'     },
  { href: '/habits',  icon: '⚡', label: 'Habits'    },
  { href: '/weekly',  icon: '📊', label: 'Weekly'    },
  { href: '/monthly', icon: '📈', label: 'Monthly'   },
]

export default function Navbar({ username }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '28px 12px',
        zIndex: 100, gap: 4,
      }} className="ht-sidebar">

        {/* Brand */}
        <div style={{ padding: '6px 14px', marginBottom: 28 }}>
          <div style={{
            fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>🔥 HabitFlow</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>@{username}</div>
        </div>

        {/* Links */}
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 14px', borderRadius: 10,
              textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
              color: active ? '#fff' : 'var(--muted)',
              background: active ? 'var(--accent)' : 'transparent',
              transition: 'all 0.15s',
              boxShadow: active ? '0 4px 14px rgba(99,102,241,0.35)' : 'none',
            }}>
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        {/* Logout */}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} disabled={loggingOut} style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            background: 'transparent', border: 'none',
            color: 'var(--muted)', fontSize: 13.5, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 11,
          }}>
            <span>🚪</span> {loggingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)',
      }} className="ht-bottomnav">
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2, textDecoration: 'none',
              padding: '10px 0 8px',
              color: active ? 'var(--accent2)' : 'var(--muted)',
              fontSize: 10, fontWeight: 700,
              borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
            }}>
              <span style={{ fontSize: 19 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <style>{`
        .ht-sidebar { display: flex !important; }
        .ht-bottomnav { display: none !important; }
        @media (max-width: 768px) {
          .ht-sidebar { display: none !important; }
          .ht-bottomnav { display: flex !important; }
        }
      `}</style>
    </>
  )
}
