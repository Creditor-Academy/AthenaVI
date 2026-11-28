import { useCallback, useEffect, useRef, useState } from 'react'
import { clampIndex } from './slideshowKeys'

/** A transition belongs to the slide it leads into (the editor stores it on the next slide). */
export const slideTransition = (slide) => slide?.transition || slide?.elements?.transition || 'none'

/**
 * The state of a slideshow, shared by every view of it (Present plan P1): which slide is up,
 * the transition to play, and following someone else's live presentation.
 *
 * @param {object} opts
 * @param {object[]} opts.slides
 * @param {number} [opts.initialSlideIndex]
 * @param {'presenter'|'audience'} [opts.chrome]  guests ('audience') follow the live presenter
 * @param {object|null} [opts.presence]  { presenter, isPresenting, conflict, canPresent,
 *   onStartPresenting, onStopPresenting } from the editor
 * @param {(index: number) => void} [opts.onIndexChange]  called when the slide changes
 */
export default function useSlideshow({
  slides = [],
  initialSlideIndex = 0,
  chrome = 'presenter',
  presence = null,
  onIndexChange,
}) {
  const count = slides.length
  const [rawIndex, setIndex] = useState(initialSlideIndex)
  // Slides can be removed while presenting (undo, a collaborator): never point past the last one.
  const index = clampIndex(rawIndex, count)

  // `reverse` flips the slide direction when stepping back; `tick` restarts the animation.
  // Opening on a slide plays the transition that leads into it, so a transition just applied
  // to the selected slide is visible straight away (Present starts on that slide).
  const [motion, setMotion] = useState(() => {
    const id = slideTransition(slides[initialSlideIndex])
    return { id, reverse: false, tick: id !== 'none' ? 1 : 0 }
  })

  // Guests always follow the live presenter by default; a member only follows
  // once someone else already holds the lock (never steal the cursor).
  const [following, setFollowing] = useState(chrome === 'audience')

  const presenter = presence?.presenter || null
  const isPresenting = Boolean(presence?.isPresenting)
  const conflict = presence?.conflict || null
  const canPresent = Boolean(presence?.canPresent)

  // These follow the presence data as it changes. They are adjusted while rendering (React's
  // pattern for state that depends on a changing input), not in effects, so there is no extra
  // render with the old value.
  // Starts empty, so a conflict or a live session already there when Present opens counts too.
  const [seen, setSeen] = useState({ conflict: null, isPresenting: false })
  if (seen.conflict !== conflict || seen.isPresenting !== isPresenting) {
    setSeen({ conflict, isPresenting })
    // Someone else already has the lock — follow them, don't fight for it.
    if (conflict && conflict !== seen.conflict) setFollowing(true)
    // I'm presenting — my own navigation drives the deck, stop following others.
    if (isPresenting && !seen.isPresenting) setFollowing(false)
  }

  // Following: go to the presenter's slide each time they move (each new `seq`).
  const [appliedSeq, setAppliedSeq] = useState(-Infinity)
  if (following && presenter && presenter.seq > appliedSeq) {
    setAppliedSeq(presenter.seq)
    const next = clampIndex(presenter.slideIndex, count)
    if (next !== rawIndex) setIndex(next)
  }

  // The editor passes a new callback on every render; only a slide change should call it.
  const onIndexChangeRef = useRef(onIndexChange)
  useEffect(() => {
    onIndexChangeRef.current = onIndexChange
  }, [onIndexChange])
  useEffect(() => {
    onIndexChangeRef.current?.(index)
  }, [index])

  const goTo = useCallback(
    (to) => {
      const target = clampIndex(to, slides.length)
      if (target === index) return
      const forward = target > index
      setFollowing(false)
      // Going forward plays the destination's transition; going back replays the one that
      // led into the current slide, in the opposite direction.
      const leadsIn = forward ? slides[target] : slides[index]
      setMotion((m) => ({ id: slideTransition(leadsIn), reverse: !forward, tick: m.tick + 1 }))
      setIndex(target)
    },
    [slides, index]
  )
  const go = useCallback((delta) => goTo(index + delta), [goTo, index])

  const jumpToPresenter = useCallback(() => {
    if (!presenter) return
    setAppliedSeq(presenter.seq)
    setIndex(clampIndex(presenter.slideIndex, count))
    setFollowing(true)
  }, [presenter, count])

  return {
    index,
    count,
    slide: slides[index],
    goTo,
    go,
    motion,
    following,
    jumpToPresenter,
    presenter,
    isPresenting,
    conflict,
    canPresent,
    startPresenting: presence?.onStartPresenting,
    stopPresenting: presence?.onStopPresenting,
  }
}

/**
 * Spotlight (the F key, "Focus"): one block of the slide at a time. Tied to the slide it was
 * started on, so it ends by itself when the slide changes.
 * @param {string[]} blockIds  the slide's blocks, in order
 * @param {number} index  the slide
 */
export function useSpotlight(blockIds, index) {
  const [state, setState] = useState({ index: -1, id: null })
  const activeId = state.index === index && blockIds.includes(state.id) ? state.id : null
  const key = blockIds.join('|')

  // Steps through blocks one at a time, then releases back to the full slide.
  const cycle = useCallback(() => {
    const ids = key ? key.split('|') : []
    if (!ids.length) return
    setState((prev) => {
      const current = prev.index === index ? prev.id : null
      if (!current) return { index, id: ids[0] }
      const at = ids.indexOf(current)
      if (at === -1 || at === ids.length - 1) return { index, id: null }
      return { index, id: ids[at + 1] }
    })
  }, [key, index])

  // While spotlight is on, clicking another block jumps to it; the same block again ends it.
  const select = useCallback(
    (id) => setState((prev) => ({ index, id: prev.index === index && prev.id === id ? null : id })),
    [index]
  )
  const clear = useCallback(() => setState({ index: -1, id: null }), [])

  return {
    activeId,
    position: activeId ? blockIds.indexOf(activeId) + 1 : 0,
    total: blockIds.length,
    cycle,
    select,
    clear,
  }
}
