import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../../components/common/SEOHead'
import { SkeletonCard } from '../../components/common/Loader'
import AgendaCountdown from '../../components/public/AgendaCountdown'
import { getPosts, getAgendas, getGallery, getSettings } from '../../lib/api'
import { formatDate } from '../../utils/formatDate'

const base = import.meta.env.BASE_URL
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export default function Home() {
  const [posts, setPosts] = useState([])
  const [agendas, setAgendas] = useState([])
  const [gallery, setGallery] = useState([])
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const wrapperRef = useRef(null)
  const deckRef = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    let active = true
    Promise.all([getPosts(), getAgendas(true), getGallery(), getSettings()])
      .then(([p, a, g, s]) => {
        if (!active) return
        setPosts(p); setAgendas(a); setGallery(g); setSettings(s)
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (loading || posts.length < 2 || window.innerWidth < 1024) return
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const wrapper = wrapperRef.current
        const deck = deckRef.current
        if (!wrapper || !deck) return
        const rect = wrapper.getBoundingClientRect()
        const travel = wrapper.offsetHeight - window.innerHeight
        const progress = clamp(-rect.top / Math.max(travel, 1), 0, 1)
        const step = progress * (posts.length - 1)
        const widths = posts.map((_, i) => 120 + 500 * clamp(1 + i - step, 0, 1))
        let offset = 0
        for (let i = 0; i < Math.floor(step); i += 1) offset += widths[i] + 8
        deck.style.transform = `translateX(-${offset}px)`
        cardRefs.current.forEach((el, i) => {
          if (!el) return
          el.style.width = `${widths[i]}px`
          el.classList.toggle('is-sliver', widths[i] < 260)
        })
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [loading, posts.length])

  const goToCard = (index) => {
    const wrapper = wrapperRef.current
    if (!wrapper || window.innerWidth < 1024 || posts.length < 2) return
    const travel = wrapper.offsetHeight - window.innerHeight
    const progress = index / (posts.length - 1)
    window.scrollTo({ top: wrapper.offsetTop + travel * progress, behavior: 'smooth' })
  }

  const featured = posts.filter((p) => p.is_featured).slice(0, 2)
  const photoA = featured[0]?.thumbnail_url || `${base}images/kegiatan-rangking-1-di-madrasah-tsanawiyah-negeri.jpg`
  const photoB = featured[1]?.thumbnail_url || `${base}images/decentralized-basic-education-in-indonesia.jpg`
  const showcase = gallery.slice(0, 4)
  const heroTitle = posts[0]?.title || 'Berita madrasah'

  return (
    <>
      <SEOHead
        title={settings?.madrasah_name || 'Berita Madrasah'}
        description="Berita, prestasi, pengumuman, agenda, dan galeri kegiatan madrasah."
      />

      <main className="board-main" aria-label="Berita utama">
        <div className="tile tile-name reveal">
          <h1>Berita<br />Madrasah</h1>
        </div>
        <div className="tile tile-photo shutter-in">
          <img src={photoA} alt="Suasana kegiatan akademik di madrasah" className="drift" width="1600" height="1067" />
        </div>
        <div className="tile tile-photo second shutter-in">
          <img src={photoB} alt="Aktivitas belajar warga madrasah" className="drift" width="1600" height="1067" />
        </div>
        <div className="tile tile-note reveal">
          <p>Berita, prestasi, dan pengumuman madrasah dalam satu halaman.</p>
        </div>
        <div className="tile tile-accent reveal">
          <p>Tulisan guru dan siswa, ditinjau sebelum terbit. <Link to="/kategori" className="link-underline">Lihat kategori</Link></p>
        </div>
      </main>

      <section className="section section-dark" aria-labelledby="intro-title">
        <div className="axis split-intro">
          <div className="intro-copy">
            <h2 id="intro-title" className="reveal">Kabar dari madrasah</h2>
            <p className="intro-statement reveal">
              Kegiatan, prestasi, dan pengumuman madrasah. Ditulis guru dan siswa, lalu ditinjau.
            </p>
            <p className="intro-detail reveal">
              Pilih kategori untuk mengikuti rubrik tertentu, atau gunakan pencarian untuk menemukan berita lama. Agenda dan galeri kegiatan tersedia di halaman tersendiri.
            </p>
          </div>
          <div className="intro-photo reveal">
            <img
              src={`${base}images/children-working-together-at-school-4321352114.jpg`}
              alt="Siswa berdiskusi bersama di dalam kelas"
              width="1200" height="900" loading="lazy" decoding="async"
            />
          </div>
          <AgendaCountdown agendas={agendas} />
        </div>
      </section>

      <section className="spines section-dark" ref={wrapperRef} aria-labelledby="spines-title">
        <div className="spines-stage">
          <h2 id="spines-title" className="spines-head reveal">Berita terbaru</h2>
          {error && <p className="alert alert-error">{error}</p>}
          {loading ? (
            <div className="news-grid"><SkeletonCard count={2} /></div>
          ) : posts.length === 0 ? (
            <p className="empty-state">Belum ada berita yang diterbitkan. Periksa kembali setelah admin menyetujui tulisan pertama.</p>
          ) : (
            <>
              <div className="spines-window">
                <div className="spines-deck" ref={deckRef}>
                  {posts.slice(0, 8).map((post, i) => (
                    <article
                      key={post.id}
                      ref={(el) => { cardRefs.current[i] = el }}
                      className={`spine-card tone-${(i % 3) + 1}`}
                      onClick={() => goToCard(i)}
                    >
                      <div>
                        <h3 style={{ marginTop: 0 }}>{post.title}</h3>
                        <p style={{ marginTop: 16 }}>{post.excerpt}</p>
                      </div>
                      <div className="spine-foot" style={{ marginTop: 0 }}>
                        <span className="spine-meta">
                          {post.is_featured && <span className="spine-dot" aria-label="Berita utama" />}
                          <span>{post.category?.name || 'Berita'} · {formatDate(post.published_at || post.created_at)}</span>
                        </span>
                        <Link className="link-underline" to={`/berita/${post.slug}`} onClick={(e) => e.stopPropagation()}>
                          Baca berita
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
              <div className="spine-foot reveal">
                <span>{posts.length} berita terbit</span>
                <Link className="link-underline" to="/kategori">Lihat semua berita</Link>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section section-dark" aria-labelledby="showcase-title">
        <div className="axis">
          <h2 id="showcase-title" className="showcase-head reveal">Kegiatan di madrasah</h2>
        </div>
        <div className="showcase-band">
          {showcase.map((item, i) => (
            <div key={item.id} className="showcase-panel" style={{ flexGrow: [5, 2, 3, 2][i] }}>
              <img src={item.image_url} alt={item.caption || item.title} loading="lazy" decoding="async" width="1200" height="900" />
              {i === 0 && <div className="showcase-title">Satu hari di madrasah</div>}
            </div>
          ))}
        </div>
        <p className="showcase-caption muted">Dokumentasi kegiatan kelas, tilawah, dan upacara bendera.</p>
      </section>

      <section className="section section-paper" aria-labelledby="gallery-title">
        <div className="axis">
          <div className="gallery-top">
            <h2 id="gallery-title" className="reveal">Galeri kegiatan</h2>
            <p className="gallery-statement reveal">
              Foto kegiatan dikumpulkan dari dokumentasi kelas, ekstrakurikuler, dan Upacara bendera madrasah.
            </p>
          </div>
          {gallery[0] && (
            <div className="gallery-feature reveal">
              <figure>
                <img src={gallery[0].image_url} alt={gallery[0].caption} loading="lazy" decoding="async" width="1200" height="800" />
                <figcaption style={{ fontSize: 13, marginTop: 6 }}>{gallery[0].title}</figcaption>
              </figure>
            </div>
          )}
          <div className="gallery-sheet">
            {gallery.slice(1, 13).map((item) => (
              <figure key={item.id} className="reveal">
                <img src={item.image_url} alt={item.caption || item.title} loading="lazy" decoding="async" width="900" height="600" />
                <figcaption>{item.title}</figcaption>
              </figure>
            ))}
          </div>
          <p style={{ marginTop: 32 }}><Link className="link-underline" to="/galeri">Buka galeri lengkap</Link></p>
        </div>
      </section>

      <section className="section section-dark" aria-labelledby="contact-title">
        <div className="axis contact-grid">
          <div className="contact-copy reveal">
            <h2 id="contact-title">Kontak madrasah</h2>
            <p>Pertanyaan PPDB dan kegiatan? Hubungi madrasah.</p>
          </div>
          <div className="contact-photo reveal">
            <img src={`${base}images/elementary-students-reciting-al-quran-in-school.jpg`} alt="Siswa mengikuti kegiatan tilawah" loading="lazy" decoding="async" width="600" height="450" />
          </div>
          <div className="contact-links reveal">
            <p>Ada yang bisa kami bantu?</p>
            <a href={`mailto:${settings?.email || 'info@madrasah.sch.id'}`}>{settings?.email || 'info@madrasah.sch.id'}</a>
            {settings?.ppdb_url && <a href={settings.ppdb_url} target="_blank" rel="noreferrer">Pendaftaran PPDB</a>}
            <p className="small">{settings?.address || 'Alamat madrasah'} · {settings?.phone || ''}</p>
          </div>
        </div>
      </section>
    </>
  )
}
