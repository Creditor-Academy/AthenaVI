import {
  FiAlignCenter,
  FiAlignJustify,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiCheck,
  FiItalic,
  FiMinus,
  FiPlus,
  FiStar,
  FiUnderline,
} from 'react-icons/fi'
import { MdFormatListBulleted, MdFormatListNumbered, MdStrikethroughS } from 'react-icons/md'
import { stripLeadingListMarkers } from '../../../../utils/textListUtils'
import { applyElementTextFill, contentFillValue, contentPlainText, contentWithSyncedText } from '../../../../utils/pptTextContent'
import { ensureGoogleFontLoaded } from '../../../../utils/googleFonts'
import FontPicker from '../../../../components/shared/fonts/FontPicker'
import ColorFillPicker from './ColorFillPicker'
import './insertPanels.css'

const LIST_STYLE_OPTIONS = [
  { id: 'bullet', title: 'Bullet list', label: '•', useIcon: MdFormatListBulleted },
  { id: 'numbered', title: 'Numbered list', label: '1.', useIcon: MdFormatListNumbered },
  { id: 'star', title: 'Star list', label: '★', useIcon: FiStar },
  { id: 'check', title: 'Check list', label: '✓', useIcon: FiCheck },
  { id: 'dash', title: 'Dash list', label: '–', useIcon: FiMinus },
]

const CASE_OPTIONS = [
  { id: 'uppercase', title: 'Uppercase', label: 'AA' },
  { id: 'lowercase', title: 'Lowercase', label: 'aa' },
  { id: 'capitalize', title: 'Title case', label: 'Aa' },
]

const ALIGN_OPTIONS = [
  { id: 'left', Icon: FiAlignLeft, title: 'Align left' },
  { id: 'center', Icon: FiAlignCenter, title: 'Align center' },
  { id: 'right', Icon: FiAlignRight, title: 'Align right' },
  { id: 'justify', Icon: FiAlignJustify, title: 'Justify' },
]

/**
 * Text formatting controls — floating toolbar or Style panel.
 */
