import { Link } from 'react-router-dom'

const credits = [
  '“Kegiatan Rangking 1 di MTs Negeri Tungkob” · Rachmat.Wahidi, CC BY-SA 3.0, Wikimedia Commons',
  '“Art made out of recycling and used materials” · USAID Indonesia, public domain, Wikimedia Commons',
  '“Children working together at school” · USAID Indonesia, public domain, Wikimedia Commons',
  '“Decentralized Basic Education in Indonesia” · USAID Indonesia, public domain, Wikimedia Commons',
  '“Elementary students reciting Al Quran in school” · rachmatwhd, CC BY-SA 2.0, Wikimedia Commons',
  '“Flag Ceremony at School in Indonesia” · Aina Aiikyo, CC BY-SA 3.0, Wikimedia Commons',
  '“Upacara bendera di SMP Kartika” · Moch Nesha AR, CC BY-SA 3.0, Wikimedia Commons',
]

export default function Footer({ settings }) {
  const name = settings?.madrasah_name || 'Madrasah Digital'
  return (
    <footer className="site-footer">
      <div className="axis">
        <div className="footer-name">{name}</div>
        <div className="footer-row">
          <div>
            <p style={{ margin: '0 0 8px' }}>{settings?.address || 'Alamat madrasah'}</p>
            <Link to="/agenda" className="link-underline">Agenda madrasah</Link>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 8px' }}>{settings?.email || 'info@madrasah.sch.id'}</p>
            <Link to="/admin/login" className="link-underline">Masuk CMS</Link>
          </div>
        </div>
        <p className="footer-credits" style={{ marginTop: 40 }}>
          Kredit foto: {credits.join(' · ')}
        </p>
      </div>
    </footer>
  )
}
