import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import { LoadingLine } from '../../components/common/Loader'
import { getProfiles, updateProfile } from '../../lib/api'
import { isDemoMode } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'
import { demoUsers } from '../../data/demoData'

const projectRef = import.meta.env.VITE_SUPABASE_URL
  ? new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]
  : null

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { user: currentUser } = useAuth()

  const load = () => {
    setLoading(true)
    getProfiles().then(setUsers).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const change = async (id, patch) => {
    setError(''); setNotice('')
    try { await updateProfile(id, patch); setNotice('Perubahan akun tersimpan.'); load() }
    catch (e) { setError(e.message) }
  }

  return (
    <>
      <SEOHead title="Kelola pengguna" type="website" />
      <div className="admin-title-row">
        <div><h1>Pengguna & peran</h1><p>{users.filter((u) => u.is_active).length} akun aktif dari {users.length} akun terdaftar.</p></div>
      </div>

      <p className="alert alert-info">
        Akun baru dibuat di Supabase Dashboard → Authentication → Add user. Setelah dibuat, akun otomatis muncul di sini sebagai penulis.
        {!isDemoMode && projectRef && (
          <> <a className="btn-link" href={`https://supabase.com/dashboard/project/${projectRef}/auth/users`} target="_blank" rel="noreferrer">Buka Supabase Auth</a></>
        )}
      </p>
      {isDemoMode && <p className="field-hint" style={{ marginBottom: 16 }}>Mode demo: akun yang tersedia {demoUsers.map((u) => u.email).join(', ')}.</p>}
      {error && <p className="alert alert-error">{error}</p>}
      {notice && <p className="alert alert-success">{notice}</p>}

      {loading ? <LoadingLine /> : (
        <div className="admin-panel" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead><tr><th>Nama</th><th>Peran</th><th>Status</th><th className="num">Bergabung</th><th>Aksi</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="identity">
                    {u.full_name}
                    <small>{demoUsers.find((d) => d.id === u.id)?.email || u.id}</small>
                  </td>
                  <td>
                    <select value={u.role} onChange={(e) => change(u.id, { role: e.target.value })} disabled={u.id === currentUser?.id}>
                      <option value="writer">Penulis</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{u.is_active ? <span className="status-mark status-published">Aktif</span> : <span className="status-mark status-draft">Nonaktif</span>}</td>
                  <td className="num">{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      className="btn-outline"
                      disabled={u.id === currentUser?.id}
                      onClick={() => change(u.id, { is_active: !u.is_active })}
                    >
                      {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
