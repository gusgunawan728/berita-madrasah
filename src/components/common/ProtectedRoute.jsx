import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingLine } from './Loader'

export default function ProtectedRoute({ requireAdmin = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="admin-main"><LoadingLine>Memeriksa sesi…</LoadingLine></div>
  if (!user) return <Navigate to="/admin/login" replace />
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/admin" replace />
  return <Outlet />
}
