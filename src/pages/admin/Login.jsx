import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import SEOHead from '../../components/common/SEOHead'
import { demoUsers } from '../../data/demoData'

export default function Login() {
  const { user, profile, signIn, resetPassword, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    const admin = profile?.role === 'admin' || user.email?.startsWith('admin@')
    return <Navigate to={admin ? '/admin' : '/admin/berita'} replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError(''); setNotice('')
    try {
      const logged = await signIn({ email, password })
      const admin = profile?.role === 'admin' || email.trim().startsWith('admin@') || logged?.user_metadata?.role === 'admin'
      navigate(admin ? '/admin' : '/admin/berita', { replace: true })
      return logged
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const forgot = async () => {
    if (!email) { setError('Isi email terlebih dahulu.'); return }
    try {
      await resetPassword(email)
      setNotice(isDemoMode ? 'Mode demo: pengiriman email dinonaktifkan.' : 'Tautan atur ulang kata sandi dikirim.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="login-page">
      <SEOHead title="Masuk CMS" type="website" />
      <section className="login-left">
        <div className="admin-brand" style={{ padding: 0 }}>
          <div className="admin-mark" aria-hidden="true" style={{ background: '#ff4a1f' }}>AL</div>
          <div><strong style={{ color: '#eff0f1' }}>Portal Madrasah</strong><span>CMS berita & informasi</span></div>
        </div>
        <div>
          <h1>Ruang redaksi madrasah</h1>
          <p style={{ marginTop: 24 }}>Guru dan siswa menulis, admin meninjau, lalu berita terbit untuk warga madrasah.</p>
        </div>
        <p style={{ color: '#9c9ea3' }}>
          <Link to="/" className="link-underline" style={{ color: '#eff0f1' }}>Kembali ke situs publik</Link>
        </p>
      </section>

      <section className="login-right">
        <div className="login-card">
          <h2>Masuk ke CMS</h2>
          <p>Gunakan akun yang sudah didaftarkan operator madrasah.</p>
          {error && <p className="alert alert-error">{error}</p>}
          {notice && <p className="alert alert-success">{notice}</p>}
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
            </div>
            <div className="field">
              <label htmlFor="login-password">Kata sandi</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            <button className="btn-primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 8 }}>
              {busy ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>
          <button type="button" className="btn-link" onClick={forgot} style={{ marginTop: 16 }}>Lupa kata sandi?</button>

          {isDemoMode && (
            <div style={{ marginTop: 28 }}>
              <p className="field-hint" style={{ marginBottom: 8 }}>Akun demo, kata sandi: <strong>demo1234</strong></p>
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="demo-account"
                  style={{ display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onClick={() => { setEmail(u.email); setPassword(u.password) }}
                >
                  {u.email} · {u.role === 'admin' ? 'Admin' : 'Penulis'}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
