/**
 * Frame-by-frame recorder for the Present harness (Phase 0.2 of PRESENT_MODE_PRODUCTION_PLAN.md).
 *
 * Every animation frame it notes which slide is up, whether the slide is drawn, and how many of
 * its pictures are still loading. Every key press starts a "change"; the change has settled on
 * the first frame where the new slide is drawn, all its pictures are loaded, fonts are ready and
 * no transition is running.
 *
 * It finds Present by these hooks. The rebuilt Present (Phases 2–3) must keep the data-* ones:
 *   root   [data-present-root]   or .ppt-present-overlay
 *   slide  [data-present-slide]  or .ppt-present-slide        (the letterboxed slide box)
 *   stage  [data-present-stage]  or .ppt-present-stage-plane  (the scaled slide contents)
 *   index  [data-present-index]  (0-based) or the "3 / 12" counter, .ppt-present-counter
 */

const pick = (scope, selectors) => {
  for (const selector of selectors) {
    const node = scope.querySelector(selector)
    if (node) return node
  }
  return null
}

const ROOT = ['[data-present-root]', '.ppt-present-overlay']
const SLIDE = ['[data-present-slide]', '.ppt-present-slide']
const STAGE = ['[data-present-stage]', '.ppt-present-stage-plane']

function readIndex(root) {
  const tagged = root.querySelector('[data-present-index]')
  if (tagged) return Number(tagged.getAttribute('data-present-index'))
  const counter = root.querySelector('.ppt-present-counter')
  const match = counter?.textContent?.match(/(\d+)/)
  return match ? Number(match[1]) - 1 : -1
}

/** Product of the computed opacity of `node` and its ancestors up to `root`. */
function effectiveOpacity(node, root) {
  let opacity = 1
  for (let n = node; n && n !== root.parentElement; n = n.parentElement) {
    opacity *= Number(getComputedStyle(n).opacity)
  }
  return opacity
}

function stageScale(stage) {
  const transform = getComputedStyle(stage).transform
  if (!transform || transform === 'none') return 1
  const values = transform.match(/matrix\(([^)]+)\)/)?.[1]?.split(',').map(Number)
  return values ? Math.hypot(values[0], values[1]) : 1
}

/**
 * Transitions and animations still running on the slide: on the slide box, inside it, or on a
 * box around it (a slide transition). The toolbar's own animations (nav dots, buttons) don't count.
 */
function runningAnimations(root, slide) {
  if (!slide || typeof root.getAnimations !== 'function') return 0
  return root.getAnimations({ subtree: true }).filter((a) => {
    if (a.playState !== 'running') return false
    if (a.effect?.getTiming?.().iterations === Infinity) return false // a looping pulse never ends
    const target = a.effect?.target
    return Boolean(target && (target === slide || target.contains(slide) || slide.contains(target)))
  }).length
}

/** What is on screen right now. */
export function presentSnapshot() {
  const root = pick(document, ROOT)
  if (!root) return { open: false, index: -1, drawn: false, pendingImages: 0, animating: 0, fontsReady: false }
  const slide = pick(root, SLIDE)
  const stage = slide ? pick(slide, STAGE) : null
  const rect = slide?.getBoundingClientRect()
  let drawn = Boolean(slide && rect.width > 0 && rect.height > 0)
  if (drawn && stage) {
    drawn = getComputedStyle(stage).visibility !== 'hidden' && stageScale(stage) > 0.001
  }
  if (drawn) drawn = effectiveOpacity(stage || slide, root) >= 0.05
  const images = slide ? [...slide.querySelectorAll('img')] : []
  return {
    open: true,
    index: readIndex(root),
    drawn,
    pendingImages: images.filter((img) => !img.complete).length,
    animating: runningAnimations(root, slide),
    fontsReady: document.fonts ? document.fonts.status === 'loaded' : true,
    slideRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
  }
}

const isSettled = (s) => s.open && s.drawn && s.pendingImages === 0 && s.animating === 0 && s.fontsReady

export function createPresentProbe() {
  let frames = []
  let keys = []
  let iframeTimes = []
  let raf = 0
  let observer = null

  const loop = (t) => {
    frames.push({ t, ...presentSnapshot() })
    raf = requestAnimationFrame(loop)
  }
  const onKey = (e) => {
    const snap = presentSnapshot()
    keys.push({ key: e.key, t0: e.timeStamp, fromIndex: snap.index })
  }

  return {
    start() {
      frames = []
      keys = []
      iframeTimes = []
      window.addEventListener('keydown', onKey, true)
      observer = new MutationObserver((records) => {
        const now = performance.now()
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1) continue
            const count = node.tagName === 'IFRAME' ? 1 : node.querySelectorAll?.('iframe').length || 0
            for (let i = 0; i < count; i += 1) iframeTimes.push(now)
          }
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
      raf = requestAnimationFrame(loop)
    },

    snapshot: presentSnapshot,

    /** True once the screen is settled after the last key press (or now, with no key yet). */
    settled() {
      const last = keys[keys.length - 1]
      const current = presentSnapshot()
      if (!last) return isSettled(current)
      return current.index !== last.fromIndex && isSettled(current)
    },

    /** Stop recording; one entry per key press. */
    stop() {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey, true)
      observer?.disconnect()
      const changes = keys.map((k, i) => {
        const end = keys[i + 1]?.t0 ?? Infinity
        const span = frames.filter((f) => f.t >= k.t0 && f.t < end)
        const toIndex = span.length ? span[span.length - 1].index : k.fromIndex
        const settledFrame = span.find((f) => f.index === toIndex && f.index !== k.fromIndex && isSettled(f))
        const until = settledFrame ? settledFrame.t : end
        const before = span.filter((f) => f.t <= until)
        return {
          key: k.key,
          fromIndex: k.fromIndex,
          toIndex,
          settleMs: settledFrame ? Math.round(settledFrame.t - k.t0) : null,
          frames: before.length,
          blankFrames: before.filter((f) => !f.drawn).length,
          popInFrames: before.filter((f) => f.drawn && f.index === toIndex && f.pendingImages > 0).length,
          iframesCreated: iframeTimes.filter((t) => t >= k.t0 && t < end).length,
        }
      })
      return { changes, frameCount: frames.length }
    },
  }
}
