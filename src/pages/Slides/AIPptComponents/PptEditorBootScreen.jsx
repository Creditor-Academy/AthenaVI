import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import '../AIPptGenerator.css'

const BOOT_SLIDES = [
  {
    id: 'boot-1',
    title: 'Opening your deck',
    lines: ['Title slide', 'Clear hierarchy', 'Brand-ready'],
    accent: '#0f172a',
  },
  {
    id: 'boot-2',
    title: 'Laying out slides',
    lines: ['Sections', 'Key points', 'Visual rhythm'],
    accent: '#1e3a5f',
  },
  {
    id: 'boot-3',
    title: 'Polishing visuals',
    lines: ['Imagery', 'Charts', 'Spacing'],
    accent: '#334155',
  },
  {
    id: 'boot-4',
    title: 'Almost ready',
    lines: ['Transitions', 'Typography', 'Final pass'],
    accent: '#0f172a',
  },
]

const DWELL_MS = 1700

/**
 * Editor open loader — same card-shuffle language as AIPptGenerating slide reveal.
 */
export default function PptEditorBootScreen({ title = '' }) {
  const [slideIndex, setSlideIndex] = useState(0)
  const count = BOOT_SLIDES.length

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % count)
    }, DWELL_MS)
    return () => window.clearInterval(timer)
  }, [count])

  const subtitle = String(title || '').trim() || 'Preparing your slides…'

  return (
    <div className="aig-editor-boot aig-editor-boot--shuffle" role="status" aria-live="polite" aria-busy="true">
      <div className="aig-bg-sky" aria-hidden />
      <div className="aig-bg-wave aig-bg-wave-1" aria-hidden />
      <div className="aig-bg-wave aig-bg-wave-2" aria-hidden />

      <main className="aig-main-fullscreen aig-main-center aig-editor-boot-main">
        <div className="aig-realtime-gen-container fade-in">
          <div className="aig-realtime-header fade-in">
            <Sparkles size={22} className="aig-pulse-icon" aria-hidden />
            <h3>Opening presentation</h3>
          </div>

          <div className="aig-realtime-carousel-wrapper aig-editor-boot-carousel">
            {BOOT_SLIDES.map((slide, i) => {
              let status = 'hidden'
              if (i === slideIndex) status = 'active'
              else if (i === (slideIndex - 1 + count) % count) status = 'prev'
              else if (i === (slideIndex + 1) % count) status = 'next'

              return (
                <div
                  key={slide.id}
                  className={`aig-realtime-slide-card aig-realtime-slide-card--layout aig-editor-boot-card pos-${status}`}
                  aria-hidden={status !== 'active'}
                >
                  <div
                    className="aig-editor-boot-card-stage"
                    style={{ '--boot-accent': slide.accent }}
                  >
                    <div className="aig-editor-boot-card-kicker" />
                    <div className="aig-editor-boot-card-heading" />
                    <div className="aig-editor-boot-card-lines">
                      <span />
                      <span />
                      <span className="is-short" />
                    </div>
                    <div className="aig-editor-boot-card-tiles">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="aig-realtime-caption">
                    <h1 className="aig-realtime-title aig-realtime-title--caption">
                      {slide.title}
                      {status === 'active' ? <span className="aig-type-cursor" /> : null}
                    </h1>
                    <p className="aig-realtime-layout-id">{slide.lines.join(' · ')}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <h2 className="aig-generating-title aig-editor-boot-title">{subtitle}</h2>
          <p className="aig-generating-text">Shuffling your slides into place…</p>

          <div className="aig-mini-slides-tray fade-in" aria-hidden>
            {BOOT_SLIDES.map((slide, i) => {
              const active = i === slideIndex
              const done = i < slideIndex
              return (
                <div
                  key={slide.id}
                  className={`aig-mini-slide ${active ? 'active' : done ? 'completed' : 'pending'}`}
                >
                  <span className="aig-mini-slide-num">{i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
