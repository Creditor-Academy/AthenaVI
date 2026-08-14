import { resolveButtonStyle } from '../../../../utils/brandKitHelpers'
import { FONT_WEIGHT_OPTIONS } from '../utils/brandKitConstants'

function ButtonStyleCard({
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
    <div className="bk-button-style-card">
      <div className="bk-button-style-preview-pane">
        <span className="bk-button-style-kicker">{title}</span>
        <button type="button" className="bk-button-style-preview" style={resolved.css}>
          {style.label || resolved.label || title}
        </button>
        <p className="bk-button-style-hint">{hint}</p>
      </div>

      <div className="bk-button-style-fields">
        <label className="bk-ov-field">
          <span>Label</span>
          <input
            type="text"
            value={style.label || ''}
            disabled={!canWrite}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder={title}
          />
        </label>

        <label className="bk-ov-field">
          <span>Background</span>
          <select
            value={style.backgroundColorId || ''}
            disabled={!canWrite}
            onChange={(e) => patch({ backgroundColorId: e.target.value || null })}
          >
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.hex})
              </option>
            ))}
          </select>
        </label>

        <label className="bk-ov-field">
          <span>Text color</span>
          <select
            value={style.textColorId ?? ''}
            disabled={!canWrite}
            onChange={(e) =>
              patch({ textColorId: e.target.value === '' ? null : e.target.value })
            }
          >
            <option value="">Auto contrast</option>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.hex})
              </option>
            ))}
          </select>
        </label>

        <label className="bk-ov-field">
          <span>Border color</span>
          <select
            value={style.borderColorId ?? ''}
            disabled={!canWrite}
            onChange={(e) =>
              patch({ borderColorId: e.target.value === '' ? null : e.target.value })
            }
          >
            <option value="">Match background</option>
            {colors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.hex})
              </option>
            ))}
          </select>
        </label>

        <div className="bk-button-style-grid">
          <label className="bk-ov-field">
            <span>Border width</span>
            <input
              type="number"
              min={0}
              max={12}
              value={style.borderWidthPx ?? 0}
              disabled={!canWrite}
              onChange={(e) => patch({ borderWidthPx: Number(e.target.value) })}
            />
          </label>
          <label className="bk-ov-field">
            <span>Radius</span>
            <input
              type="number"
              min={0}
              max={64}
              value={style.borderRadiusPx ?? 10}
              disabled={!canWrite}
              onChange={(e) => patch({ borderRadiusPx: Number(e.target.value) })}
            />
          </label>
          <label className="bk-ov-field">
            <span>Pad X</span>
            <input
              type="number"
              min={0}
              max={80}
              value={style.paddingXPx ?? 20}
              disabled={!canWrite}
              onChange={(e) => patch({ paddingXPx: Number(e.target.value) })}
            />
          </label>
          <label className="bk-ov-field">
            <span>Pad Y</span>
            <input
              type="number"
              min={0}
              max={48}
              value={style.paddingYPx ?? 10}
              disabled={!canWrite}
              onChange={(e) => patch({ paddingYPx: Number(e.target.value) })}
            />
          </label>
          <label className="bk-ov-field">
            <span>Weight</span>
            <select
              value={String(style.fontWeight ?? 600)}
              disabled={!canWrite}
              onChange={(e) => patch({ fontWeight: Number(e.target.value) })}
            >
              {FONT_WEIGHT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="bk-ov-field">
            <span>Font size</span>
            <input
              type="number"
              min={10}
              max={32}
              value={style.fontSizePx ?? 14}
              disabled={!canWrite}
              onChange={(e) => patch({ fontSizePx: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default function ButtonStylesSection({ canWrite, kitData, setKitData }) {
  return (
    <section className="bk-color-section bk-button-styles-section">
      <div className="bk-section-head-line">
        <span className="bk-sec-num">[03]</span>
        <h3 className="bk-sec-title">Button Styles</h3>
      </div>
      <p className="bk-type-page-desc" style={{ marginBottom: 16 }}>
        Primary and secondary buttons for decks, CTAs, and product UI. Colors pick from your
        palette and save with the brand kit.
      </p>
      <div className="bk-button-styles-grid">
        <ButtonStyleCard
          kind="primary"
          title="Primary button"
          hint="Filled CTA — uses brand primary by default"
          canWrite={canWrite}
          kitData={kitData}
          setKitData={setKitData}
        />
        <ButtonStyleCard
          kind="secondary"
          title="Secondary button"
          hint="Outlined / soft action — pairs with primary"
          canWrite={canWrite}
          kitData={kitData}
          setKitData={setKitData}
        />
      </div>
    </section>
  )
}
