import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEOHead from '../../components/common/SEOHead'
import NewsCard from '../../components/public/NewsCard'
import { SkeletonCard } from '../../components/common/Loader'
import { getPosts, getCategories } from '../../lib/api'

export default function CategoryPage() {
  const { slug } = useParams()
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getCategories(), getPosts({ categorySlug: slug })])
      .then(([cats, list]) => {
        if (!active) return
        setCategories(cats); setPosts(list)
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [slug])

  const current = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug]
  )

  return (
    <>
      <SEOHead
        title={current?.name || 'Kategori berita'}
        description={current?.description || 'Jelajahi berita madrasah berdasarkan kategori.'}
      />
      <header className="axis list-head">
        <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>Arsip madrasah</p>
        <h1>{current?.name || 'Semua berita'}</h1>
        <p>{current?.description || 'Pilih kategori untuk membaca berita, prestasi, dan pengumuman madrasah.'}</p>
        <nav aria-label="Kategori berita" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginTop: 32 }}>
          <Link className="link-underline" to="/kategori" style={{ fontWeight: !slug ? 700 : 400 }}>Semua</Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              className="link-underline"
              to={`/kategori/${c.slug}`}
              style={{ fontWeight: slug === c.slug ? 700 : 400, color: slug === c.slug ? 'var(--accent)' : 'inherit' }}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="axis">
        {loading ? (
          <div className="news-grid"><SkeletonCard count={2} /></div>
        ) : posts.length === 0 ? (
          <p className="empty-state">Belum ada berita di kategori ini.</p>
        ) : (
          <div className="news-grid">
            {posts.map((post, i) => <NewsCard key={post.id} post={post} index={i} />)}
          </div>
        )}
      </div>
    </>
  )
}
