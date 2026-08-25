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

/**
 * Shared Google Fonts catalog picker.
 * Stores family name only via onChange(family, fontMeta?).
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
  defaultBrowse = 'recommended',
}) {
  const [open, setOpen] = useState(false)
  const [browse, setBrowse] = useState(defaultBrowse)
  const rootRef = useRef(null)
  const searchRef = useRef(null)
  const { fonts, recommendedFonts, pairings, query, setQuery, loading, error } = useFontCatalog({
    enabled: open || Boolean(value),
  })

  const isSearching = Boolean(String(query || '').trim())
  const listFonts = useMemo(() => {
    if (isSearching) return fonts
    return browse === 'featured' ? fonts : recommendedFonts
  }, [isSearching, browse, fonts, recommendedFonts])

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
    listFonts.slice(0, 40).forEach(preloadFontPreview)
  }, [open, listFonts])

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
  const hasCurrentInList = listFonts.some((f) => f.family === value)
  const sectionTitle = isSearching
    ? 'Search results'
    : browse === 'featured'
      ? 'Featured'
      : 'Recommended'

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
            <MdSearch size={16} aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Search fonts…"
              aria-label="Search fonts"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>

          {!isSearching ? (
            <div className="font-picker__tabs" role="tablist" aria-label="Font lists">
              <button
                type="button"
                role="tab"
                aria-selected={browse === 'recommended'}
                className={`font-picker__tab ${browse === 'recommended' ? 'is-active' : ''}`}
                onClick={() => setBrowse('recommended')}
              >
                Recommended
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={browse === 'featured'}
                className={`font-picker__tab ${browse === 'featured' ? 'is-active' : ''}`}
                onClick={() => setBrowse('featured')}
              >
                Featured
              </button>
            </div>
          ) : null}

          {showPairings && pairings.length > 0 && !isSearching && browse === 'recommended' ? (
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

          <div className="font-picker__section">
            <div className="font-picker__section-title">{sectionTitle}</div>
            {loading ? <div className="font-picker__status">Loading…</div> : null}
            {error ? <div className="font-picker__status font-picker__status--error">{error}</div> : null}
            {!loading && !error && listFonts.length === 0 ? (
              <div className="font-picker__status">No fonts found</div>
            ) : null}
            <div className="font-picker__list">
              {value && !hasCurrentInList ? (
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
              {listFonts.map((font) => {
                const isActive = value === font.family
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
                    {font.category ? (
                      <span className="font-picker__item-cat">{font.category}</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
