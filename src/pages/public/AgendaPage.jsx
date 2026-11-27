import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import { getAgendas } from '../../lib/api'
import { daysUntil, formatDate, formatDateShort, formatHijriah } from '../../utils/formatDate'

function AgendaRow({ item, past = false }) {
  const d = daysUntil(item.event_date)
  return (
    <article className="news-card tone-2" style={{ minHeight: 0 }}>
      <div className="news-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'baseline' }}>
          <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0, fontSize: 15 }}>
            {formatDate(item.event_date)}
          </p>
          {!past && d !== null && (
            <strong style={{ fontSize: 28, letterSpacing: '-0.04em' }}>{d === 0 ? 'Hari ini' : `H-${d}`}</strong>
          )}
        </div>
        <h2 style={{ fontSize: 26 }}>{item.title}</h2>
        {item.location && <p className="muted" style={{ margin: 0, fontSize: 15 }}>{item.location}</p>}
        {item.description && <p style={{ margin: 0, fontSize: 16 }}>{item.description}</p>}
        <p className="card-label muted" style={{ marginTop: 8 }}>{formatHijriah(item.event_date)} H · {formatDateShort(item.event_date)}</p>
      </div>
    </article>
  )
}

export default function AgendaPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getAgendas()
      .then((data) => active && setItems(data))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = items.filter((i) => i.event_date >= today)
  const past = items.filter((i) => i.event_date < today).reverse()

  return (
    <>
      <SEOHead title="Agenda madrasah" description="Jadwal ujian, libur, dan kegiatan madrasah." />
      <header className="axis list-head">
        <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>Kalender madrasah</p>
        <h1>Agenda mendatang</h1>
        <p>Jadwal ujian, rapat, kegiatan, dan libur madrasah dalam satu halaman.</p>
      </header>

      <div className="axis">
        {loading && <p className="muted">Memuat agenda…</p>}
        {!loading && upcoming.length === 0 && <p className="empty-state">Belum ada agenda mendatang.</p>}
        {upcoming.length > 0 && (
          <section aria-labelledby="upcoming-title" style={{ paddingBottom: 72 }}>
            <h2 id="upcoming-title" className="sr-only">Agenda mendatang</h2>
            <div className="news-grid">
              {upcoming.map((item) => <AgendaRow key={item.id} item={item} />)}
            </div>
          </section>
        )}
        {past.length > 0 && (
          <section className="section section-surface" aria-labelledby="past-title" style={{ paddingInline: 'calc(var(--margin) * -1)' }}>
            <div className="axis">
              <h2 id="past-title" className="section-heading" style={{ marginBottom: 40 }}>Agenda yang telah lalu</h2>
              <div className="news-grid">
                {past.slice(0, 6).map((item) => <AgendaRow key={item.id} item={item} past />)}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
