import { useState } from 'react'
import { FiRotateCcw } from 'react-icons/fi'
import ColorFillPicker from './ColorFillPicker'
import {
  SHAPE_EFFECT_OPTIONS,
  STYLE_EFFECT_OPTIONS,
  buildTextEffectStyle,
} from '../../../../utils/textEffectsUtils'

function fillSolidColor(fill, fallback = '#3B82F6') {
  if (!fill) return fallback
  if (typeof fill === 'string') return fill
  return fill.color || fallback
}

export default function TextEffectsPanel({
  element,
  palette,
  disabled = false,
  onChange,
}) {
  const c = element?.content || {}
  const shape =
    c.shapeEffect ||
    c.textShape ||
    (c.curveAmount != null && Number(c.curveAmount) !== 0
      ? Math.abs(Number(c.curveAmount)) >= 95
        ? 'circle'
        : 'curve'
      : 'none')
  const styleEffect = c.textEffect || 'none'

  const patch = (updates) => {
    onChange?.({ ...c, ...updates })
  }

  const setShape = (nextShape) => {
    if (nextShape === 'none') {
      patch({ shapeEffect: 'none', textShape: 'none', curveAmount: 0 })
    } else if (nextShape === 'circle') {
      patch({ shapeEffect: 'circle', textShape: 'circle', curveAmount: 100 })
    } else {
      const amt = c.curveAmount && Number(c.curveAmount) !== 0 ? Number(c.curveAmount) : 50
      patch({ shapeEffect: 'curve', textShape: 'curve', curveAmount: amt })
    }
  }

  const setStyleEffect = (nextEffect) => {
    patch({ textEffect: nextEffect })
  }

  const curveAmount = c.curveAmount != null ? Number(c.curveAmount) : 50

  return (
    <div className="ppt-text-effects-panel">
      {/* ── Shape Section (Curve / Circle) ── */}
      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Shape</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-effects-grid ppt-effects-grid--shape">
            {SHAPE_EFFECT_OPTIONS.map((opt) => {
              const active =
                opt.id === 'circle'
                  ? shape === 'circle' || Math.abs(curveAmount) >= 95
                  : opt.id === 'curve'
                    ? (shape === 'curve' || curveAmount !== 0) && Math.abs(curveAmount) < 95
                    : (shape === 'none' || !shape) && curveAmount === 0

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`ppt-effect-tile ${active ? 'is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => setShape(opt.id)}
                >
                  <div className={`ppt-effect-thumb ppt-effect-thumb--${opt.id}`}>
                    <span className="ppt-effect-thumb-text">ABC</span>
                  </div>
                  <span className="ppt-effect-label">{opt.label}</span>
                </button>
              )
            })}
          </div>

          {(shape === 'curve' || shape === 'circle' || curveAmount !== 0) && (
            <div className="ppt-effect-params">
              <div className="ppt-props-row ppt-props-row--slider">
                <div className="ppt-props-row-head">
                  <span className="ppt-props-row-label">Curve degree</span>
                  <span className="ppt-props-slider-value">{curveAmount}°</span>
                </div>
                <div className="ppt-props-slider">
                  <input
                    type="range"
                    min={-100}
                    max={100}
                    value={curveAmount}
                    disabled={disabled}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      const nextS = Math.abs(val) >= 95 ? 'circle' : val !== 0 ? 'curve' : 'none'
                      patch({ curveAmount: val, shapeEffect: nextS, textShape: nextS })
                    }}
                  />
                  <button
                    type="button"
                    className="ppt-effect-reset-btn"
                    title="Reset curve"
                    disabled={disabled || curveAmount === 0}
                    onClick={() => patch({ curveAmount: 0, shapeEffect: 'none', textShape: 'none' })}
                  >
                    <FiRotateCcw size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Style Effects Section ── */}
      <section className="ppt-props-group">
        <header className="ppt-props-group-head">
          <h3 className="ppt-props-group-title">Style Effects</h3>
        </header>
        <div className="ppt-props-group-body">
          <div className="ppt-effects-grid ppt-effects-grid--style">
            {STYLE_EFFECT_OPTIONS.map((opt) => {
              const active = styleEffect === opt.id
              const previewStyle = buildTextEffectStyle({ textEffect: opt.id }, palette, '#2563EB')

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`ppt-effect-tile ${active ? 'is-active' : ''}`}
                  disabled={disabled}
                  onClick={() => setStyleEffect(opt.id)}
                >
                  <div className="ppt-effect-thumb">
                    <span className="ppt-effect-thumb-text" style={previewStyle}>
                      Ag
                    </span>
                  </div>
                  <span className="ppt-effect-label">{opt.label}</span>
                </button>
              )
            })}
          </div>

          {/* ── Dynamic Controls for Active Style Effect ── */}
          {styleEffect !== 'none' && (
            <div className="ppt-effect-params">
              {styleEffect === 'shadow' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Offset</span>
                      <span className="ppt-props-slider-value">{c.shadowOffset ?? 4}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={c.shadowOffset ?? 4}
                        disabled={disabled}
                        onChange={(e) => patch({ shadowOffset: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Blur</span>
                      <span className="ppt-props-slider-value">{c.shadowBlur ?? 4}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={c.shadowBlur ?? 4}
                        disabled={disabled}
                        onChange={(e) => patch({ shadowBlur: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Shadow color</span>
                    <ColorFillPicker
                      title="Shadow color"
                      compact
                      value={c.shadowColor || 'rgba(0, 0, 0, 0.45)'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#000000"
                      onChange={(fill) => patch({ shadowColor: fillSolidColor(fill, 'rgba(0, 0, 0, 0.45)') })}
                    />
                  </div>
                </>
              )}

              {styleEffect === 'lift' && (
                <div className="ppt-props-row ppt-props-row--slider">
                  <div className="ppt-props-row-head">
                    <span className="ppt-props-row-label">Intensity</span>
                    <span className="ppt-props-slider-value">{c.liftIntensity ?? 50}%</span>
                  </div>
                  <div className="ppt-props-slider">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={c.liftIntensity ?? 50}
                      disabled={disabled}
                      onChange={(e) => patch({ liftIntensity: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {styleEffect === 'hollow' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Thickness</span>
                      <span className="ppt-props-slider-value">{c.hollowThickness ?? 2}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={c.hollowThickness ?? 2}
                        disabled={disabled}
                        onChange={(e) => patch({ hollowThickness: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Stroke color</span>
                    <ColorFillPicker
                      title="Stroke color"
                      compact
                      value={c.hollowColor || '#000000'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#000000"
                      onChange={(fill) => patch({ hollowColor: fillSolidColor(fill, '#000000') })}
                    />
                  </div>
                </>
              )}

              {styleEffect === 'splice' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Thickness</span>
                      <span className="ppt-props-slider-value">{c.spliceThickness ?? 2}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={c.spliceThickness ?? 2}
                        disabled={disabled}
                        onChange={(e) => patch({ spliceThickness: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Offset</span>
                      <span className="ppt-props-slider-value">{c.spliceOffset ?? 3}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={c.spliceOffset ?? 3}
                        disabled={disabled}
                        onChange={(e) => patch({ spliceOffset: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Splice color</span>
                    <ColorFillPicker
                      title="Splice color"
                      compact
                      value={c.spliceColor || '#3B82F6'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#3B82F6"
                      onChange={(fill) => patch({ spliceColor: fillSolidColor(fill, '#3B82F6') })}
                    />
                  </div>
                </>
              )}

              {styleEffect === 'outline' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Thickness</span>
                      <span className="ppt-props-slider-value">{c.outlineThickness ?? 2}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={c.outlineThickness ?? 2}
                        disabled={disabled}
                        onChange={(e) => patch({ outlineThickness: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Outline color</span>
                    <ColorFillPicker
                      title="Outline color"
                      compact
                      value={c.outlineColor || '#000000'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#000000"
                      onChange={(fill) => patch({ outlineColor: fillSolidColor(fill, '#000000') })}
                    />
                  </div>
                </>
              )}

              {styleEffect === 'echo' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Offset</span>
                      <span className="ppt-props-slider-value">{c.echoOffset ?? 3}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={1}
                        max={20}
                        value={c.echoOffset ?? 3}
                        disabled={disabled}
                        onChange={(e) => patch({ echoOffset: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Echo color</span>
                    <ColorFillPicker
                      title="Echo color"
                      compact
                      value={c.echoColor || '#6366F1'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#6366F1"
                      onChange={(fill) => patch({ echoColor: fillSolidColor(fill, '#6366F1') })}
                    />
                  </div>
                </>
              )}

              {styleEffect === 'glitch' && (
                <div className="ppt-props-row ppt-props-row--slider">
                  <div className="ppt-props-row-head">
                    <span className="ppt-props-row-label">Offset</span>
                    <span className="ppt-props-slider-value">{c.glitchOffset ?? 3}px</span>
                  </div>
                  <div className="ppt-props-slider">
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={c.glitchOffset ?? 3}
                      disabled={disabled}
                      onChange={(e) => patch({ glitchOffset: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {styleEffect === 'neon' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Intensity</span>
                      <span className="ppt-props-slider-value">{c.neonIntensity ?? 70}%</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={c.neonIntensity ?? 70}
                        disabled={disabled}
                        onChange={(e) => patch({ neonIntensity: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Glow color</span>
                    <ColorFillPicker
                      title="Glow color"
                      compact
                      value={c.neonColor || '#EC4899'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#EC4899"
                      onChange={(fill) => patch({ neonColor: fillSolidColor(fill, '#EC4899') })}
                    />
                  </div>
                </>
              )}

              {styleEffect === 'background' && (
                <>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Roundness</span>
                      <span className="ppt-props-slider-value">{c.textBgRadius ?? 8}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={0}
                        max={30}
                        value={c.textBgRadius ?? 8}
                        disabled={disabled}
                        onChange={(e) => patch({ textBgRadius: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--slider">
                    <div className="ppt-props-row-head">
                      <span className="ppt-props-row-label">Padding</span>
                      <span className="ppt-props-slider-value">{c.textBgPadding ?? 6}px</span>
                    </div>
                    <div className="ppt-props-slider">
                      <input
                        type="range"
                        min={0}
                        max={24}
                        value={c.textBgPadding ?? 6}
                        disabled={disabled}
                        onChange={(e) => patch({ textBgPadding: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="ppt-props-row ppt-props-row--fill">
                    <span className="ppt-props-row-label">Background</span>
                    <ColorFillPicker
                      title="Background color"
                      compact
                      value={c.textBgColor || '#FEF08A'}
                      palette={palette}
                      disabled={disabled}
                      fallbackHex="#FEF08A"
                      onChange={(fill) => patch({ textBgColor: fillSolidColor(fill, '#FEF08A') })}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
