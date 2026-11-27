import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/kategori', label: 'Kategori' },
  { to: '/agenda', label: 'Agenda' },
  { to: '/galeri', label: 'Galeri' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="board" style={{ marginBottom: 0 }}>
      <nav className="board-top" aria-label="Navigasi utama">
        <Link to="/" className="board-mark" aria-label="Beranda madrasah">AL</Link>
        <div className="board-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>
          ))}
        </div>
        <Link to={pathname.startsWith('/admin') ? '/admin' : '/admin/login'} className="board-action">
          {pathname.startsWith('/admin') ? 'Dashboard CMS' : 'Masuk CMS'}
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && (
        <div className="menu-panel">
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          <Link to="/admin/login" onClick={() => setOpen(false)}>Masuk CMS</Link>
        </div>
      )}
    </div>
  )
}
