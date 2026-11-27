import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import SEOHead from '../../components/common/SEOHead'
import RichTextEditor from '../../components/admin/RichTextEditor'
import ImageUploader from '../../components/admin/ImageUploader'
import StatusMark from '../../components/admin/StatusMark'
import { LoadingLine } from '../../components/common/Loader'
import { getCategories, getPostById, savePost } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { uniqueSlug } from '../../utils/slugify'
import { formatDate } from '../../utils/formatDate'

export default function PostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', thumbnail_url: '',
    category_id: '', status: 'draft', is_featured: false,
  })

  useEffect(() => {
    let active = true
    Promise.all([getCategories(), id ? getPostById(id) : Promise.resolve(null)])
      .then(([cats, found]) => {
        if (!active) return
        setCategories(cats)
        if (found) {
          setPost(found)
          setForm({
            title: found.title, slug: found.slug, excerpt: found.excerpt || '',
            content: found.content || '', thumbnail_url: found.thumbnail_url || '',
            category_id: found.category_id || '', status: found.status,
            is_featured: Boolean(found.is_featured),
          })
        }
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  if (loading) return <LoadingLine />
  if (id && !post) return <Navigate to="/admin/berita" replace />
  if (post && !isAdmin && post.author_id !== user?.id) return <Navigate to="/admin/berita" replace />

  const change = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const changeTitle = (value) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: post ? f.slug : uniqueSlug(value, []),
    }))
  }

  const submit = async (status) => {
    setError(''); setSaved('')
    if (!form.title.trim()) { setError('Judul berita wajib diisi.'); return }
    if (!form.content.replace(/<[^>]*>/g, '').trim()) { setError('Isi berita wajib diisi.'); return }
    setBusy(true)
    try {
      const result = await savePost({
        ...form,
        id: post?.id,
        status,
        author_id: post?.author_id || user.id,
        category_id: form.category_id || null,
      })
      setPost((p) => p || result)
      setForm((f) => ({ ...f, status, slug: result.slug || f.slug }))
      setSaved(status === 'published' ? 'Berita diterbitkan.' : status === 'pending' ? 'Berita diajukan untuk tinjauan.' : 'Draf tersimpan.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SEOHead title={post ? 'Edit berita' : 'Tulis berita'} type="website" />
      <div className="admin-title-row">
        <div>
          <h1>{post ? 'Edit berita' : 'Tulis berita'}</h1>
          <p>{post ? `Dibuat ${formatDate(post.created_at, { withTime: true })}` : 'Berita baru disimpan sebagai draf sebelum diajukan.'}</p>
        </div>
        <div className="admin-actions">
          <Link className="btn-outline" to="/admin/berita" style={{ display: 'grid', placeItems: 'center' }}>Kembali</Link>
          <button className="btn-primary" type="button" disabled={busy} onClick={() => submit('draft')}>Simpan draf</button>
        </div>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {saved && <p className="alert alert-success">{saved} <Link className="btn-link" to="/admin/berita">Kembali ke daftar</Link></p>}

      <div className="editor-shell">
        <div className="admin-grid">
          <section className="admin-panel" aria-label="Isi berita">
            <div className="field">
              <label htmlFor="post-title">Judul</label>
              <input id="post-title" value={form.title} onChange={(e) => changeTitle(e.target.value)} placeholder="Judul berita" />
            </div>
            <div className="field">
              <label htmlFor="post-excerpt">Ringkasan</label>
              <textarea id="post-excerpt" value={form.excerpt} onChange={(e) => change('excerpt', e.target.value)} placeholder="Satu atau dua kalimat ringkasan" />
              <p className="field-hint">Ditampilkan di kartu berita dan sebagai deskripsi pencarian.</p>
            </div>
            <div className="field">
              <label htmlFor="post-content">Isi berita</label>
              <RichTextEditor value={form.content} onChange={(v) => change('content', v)} />
            </div>
          </section>
        </div>

        <div className="admin-grid">
          <section className="admin-panel" aria-labelledby="publish-title">
            <h2 id="publish-title">Publikasi</h2>
            <p style={{ margin: '0 0 16px' }}><StatusMark status={form.status} /></p>
            <div style={{ display: 'grid', gap: 8 }}>
              <button className="btn-quiet" type="button" disabled={busy} onClick={() => submit('draft')}>Simpan draf</button>
              <button className="btn-quiet" type="button" disabled={busy} onClick={() => submit('pending')}>Ajukan tinjauan</button>
              {isAdmin && (
                <button className="btn-primary" type="button" disabled={busy} onClick={() => submit('published')}>Terbitkan sekarang</button>
              )}
              {isAdmin && form.status === 'published' && (
                <button className="btn-outline" type="button" disabled={busy} onClick={() => submit('draft')}>Tarik ke draf</button>
              )}
            </div>
            {!isAdmin && <p className="field-hint" style={{ marginTop: 12 }}>Admin Humas yang menyetujui berita sebelum terbit.</p>}
          </section>

          <section className="admin-panel" aria-labelledby="detail-title">
            <h2 id="detail-title">Detail berita</h2>
            <ImageUploader value={form.thumbnail_url} onChange={(v) => change('thumbnail_url', v)} userId={user?.id} />
            <div className="field">
              <label htmlFor="post-category">Kategori</label>
              <select id="post-category" value={form.category_id} onChange={(e) => change('category_id', e.target.value)}>
                <option value="">Tanpa kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="post-slug">Slug URL</label>
              <input id="post-slug" value={form.slug} onChange={(e) => change('slug', e.target.value)} />
              <p className="field-hint">Otomatis dari judul. Hindari mengubahnya setelah berita terbit.</p>
            </div>
            {isAdmin && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.is_featured} onChange={(e) => change('is_featured', e.target.checked)} />
                Jadikan berita utama
              </label>
            )}
            {post?.status === 'published' && (
              <p style={{ marginTop: 16 }}><Link className="btn-link" to={`/berita/${post.slug}`}>Lihat di situs publik</Link></p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
