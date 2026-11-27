import { Helmet } from 'react-helmet-async'

export default function SEOHead({ title, description, image, type = 'article' }) {
  const fullTitle = title ? `${title} · Portal Berita Madrasah` : 'Portal Berita & Informasi Madrasah'
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}
