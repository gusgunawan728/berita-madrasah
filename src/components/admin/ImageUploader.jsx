import { useState } from 'react'
import imageCompression from 'browser-image-compression'
import { ImagePlus, Trash2 } from 'lucide-react'
import { uploadImage } from '../../lib/api'

export default function ImageUploader({ value, onChange, userId }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true); setError(''); setProgress(0)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      })
      const url = await uploadImage(compressed, userId, setProgress)
      onChange(url)
    } catch (e) {
      setError(e.message || 'Gagal mengunggah gambar')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  return (
    <div className="field">
      <label htmlFor="thumbnail-input">Gambar utama</label>
      <div className="uploader">
        {value ? (
          <>
            <img src={value} alt="Pratinjau gambar utama berita" />
            <button type="button" className="btn-outline" onClick={() => onChange('')}>
              <Trash2 size={14} /> Hapus gambar
            </button>
          </>
        ) : (
          <label htmlFor="thumbnail-input" style={{ cursor: 'pointer' }}>
            <ImagePlus size={24} aria-hidden="true" />
            <p style={{ margin: '8px 0 4px' }}>Pilih gambar JPG, PNG, atau WebP</p>
            <span className="field-hint">Dikompres otomatis ke maksimal 300 KB sebelum diunggah</span>
          </label>
        )}
        <input id="thumbnail-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={busy} />
        {busy && <div className="upload-progress" role="status" aria-label="Mengunggah gambar"><div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)' }} /></div>}
        {error && <p className="alert alert-error" style={{ marginBottom: 0 }}>{error}</p>}
      </div>
    </div>
  )
}
