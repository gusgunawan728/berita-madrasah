import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatDate'

export default function NewsCard({ post, index = 0, showExcerpt = true }) {
  if (!post) return null
  const tone = `tone-${(index % 3) + 1}`
  return (
    <article className={`news-card ${tone} reveal`}>
      {post.thumbnail_url && (
        <Link to={`/berita/${post.slug}`} className="news-card-media" aria-label={`Baca ${post.title}`}>
          <img
            src={post.thumbnail_url}
            alt={post.title}
            loading="lazy"
            decoding="async"
            width="1200"
            height="800"
          />
        </Link>
      )}
      <div className="news-card-body">
        {post.category?.name && <p className="card-label" style={{ color: 'var(--accent-soft)', fontWeight: 600 }}>{post.category.name}</p>}
        <h2><Link to={`/berita/${post.slug}`}>{post.title}</Link></h2>
        {showExcerpt && <p>{post.excerpt}</p>}
        <div className="news-card-foot">
          <span>{formatDate(post.published_at || post.created_at)}</span>
          <Link className="link-underline" to={`/berita/${post.slug}`}>Baca berita</Link>
        </div>
      </div>
    </article>
  )
}
