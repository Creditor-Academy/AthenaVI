import { useEffect, useMemo, useRef, useState } from 'react'
import { MdKeyboardArrowDown, MdSearch } from 'react-icons/md'
import { ensureGoogleFontLoaded, injectStylesheet } from '../../../utils/googleFonts'
import { preloadFontPreview, useFontCatalog } from './useFontCatalog'
import './FontPicker.css'

function fontLinkId(family) {
  return `google-font-${String(family || '').replace(/\s+/g, '-').toLowerCase()}`
}

function loadFontFace(fontOrFamily) {
  if (!fontOrFamily) return
  if (typeof fontOrFamily === 'string') {
    ensureGoogleFontLoaded(fontOrFamily)
    return
  }
  if (fontOrFamily.cssUrl) {
    injectStylesheet(fontOrFamily.cssUrl, fontLinkId(fontOrFamily.family))
  } else {
    ensureGoogleFontLoaded(fontOrFamily.family)
  }
}

function normalizeFamily(family) {
  return String(family || '').trim()
}

function familyKey(family) {
  return normalizeFamily(family).toLowerCase()
}

function uniqueFamilyNames(families = []) {
  const seen = new Set()
  const out = []
  for (const raw of families) {
    const name = normalizeFamily(raw)
    if (!name) continue
    const key = familyKey(name)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out
}

function resolveFont(family, catalogByKey) {
  const name = normalizeFamily(family)
  if (!name) return null
  return catalogByKey.get(familyKey(name)) || { family: name, featured: false, category: null }
}

/**
 * Shared Google Fonts catalog picker.
 * Stores family name only via onChange(family, fontMeta?).
 *
 * Canva-style panel: search → Recommended (used in doc / fallbacks) → Featured.
 */
export default function FontPicker({
  value = '',
  onChange,
  disabled = false,
  label = 'Font family',
  menuLabel,
  showPairings = false,
  onApplyPairing,
  className = '',
  compact = false,
  /** Fonts already used in the current presentation / document. */
  usedFontFamilies = [],
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const searchRef = useRef(null)
  const { fonts, recommendedFonts, pairings, query, setQuery, loading, error } = useFontCatalog({
    enabled: open || Boolean(value),
  })

  const isSearching = Boolean(String(query || '').trim())

  const catalogByKey = useMemo(() => {
    const map = new Map()
    for (const font of fonts) {
      if (font?.family) map.set(familyKey(font.family), font)
    }
    for (const font of recommendedFonts) {
      if (font?.family && !map.has(familyKey(font.family))) {
        map.set(familyKey(font.family), font)
      }
    }
    return map
  }, [fonts, recommendedFonts])

  const recommendedList = useMemo(() => {
    const fromDoc = uniqueFamilyNames(usedFontFamilies)
      .map((family) => resolveFont(family, catalogByKey))
      .filter(Boolean)

    if (fromDoc.length) return fromDoc

    // Fallback when nothing is used yet (brand kits / empty decks): curated pairings.
    return recommendedFonts
  }, [usedFontFamilies, catalogByKey, recommendedFonts])

  const featuredList = useMemo(() => {
    if (isSearching) return fonts
    const recommendedKeys = new Set(recommendedList.map((f) => familyKey(f.family)))
    return fonts.filter((f) => f?.family && !recommendedKeys.has(familyKey(f.family)))
  }, [isSearching, fonts, recommendedList])

  useEffect(() => {
    if (value) ensureGoogleFontLoaded(value)
  }, [value])

  useEffect(() => {
    if (!open) return undefined
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false)
    }
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => searchRef.current?.focus(), 0)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const preview = isSearching
      ? fonts.slice(0, 40)
      : [...recommendedList.slice(0, 20), ...featuredList.slice(0, 40)]
    preview.forEach(preloadFontPreview)
  }, [open, isSearching, fonts, recommendedList, featuredList])

  const handleSelect = (font) => {
    loadFontFace(font)
    onChange?.(font.family, font)
    setOpen(false)
    setQuery('')
  }

  const handlePairing = (pairing) => {
    ;[pairing.heading, pairing.subheading, pairing.body].filter(Boolean).forEach(ensureGoogleFontLoaded)
    onApplyPairing?.(pairing)
    setOpen(false)
    setQuery('')
  }

  const displayValue = value || 'Select font'
  const recommendedKeys = useMemo(
    () => new Set(recommendedList.map((f) => familyKey(f.family))),
    [recommendedList]
  )
  const showCurrentInFeatured =
    Boolean(value) &&
    !isSearching &&
    !recommendedKeys.has(familyKey(value)) &&
    !featuredList.some((f) => familyKey(f.family) === familyKey(value))

  const renderFontButton = (font) => {
    const isActive = familyKey(value) === familyKey(font.family)
    return (
      <button
        key={font.family}
        type="button"
        role="option"
        aria-selected={isActive}
        className={`font-picker__item ${isActive ? 'is-active' : ''}`}
        style={{ fontFamily: font.family }}
        onMouseEnter={() => preloadFontPreview(font)}
        onClick={() => handleSelect(font)}
      >
        {font.family}
        {font.category ? <span className="font-picker__item-cat">{font.category}</span> : null}
      </button>
    )
  }

  return (
    <div
      className={`font-picker ${compact ? 'font-picker--compact' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
      ref={rootRef}
    >
      {label ? <span className="font-picker__label">{label}</span> : null}
      <button
        type="button"
        className={`font-picker__trigger ${open ? 'is-open' : ''}`}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev)
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span className="font-picker__value" style={value ? { fontFamily: value } : undefined}>
          {displayValue}
        </span>
        <MdKeyboardArrowDown size={18} aria-hidden className={`font-picker__chevron ${open ? 'open' : ''}`} />
      </button>

      {open ? (
        <div
          className="font-picker__panel workspace-header-dropdown fade-in-fast"
          role="listbox"
          aria-label={menuLabel || label || 'Font family'}
        >
          <div className="font-picker__search">
            <label className="font-picker__search-field">
              <MdSearch size={18} aria-hidden className="font-picker__search-icon" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                placeholder="Search fonts"
                aria-label="Search fonts"
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </label>
          </div>

          <div className="font-picker__body">
            {showPairings && pairings.length > 0 && !isSearching ? (
              <div className="font-picker__section">
                <div className="font-picker__section-title">Pairings</div>
                <div className="font-picker__pairings">
                  {pairings.slice(0, 12).map((pairing) => (
                    <button
                      key={pairing.id}
                      type="button"
                      className="font-picker__pairing"
                      onClick={() => handlePairing(pairing)}
                    >
                      <span className="font-picker__pairing-heading" style={{ fontFamily: pairing.heading }}>
                        {pairing.heading}
                      </span>
                      <span className="font-picker__pairing-meta">
                        <span style={{ fontFamily: pairing.subheading }}>{pairing.subheading}</span>
                        {' · '}
                        <span style={{ fontFamily: pairing.body }}>{pairing.body}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!isSearching && recommendedList.length > 0 ? (
              <div className="font-picker__section">
                <div className="font-picker__section-title">Recommended</div>
                <div className="font-picker__list font-picker__list--section">
                  {recommendedList.map(renderFontButton)}
                </div>
              </div>
            ) : null}

            <div className="font-picker__section">
              <div className="font-picker__section-title">
                {isSearching ? 'Search results' : 'Featured'}
              </div>
              {loading ? <div className="font-picker__status">Loading…</div> : null}
              {error ? <div className="font-picker__status font-picker__status--error">{error}</div> : null}
              {!loading && !error && featuredList.length === 0 && !showCurrentInFeatured ? (
                <div className="font-picker__status">No fonts found</div>
              ) : null}
              <div className="font-picker__list font-picker__list--section">
                {showCurrentInFeatured ? (
                  <button
                    type="button"
                    role="option"
                    aria-selected
                    className="font-picker__item is-active"
                    style={{ fontFamily: value }}
                    onClick={() => {
                      ensureGoogleFontLoaded(value)
                      onChange?.(value)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    {value}
                  </button>
                ) : null}
                {featuredList.map(renderFontButton)}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
