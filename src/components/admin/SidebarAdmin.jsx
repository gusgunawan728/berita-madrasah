import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, PenLine, FolderTree, CalendarDays, Images, Users, Settings, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const groups = [
  {
    label: 'Redaksi',
    links: [
      { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard, end: true },
      { to: '/admin/berita', label: 'Semua berita', icon: FileText, queue: 'pending' },
      { to: '/admin/berita/baru', label: 'Tulis berita', icon: PenLine },
    ],
  },
  {
    label: 'Pengelolaan',
    links: [
      { to: '/admin/kategori', label: 'Kategori', icon: FolderTree, adminOnly: true },
      { to: '/admin/agenda', label: 'Agenda', icon: CalendarDays, adminOnly: true },
      { to: '/admin/galeri', label: 'Galeri foto', icon: Images, adminOnly: true },
    ],
  },
]

export default function SidebarAdmin({ pendingCount = 0, open = false, onClose }) {
  const { profile, signOut } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const visibleGroups = groups
    .map((group) => ({ ...group, links: group.links.filter((link) => !link.adminOnly || isAdmin) }))
    .filter((group) => group.links.length > 0)

  return (
    <aside className={`admin-sidebar${open ? ' open' : ''}`} aria-label="Navigasi CMS">
      <div className="admin-brand">
        <div className="admin-mark" aria-hidden="true">AL</div>
        <div>
          <strong>Portal Madrasah</strong>
          <span>CMS berita & informasi</span>
        </div>
      </div>

      {visibleGroups.map((group) => (
        <div className="admin-nav-group" key={group.label}>
          <div className="admin-nav-label">{group.label}</div>
          {group.links.map(({ to, label, icon: Icon, end, queue }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {queue === 'pending' && pendingCount > 0 && (
                <span className="admin-nav-count" aria-label={`${pendingCount} berita menungu tinjauan`}>{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </div>
      ))}

      {profile?.role === 'admin' && (
        <div className="admin-nav-group">
          <div className="admin-nav-label">Pengaturan</div>
          <NavLink to="/admin/pengguna" onClick={onClose} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <Users aria-hidden="true" /><span>Pengguna</span>
          </NavLink>
          <NavLink to="/admin/profil" onClick={onClose} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
            <Settings aria-hidden="true" /><span>Profil madrasah</span>
          </NavLink>
        </div>
      )}

      <div className="admin-sidebar-foot">
        <a href="/" className="admin-nav-link" style={{ paddingInline: 0 }}>
          <ExternalLink aria-hidden="true" /><span>Lihat situs publik</span>
        </a>
        <button type="button" className="btn-link" onClick={signOut} style={{ marginTop: 12 }}>Keluar</button>
      </div>
    </aside>
  )
}
