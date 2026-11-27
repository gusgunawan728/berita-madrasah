import { useEffect } from 'react'

/** Menambahkan kelas is-in saat elemen masuk viewport. Aman bila JS gagal: konten tetap tampil. */
export default function useReveal(dependency) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal, .shutter-in').forEach((el) => el.classList.add('is-in'))
      return
    }
    const targets = new Set()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    const scan = () => {
      document.querySelectorAll('.reveal:not(.is-in), .shutter-in:not(.is-in)').forEach((el) => {
        if (!targets.has(el)) { targets.add(el); observer.observe(el) }
      })
    }
    scan()
    const mutations = new MutationObserver(scan)
    mutations.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutations.disconnect() }
  }, [dependency])
}
