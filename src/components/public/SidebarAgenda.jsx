import { Link } from 'react-router-dom'
import { formatDateShort } from '../../utils/formatDate'

export default function SidebarAgenda({ agendas = [] }) {
  return (
    <aside className="admin-panel" style={{ background: 'var(--surface)' }} aria-labelledby="agenda-sidebar-title">
      <h2 id="agenda-sidebar-title" style={{ fontSize: 20 }}>Agenda mendatang</h2>
      {agendas.length === 0 && <p className="muted">Belum ada agenda.</p>}
      <div style={{ display: 'grid', gap: 18 }}>
        {agendas.slice(0, 4).map((a) => (
          <div key={a.id}>
            <p style={{ color: 'var(--accent)', fontSize: 13, margin: '0 0 4px' }}>{formatDateShort(a.event_date)}</p>
            <strong style={{ fontSize: 16, fontWeight: 600 }}>{a.title}</strong>
            {a.location && <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{a.location}</p>}
          </div>
        ))}
      </div>
      <Link className="link-underline" to="/agenda" style={{ display: 'inline-block', marginTop: 24, fontSize: 14 }}>
        Semua agenda
      </Link>
    </aside>
  )
}
