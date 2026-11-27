import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PenLine, Plus, Trash2 } from 'lucide-react'
import SEOHead from '../../components/common/SEOHead'
import StatusMark from '../../components/admin/StatusMark'
import { LoadingLine } from '../../components/common/Loader'
import { getPosts, deletePost, updatePostStatus } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatDate'

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'published', label: 'Terbit' },
  { key: 'pending', label: 'Menunggu' },
  { key: 'draft', label: 'Draf' },
]

export default function PostList() {
  const [params, setParams] = useSearchParams()
  const tab = tabs.some((t) => t.key === params.get('status')) ? params.get('status') : 'all'
  const [search, setSearch] = useState(params.get('q') || '')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAdmin, user } = useAuth()

  const load = () => {
    setLoading(true)
    getPosts({
      status: tab,
      search: params.get('q') || '',
    })
      .then(setPosts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab, params.get('q')])

  const setTab = (key) => {
    const next = new URLSearchParams(params)
    if (key === 'all') next.delete('status'); else next.set('status', key)
    setParams(next)
  }

  const submitSearch = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(params)
    if (search.trim()) next.set('q', search.trim()); else next.delete('q')
    setParams(next)
  }

  const act = async (fn) => {
    setError('')
    try { await fn(); load() } catch (e) { setError(e.message) }
  }

  return (
    <>
      <SEOHead title="Semua berita" type="website" />
      <div className="admin-title-row">
        <div>
          <h1>Semua berita</h1>
          <p>{posts.length} tulisan pada tampilan ini. Penulis hanya mengubah draf miliknya sendiri.</p>
        </div>
        <div className="admin-actions">
          <Link className="btn-primary" to="/admin/berita/baru" style={{ display: 'grid', placeItems: 'center' }}>
            <Plus size={15} /> Tulis berita
          </Link>
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="admin-tabs" role="tablist" aria-label="Status berita">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`admin-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form className="admin-toolbar" onSubmit={submitSearch} role="search">
        <label className="sr-only" htmlFor="post-search">Cari judul berita</label>
        <input
          id="post-search"
          className="admin-topbar-search"
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul berita"
        />
        <button className="btn-outline" type="submit">Cari</button>
        <span className="count">{posts.length} berita</span>
      </form>

      {loading ? <LoadingLine /> : posts.length === 0 ? (
        <div className="empty-panel">Belum ada berita pada status ini.</div>
      ) : (
        <div className="admin-panel" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Judul</th><th>Kategori</th><th>Status</th><th className="num">Pembaca</th><th className="num">Tanggal</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const canEdit = isAdmin || (p.author_id === user?.id && p.status !== 'published')
                return (
                  <tr key={p.id}>
                    <td className="identity">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {p.thumbnail_url && <img className="row-thumb" src={p.thumbnail_url} alt="" loading="lazy" />}
                        <div>
                          {canEdit ? <Link to={`/admin/berita/${p.id}`}>{p.title}</Link> : <span>{p.title}</span>}
                          <small>{p.author?.full_name || 'Penulis'} · {p.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.category?.name || 'Tanpa kategori'}</td>
                    <td><StatusMark status={p.status} /></td>
                    <td className="num">{p.views_count || 0}</td>
                    <td className="num">{formatDateShort(p.published_at || p.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {canEdit && <Link className="btn-link" to={`/admin/berita/${p.id}`} aria-label={`Edit ${p.title}`}><PenLine size={14} /> Edit</Link>}
                        {isAdmin && p.status !== 'published' && (
                          <button className="btn-link" onClick={() => act(() => updatePostStatus(p.id, 'published'))}>Terbitkan</button>
                        )}
                        {isAdmin && p.status === 'pending' && (
                          <button className="btn-link" onClick={() => act(() => updatePostStatus(p.id, 'draft'))}>Kembalikan</button>
                        )}
                        {isAdmin && <button className="btn-danger" onClick={() => window.confirm(`Hapus berita “${p.title}”?`) && act(() => deletePost(p.id))} aria-label={`Hapus ${p.title}`}><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
