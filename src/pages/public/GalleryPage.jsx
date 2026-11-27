import { useEffect, useState } from 'react'
import SEOHead from '../../components/common/SEOHead'
import { getGallery } from '../../lib/api'
import { formatDateShort } from '../../utils/formatDate'

export default function GalleryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getGallery()
      .then((data) => active && setItems(data))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  return (
    <>
      <SEOHead title="Galeri kegiatan" description="Dokumentasi foto kegiatan madrasah." />
      <header className="axis list-head">
        <p style={{ color: 'var(--accent)', fontWeight: 600, margin: 0 }}>Dokumentasi</p>
        <h1>Galeri kegiatan</h1>
        <p>Foto kegiatan kelas, ekstrakurikuler, dan upacara yang diambil selama tahun ajaran berjalan.</p>
      </header>

      <div className="axis" style={{ paddingBottom: 'var(--gap-section)' }}>
        {loading && <p className="muted">Memuat galeri…</p>}
        {!loading && items.length === 0 && <p className="empty-state">Galeri masih kosong.</p>}
        <div className="gallery-sheet gallery-sheet-dark" style={{ margin: 0, columns: 4 }}>
          {items.map((item) => (
            <figure key={item.id} className="reveal">
              <img src={item.image_url} alt={item.caption || item.title} loading="lazy" decoding="async" width="900" height="600" />
              <figcaption>
                {item.title}{item.taken_at ? `, ${formatDateShort(item.taken_at)}` : ''}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </>
  )
}
