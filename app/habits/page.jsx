'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

const CATEGORIES = ['General', 'Health', 'Learning', 'Productivity', 'Fitness', 'Mindfulness']
const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6','#f97316']
const ICONS = ['⭐','💪','📚','💻','🏃','🧘','💧','🥗','😴','✍️','🎯','🎵','🌱','🔥','⚡','🧠']

const empty = { name: '', category: 'General', color: '#6366f1', icon: '⭐' }

export default function HabitsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { loadHabits() }, [])

  async function loadHabits() {
    const res = await fetch('/api/habits')
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    if (Array.isArray(data)) setHabits(data)
    setLoading(false)
  }

  function openAdd() { setForm(empty); setEditing(null); setShowForm(true) }
  function openEdit(h) { setForm({ name: h.name, category: h.category, color: h.color, icon: h.icon }); setEditing(h); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null); setForm(empty) }

  async function save() {
    if (!form.name.trim()) return
    setSaving(true)
    if (editing) {
      const res = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
      const updated = await res.json()
      setHabits(h => h.map(x => x.id === editing.id ? updated : x))
    } else {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const created = await res.json()
      setHabits(h => [...h, created])
    }
    setSaving(false)
    closeForm()
  }

  async function confirmDelete(id) {
    await fetch('/api/habits', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setHabits(h => h.filter(x => x.id !== id))
    setDeleteId(null)
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--bg3)', borderTopColor: 'var(--accent)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 36px)', maxWidth: 800 }} className="ht-main">

        {/* ═══ Header ═══ */}
        <div className="animate-fadeIn" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'clamp(20px, 4vw, 32px)', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 className="page-title" style={{ fontSize: 'clamp(22px, 4vw, 30px)' }}>
              My Habits <span style={{ fontSize: 'clamp(22px, 4vw, 28px)' }}>⚡</span>
            </h1>
            <p className="page-subtitle">
              {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary" style={{
            padding: '12px 24px', fontSize: 14, borderRadius: 12,
          }}>
            ➕ Add Habit
          </button>
        </div>

        {/* ═══ Habit Grid ═══ */}
        {habits.length === 0 ? (
          <div className="glass-card animate-fadeIn" style={{
            textAlign: 'center', padding: '70px 20px', cursor: 'default',
          }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🌱</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>No habits yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>
              Add your first habit to get started
            </p>
            <button onClick={openAdd} className="btn-primary" style={{
              padding: '12px 26px', fontSize: 14, borderRadius: 12,
            }}>➕ Add First Habit</button>
          </div>
        ) : (
          <div className="habit-grid">
            {habits.map((h, i) => (
              <div
                key={h.id}
                className={`glass-card animate-fadeIn delay-${Math.min(i, 7)}`}
                style={{
                  padding: 0, overflow: 'hidden', cursor: 'default',
                  display: 'flex', position: 'relative',
                }}
              >
                {/* Color strip on left */}
                <div style={{
                  width: 5, background: h.color, flexShrink: 0,
                  borderRadius: '16px 0 0 16px',
                }} />

                <div style={{
                  padding: '18px 18px 18px 16px', flex: 1,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 13, flexShrink: 0,
                    background: h.color + '15',
                    border: `1.5px solid ${h.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>{h.icon}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{h.name}</div>
                    <span style={{
                      display: 'inline-block',
                      background: h.color + '15',
                      color: h.color,
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                      border: `1px solid ${h.color}20`,
                    }}>{h.category}</span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(h)}
                      style={iconBtnStyle}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg4)'; e.currentTarget.style.borderColor = 'var(--border2)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}
                    >✏️</button>
                    <button
                      onClick={() => setDeleteId(h.id)}
                      style={{ ...iconBtnStyle, }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg3)'; e.currentTarget.style.borderColor = 'var(--glass-border)' }}
                    >🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ═══ Add/Edit Modal ═══ */}
      {showForm && (
        <div className="glass-overlay" onClick={closeForm}>
          <div
            className="animate-scaleIn modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 24, padding: '32px',
              width: '100%', maxWidth: 500,
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 900 }}>{editing ? 'Edit Habit' : 'New Habit'}</h2>
              <button onClick={closeForm} style={{
                background: 'var(--bg3)', border: '1px solid var(--glass-border)',
                color: 'var(--muted)', fontSize: 16, cursor: 'pointer',
                width: 34, height: 34, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>✕</button>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Habit Name</label>
              <div className="gradient-border-wrap">
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Morning Run"
                  style={inputStyle}
                  autoFocus
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{
                    padding: '7px 16px', borderRadius: 20,
                    border: `1.5px solid ${form.category === c ? 'var(--accent)' : 'var(--glass-border)'}`,
                    background: form.category === c
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(129,140,248,0.15))'
                      : 'var(--bg3)',
                    color: form.category === c ? '#fff' : 'var(--muted)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: form.category === c ? '0 2px 12px rgba(99,102,241,0.2)' : 'none',
                  }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Color — glowing circle swatches */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Color</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`,
                    background: c, cursor: 'pointer',
                    boxShadow: form.color === c
                      ? `0 0 16px ${c}60, 0 0 32px ${c}30`
                      : `0 2px 8px ${c}30`,
                    transition: 'all 0.2s',
                    transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                  }} />
                ))}
              </div>
            </div>

            {/* Icon — scrollable emoji grid */}
            <div style={{ marginBottom: 26 }}>
              <label style={labelStyle}>Icon</label>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))', gap: 8,
                maxHeight: 160, overflowY: 'auto',
                padding: '4px 2px',
              }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{
                    width: '100%', aspectRatio: '1', borderRadius: 10, fontSize: 22,
                    border: `2px solid ${form.icon === ic ? 'var(--accent)' : 'var(--glass-border)'}`,
                    background: form.icon === ic
                      ? 'rgba(99,102,241,0.15)'
                      : 'var(--bg3)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    transform: form.icon === ic ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{ic}</button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px',
              background: 'var(--bg3)', borderRadius: 14,
              border: `1.5px solid ${form.color}25`,
              marginBottom: 24,
            }}>
              <div style={{
                width: 5, height: 48, borderRadius: 4,
                background: form.color, flexShrink: 0,
              }} />
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: form.color + '15',
                border: `1.5px solid ${form.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{form.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{form.name || 'Habit name'}</div>
                <div style={{
                  fontSize: 12, color: form.color, fontWeight: 700, marginTop: 3,
                }}>{form.category}</div>
              </div>
            </div>

            {/* Save button */}
            <button onClick={save} disabled={saving || !form.name.trim()} className="btn-primary" style={{
              width: '100%', padding: '14px', fontSize: 15, fontWeight: 800,
              borderRadius: 14,
              opacity: saving || !form.name.trim() ? 0.5 : 1,
              cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer',
            }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Delete Confirmation Sheet ═══ */}
      {deleteId && (
        <div className="glass-overlay" onClick={() => setDeleteId(null)}>
          <div
            className="animate-slideUp modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 24, padding: '32px',
              maxWidth: 380, width: '100%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.15)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 16,
              }}>🗑️</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Delete this habit?</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
                All completion history will also be permanently deleted.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} className="btn-ghost" style={{
                flex: 1, padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              }}>Cancel</button>
              <button onClick={() => confirmDelete(deleteId)} className="btn-danger" style={{
                flex: 1, padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 800,
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const iconBtnStyle = {
  width: 36, height: 36, borderRadius: 10,
  border: '1px solid var(--glass-border)',
  background: 'var(--bg3)', cursor: 'pointer', fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
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
