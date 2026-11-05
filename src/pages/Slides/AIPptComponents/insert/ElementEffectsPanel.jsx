import ColorFillPicker from './ColorFillPicker'
import {
  ELEMENT_EFFECT_DEFAULTS,
  ELEMENT_EFFECT_OPTIONS,
  ELEMENT_EFFECT_RANGES,
  elementEffectFilter,
  normalizeElementEffect,
  withElementEffectSettings,
  withElementEffectType,
} from '../../../../utils/elementEffects'

function fillSolidColor(fill, fallback) {
  if (!fill) return fallback
  if (typeof fill === 'string') return fill
  return fill.color || fallback
}

/** Which settings each effect shows, in order. */
const EFFECT_CONTROLS = {
  shadow: [
    { key: 'offset', label: 'Distance', unit: 'px' },
    { key: 'angle', label: 'Direction', unit: '°' },
    { key: 'blur', label: 'Blur', unit: 'px' },
    { key: 'transparency', label: 'Transparency', unit: '%' },
    { key: 'color', label: 'Shadow color' },
  ],
  lift: [{ key: 'intensity', label: 'Intensity', unit: '%' }],
  glow: [
    { key: 'size', label: 'Size', unit: 'px' },
    { key: 'color', label: 'Glow color' },
  ],
  outline: [
    { key: 'thickness', label: 'Thickness', unit: 'px' },
    { key: 'color', label: 'Outline color' },
  ],
  echo: [
    { key: 'offset', label: 'Offset', unit: 'px' },
    { key: 'color', label: 'Echo color' },
  ],
  neon: [
    { key: 'intensity', label: 'Intensity', unit: '%' },
    { key: 'color', label: 'Glow color' },
  ],
  glitch: [{ key: 'offset', label: 'Offset', unit: 'px' }],
  blur: [{ key: 'amount', label: 'Amount', unit: 'px' }],
}

// Tile previews are ~1/3 of a slide element, so shrink the effect to match.
const PREVIEW_SCALE = 0.4

/**
 * Effects for any element (shape, image, icon, chart, table, group…): shadow, glow, outline…
 * Writes `content.effect`; for a group the editor passes the change on to its elements.
 */
export default function ElementEffectsPanel({ element, palette, disabled = false, onChange }) {
  const c = element?.content || {}
  const fx = normalizeElementEffect(c.effect)
  const active = fx?.type || 'none'
  const controls = fx ? EFFECT_CONTROLS[fx.type] || [] : []

  return (
    <div className="ppt-text-effects-panel ppt-element-effects-panel">
      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Effects</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-effects-grid ppt-effects-grid--style" role="radiogroup" aria-label="Effect">
            {ELEMENT_EFFECT_OPTIONS.map((opt) => {
              const isActive = active === opt.id
              const preview = elementEffectFilter(
                { effect: { type: opt.id, ...(isActive ? fx : {}) } },
                { palette, scale: PREVIEW_SCALE }
              )
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  data-effect={opt.id}
                  className={`ppt-effect-tile ${isActive ? 'is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => onChange?.(withElementEffectType(c, opt.id))}
                >
                  <div className="ppt-effect-thumb ppt-effect-thumb--element">
                    <span className="ppt-effect-thumb-shape" style={{ filter: preview }} />
                  </div>
                  <span className="ppt-effect-label">{opt.label}</span>
                </button>
              )
            })}
          </div>

          {fx && controls.length ? (
            <div className="ppt-effect-params">
              {controls.map((ctl) => {
                if (ctl.key === 'color') {
                  const fallback = ELEMENT_EFFECT_DEFAULTS[fx.type].color
                  return (
                    <div key={ctl.key} className="ppt-props-row ppt-props-row--fill">
                      <span className="ppt-props-row-label">{ctl.label}</span>
                      <ColorFillPicker
                        title={ctl.label}
                        compact
                        value={fx.color}
                        palette={palette}
                        disabled={disabled}
                        fallbackHex={fallback}
                        onChange={(fill) =>
                          onChange?.(withElementEffectSettings(c, { color: fillSolidColor(fill, fallback) }))
                        }
                      />
                    </div>
                  )
                }
                const [min, max] = ELEMENT_EFFECT_RANGES[ctl.key]
                return (
                  <div key={ctl.key} className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">{ctl.label}</span>
                      <span className="ppt-props-slider-value">
                        {fx[ctl.key]}
                        {ctl.unit}
                      </span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={fx[ctl.key]}
                        disabled={disabled}
                        aria-label={ctl.label}
                        data-effect-setting={ctl.key}
                        onChange={(e) =>
                          onChange?.(withElementEffectSettings(c, { [ctl.key]: Number(e.target.value) }))
                        }
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
