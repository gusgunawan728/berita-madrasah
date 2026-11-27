export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="news-card tone-1" aria-hidden="true">
          <div className="news-card-media skeleton" />
          <div className="news-card-body">
            <div className="skeleton" style={{ width: '35%', height: 13 }} />
            <div className="skeleton" style={{ height: 28 }} />
            <div className="skeleton" style={{ height: 16 }} />
            <div className="skeleton" style={{ height: 16, width: '70%' }} />
          </div>
        </div>
      ))}
    </>
  )
}

export function LoadingLine({ children = 'Memuat data…' }) {
  return <p className="loading-line" role="status">{children}</p>
}
