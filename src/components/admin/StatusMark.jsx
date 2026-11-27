const labels = { published: 'Terbit', pending: 'Menunggu tinjauan', draft: 'Draf' }

export default function StatusMark({ status }) {
  return <span className={`status-mark status-${status || 'draft'}`}>{labels[status] || 'Draf'}</span>
}
