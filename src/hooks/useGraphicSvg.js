import { useEffect, useMemo, useState } from 'react'

/**
 * Load an SVG URL for display.
 * - Always prefers a displayable image/blob URL for <img>.
 * - For recolorable + currentColor SVGs, also returns sanitized inline markup.
 */
export default function useGraphicSvg(src, { preferInline = false } = {}) {
  const [state, setState] = useState({
    imgSrc: src || '',
    inlineSvg: null,
    usesCurrentColor: false,
  })

  useEffect(() => {
    if (!src) {
      setState({ imgSrc: '', inlineSvg: null, usesCurrentColor: false })
      return undefined
    }

    if (src.startsWith('data:image/svg+xml')) {
      try {
        const decoded = decodeDataSvg(src)
        const usesCurrentColor = /currentColor/i.test(decoded)
        setState({
          imgSrc: src,
          inlineSvg: preferInline && usesCurrentColor ? sanitizeInlineSvg(decoded) : null,
          usesCurrentColor,
        })
      } catch {
        setState({ imgSrc: src, inlineSvg: null, usesCurrentColor: false })
      }
      return undefined
    }

    if (src.startsWith('blob:')) {
      setState({ imgSrc: src, inlineSvg: null, usesCurrentColor: false })
      return undefined
    }

    let cancelled = false
    let blobUrl = null

    fetch(src, { mode: 'cors', credentials: 'omit' })
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.text()
      })
      .then((text) => {
        if (cancelled) return
        const usesCurrentColor = /currentColor/i.test(text)
        const blob = new Blob([text], { type: 'image/svg+xml' })
        blobUrl = URL.createObjectURL(blob)
        setState({
          imgSrc: blobUrl,
          inlineSvg: preferInline && usesCurrentColor ? sanitizeInlineSvg(text) : null,
          usesCurrentColor,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setState({ imgSrc: src, inlineSvg: null, usesCurrentColor: false })
        }
      })

    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [src, preferInline])

  return state
}

function decodeDataSvg(dataUrl) {
  const comma = dataUrl.indexOf(',')
  const meta = dataUrl.slice(0, comma)
  const payload = dataUrl.slice(comma + 1)
  if (/;base64/i.test(meta)) {
    return atob(payload)
  }
  return decodeURIComponent(payload)
}

/** Strip scripts / event handlers before inlining. */
function sanitizeInlineSvg(raw) {
  let svg = String(raw || '')
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '')
  svg = svg.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  svg = svg.replace(/javascript:/gi, '')
  if (!/<svg[\s>]/i.test(svg)) return null
  // Ensure it scales to the container
  svg = svg.replace(
    /<svg\b([^>]*)>/i,
    (match, attrs) => {
      let next = attrs
      if (!/\bwidth\s*=/i.test(next)) next += ' width="100%"'
      if (!/\bheight\s*=/i.test(next)) next += ' height="100%"'
      if (!/\bpreserveAspectRatio\s*=/i.test(next)) next += ' preserveAspectRatio="xMidYMid meet"'
      return `<svg${next}>`
    }
  )
  return svg
}

export function resolveGraphicThemeColor(content = {}, palette = {}) {
  const fill = content.fill
  if (typeof fill === 'string' && fill) return fill
  if (fill && typeof fill === 'object' && fill.color) return fill.color
  const overrides = content.colorOverrides || {}
  if (typeof overrides.primary === 'string' && overrides.primary) return overrides.primary
  return palette?.primary || palette?.accent || '#6366F1'
}
