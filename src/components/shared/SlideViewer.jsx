import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Renders a lesson's slide deck (pre-converted to PNGs by scripts/convert-slides.js).
 * Expects public/slides/<weekId>/manifest.json + slide-01.png, slide-02.png, ...
 *
 * Usage: <SlideViewer weekId={meta.slides} />
 * Renders nothing if the week has no `slides` field or the manifest 404s.
 */
export default function SlideViewer({ weekId }) {
  const [manifest, setManifest] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (!weekId) return
    let cancelled = false
    setStatus('loading')
    setIndex(0)

    fetch(`/slides/${weekId}/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        setManifest(data)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [weekId])

  const goTo = useCallback(
    (i) => {
      if (!manifest) return
      setIndex(Math.max(0, Math.min(manifest.count - 1, i)))
    },
    [manifest]
  )

  const next = useCallback(() => goTo(index + 1), [goTo, index])
  const prev = useCallback(() => goTo(index - 1), [goTo, index])

  useEffect(() => {
    if (status !== 'ready') return
    function onKey(e) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, next, prev])

  // Lock page scroll while the fullscreen overlay is open
  useEffect(() => {
    if (!expanded) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [expanded])

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (delta < -40) next()
    if (delta > 40) prev()
    touchStartX.current = null
  }

  // No slides configured for this week — render nothing.
  if (!weekId) return null
  if (status === 'loading') return null
  if (status === 'error') return null

  const src = `/slides/${weekId}/${manifest.files[index]}`

  const slideImg = (
    <img
      key={src}
      src={src}
      alt={`Slide ${index + 1} of ${manifest.count}`}
      className="slide-image"
      draggable={false}
    />
  )

  return (
    <div className="slide-viewer">
      <p className="eyebrow text-dim">Lesson slides</p>

      <div className="slide-frame card" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button type="button" className="slide-expand-btn" onClick={() => setExpanded(true)} aria-label="View fullscreen">
          ⤢
        </button>

        {slideImg}

        <button
          type="button"
          className="slide-nav-btn slide-nav-prev"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          className="slide-nav-btn slide-nav-next"
          onClick={next}
          disabled={index === manifest.count - 1}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      {/* Always-visible controls — the overlay arrows above rely on :hover,
          which doesn't exist on touch, so these give phones a real affordance
          (in addition to swipe, which still works). */}
      <div className="slide-controls">
        <button type="button" className="btn btn-ghost btn-sm" onClick={prev} disabled={index === 0}>
          ‹ Prev
        </button>

        <div className="slide-controls-center">
          <span className="small text-faint">
            {index + 1} / {manifest.count}
          </span>
          <div className="slide-dots">
            {Array.from({ length: manifest.count }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`slide-dot${i === index ? ' current' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button type="button" className="btn btn-ghost btn-sm" onClick={next} disabled={index === manifest.count - 1}>
          Next ›
        </button>
      </div>

      {expanded && (
        <div
          className="slide-fullscreen"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={(e) => {
            if (e.target === e.currentTarget) setExpanded(false)
          }}
        >
          <button type="button" className="slide-fullscreen-close" onClick={() => setExpanded(false)} aria-label="Close fullscreen">
            ✕
          </button>
          <button
            type="button"
            className="slide-nav-btn slide-nav-prev"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            ‹
          </button>
          {slideImg}
          <button
            type="button"
            className="slide-nav-btn slide-nav-next"
            onClick={next}
            disabled={index === manifest.count - 1}
            aria-label="Next slide"
          >
            ›
          </button>
          <span className="slide-fullscreen-count small">
            {index + 1} / {manifest.count}
          </span>
        </div>
      )}
    </div>
  )
}
