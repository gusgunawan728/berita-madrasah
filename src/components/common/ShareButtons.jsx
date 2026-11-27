import { useState } from 'react'
import { Check } from 'lucide-react'

export default function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const encoded = encodeURIComponent(shareUrl)
  const text = encodeURIComponent(title || '')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Salin tautan ini:', shareUrl)
    }
  }

  return (
    <div className="share-row" aria-label="Bagikan berita">
      <a href={`https://wa.me/?text=${text}%20${encoded}`} target="_blank" rel="noreferrer">WhatsApp</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noreferrer">Facebook</a>
      <button type="button" onClick={copy}>{copied ? <><Check size={14} /> Tautan tersalin</> : 'Salin tautan'}</button>
    </div>
  )
}
