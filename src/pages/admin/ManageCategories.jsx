import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import { LoadingLine } from '../../components/common/Loader'
import { getCategories, saveCategory, deleteCategory, getPosts } from '../../lib/api'
import { slugifyLocal } from '../../utils/adminHelpers'

const empty = { name: '', slug: '', description: '' }

export default function ManageCategories() {
  const [items, setItems] = useState([])
  const [counts, setCounts] = useState({})
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([getCategories(), getPosts({ status: 'all' })])
      .then(([cats, posts]) => {
        setItems(cats)
        setCounts(cats.reduce((acc, c) => ({ ...acc, [c.id]: posts.filter((p) => p.category_id === c.id).length }), {}))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaved('')
    if (!form.name.trim()) { setError('Nama kategori wajib diisi.'); return }
    try {
      await saveCategory({ ...form, slug: form.slug || slugifyLocal(form.name) })
      setSaved('Kategori tersimpan.')
      setForm(empty); setEditing(false); load()
    } catch (err) { setError(err.message) }
  }

  const remove = async (item) => {
    if (!window.confirm(`Hapus kategori “${item.name}”? Berita di dalamnya akan tetap ada tanpa kategori.`)) return
    try { await deleteCategory(item.id); load() } catch (e) { setError(e.message) }
  }

  return (
    <>
      <SEOHead title="Kategori berita" type="website" />
      <div className="admin-title-row">
        <div><h1>Kategori berita</h1><p>{items.length} kategori dipakai untuk mengelompokkan tulisan.</p></div>
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {saved && <p className="alert alert-success">{saved}</p>}

      <div className="admin-two-col">
        <div className="admin-panel" style={{ padding: 0, overflowX: 'auto' }}>
          {loading ? <LoadingLine /> : items.length === 0 ? <div className="empty-panel">Belum ada kategori.</div> : (
            <table className="admin-table">
              <thead><tr><th>Nama</th><th>Slug</th><th className="num">Berita</th><th>Aksi</th></tr></thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td className="identity">{c.name}<small>{c.description || 'Tanpa deskripsi'}</small></td>
                    <td>{c.slug}</td>
                    <td className="num">{counts[c.id] || 0}</td>
                    <td>
                      <button className="btn-link" onClick={() => { setForm(c); setEditing(true) }}>Edit</button>
                      <button className="btn-danger" onClick={() => remove(c)} style={{ marginLeft: 8 }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form className="admin-panel" onSubmit={submit}>
          <h2>{editing ? 'Edit kategori' : 'Kategori baru'}</h2>
          <div className="field"><label htmlFor="cat-name">Nama</label><input id="cat-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label htmlFor="cat-slug">Slug</label><input id="cat-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Otomatis dari nama" /></div>
          <div className="field"><label htmlFor="cat-desc">Deskripsi</label><textarea id="cat-desc" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="admin-actions">
            <button className="btn-primary" type="submit">{editing ? 'Simpan perubahan' : 'Tambah kategori'}</button>
            {editing && <button className="btn-outline" type="button" onClick={() => { setForm(empty); setEditing(false) }}>Batal</button>}
          </div>
        </form>
      </div>
    </>
  )
}
