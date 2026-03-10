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
  const [hoveredLink, setHoveredLink] = useState(null)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  // Get user initials for avatar
  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '??'

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside
        className="ht-sidebar"
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: 'var(--sidebar-width)',
          background: 'rgba(12, 12, 18, 0.75)',
          backdropFilter: 'blur(24px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
          borderRight: '1px solid var(--glass-border)',
          display: 'flex', flexDirection: 'column',
          padding: '28px 14px 20px',
          zIndex: 100,
        }}
      >
        {/* ── User Avatar + Brand ── */}
        <div style={{ padding: '0 10px', marginBottom: 32 }}>
          {/* Avatar circle */}
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '0.5px',
            marginBottom: 16,
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          }}>
            {initials}
          </div>

          {/* Brand name */}
          <div style={{
            fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px',
            marginBottom: 4,
          }}>
            <span className="gradient-text">Tracker</span>
          </div>
          <div style={{
            fontSize: 12, color: 'var(--muted)',
            fontWeight: 500,
          }}>
            @{username || 'user'}
          </div>
        </div>

        {/* ── Nav Links ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const active = pathname === item.href
            const hovered = hoveredLink === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredLink(item.href)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 14px', borderRadius: 12,
                  textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
                  color: active ? '#fff' : hovered ? 'var(--text2)' : 'var(--muted)',
                  background: active
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(129,140,248,0.8))'
                    : hovered
                      ? 'rgba(255,255,255,0.04)'
                      : 'transparent',
                  boxShadow: active
                    ? '0 4px 20px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Glow effect behind active link */}
                {active && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    borderRadius: 12,
                  }} />
                )}
                <span style={{
                  fontSize: 18,
                  filter: active ? 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' : 'none',
                  transition: 'filter 0.2s',
                  position: 'relative', zIndex: 1,
                }}>{item.icon}</span>
                <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* ── Bottom Section: Logout ── */}
        <div style={{ marginTop: 'auto' }}>
          {/* Divider */}
          <div style={{
            height: 1,
            background: 'var(--glass-border)',
            margin: '16px 10px',
          }} />

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--muted)'
            }}
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 12,
              background: 'transparent', border: 'none',
              color: 'var(--muted)', fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: 18 }}>🚪</span>
            {loggingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>
      </aside>

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      <nav
        className="ht-bottomnav"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(10, 10, 15, 0.85)',
          backdropFilter: 'blur(24px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex', zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {navItems.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3, textDecoration: 'none',
                padding: '10px 0 8px',
                color: active ? '#fff' : 'var(--muted)',
                fontSize: 10, fontWeight: 700,
                transition: 'color 0.2s',
                position: 'relative',
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20, height: 3,
                  background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 2px 10px rgba(99,102,241,0.5)',
                }} />
              )}
              <span style={{
                fontSize: 20,
                filter: active ? 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' : 'none',
                transition: 'filter 0.2s, transform 0.2s',
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}>{item.icon}</span>
              <span style={{
                color: active ? 'var(--accent2)' : 'var(--muted)',
              }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