export default function ElementToolbar({
  element,
  palette,
  onChange,
  disabled = false,
  variant = 'floating',
  usedFontFamilies = [],
}) {
  if (!element || (element.type !== 'text' && element.type !== 'textbox')) return null

  const c = element.content || {}
  const fill = contentFillValue(c, palette, element.id)
  const isPanel = variant === 'panel'

  const patch = (updates) => {
    onChange?.({ ...c, ...updates })
  }

  const adjustSize = (delta) => {
    const current = Number(c.fontSize) || 22
    patch({ fontSize: Math.max(8, Math.min(200, current + delta)) })
  }

  const toggleList = (listType) => {
    const next = c.listType === listType ? null : listType
    const text = next ? stripLeadingListMarkers(contentPlainText(c)) : contentPlainText(c)
    onChange?.({ ...contentWithSyncedText(c, text), listType: next })
  }

  const setCase = (value) => {
    const next = c.textTransform === value ? null : value
    patch({ textTransform: next })
  }

  const fontFamilyControl = (
    <div className={`ppt-element-toolbar-font-picker ${isPanel ? 'is-panel' : ''}`}>
      <FontPicker
        label={isPanel ? '' : ''}
        value={c.fontFamily || 'Inter'}
        disabled={disabled}
        compact
        menuLabel="Font family"
        usedFontFamilies={usedFontFamilies}
        onChange={(family) => {
          ensureGoogleFontLoaded(family)
          patch({ fontFamily: family })
        }}
      />
    </div>
  )

  const sizeControl = (
    <div className="ppt-size-stepper" title="Font size">
      <button type="button" disabled={disabled} onClick={() => adjustSize(-1)} title="Decrease size">
        <FiMinus size={14} />
      </button>
      <input
        type="number"
        className="ppt-size-stepper-input"
        value={c.fontSize ?? 22}
        min={8}
        max={200}
        disabled={disabled}
        onChange={(e) => patch({ fontSize: Number(e.target.value) || 22 })}
      />
      <button type="button" disabled={disabled} onClick={() => adjustSize(1)} title="Increase size">
        <FiPlus size={14} />
      </button>
    </div>
  )

  const formatButtons = (
    <>
      <button
        type="button"
        className={`ppt-element-toolbar-btn ${c.bold ? 'is-active' : ''}`}
        disabled={disabled}
        onClick={() => patch({ bold: !c.bold })}
        title="Bold"
      >
        <FiBold size={15} />
      </button>
      <button
        type="button"
        className={`ppt-element-toolbar-btn ${c.italic ? 'is-active' : ''}`}
        disabled={disabled}
        onClick={() => patch({ italic: !c.italic })}
        title="Italic"
      >
        <FiItalic size={15} />
      </button>
      <button
        type="button"
        className={`ppt-element-toolbar-btn ${c.underline ? 'is-active' : ''}`}
        disabled={disabled}
        onClick={() => patch({ underline: !c.underline })}
        title="Underline"
      >
        <FiUnderline size={15} />
      </button>
      <button
        type="button"
        className={`ppt-element-toolbar-btn ${c.strikethrough ? 'is-active' : ''}`}
        disabled={disabled}
        onClick={() => patch({ strikethrough: !c.strikethrough })}
        title="Strikethrough"
      >
        <MdStrikethroughS size={16} />
      </button>
    </>
  )

  const alignButtons = ALIGN_OPTIONS.map(({ id, Icon, title }) => (
    <button
      key={id}
      type="button"
      className={`ppt-element-toolbar-btn ${(c.align || 'left') === id ? 'is-active' : ''}`}
      disabled={disabled}
      onClick={() => patch({ align: id })}
      title={title}
    >
      <Icon size={15} />
    </button>
  ))

  const listButtons = LIST_STYLE_OPTIONS.map(({ id, title, label, useIcon: Icon }) => (
    <button
      key={id}
      type="button"
      className={`ppt-element-toolbar-btn ${c.listType === id ? 'is-active' : ''}`}
      disabled={disabled}
      onClick={() => toggleList(id)}
      title={title}
    >
      {Icon ? <Icon size={id === 'dash' ? 14 : 16} /> : label}
    </button>
  ))

  const colorControl = (
    <div className="ppt-element-toolbar-color" title="Text color">
      <ColorFillPicker
        key={element.id}
        compact
        title="Text color"
        value={fill}
        palette={palette}
        disabled={disabled}
        onChange={(nextFill) => onChange?.(applyElementTextFill(element, nextFill))}
      />
    </div>
  )

  const wrapOn = (c.wrap || 'pre-wrap') !== 'nowrap'

  if (isPanel) {
    return (
      <>
        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Font</h3>
          </header>
          <div className="ppt-props-group-body">
            {fontFamilyControl}
            <div className="ppt-text-font-row">
              {sizeControl}
              {colorControl}
            </div>
            <div className="ppt-icon-cluster" role="group" aria-label="Text style">
              {formatButtons}
            </div>
          </div>
        </section>

        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Alignment</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-segmented ppt-segmented--4" role="radiogroup" aria-label="Text alignment">
              {ALIGN_OPTIONS.map(({ id, Icon, title }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={(c.align || 'left') === id}
                  className={`ppt-segmented-btn ${(c.align || 'left') === id ? 'is-active' : ''}`}
                  disabled={disabled}
                  title={title}
                  onClick={() => patch({ align: id })}
                >
                  <Icon size={15} aria-hidden />
                </button>
              ))}
            </div>
            <div className="ppt-icon-cluster" role="group" aria-label="List style">
              {listButtons}
            </div>
            <div className="ppt-segmented ppt-segmented--3" role="radiogroup" aria-label="Letter case">
              {CASE_OPTIONS.map(({ id, title, label }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={c.textTransform === id}
                  className={`ppt-segmented-btn ${c.textTransform === id ? 'is-active' : ''}`}
                  disabled={disabled}
                  title={title}
                  onClick={() => setCase(id)}
                >
                  <span className="ppt-case-glyph">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ppt-props-group">
          <header className="ppt-props-group-head">
            <h3 className="ppt-props-group-title">Spacing</h3>
          </header>
          <div className="ppt-props-group-body">
            <div className="ppt-props-row">
              <span className="ppt-props-row-label">Line height</span>
              <div className="ppt-props-row-control">
                <div className="ppt-size-stepper" title="Line height">
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Decrease line height"
                    onClick={() =>
                      patch({ lineHeight: Math.max(0.8, Number(((c.lineHeight ?? 1.25) - 0.05).toFixed(2))) })
                    }
                  >
                    <FiMinus size={14} />
                  </button>
                  <input
                    type="number"
                    className="ppt-size-stepper-input"
                    value={c.lineHeight ?? 1.25}
                    min={0.8}
                    max={3}
                    step={0.05}
                    disabled={disabled}
                    aria-label="Line height"
                    onChange={(e) => patch({ lineHeight: Number(e.target.value) || 1.25 })}
                  />
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Increase line height"
                    onClick={() =>
                      patch({ lineHeight: Math.min(3, Number(((c.lineHeight ?? 1.25) + 0.05).toFixed(2))) })
                    }
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="ppt-props-row">
              <span className="ppt-props-row-label">Letter spacing</span>
              <div className="ppt-props-row-control">
                <div className="ppt-size-stepper" title="Letter spacing">
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Decrease letter spacing"
                    onClick={() =>
                      patch({
                        letterSpacing: Math.max(-5, Number(((c.letterSpacing ?? 0) - 0.5).toFixed(1))),
                      })
                    }
                  >
                    <FiMinus size={14} />
                  </button>
                  <input
                    type="number"
                    className="ppt-size-stepper-input"
                    value={c.letterSpacing ?? 0}
                    min={-5}
                    max={40}
                    step={0.5}
                    disabled={disabled}
                    aria-label="Letter spacing"
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      patch({ letterSpacing: Number.isFinite(next) ? next : 0 })
                    }}
                  />
                  <button
                    type="button"
                    disabled={disabled}
                    aria-label="Increase letter spacing"
                    onClick={() =>
                      patch({
                        letterSpacing: Math.min(40, Number(((c.letterSpacing ?? 0) + 0.5).toFixed(1))),
                      })
                    }
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="ppt-props-row ppt-props-row--switch">
              <span className="ppt-props-row-label">Wrap text</span>
              <button
                type="button"
                className={`ppt-toggle-switch ${wrapOn ? 'is-on' : ''}`}
                role="switch"
                aria-checked={wrapOn}
                aria-label="Wrap text"
                disabled={disabled}
                onClick={() => patch({ wrap: wrapOn ? 'nowrap' : 'pre-wrap' })}
              />
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <div
      className="ppt-element-toolbar"
      role="toolbar"
      aria-label="Text formatting"
    >
      {fontFamilyControl}
      {sizeControl}
      <span className="ppt-element-toolbar-divider" />
      {formatButtons}
      <span className="ppt-element-toolbar-divider" />
      {colorControl}
      <span className="ppt-element-toolbar-divider" />
      {alignButtons}
      <span className="ppt-element-toolbar-divider" />
      {listButtons}
      <input
        type="number"
        className="ppt-element-toolbar-spacing"
        value={c.lineHeight ?? 1.25}
        min={0.8}
        max={3}
        step={0.05}
        disabled={disabled}
        onChange={(e) => patch({ lineHeight: Number(e.target.value) || 1.25 })}
        title="Line spacing"
      />
      <select
        className="ppt-ui-select ppt-element-toolbar-select ppt-element-toolbar-select--case"
        value={c.textTransform || 'none'}
        disabled={disabled}
        onChange={(e) => patch({ textTransform: e.target.value === 'none' ? null : e.target.value })}
        title="Letter case"
      >
        <option value="none">As typed</option>
        <option value="uppercase">UPPERCASE</option>
        <option value="lowercase">lowercase</option>
        <option value="capitalize">Title Case</option>
      </select>
    </div>
  )
}
