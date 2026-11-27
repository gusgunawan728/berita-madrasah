import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'
import useReveal from './hooks/useReveal'
import { useAuth } from './context/AuthContext'
import { getSettings } from './lib/api'

import Home from './pages/public/Home'
import NewsDetail from './pages/public/NewsDetail'
import CategoryPage from './pages/public/CategoryPage'
import SearchPage from './pages/public/SearchPage'
import AgendaPage from './pages/public/AgendaPage'
import GalleryPage from './pages/public/GalleryPage'
const Login = lazy(() => import('./pages/admin/Login'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const PostList = lazy(() => import('./pages/admin/PostList'))
const PostEditor = lazy(() => import('./pages/admin/PostEditor'))
const ManageCategories = lazy(() => import('./pages/admin/ManageCategories'))
const ManageAgendas = lazy(() => import('./pages/admin/ManageAgendas'))
const ManageGallery = lazy(() => import('./pages/admin/ManageGallery'))
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'))
const SiteSettings = lazy(() => import('./pages/admin/SiteSettings'))
import SEOHead from './components/common/SEOHead'

function PublicLayout() {
  const [settings, setSettings] = useState(null)
  const { isDemoMode } = useAuth()
  useEffect(() => { getSettings().then(setSettings).catch(() => {}) }, [])

  return (
    <>
      {isDemoMode && (
        <div className="demo-banner">
          <span>Mode demo, data contoh. Isi .env dengan kredensial Supabase lalu build ulang untuk memakai data nyata.</span>
          <Link to="/admin/login">Masuk CMS demo</Link>
        </div>
      )}
      <Navbar />
      <Outlet context={{ settings }} />
      <Footer settings={settings} />
    </>
  )
}

function NotFound() {
  return (
    <div className="axis article-head">
      <SEOHead title="Halaman tidak ditemukan" />
      <h1>Halaman tidak ditemukan</h1>
      <p className="standfirst">Alamat yang Anda buka tidak tersedia. Kembali ke beranda untuk membaca berita terbaru.</p>
      <p style={{ marginTop: 28 }}><Link className="link-underline" to="/">Ke beranda</Link></p>
    </div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useReveal(pathname)

  return (
    <Suspense fallback={<div className="axis article-head"><p>Memuat halaman…</p></div>}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/berita/:slug" element={<NewsDetail />} />
        <Route path="/kategori" element={<CategoryPage />} />
        <Route path="/kategori/:slug" element={<CategoryPage />} />
        <Route path="/cari" element={<SearchPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/galeri" element={<GalleryPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="berita" element={<PostList />} />
          <Route path="berita/baru" element={<PostEditor />} />
          <Route path="berita/:id" element={<PostEditor />} />
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="kategori" element={<ManageCategories />} />
            <Route path="agenda" element={<ManageAgendas />} />
            <Route path="galeri" element={<ManageGallery />} />
            <Route path="pengguna" element={<ManageUsers />} />
            <Route path="profil" element={<SiteSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  )
}
