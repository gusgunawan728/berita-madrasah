import { supabase, isDemoMode, STORAGE_BUCKET } from './supabaseClient'
import {
  demoPosts, demoCategories, demoAuthors, demoAgendas, demoGallery, demoSettings,
} from '../data/demoData'
import { uniqueSlug } from '../utils/slugify'

// Data yang bisa diubah saat mode demo (hilang saat halaman di-refresh)
const store = {
  posts: demoPosts.map((p) => ({ ...p })),
  categories: demoCategories.map((c) => ({ ...c })),
  agendas: demoAgendas.map((a) => ({ ...a })),
  gallery: demoGallery.map((g) => ({ ...g })),
  settings: { ...demoSettings },
  profiles: demoAuthors.map((a, i) => ({
    ...a,
    role: i === 0 ? 'admin' : 'writer',
    is_active: true,
  })),
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))
const byDateDesc = (a, b) =>
  new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)

function decorate(post, categories, authors) {
  return {
    ...post,
    category: categories.find((c) => c.id === post.category_id) || null,
    author: authors.find((a) => a.id === post.author_id) || null,
  }
}

export async function getCategories() {
  if (isDemoMode) {
    await delay(80)
    return store.categories.map((c) => ({ ...c }))
  }
  const { data, error } = await supabase
    .from('categories').select('id,name,slug,description').order('name')
  if (error) throw error
  return data
}

