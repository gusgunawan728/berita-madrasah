import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, LogOut } from 'lucide-react'
import SidebarAdmin from '../../components/admin/SidebarAdmin'
import { useAuth } from '../../context/AuthContext'
import { getPosts } from '../../lib/api'
import SEOHead from '../../components/common/SEOHead'

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pending, setPending] = useState(0)
  const [query, setQuery] = useState('')
  const { user, profile, signOut, isDemoMode } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMenuOpen(false)
    getPosts({ status: 'pending' })
      .then((list) => setPending(list.length))
      .catch(() => setPending(0))
  }, [location.pathname])

  const submit = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/cari?q=${encodeURIComponent(query.trim())}` : '/cari')
  }

  return (
    <div className="admin-app">
      <SEOHead title="Dashboard CMS" type="website" />
      {menuOpen && <button className="sr-only" onClick={() => setMenuOpen(false)}>Tutup navigasi</button>}
      <SidebarAdmin pendingCount={pending} open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="admin-right">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-button" aria-label="Buka navigasi" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </button>
          <form onSubmit={submit} role="search" style={{ display: 'flex', flex: 1 }}>
            <label className="sr-only" htmlFor="admin-search">Cari berita publik</label>
            <input
              id="admin-search"
              className="admin-topbar-search"
              placeholder="Cari berita di situs publik"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="sr-only">Cari</button>
          </form>
          <div className="admin-topbar-right">
            {isDemoMode && <span className="admin-nav-count" title="Mode demo">Demo</span>}
            <div className="admin-user">
              <strong>{profile?.full_name || user?.email || 'Pengguna'}</strong>
              <span>{profile?.role === 'admin' ? 'Admin Utama' : 'Penulis'}</span>
            </div>
            <Link to="/" className="btn-outline" style={{ display: 'grid', placeItems: 'center', width: 34 }} aria-label="Lihat situs">↗</Link>
            <button type="button" className="btn-quiet" onClick={signOut} aria-label="Keluar" style={{ display: 'grid', placeItems: 'center', width: 34 }}>
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <main className="admin-main"><Outlet context={{ pending }} /></main>
      </div>
    </div>
  )
}
