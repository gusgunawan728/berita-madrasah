import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isDemoMode } from '../lib/supabaseClient'
import { demoUsers } from '../data/demoData'

const AuthContext = createContext(null)
const DEMO_KEY = 'berita-madrasah-demo-session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      try {
        const saved = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null')
        if (saved) {
          setUser(saved)
          setProfile(demoUsers.find((u) => u.id === saved.id) || null)
        }
      } catch {
        localStorage.removeItem(DEMO_KEY)
      }
      setLoading(false)
      return
    }

    let active = true
    const loadProfile = async (id, meta = {}) => {
      const { data } = await supabase
        .from('profiles').select('id,full_name,role,avatar_url,bio,is_active').eq('id', id).maybeSingle()
      if (!active) return
      setProfile(data || {
        id,
        full_name: meta.full_name || id,
        role: meta.role || 'writer',
        is_active: true,
      })
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(data.session?.user || null)
      if (data.session) loadProfile(data.session.user.id, data.session.user.user_metadata)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null)
        if (session) loadProfile(session.user.id, session.user.user_metadata)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
      if (session) setLoading(false)
    })

    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    isDemoMode,
    isAdmin: profile?.role === 'admin',
    isWriter: profile?.role === 'writer',

    async signIn({ email, password }) {
      if (isDemoMode) {
        const found = demoUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
        if (!found || found.password !== password) {
          throw new Error('Email atau kata sandi salah. Gunakan akun demo di bawah ini.')
        }
        const sessionUser = { id: found.id, email: found.email }
        localStorage.setItem(DEMO_KEY, JSON.stringify(sessionUser))
        setUser(sessionUser)
        setProfile(found)
        return sessionUser
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data.user
    },

    async signUp({ email, password, fullName }) {
      if (isDemoMode) {
        const created = {
          id: `u-${Date.now()}`, email, password, role: 'writer', full_name: fullName || email,
        }
        demoUsers.push(created)
        const sessionUser = { id: created.id, email }
        localStorage.setItem(DEMO_KEY, JSON.stringify(sessionUser))
        setUser(sessionUser)
        setProfile(created)
        return created
      }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName || email.split('@')[0], role: 'writer' } },
      })
      if (error) throw error
      return data.user
    },

    async signOut() {
      if (isDemoMode) {
        localStorage.removeItem(DEMO_KEY)
        setUser(null)
        setProfile(null)
        return
      }
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
    },

    async resetPassword(email) {
      if (isDemoMode) return
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      })
      if (error) throw error
    },
  }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