export async function getAuthors(ids) {
  if (isDemoMode) {
    await delay(60)
    return store.profiles
      .filter((a) => !ids || ids.includes(a.id))
      .map(({ id, full_name, avatar_url, bio }) => ({ id, full_name, avatar_url, bio }))
  }
  let query = supabase.from('public_authors').select('id,full_name,avatar_url,bio')
  if (ids?.length) query = query.in('id', ids)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getPosts(options = {}) {
  const { status, categorySlug, search = '', featuredOnly = false, limit } = options
  if (isDemoMode) {
    await delay()
    let rows = store.posts.filter((p) =>
      status === 'all' ? true : status ? p.status === status : p.status === 'published'
    )
    if (categorySlug) rows = rows.filter((p) => p.category?.slug === categorySlug ||
      store.categories.find((c) => c.id === p.category_id)?.slug === categorySlug)
    if (featuredOnly) rows = rows.filter((p) => p.is_featured)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter((p) =>
        `${p.title} ${p.excerpt || ''} ${p.content || ''} ${p.category?.name || ''}`
          .toLowerCase().includes(q)
      )
    }
    rows = rows.sort(byDateDesc).map((p) => decorate(p, store.categories, store.profiles))
    return limit ? rows.slice(0, limit) : rows
  }

  let query = supabase.from('posts').select(
    'id,title,slug,excerpt,content,thumbnail_url,category_id,author_id,status,is_featured,views_count,published_at,created_at,updated_at'
  )
  if (status && status !== 'all') query = query.eq('status', status)
  if (featuredOnly) query = query.eq('is_featured', true).eq('status', 'published')
  if (search.trim()) {
    const safe = search.trim().replace(/[%,()]/g, ' ')
    query = query.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%`)
  }
  query = query.order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  const [categories, authors] = await Promise.all([
    getCategories(),
    getAuthors([...new Set((data || []).map((p) => p.author_id).filter(Boolean))]),
  ])
  if (categorySlug) {
    const category = categories.find((c) => c.slug === categorySlug)
    return (data || []).filter((p) => p.category_id === category?.id)
      .map((p) => decorate(p, categories, authors))
  }
  return (data || []).map((p) => decorate(p, categories, authors))
}

export async function getPostBySlug(slug) {
  if (isDemoMode) {
    await delay()
    const found = store.posts.find((p) => p.slug === slug && p.status === 'published')
    if (!found) return null
    found.views_count += 1
    return decorate(found, store.categories, store.profiles)
  }
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!data) return null
  const [categories, authors] = await Promise.all([
    getCategories(),
    getAuthors(data.author_id ? [data.author_id] : []),
  ])
  supabase.rpc('increment_post_views', { p_post_id: data.id }).then(() => {})
  return decorate(data, categories, authors)
}

export async function getAgendas(upcomingOnly = false) {
  if (isDemoMode) {
    await delay(90)
    const today = new Date().toISOString().slice(0, 10)
    return store.agendas
      .filter((a) => !upcomingOnly || a.event_date >= today)
      .sort((a, b) => a.event_date.localeCompare(b.event_date))
      .map((a) => ({ ...a }))
  }
  let query = supabase.from('agendas').select('*').order('event_date')
  if (upcomingOnly) query = query.gte('event_date', new Date().toISOString().slice(0, 10))
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getGallery() {
  if (isDemoMode) {
    await delay(90)
    return store.gallery.map((g) => ({ ...g }))
  }
  const { data, error } = await supabase.from('gallery_photos').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSettings() {
  if (isDemoMode) {
    await delay(60)
    return { ...store.settings }
  }
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle()
  if (error) throw error
  return data || {}
}

export async function getProfiles() {
  if (isDemoMode) {
    await delay(90)
    return store.profiles.map((p) => ({ ...p }))
  }
  const { data, error } = await supabase.from('profiles').select('id,full_name,role,avatar_url,bio,is_active,created_at').order('full_name')
  if (error) throw error
  return data
}

export async function updateProfile(id, patch) {
  if (isDemoMode) {
    store.profiles = store.profiles.map((p) => p.id === id ? { ...p, ...patch } : p)
    return store.profiles.find((p) => p.id === id)
  }
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const [posts, categories, agendas] = await Promise.all([
    getPosts({ status: undefined, search: '' }),
    getCategories(),
    getAgendas(true),
  ])
  // getPosts menyaring ke published bila status tidak diberikan; ambil semua status:
  const allPosts = isDemoMode
    ? store.posts.map((p) => decorate(p, store.categories, store.profiles))
    : await supabase.from('posts')
        .select('id,status,views_count,category_id,published_at,title,author_id,slug,excerpt')
        .then(({ data, error }) => {
          if (error) throw error
          return (data || []).map((p) => decorate(p, categories, []))
        })

  const published = allPosts.filter((p) => p.status === 'published')
  const byCategory = categories.map((c) => ({
    name: c.name,
    count: published.filter((p) => p.category_id === c.id).length,
  }))
  return {
    total: allPosts.length,
    published: published.length,
    pending: allPosts.filter((p) => p.status === 'pending').length,
    drafts: allPosts.filter((p) => p.status === 'draft').length,
    views: published.reduce((sum, p) => sum + (p.views_count || 0), 0),
    byCategory,
    upcoming: agendas.length,
    posts: allPosts.sort(byDateDesc),
  }
}

export async function savePost(payload) {
  const { id, category_id, author_id, ...rest } = payload
  if (isDemoMode) {
    await delay(220)
    if (id) {
      store.posts = store.posts.map((p) => p.id === id ? { ...p, ...payload, updated_at: new Date().toISOString() } : p)
      return store.posts.find((p) => p.id === id)
    }
    const slugs = store.posts.map((p) => p.slug)
    const post = {
      ...rest,
      id: `p-${Date.now()}`,
      slug: rest.slug || uniqueSlug(rest.title, slugs),
      category_id: category_id || null,
      author_id,
      views_count: 0,
      published_at: rest.status === 'published' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    store.posts.unshift(post)
    return post
  }

  if (id) {
    const { data, error } = await supabase.from('posts')
      .update({ ...rest, category_id: category_id || null, updated_at: new Date().toISOString() })
      .eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const categories = await getCategories()
  const { data: existing, error: e1 } = await supabase.from('posts').select('slug')
  if (e1) throw e1
  const { data, error } = await supabase.from('posts').insert({
    ...rest,
    slug: rest.slug || uniqueSlug(rest.title, (existing || []).map((p) => p.slug)),
    category_id: category_id || null,
    author_id,
  }).select().single()
  if (error) throw error
  return data
}

export async function getPostById(id) {
  if (isDemoMode) {
    await delay(90)
    const found = store.posts.find((p) => p.id === id)
    return found ? decorate(found, store.categories, store.profiles) : null
  }
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) return null
  const [categories, authors] = await Promise.all([
    getCategories(),
    getAuthors(data.author_id ? [data.author_id] : []),
  ])
  return decorate(data, categories, authors)
}

export async function updatePostStatus(id, status) {
  if (isDemoMode) {
    store.posts = store.posts.map((p) => p.id === id ? {
      ...p, status,
      published_at: status === 'published' ? p.published_at || new Date().toISOString() : p.published_at,
      updated_at: new Date().toISOString(),
    } : p)
    return store.posts.find((p) => p.id === id)
  }
  const { data, error } = await supabase.from('posts').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deletePost(id) {
  if (isDemoMode) {
    store.posts = store.posts.filter((p) => p.id !== id)
    return
  }
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}

async function saveRecord(table, payload, key = 'id') {
  if (isDemoMode) {
    await delay(160)
    const list = store[table]
    if (payload[key]) {
      const index = list.findIndex((x) => x[key] === payload[key])
      if (index >= 0) list[index] = { ...list[index], ...payload }
      return list[index]
    }
    const item = { ...payload, id: `${table[0]}-${Date.now()}` }
    list.unshift(item)
    return item
  }
  if (payload[key]) {
    const { data, error } = await supabase.from(table).update(payload).eq(key, payload[key]).select().single()
    if (error) throw error
    return data
  }
  const { id, ...clean } = payload
  const { data, error } = await supabase.from(table).insert(clean).select().single()
  if (error) throw error
  return data
}

async function deleteRecord(table, id) {
  if (isDemoMode) {
    store[table] = store[table].filter((x) => x.id !== id)
    return
  }
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}

const slugifyLocal = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const saveCategory = (payload) => saveRecord('categories', {
  ...payload, slug: payload.slug || slugifyLocal(payload.name),
})
export const deleteCategory = (id) => deleteRecord('categories', id)
export const saveAgenda = (payload) => saveRecord('agendas', payload)
export const deleteAgenda = (id) => deleteRecord('agendas', id)
export const saveGalleryItem = (payload) => saveRecord('gallery', payload)
export const deleteGalleryItem = (id) => deleteRecord('gallery', id)

export async function saveSettings(payload) {
  if (isDemoMode) {
    await delay(160)
    store.settings = { ...store.settings, ...payload }
    return store.settings
  }
  const { id, ...clean } = payload
  const { data, error } = await supabase.from('site_settings').update(clean).eq('id', 1).select().single()
  if (error) throw error
  return data
}

export async function uploadImage(file, userId, onProgress) {
  if (isDemoMode) {
    onProgress?.(100)
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `${userId}/${safeName}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  onProgress?.(100)
  return data.publicUrl
}
