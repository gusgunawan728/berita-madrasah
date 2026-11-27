import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEOHead from '../../components/common/SEOHead'
import ShareButtons from '../../components/common/ShareButtons'
import NewsCard from '../../components/public/NewsCard'
import { getPostBySlug, getPosts, getCategories } from '../../lib/api'
import { formatDate, formatHijriah } from '../../utils/formatDate'

export default function NewsDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [related, setRelated] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getPostBySlug(slug), getCategories()])
      .then(async ([found, cats]) => {
        if (!active) return
        setPost(found); setCategories(cats)
        if (found?.category_id) {
          const list = await getPosts({ categorySlug: found.category.slug, limit: 4 })
          if (active) setRelated(list.filter((p) => p.id !== found.id).slice(0, 3))
        }
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [slug])

  if (loading) return <div className="axis article-head"><p className="muted">Memuat berita…</p></div>

  if (!post) {
    return (
      <div className="axis article-head">
        <SEOHead title="Berita tidak ditemukan" />
        <h1>Berita tidak ditemukan</h1>
        <p className="standfirst muted">Tautan mungkin sudah berubah. Kembali ke daftar berita untuk mencari tulisan lain.</p>
        <p style={{ marginTop: 28 }}><Link className="link-underline" to="/kategori">Lihat semua berita</Link></p>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${import.meta.env.BASE_URL}berita/${post.slug}`
    : ''

  return (
    <>
      <SEOHead title={post.title} description={post.excerpt} image={post.thumbnail_url} />

      <header className="axis article-head">
        <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>
          {post.category?.name || 'Berita'}
        </p>
        <h1>{post.title}</h1>
        <p className="standfirst">{post.excerpt}</p>
        <div className="article-meta">
          <span>Oleh {post.author?.full_name || 'Redaksi madrasah'}</span>
          <span>{formatDate(post.published_at, { withTime: true })}</span>
          <span>{formatHijriah(post.published_at)} H</span>
          <span>{post.views_count || 0} pembaca</span>
        </div>
      </header>

      {post.thumbnail_url && (
        <div className="article-hero shutter-in">
          <img src={post.thumbnail_url} alt={post.title} width="1600" height="900" />
        </div>
      )}

      <div className="axis article-body">
        <aside className="article-aside">
          <p className="muted">Diterbitkan oleh Humas Madrasah. Tulisan siswa dan guru ditinjau sebelum tayang.</p>
          <p className="muted">{categories.map((c) => c.name).join(' · ')}</p>
          <ShareButtons title={post.title} url={shareUrl} />
        </aside>
        <article className="article-content prose-copy" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {related.length > 0 && (
        <section className="section section-surface" aria-labelledby="related-title">
          <div className="axis">
            <h2 id="related-title" className="section-heading reveal" style={{ marginBottom: 40 }}>
              Berita lain di {post.category?.name}
            </h2>
            <div className="news-grid">
              {related.map((item, i) => <NewsCard key={item.id} post={item} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
