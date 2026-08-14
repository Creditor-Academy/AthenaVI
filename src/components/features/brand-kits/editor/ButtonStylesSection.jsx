import { FontMetricField, FontMetricSelect } from '../TypeSpecEditors'
import { FONT_WEIGHT_OPTIONS } from '../utils/brandKitConstants'
import { resolveButtonStyle } from '../../../../utils/brandKitHelpers'

function ColorSwatchPicker({ label, value, colors, allowEmpty, emptyLabel, disabled, onChange }) {
  return (
    <div className={`bk-btn-swatch-picker ${disabled ? 'is-disabled' : ''}`}>
      <span className="bk-tb-lbl">{label}</span>
      <div className="bk-btn-swatches" role="listbox" aria-label={label}>
        {allowEmpty ? (
          <button
            type="button"
            role="option"
            aria-selected={!value}
            className={`bk-btn-swatch bk-btn-swatch--empty${!value ? ' is-active' : ''}`}
            disabled={disabled}
            title={emptyLabel}
            onClick={() => onChange(null)}
          >
            Auto
          </button>
        ) : null}
        {(colors || []).map((color) => {
          const active = value === color.id
          return (
            <button
              key={color.id}
              type="button"
              role="option"
              aria-selected={active}
              className={`bk-btn-swatch${active ? ' is-active' : ''}`}
              style={{ background: color.hex || '#94A3B8' }}
              disabled={disabled}
              title={`${color.name || 'Color'} (${color.hex || ''})`}
              onClick={() => onChange(color.id)}
            />
          )
        })}
      </div>
    </div>
  )
}

function ButtonStyleSpecimen({
  kind,
  title,
  hint,
  canWrite,
  kitData,
  setKitData,
}) {
  const colors = kitData.colors || []
  const style = kitData.buttons?.[kind] || {}
  const resolved = resolveButtonStyle(kitData, kind)

  const patch = (partial) => {
    setKitData((prev) => ({
      ...prev,
      buttons: {
        ...(prev.buttons || {}),
        [kind]: {
          ...(prev.buttons?.[kind] || {}),
          ...partial,
        },
      },
    }))
  }

  return (
    <div className="bk-type-specimen-box bk-btn-specimen">
      <div className="bk-type-box-head">
        <span className="bk-type-box-tag">{title}</span>
        <span className="bk-btn-specimen-hint">{hint}</span>
      </div>

      <div className="bk-btn-preview-stage" aria-label={`${title} preview`}>
        <div className="bk-btn-preview-surface bk-btn-preview-surface--light">
          <button type="button" className="bk-button-style-preview" style={resolved.css}>
            {style.label || resolved.label || title}
          </button>
        </div>
        <div className="bk-btn-preview-surface bk-btn-preview-surface--dark">
          <button type="button" className="bk-button-style-preview" style={resolved.css}>
            {style.label || resolved.label || title}
          </button>
        </div>
      </div>

      <div className="bk-type-box-badges bk-type-box-badges--editable">
        <FontMetricField
          label="Label"
          value={style.label || ''}
          disabled={!canWrite}
          placeholder={title}
          ariaLabel={`${kind} label`}
          onChange={(label) => patch({ label })}
        />
        <FontMetricSelect
          label="Weight"
          value={String(style.fontWeight ?? 600)}
          options={FONT_WEIGHT_OPTIONS}
          disabled={!canWrite}
          menuLabel={`${kind} font weight`}
          onChange={(fontWeight) => patch({ fontWeight: Number(fontWeight) })}
        />
        <FontMetricField
          label="Size"
          value={String(style.fontSizePx ?? 14)}
          disabled={!canWrite}
          placeholder="14"
          ariaLabel={`${kind} font size`}
          onChange={(v) => patch({ fontSizePx: Number(v) || 14 })}
        />
        <FontMetricField
          label="Radius"
          value={String(style.borderRadiusPx ?? 10)}
          disabled={!canWrite}
          placeholder="10"
          ariaLabel={`${kind} radius`}
          onChange={(v) => patch({ borderRadiusPx: Number(v) || 0 })}
        />
      </div>

      <div className="bk-type-box-badges bk-type-box-badges--editable bk-btn-metrics-row">
        <FontMetricField
          label="Pad X"
          value={String(style.paddingXPx ?? 20)}
          disabled={!canWrite}
          placeholder="20"
          ariaLabel={`${kind} padding x`}
          onChange={(v) => patch({ paddingXPx: Number(v) || 0 })}
        />
        <FontMetricField
          label="Pad Y"
          value={String(style.paddingYPx ?? 10)}
          disabled={!canWrite}
          placeholder="10"
          ariaLabel={`${kind} padding y`}
          onChange={(v) => patch({ paddingYPx: Number(v) || 0 })}
        />
        <FontMetricField
          label="Border"
          value={String(style.borderWidthPx ?? 0)}
          disabled={!canWrite}
          placeholder="0"
          ariaLabel={`${kind} border width`}
          onChange={(v) => patch({ borderWidthPx: Number(v) || 0 })}
        />
      </div>

      <div className="bk-btn-color-panel">
        <ColorSwatchPicker
          label="Background"
          value={style.backgroundColorId || null}
          colors={colors}
          disabled={!canWrite}
          onChange={(backgroundColorId) => patch({ backgroundColorId })}
        />
        <ColorSwatchPicker
          label="Text"
          value={style.textColorId ?? null}
          colors={colors}
          allowEmpty
          emptyLabel="Auto contrast"
          disabled={!canWrite}
          onChange={(textColorId) => patch({ textColorId })}
        />
        <ColorSwatchPicker
          label="Border"
          value={style.borderColorId ?? null}
          colors={colors}
          allowEmpty
          emptyLabel="Match background"
          disabled={!canWrite}
          onChange={(borderColorId) => patch({ borderColorId })}
        />
      </div>
    </div>
  )
}

export default function ButtonStylesSection({ canWrite, kitData, setKitData }) {
  return (
    <div className="bk-btn-specimen-stack">
      <ButtonStyleSpecimen
        kind="primary"
        title="Primary"
        hint="Filled CTA for main actions"
        canWrite={canWrite}
        kitData={kitData}
        setKitData={setKitData}
      />
      <ButtonStyleSpecimen
        kind="secondary"
        title="Secondary"
        hint="Soft / outlined companion action"
        canWrite={canWrite}
        kitData={kitData}
        setKitData={setKitData}
      />
    </div>
  )
}
