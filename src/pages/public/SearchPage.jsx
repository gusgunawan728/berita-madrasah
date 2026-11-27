import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import SEOHead from '../../components/common/SEOHead'
import NewsCard from '../../components/public/NewsCard'
import { getPosts } from '../../lib/api'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const [text, setText] = useState(query)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => setText(query), [query])

  useEffect(() => {
    if (!query.trim()) { setPosts([]); return }
    let active = true
    setLoading(true)
    getPosts({ search: query })
      .then((result) => active && setPosts(result))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [query])

  const submit = (e) => {
    e.preventDefault()
    setParams(text.trim() ? { q: text.trim() } : {})
  }

  return (
    <>
      <SEOHead title="Cari berita" description="Cari berita, pengumuman, dan prestasi madrasah berdasarkan kata kunci." />
      <header className="axis list-head">
        <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>Arsip madrasah</p>
        <h1>Cari berita</h1>
        <p>Masukkan kata kunci untuk menemukan tulisan dari seluruh rubrik madrasah.</p>
        <form className="search-form" onSubmit={submit} role="search">
          <label className="sr-only" htmlFor="search-input">Kata kunci</label>
          <input
            id="search-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Contoh: OSN, PPDB, tilawah"
            type="search"
          />
          <button className="flat-button" type="submit"><Search size={16} /> Cari</button>
        </form>
      </header>

      <div className="axis">
        {query && !loading && (
          <p className="muted" style={{ marginBottom: 24 }}>
            {posts.length} hasil untuk “{query}”
          </p>
        )}
        {loading && <p className="muted">Mencari…</p>}
        {!loading && query && posts.length === 0 && (
          <p className="empty-state">Tidak ada berita yang cocok. Coba kata kunci lain.</p>
        )}
        <div className="news-grid">
          {posts.map((post, i) => <NewsCard key={post.id} post={post} index={i} />)}
        </div>
      </div>
    </>
  )
}
