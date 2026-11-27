import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import ImageUploader from '../../components/admin/ImageUploader'
import { LoadingLine } from '../../components/common/Loader'
import { getGallery, saveGalleryItem, deleteGalleryItem } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { formatDateShort } from '../../utils/formatDate'

const empty = { title: '', image_url: '', caption: '', taken_at: '' }

export default function ManageGallery() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const { user } = useAuth()

  const load = () => {
    setLoading(true)
    getGallery().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaved('')
    if (!form.title.trim() || !form.image_url) { setError('Judul dan gambar wajib diisi.'); return }
    try {
      await saveGalleryItem(form)
      setSaved('Foto galeri tersimpan.'); setForm(empty); setEditing(false); load()
    } catch (err) { setError(err.message) }
  }

  return (
    <>
      <SEOHead title="Kelola galeri" type="website" />
      <div className="admin-title-row">
        <div><h1>Galeri foto</h1><p>{items.length} foto kegiatan ditampilkan di halaman galeri publik.</p></div>
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {saved && <p className="alert alert-success">{saved}</p>}

      <div className="admin-two-col">
        <div className="admin-panel">
          {loading ? <LoadingLine /> : items.length === 0 ? <div className="empty-panel">Belum ada foto.</div> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
              {items.map((item) => (
                <div key={item.id}>
                  <img src={item.image_url} alt={item.caption || item.title} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} loading="lazy" />
                  <strong style={{ display: 'block', marginTop: 8, fontSize: 13 }}>{item.title}</strong>
                  <span className="field-hint">{item.taken_at ? formatDateShort(item.taken_at) : 'Tanpa tanggal'}</span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn-link" onClick={() => { setForm(item); setEditing(true) }}>Edit</button>
                    <button className="btn-danger" onClick={() => window.confirm(`Hapus foto “${item.title}”?`) && deleteGalleryItem(item.id).then(load)}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form className="admin-panel" onSubmit={submit}>
          <h2>{editing ? 'Edit foto' : 'Tambah foto'}</h2>
          <ImageUploader value={form.image_url} onChange={(v) => setForm((f) => ({ ...f, image_url: v }))} userId={user?.id} />
          <div className="field"><label htmlFor="gal-title">Judul</label><input id="gal-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label htmlFor="gal-caption">Keterangan</label><input id="gal-caption" value={form.caption || ''} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></div>
          <div className="field"><label htmlFor="gal-date">Tanggal foto</label><input id="gal-date" type="date" value={form.taken_at || ''} onChange={(e) => setForm({ ...form, taken_at: e.target.value })} /></div>
          <div className="admin-actions">
            <button className="btn-primary" type="submit">{editing ? 'Simpan perubahan' : 'Tambah foto'}</button>
            {editing && <button className="btn-outline" type="button" onClick={() => { setForm(empty); setEditing(false) }}>Batal</button>}
          </div>
        </form>
      </div>
    </>
  )
}
