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
  const [editing, setEditing] = useState(null) // habit object or null
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

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: 'var(--muted)' }}>Loading…</div></div>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar username="" />
      <main style={{ flex: 1, padding: '40px 36px', maxWidth: 700 }} className="ht-main">

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900 }}>My Habits ⚡</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 5 }}>{habits.length} habit{habits.length !== 1 ? 's' : ''} tracked</p>
          </div>
          <button onClick={openAdd} style={{
            padding: '11px 22px', background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 800,
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>➕ Add Habit</button>
        </div>

        {/* Habit list */}
        {habits.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '70px 20px',
            background: 'var(--bg2)', borderRadius: 18, border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>🌱</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>No habits yet</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 22 }}>Add your first habit to get started</p>
            <button onClick={openAdd} style={{
              padding: '11px 24px', background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer',
            }}>➕ Add First Habit</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {habits.map(h => (
              <div key={h.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 20px', background: 'var(--bg2)',
                borderRadius: 14, border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: h.color + '22', border: `2px solid ${h.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                }}>{h.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    <span style={{
                      background: h.color + '22', color: h.color,
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>{h.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(h)} style={iconBtn}>✏️</button>
                  <button onClick={() => setDeleteId(h.id)} style={{ ...iconBtn, borderColor: 'rgba(239,68,68,0.3)' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit modal */}
      {showForm && (
        <div style={overlay} onClick={closeForm}>
          <div style={modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900 }}>{editing ? 'Edit Habit' : 'New Habit'}</h2>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Habit Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Morning Run" style={inp} autoFocus />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} style={{
                    padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${form.category === c ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.category === c ? 'var(--accent)' : 'var(--bg3)',
                    color: form.category === c ? '#fff' : 'var(--muted)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>{c}</button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Color</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                    width: 32, height: 32, borderRadius: 8, border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`,
                    background: c, cursor: 'pointer',
                  }} />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div style={{ marginBottom: 26 }}>
              <label style={lbl}>Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{
                    width: 40, height: 40, borderRadius: 9, fontSize: 20,
                    border: `2px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.icon === ic ? 'var(--accent)22' : 'var(--bg3)',
                    cursor: 'pointer',
                  }}>{ic}</button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px', background: 'var(--bg3)',
              borderRadius: 12, border: `1.5px solid ${form.color}44`,
              marginBottom: 22,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11,
                background: form.color + '22', border: `2px solid ${form.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21,
              }}>{form.icon}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{form.name || 'Habit name'}</div>
                <div style={{ fontSize: 12, color: form.color, fontWeight: 700, marginTop: 2 }}>{form.category}</div>
              </div>
            </div>

            <button onClick={save} disabled={saving || !form.name.trim()} style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              color: '#fff', fontSize: 15, fontWeight: 800,
              cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !form.name.trim() ? 0.6 : 1,
            }}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={overlay} onClick={() => setDeleteId(null)}>
          <div style={{ ...modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '8px 0 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🗑️</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Delete this habit?</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>All completion history will also be deleted.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{
                flex: 1, padding: '12px', borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => confirmDelete(deleteId)} style={{
                flex: 1, padding: '12px', borderRadius: 10,
                background: '#ef4444', border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ht-main { margin-left: 220px !important; }
        @media (max-width: 768px) {
          .ht-main { margin-left: 0 !important; padding: 24px 16px 90px !important; }
        }
      `}</style>
    </div>
  )
}

const iconBtn = {
  width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)',
  background: 'var(--bg3)', cursor: 'pointer', fontSize: 15,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: 20,
}
const modal = {
  background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--border)',
  padding: '28px', width: '100%', maxWidth: 480,
  maxHeight: '90vh', overflowY: 'auto',
}
const lbl = {
  fontSize: 11, fontWeight: 800, color: 'var(--muted)',
  display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em',
}
const inp = {
  width: '100%', padding: '11px 13px', borderRadius: 9,
  border: '1.5px solid var(--border)', background: 'var(--bg3)',
  color: 'var(--text)', fontSize: 14,
}
