import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

const placeholder =
  !url ||
  !key ||
  url.includes('xyzcompany') ||
  key.includes('...') ||
  key.length < 120

/**
 * Saat kredensial belum diisi, aplikasi berjalan dalam MODE DEMO memakai data
 * lokal. Setelah .env diisi dan aplikasi di-build ulang, mode demo otomatis mati.
 */
export const isDemoMode = placeholder

export const supabase = isDemoMode
  ? null
  : createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export const STORAGE_BUCKET = 'news-images'
