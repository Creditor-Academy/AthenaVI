import { useEffect, useRef, useState } from 'react'
import { MdKeyboardArrowDown } from 'react-icons/md'
import { FONT_WEIGHT_OPTIONS, POPULAR_GOOGLE_FONTS } from './utils/brandKitConstants'
import { ensureGoogleFontLoaded } from './utils/brandKitUtils'

export function FontMetricSelect({ label, value, options, onChange, disabled = false, menuLabel, previewAsFont = false }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const current = options.find((option) => option.value === value) || options[0]

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
    if (!open || !previewAsFont) return
    options.forEach((option) => ensureGoogleFontLoaded(option.value))
  }, [open, options, previewAsFont])

  return (
    <div className={`bk-type-metric ${disabled ? 'is-disabled' : ''}`} ref={rootRef}>
      <span className="bk-tb-lbl">{label}</span>
      <button
        type="button"
        className={`bk-type-metric-input bk-type-metric-trigger ${open ? 'is-open' : ''}`}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev)
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span
          className="bk-type-metric-trigger__value"
          style={previewAsFont ? { fontFamily: current?.value || value } : undefined}
        >
          {current?.label || value}
        </span>
        <MdKeyboardArrowDown
          size={18}
          aria-hidden
          className={`bk-type-metric-trigger__chevron ${open ? 'open' : ''}`}
        />
      </button>
      {open ? (
        <div className="workspace-header-dropdown bk-type-font-menu fade-in-fast" role="listbox" aria-label={menuLabel || label}>
          {options.map((option) => {
            const isActive = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`workspace-header-dropdown__item ${isActive ? 'active' : ''}`}
                style={previewAsFont ? { fontFamily: option.value } : undefined}
                onClick={() => {
                  if (previewAsFont) ensureGoogleFontLoaded(option.value)
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function FontMetricField({ label, value, onChange, disabled = false, placeholder = '', ariaLabel }) {
  return (
    <label className={`bk-type-metric ${disabled ? 'is-disabled' : ''}`}>
      <span className="bk-tb-lbl">{label}</span>
      <input
        type="text"
        className="bk-type-metric-input"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel || label}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function TypographyColorPickers({
  lightLabel = 'Light mode text',
  darkLabel = 'Dark mode text',
  lightTextColorId,
  darkTextColorId,
  colors = [],
  disabled = false,
  onChange,
}) {
  return (
    <div className="bk-type-color-pickers">
      <div className={`bk-btn-swatch-picker ${disabled ? 'is-disabled' : ''}`}>
        <span className="bk-tb-lbl">{lightLabel}</span>
        <div className="bk-btn-swatches" role="listbox" aria-label={lightLabel}>
          {(colors || []).map((color) => {
            const active = lightTextColorId === color.id
            return (
              <button
                key={`light-${color.id}`}
                type="button"
                role="option"
                aria-selected={active}
                className={`bk-btn-swatch${active ? ' is-active' : ''}`}
                style={{ background: color.hex || '#94A3B8' }}
                disabled={disabled}
                title={`${color.name || 'Color'} (${color.hex || ''})`}
                onClick={() => onChange({ lightTextColorId: color.id })}
              />
            )
          })}
        </div>
      </div>
      <div className={`bk-btn-swatch-picker ${disabled ? 'is-disabled' : ''}`}>
        <span className="bk-tb-lbl">{darkLabel}</span>
        <div className="bk-btn-swatches" role="listbox" aria-label={darkLabel}>
          {(colors || []).map((color) => {
            const active = darkTextColorId === color.id
            return (
              <button
                key={`dark-${color.id}`}
                type="button"
                role="option"
                aria-selected={active}
                className={`bk-btn-swatch${active ? ' is-active' : ''}`}
                style={{ background: color.hex || '#94A3B8' }}
                disabled={disabled}
                title={`${color.name || 'Color'} (${color.hex || ''})`}
                onClick={() => onChange({ darkTextColorId: color.id })}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function TypeSpecEditors({ role, font, colors = [], canWrite, onPatch }) {
  const familyOptions = POPULAR_GOOGLE_FONTS.map((fontName) => ({ value: fontName, label: fontName }))
  const familyInList = familyOptions.some((option) => option.value === font.family)
  const familySelectOptions = familyInList
    ? familyOptions
    : [{ value: font.family, label: font.family }, ...familyOptions]

  return (
    <>
    <div className="bk-type-box-badges bk-type-box-badges--editable">
      <FontMetricSelect
        label="Font Family"
        value={font.family}
        options={familySelectOptions}
        disabled={!canWrite}
        menuLabel={`${role} font family`}
        previewAsFont
        onChange={(family) => {
          ensureGoogleFontLoaded(family)
          onPatch({ family })
        }}
      />
      <FontMetricSelect
        label="Weight"
        value={String(font.weight)}
        options={FONT_WEIGHT_OPTIONS}
        disabled={!canWrite}
        menuLabel={`${role} font weight`}
        onChange={(weight) => onPatch({ weight })}
      />
      <FontMetricField
        label="Size"
        value={font.size}
        disabled={!canWrite}
        placeholder="48px"
        ariaLabel={`${role} size`}
        onChange={(size) => onPatch({ size })}
      />
      <FontMetricField
        label="Line Height"
        value={font.lineHeight}
        disabled={!canWrite}
        placeholder="1.2"
        ariaLabel={`${role} line height`}
        onChange={(lineHeight) => onPatch({ lineHeight })}
      />
    </div>
    {colors.length > 0 ? (
      <TypographyColorPickers
        lightTextColorId={font.lightTextColorId}
        darkTextColorId={font.darkTextColorId}
        colors={colors}
        disabled={!canWrite}
        onChange={onPatch}
      />
    ) : null}
  </>
  )
}
