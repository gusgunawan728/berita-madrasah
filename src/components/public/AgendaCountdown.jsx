import { daysUntil, formatDateShort } from '../../utils/formatDate'

/** Satu hal yang hidup di halaman: hitung hari ke agenda berikutnya dari data nyata. */
export default function AgendaCountdown({ agendas = [] }) {
  const upcoming = agendas
    .map((a) => ({ ...a, days: daysUntil(a.event_date) }))
    .filter((a) => a.days !== null && a.days >= 0)
    .sort((a, b) => a.days - b.days)[0]

  if (!upcoming) {
    return (
      <div className="intro-note reveal">
        <span className="note-label">Agenda mendatang</span>
        <p style={{ marginTop: 10 }}>Belum ada agenda terjadwal. Lihat halaman agenda untuk info terbaru.</p>
      </div>
    )
  }

  return (
    <div className="intro-note reveal">
      <strong>{upcoming.days === 0 ? 'Hari ini' : `H-${upcoming.days}`}</strong>
      <span className="note-label" style={{ display: 'block', marginTop: 4 }}>Agenda berikutnya</span>
      <p style={{ marginTop: 8 }}>{upcoming.title}</p>
      <p style={{ color: 'var(--accent)', marginTop: 8 }}>{formatDateShort(upcoming.event_date)}</p>
    </div>
  )
}
