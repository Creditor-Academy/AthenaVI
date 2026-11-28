import { useEffect, useState } from 'react'
import PresentMode from '../pages/Slides/AIPptComponents/PresentMode'
import { prepareDeck } from '../export-render/exportDeck'
import {
  collectSlideFontFamilies,
  ensureElementFontsLoaded,
  ensureFontCssUrl,
  ensureThemeFontsLoaded,
} from '../utils/googleFonts'
import { createPresentProbe } from './presentProbe'

/** Bumped when the page's contract with the harness changes. */
export const PRESENT_EVAL_VERSION = 1

/**
 * Present, as the editor mounts it, on a deck injected by the harness. The deck goes through
 * the same preparation as the export render page (slide normalisation, re-theming, theme fonts).
 */
export default function PresentEvalApp() {
  const [job, setJob] = useState(null)

  useEffect(() => {
    const probe = createPresentProbe()
    window.__athenaPresent = {
      version: PRESENT_EVAL_VERSION,
      probe,
      /** Open Present on `payload.deck` (render-page payload shape) at `payload.slideIndex`. */
      open(payload) {
        const prepared = prepareDeck(payload)
        setJob({ ...prepared, slideIndex: Number(payload?.slideIndex) || 0, key: Date.now() })
        return prepared.slides.length
      },
      close() {
        setJob(null)
      },
    }
    window.__athenaPresent.loaded = true
  }, [])

  // Load the deck's fonts the same way the editor does.
  useEffect(() => {
    if (!job) return
    if (job.fontCssUrl) ensureFontCssUrl(job.fontCssUrl)
    else ensureThemeFontsLoaded(job.themeTokens)
    ensureElementFontsLoaded(collectSlideFontFamilies(job.slides))
  }, [job])

  if (!job) return null
  return (
    <PresentMode
      key={job.key}
      slides={job.slides}
      themeVisual={job.themeVisual}
      aspectRatio={job.aspectRatio}
      initialSlideIndex={job.slideIndex}
      onClose={() => {}}
      chrome="presenter"
      presence={null}
      fontVars={job.fontVars}
    />
  )
}
