import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import fontService from '../../../services/fontService'
import { ensureGoogleFontLoaded, injectStylesheet } from '../../../utils/googleFonts'
import {
  builtinFontEntries,
  isSystemFontFamily,
  mergeBuiltinAndCatalogFonts,
} from '../../../utils/legacyFonts'

const FEATURED_CACHE_TTL_MS = 5 * 60 * 1000

let featuredCache = null
let featuredCacheAt = 0
let featuredInflight = null

async function loadFeaturedCatalog() {
  const now = Date.now()
  if (featuredCache && now - featuredCacheAt < FEATURED_CACHE_TTL_MS) {
    return featuredCache
  }
  if (featuredInflight) return featuredInflight
  featuredInflight = fontService
    .getCatalog({ featured: true, limit: 100 })
    .then((data) => {
      const merged = {
        ...data,
        fonts: mergeBuiltinAndCatalogFonts(data?.fonts || []),
        pairings: data?.pairings || [],
      }
      featuredCache = merged
      featuredCacheAt = Date.now()
      return merged
    })
    .catch(() => {
      const fallback = {
        fonts: builtinFontEntries(),
        pairings: [],
      }
      featuredCache = fallback
      featuredCacheAt = Date.now()
      return fallback
    })
    .finally(() => {
      featuredInflight = null
    })
  return featuredInflight
}

function filterBuiltinByQuery(q) {
  const needle = String(q || '').trim().toLowerCase()
  if (!needle) return builtinFontEntries()
  return builtinFontEntries().filter((font) =>
    String(font.family).toLowerCase().includes(needle)
  )
}

/** Unique families from curated pairings (Recommended list). */
export function fontsFromPairings(pairings = [], catalogFonts = []) {
  const byFamily = new Map()
  for (const font of catalogFonts) {
    if (font?.family) byFamily.set(font.family.toLowerCase(), font)
  }
  const seen = new Set()
  const out = []
  for (const pairing of pairings) {
    for (const family of [pairing?.heading, pairing?.subheading, pairing?.body]) {
      const name = String(family || '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(byFamily.get(key) || { family: name, featured: true, category: null })
    }
  }
  return out
}

/**
 * Featured catalog (cached) + debounced search.
 * Always merges previous built-in fonts with Google catalog results.
 */
export function useFontCatalog({ enabled = true, searchDebounceMs = 250 } = {}) {
  const [fonts, setFonts] = useState(() => builtinFontEntries())
  const [pairings, setPairings] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchGen = useRef(0)

  const loadFeatured = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await loadFeaturedCatalog()
      setFonts(data.fonts || builtinFontEntries())
      setPairings(data.pairings || [])
    } catch (err) {
      setError(err?.message || 'Failed to load fonts')
      setFonts(builtinFontEntries())
      setPairings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    loadFeatured()
    return undefined
  }, [enabled, loadFeatured])

  useEffect(() => {
    if (!enabled) return undefined
    const q = String(query || '').trim()
    if (!q) {
      if (featuredCache) {
        setFonts(featuredCache.fonts || builtinFontEntries())
        setPairings(featuredCache.pairings || [])
      }
      return undefined
    }

    const gen = ++searchGen.current
    const timer = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fontService.getCatalog({ q, limit: 100 })
        if (searchGen.current !== gen) return
        setFonts(
          mergeBuiltinAndCatalogFonts(data.fonts || [], {
            builtins: filterBuiltinByQuery(q),
          })
        )
        if (Array.isArray(data.pairings) && data.pairings.length) {
          setPairings(data.pairings)
        }
      } catch (err) {
        if (searchGen.current !== gen) return
        setError(err?.message || 'Font search failed')
        setFonts(filterBuiltinByQuery(q))
      } finally {
        if (searchGen.current === gen) setLoading(false)
      }
    }, searchDebounceMs)

    return () => clearTimeout(timer)
  }, [query, enabled, searchDebounceMs])

  const recommendedFonts = useMemo(
    () => fontsFromPairings(pairings, featuredCache?.fonts || fonts),
    [pairings, fonts]
  )

  return {
    fonts,
    recommendedFonts,
    pairings,
    query,
    setQuery,
    loading,
    error,
    reload: loadFeatured,
  }
}

export function preloadFontPreview(font) {
  if (!font) return
  const family = typeof font === 'string' ? font : font.family
  if (isSystemFontFamily(family) || font?.source === 'system') return
  if (font.cssUrl) {
    injectStylesheet(
      font.cssUrl,
      `google-font-${String(font.family).replace(/\s+/g, '-').toLowerCase()}`
    )
  } else {
    ensureGoogleFontLoaded(family)
  }
}
