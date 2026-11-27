import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PenLine } from 'lucide-react'
import SEOHead from '../../components/common/SEOHead'
import { LoadingLine } from '../../components/common/Loader'
import { getDashboardStats, getAgendas } from '../../lib/api'
import { timeAgo, formatDateShort } from '../../utils/formatDate'
import { useAuth } from '../../context/AuthContext'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [agendas, setAgendas] = useState([])
  const [error, setError] = useState('')
  const { isAdmin } = useAuth()

  useEffect(() => {
    let active = true
    Promise.all([getDashboardStats(), getAgendas(true)])
      .then(([s, a]) => { if (active) { setStats(s); setAgendas(a) } })
      .catch((e) => active && setError(e.message))
    return () => { active = false }
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>
  if (!stats) return <LoadingLine />

  const recentPending = stats.posts.filter((p) => p.status === 'pending')
    .filter((p) => Date.now() - new Date(p.created_at).getTime() < 7 * 86400000).length
  const maxCount = Math.max(...stats.byCategory.map((c) => c.count), 1)

  return (
    <>
      <SEOHead title="Ringkasan redaksi" type="website" />
      <div className="admin-title-row">
        <div>
          <h1>Ringkasan redaksi</h1>
          <p>
            {stats.pending > 0
              ? `${stats.pending} berita menungu tinjauan, ${recentPending} di antaranya masuk minggu ini.`
              : `Belum ada antrian tinjauan. ${stats.published} berita sudah terbit.`}
          </p>
        </div>
        <div className="admin-actions">
          <Link className="btn-primary" to="/admin/berita/baru" style={{ display: 'grid', placeItems: 'center' }}>
            <PenLine size={15} /> Tulis berita
          </Link>
        </div>
      </div>

      <div className="admin-grid" style={{ gap: 'var(--gap)' }}>
        <div className="kpi-strip">
          <div className="kpi-cell">
            <div className="kpi-label">Menunggu tinjauan</div>
            <div className="kpi-value lead">{stats.pending}</div>
            <div className="kpi-caption">dari {stats.total} tulisan</div>
          </div>
          <div className="kpi-cell">
            <div className="kpi-label">Berita terbit</div>
            <div className="kpi-value">{stats.published}</div>
            <div className="kpi-caption">di seluruh kategori</div>
          </div>
          <div className="kpi-cell">
            <div className="kpi-label">Draf</div>
            <div className="kpi-value">{stats.drafts}</div>
            <div className="kpi-caption">belum diajukan</div>
          </div>
          <div className="kpi-cell">
            <div className="kpi-label">Total pembaca</div>
            <div className="kpi-value">{stats.views.toLocaleString('id-ID')}</div>
            <div className="kpi-caption">kumulatif berita terbit</div>
          </div>
        </div>

        <div className="admin-two-col">
          <div className="admin-grid">
            <section className="admin-panel" aria-labelledby="category-chart">
              <h2 id="category-chart">Berita terbit per kategori</h2>
              <div className="chart-bars">
                {stats.byCategory.map((c) => (
                  <div className="chart-row" key={c.name}>
                    <span>{c.name}</span>
                    <div className="chart-track" role="img" aria-label={`${c.name}: ${c.count} berita`}>
                      <div className="chart-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                    </div>
                    <strong>{c.count}</strong>
                  </div>
                ))}
              </div>
              <p className="chart-caption">Dari {stats.published} berita terbit. Kategori tanpa berita tetap ditampilkan.</p>
            </section>

            <section className="admin-panel" aria-labelledby="latest-title">
              <h2 id="latest-title">Tulisan terakhir</h2>
              <table className="admin-table">
                <thead><tr><th>Judul</th><th>Status</th><th className="num">Dibuat</th></tr></thead>
                <tbody>
                  {stats.posts.slice(0, 5).map((p) => (
                    <tr key={p.id}>
                      <td className="identity">
                        <Link to={`/admin/berita/${p.id}`}>{p.title}</Link>
                        <small>{p.author?.full_name || 'Tanpa penulis'}</small>
                      </td>
                      <td><span className={`status-mark status-${p.status}`}>{p.status === 'published' ? 'Terbit' : p.status === 'pending' ? 'Menunggu tinjauan' : 'Draf'}</span></td>
                      <td className="num">{timeAgo(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link className="btn-link" to="/admin/berita">Semua berita</Link>
            </section>
          </div>

          <div className="admin-grid">
            <section aria-labelledby="queue-title">
              <h2 id="queue-title" style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Antrian tinjauan</h2>
              <div className="admin-panel">
                {stats.posts.filter((p) => p.status === 'pending').length === 0 && (
                  <p className="muted" style={{ margin: 0 }}>Tidak ada berita yang menunggu tinjauan.</p>
                )}
                <div style={{ display: 'grid', gap: 14 }}>
                  {stats.posts.filter((p) => p.status === 'pending').slice(0, 4).map((p) => (
                    <div key={p.id}>
                      <Link to={`/admin/berita/${p.id}`} style={{ fontWeight: 500 }}>{p.title}</Link>
                      <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
                        {p.author?.full_name || 'Penulis'} · {timeAgo(p.created_at)}
                      </p>
                      {isAdmin && <Link className="btn-link" to={`/admin/berita/${p.id}`}>Tinjau berita</Link>}
                    </div>
                  ))}
                </div>
                <Link className="btn-outline" to="/admin/berita?status=pending" style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>
                  Lihat antrian
                </Link>
              </div>
            </section>

            <section aria-labelledby="agenda-title">
              <h2 id="agenda-title" style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Agenda dekat</h2>
              <div className="admin-panel">
                {agendas.length === 0 && <p className="muted" style={{ margin: 0 }}>Belum ada agenda mendatang.</p>}
                <div style={{ display: 'grid', gap: 14 }}>
                  {agendas.slice(0, 4).map((a) => (
                    <div key={a.id}>
                      <strong style={{ fontWeight: 500 }}>{a.title}</strong>
                      <p className="muted" style={{ margin: '4px 0 0', fontSize: 12 }}>
                        {formatDateShort(a.event_date)} · {a.location || 'Tanpa lokasi'}
                      </p>
                    </div>
                  ))}
                </div>
                <Link className="btn-outline" to="/admin/agenda" style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>Kelola agenda</Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
