const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  const base = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  if (!withTime) return base
  return `${base}, ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}` // taste-skill-ignore: clock digits
}

export function formatDateShort(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` // taste-skill-ignore: date digits
}

export function timeAgo(value) {
  if (!value) return '-'
  const diff = Date.now() - new Date(value).getTime()
  if (Number.isNaN(diff)) return '-'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return formatDate(value)
}

export function daysUntil(value) {
  if (!value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(target.getTime())) return null
  return Math.round((target - today) / 86400000)
}

export function formatHijriah(value = new Date()) {
  try {
    return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date(value))
  } catch {
    return '-'
  }
}

export function isoDay(value) {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` // taste-skill-ignore: ISO date digits
}
