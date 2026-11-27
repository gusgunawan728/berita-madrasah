import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import { LoadingLine } from '../../components/common/Loader'
import { getAgendas, saveAgenda, deleteAgenda } from '../../lib/api'
import { formatDateShort, daysUntil } from '../../utils/formatDate'

const empty = { title: '', event_date: '', location: '', description: '' }

export default function ManageAgendas() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const load = () => {
    setLoading(true)
    getAgendas().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaved('')
    if (!form.title.trim() || !form.event_date) { setError('Judul dan tanggal wajib diisi.'); return }
    try {
      await saveAgenda(form)
      setSaved('Agenda tersimpan.'); setForm(empty); setEditing(false); load()
    } catch (err) { setError(err.message) }
  }

  const remove = async (item) => {
    if (!window.confirm(`Hapus agenda “${item.title}”?`)) return
    try { await deleteAgenda(item.id); load() } catch (e) { setError(e.message) }
  }

  return (
    <>
      <SEOHead title="Kelola agenda" type="website" />
      <div className="admin-title-row">
        <div><h1>Agenda madrasah</h1><p>{items.filter((a) => daysUntil(a.event_date) >= 0).length} agenda mendatang dari {items.length} entri.</p></div>
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {saved && <p className="alert alert-success">{saved}</p>}

      <div className="admin-two-col">
        <div className="admin-panel" style={{ padding: 0, overflowX: 'auto' }}>
          {loading ? <LoadingLine /> : items.length === 0 ? <div className="empty-panel">Belum ada agenda.</div> : (
            <table className="admin-table">
              <thead><tr><th>Agenda</th><th className="num">Tanggal</th><th>Aksi</th></tr></thead>
              <tbody>
                {items.map((a) => {
                  const d = daysUntil(a.event_date)
                  return (
                    <tr key={a.id}>
                      <td className="identity">{a.title}<small>{a.location || 'Tanpa lokasi'} · {a.description || 'Tanpa keterangan'}</small></td>
                      <td className="num">{formatDateShort(a.event_date)}<small>{d < 0 ? 'Lalu' : d === 0 ? 'Hari ini' : `H-${d}`}</small></td>
                      <td>
                        <button className="btn-link" onClick={() => { setForm(a); setEditing(true) }}>Edit</button>
                        <button className="btn-danger" onClick={() => remove(a)} style={{ marginLeft: 8 }}>Hapus</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <form className="admin-panel" onSubmit={submit}>
          <h2>{editing ? 'Edit agenda' : 'Agenda baru'}</h2>
          <div className="field"><label htmlFor="ag-title">Judul</label><input id="ag-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="field"><label htmlFor="ag-date">Tanggal</label><input id="ag-date" type="date" value={form.event_date || ''} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
          <div className="field"><label htmlFor="ag-loc">Lokasi</label><input id="ag-loc" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div className="field"><label htmlFor="ag-desc">Keterangan</label><textarea id="ag-desc" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="admin-actions">
            <button className="btn-primary" type="submit">{editing ? 'Simpan perubahan' : 'Tambah agenda'}</button>
            {editing && <button className="btn-outline" type="button" onClick={() => { setForm(empty); setEditing(false) }}>Batal</button>}
          </div>
        </form>
      </div>
    </>
  )
}
