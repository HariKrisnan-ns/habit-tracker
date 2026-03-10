export function today() {
  return new Date().toISOString().split('T')[0]
}

export function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()
}

export function daysInMonth(year, month) {
  const count = new Date(year, month, 0).getDate()
  return Array.from({ length: count }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    const m = String(month).padStart(2, '0')
    return `${year}-${m}-${d}`
  })
}

export function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0
  const sorted = [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a))
  const todayStr = today()
  let streak = 0
  let check = new Date(todayStr)

  for (let i = 0; i < 365; i++) {
    const ds = check.toISOString().split('T')[0]
    if (sorted.includes(ds)) {
      streak++
      check.setDate(check.getDate() - 1)
    } else {
      if (i === 0) { check.setDate(check.getDate() - 1); continue }
      break
    }
  }
  return streak
}

export function shortDay(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })
}

export function shortDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
