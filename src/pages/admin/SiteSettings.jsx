import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import { LoadingLine } from '../../components/common/Loader'
import { getSettings, saveSettings } from '../../lib/api'

export default function SiteSettings() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSettings().then(setForm).catch((e) => setError(e.message))
  }, [])

  if (!form) return <LoadingLine />

  const change = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSaved(''); setBusy(true)
    try { await saveSettings(form); setSaved('Profil madrasah diperbarui.') }
    catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  return (
    <>
      <SEOHead title="Profil madrasah" type="website" />
      <div className="admin-title-row">
        <div><h1>Profil madrasah</h1><p>Nama, sambutan, kontak, dan tautan PPDB yang tampil di situs publik.</p></div>
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {saved && <p className="alert alert-success">{saved}</p>}

      <form onSubmit={submit}>
        <section className="settings-section">
          <div>
            <h2>Identitas madrasah</h2>
            <p className="settings-desc">Nama ini dipakai pada judul halaman dan penutup situs.</p>
          </div>
          <div className="settings-panel">
            <div className="field"><label htmlFor="set-name">Nama madrasah</label><input id="set-name" value={form.madrasah_name || ''} onChange={(e) => change('madrasah_name', e.target.value)} /></div>
            <div className="field"><label htmlFor="set-tagline">Tagline</label><input id="set-tagline" value={form.tagline || ''} onChange={(e) => change('tagline', e.target.value)} /></div>
          </div>
        </section>

        <section className="settings-section">
          <div>
            <h2>Sambutan kepala madrasah</h2>
            <p className="settings-desc">Teks sambutan dapat dipakai kembali di halaman profil atau brosur.</p>
          </div>
          <div className="settings-panel">
            <div className="field"><label htmlFor="set-welcome-title">Judul sambutan</label><input id="set-welcome-title" value={form.welcome_title || ''} onChange={(e) => change('welcome_title', e.target.value)} /></div>
            <div className="field"><label htmlFor="set-headmaster">Nama kepala madrasah</label><input id="set-headmaster" value={form.headmaster_name || ''} onChange={(e) => change('headmaster_name', e.target.value)} /></div>
            <div className="field"><label htmlFor="set-welcome">Isi sambutan</label><textarea id="set-welcome" value={form.welcome_message || ''} onChange={(e) => change('welcome_message', e.target.value)} /></div>
          </div>
        </section>

        <section className="settings-section">
          <div>
            <h2>Kontak & PPDB</h2>
            <p className="settings-desc">Tautan PPDB dan email ditampilkan pada bagian kontak halaman beranda.</p>
          </div>
          <div className="settings-panel">
            <div className="field"><label htmlFor="set-address">Alamat</label><input id="set-address" value={form.address || ''} onChange={(e) => change('address', e.target.value)} /></div>
            <div className="field-row">
              <div className="field"><label htmlFor="set-email">Email</label><input id="set-email" type="email" value={form.email || ''} onChange={(e) => change('email', e.target.value)} /></div>
              <div className="field"><label htmlFor="set-phone">Telepon</label><input id="set-phone" value={form.phone || ''} onChange={(e) => change('phone', e.target.value)} /></div>
            </div>
            <div className="field"><label htmlFor="set-ppdb">Tautan PPDB</label><input id="set-ppdb" value={form.ppdb_url || ''} onChange={(e) => change('ppdb_url', e.target.value)} /></div>
            <div className="field-row">
              <div className="field"><label htmlFor="set-fb">Facebook</label><input id="set-fb" value={form.facebook_url || ''} onChange={(e) => change('facebook_url', e.target.value)} /></div>
              <div className="field"><label htmlFor="set-ig">Instagram</label><input id="set-ig" value={form.instagram_url || ''} onChange={(e) => change('instagram_url', e.target.value)} /></div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 24 }}>
          <button className="btn-primary" type="submit" disabled={busy}>{busy ? 'Menyimpan…' : 'Simpan profil'}</button>
        </div>
      </form>
    </>
  )
}
