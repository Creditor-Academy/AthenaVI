import { MdCheckCircle, MdErrorOutline, MdLightMode, MdDarkMode } from 'react-icons/md'
import { AA_CONTRAST_RATIO, getContrastChecks } from '../../../utils/brandKitHelpers'

const MODE_META = {
  light: { label: 'Light mode', icon: MdLightMode },
  dark: { label: 'Dark mode', icon: MdDarkMode },
}

/**
 * Lets users pick which palette colors are slide background + text for each mode,
 * with a live WCAG AA check (backend rejects saves below 4.5:1).
 */
export default function ColorContrastPanel({ kitData, setKitData, canWrite }) {
  const colors = kitData?.colors || []
  const roles = kitData?.colorRoles || {}
  const checks = getContrastChecks(kitData)

  const setRole = (key, colorId) => {
    setKitData((prev) => ({
      ...prev,
      colorRoles: { ...(prev.colorRoles || {}), [key]: colorId },
    }))
  }

  const renderSelect = (key, label) => (
    <label className="bk-contrast-field">
      <span className="bk-contrast-field-lbl">{label}</span>
      <select
        className="bk-contrast-select"
        value={roles[key] || ''}
        disabled={!canWrite}
        onChange={(e) => setRole(key, e.target.value)}
      >
        {!roles[key] && <option value="">Not set</option>}
        {colors.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name || c.id} · {c.hex}
          </option>
        ))}
      </select>
    </label>
  )

  return (
    <section className="bk-contrast-panel" aria-labelledby="bk-contrast-title">
      <div className="bk-contrast-head">
        <h3 id="bk-contrast-title" className="bk-contrast-title">Text readability</h3>
        <p className="bk-contrast-desc">
          Choose the background and text colors used on slides. Each pair needs at least{' '}
          {AA_CONTRAST_RATIO}:1 contrast (WCAG AA) before the kit can be saved.
        </p>
      </div>

      <div className="bk-contrast-rows">
        {checks.map((check) => {
          const { label, icon: Icon } = MODE_META[check.mode]
          const status = !check.enforced ? 'is-optional' : check.passes ? 'is-pass' : 'is-fail'
          return (
            <div className={`bk-contrast-row ${status}`} key={check.mode}>
              <div
                className="bk-contrast-sample"
                style={{ background: check.bg?.hex || 'transparent', color: check.text?.hex || 'inherit' }}
                aria-hidden="true"
              >
                Aa
              </div>
              <div className="bk-contrast-fields">
                <span className="bk-contrast-mode">
                  <Icon size={14} /> {label}
                </span>
                {renderSelect(check.bgKey, 'Background')}
                {renderSelect(check.textKey, 'Text')}
              </div>
              <span className="bk-contrast-badge" role="status">
                {!check.enforced ? (
                  'Optional — set both to enable'
                ) : check.ratio == null ? (
                  <>
                    <MdErrorOutline size={15} /> Invalid color
                  </>
                ) : (
                  <>
                    {check.passes ? <MdCheckCircle size={15} /> : <MdErrorOutline size={15} />}
                    {check.ratio.toFixed(2)}:1 · {check.passes ? 'Readable' : 'Too low'}
                  </>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
