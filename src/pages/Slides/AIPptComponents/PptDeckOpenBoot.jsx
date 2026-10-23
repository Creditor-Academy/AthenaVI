import { useEffect, useState } from 'react'
import { usePptDaypart } from '../../../utils/pptDaypart'
import pptBgMorning from '../../../assets/ppt-bg/morning.png'
import pptBgAfternoon from '../../../assets/ppt-bg/afternoon.png'
import pptBgEvening from '../../../assets/ppt-bg/evening.png'
import pptBgNight from '../../../assets/ppt-bg/night.png'
import './PptDeckOpenBoot.css'

const PPT_DAY_BACKGROUNDS = {
  morning: pptBgMorning,
  afternoon: pptBgAfternoon,
  evening: pptBgEvening,
  night: pptBgNight,
}

const SUBLINES = [
  'Gathering your slides…',
  'Restoring layout and media…',
  'Preparing the canvas…',
]

const SUBLINE_MS = 2400

/**
 * PPT editor open loader — daypart background and Playfair type from the create dashboard.
 * Isolated from other feature boot screens.
 */
export default function PptDeckOpenBoot({ title = '' }) {
  const daypart = usePptDaypart()
  const background = PPT_DAY_BACKGROUNDS[daypart] || PPT_DAY_BACKGROUNDS.afternoon
  const [sublineIndex, setSublineIndex] = useState(0)
  const label = String(title || '').trim()
    ? `Loading presentation: ${String(title).trim()}`
    : 'Loading presentation'

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined
    const id = window.setInterval(() => {
      setSublineIndex((i) => (i + 1) % SUBLINES.length)
    }, SUBLINE_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className={`ppt-deck-open ppt-deck-open--${daypart}`}
      style={{ backgroundImage: `url(${background})` }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <div className="ppt-deck-open-center">
        <div className="ppt-deck-open-orb" aria-hidden>
          <span />
          <span />
          <i />
        </div>
        <div className="ppt-deck-open-copy">
          <h1 className="ppt-deck-open-title">
            Loading <em>Presentation</em>
          </h1>
          <p className="ppt-deck-open-subline" key={sublineIndex}>
            {SUBLINES[sublineIndex]}
          </p>
        </div>
      </div>
    </div>
  )
}
