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
import ColorFillPicker from './ColorFillPicker'
import './insertPanels.css'

const LIST_STYLE_OPTIONS = [
  { id: 'bullet', title: 'Bullet list', label: '•', useIcon: MdFormatListBulleted },
  { id: 'numbered', title: 'Numbered list', label: '1.', useIcon: MdFormatListNumbered },
  { id: 'star', title: 'Star list', label: '★', useIcon: FiStar },
  { id: 'check', title: 'Check list', label: '✓', useIcon: FiCheck },
  { id: 'dash', title: 'Dash list', label: '–', useIcon: FiMinus },
]

const FONT_FAMILIES = [
  'Inter',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
  'Courier New',
  'monospace',
]

/**
 * Floating toolbar for selected text elements (Pitch-style inline formatting).
 */
export default function ElementToolbar({
  element,
  palette,
  onChange,
  disabled = false,
  variant = 'floating',
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

  return (
    <div
      className={`ppt-element-toolbar ${isPanel ? 'ppt-element-toolbar--panel' : ''}`}
      role="toolbar"
      aria-label="Text formatting"
    >
      <select
        className="ppt-element-toolbar-select"
        value={c.fontFamily || 'Inter'}
        disabled={disabled}
        onChange={(e) => patch({ fontFamily: e.target.value })}
        title="Font family"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <div className="ppt-element-toolbar-size">
        <button type="button" disabled={disabled} onClick={() => adjustSize(-1)} title="Decrease size">
          <FiMinus size={14} />
        </button>
        <input
          type="number"
          className="ppt-element-toolbar-size-input"
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

      <span className="ppt-element-toolbar-divider" />

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

      <span className="ppt-element-toolbar-divider" />

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

      <span className="ppt-element-toolbar-divider" />

      {(['left', 'center', 'right', 'justify']).map((align) => {
        const Icon =
          align === 'left'
            ? FiAlignLeft
            : align === 'center'
              ? FiAlignCenter
              : align === 'right'
                ? FiAlignRight
                : FiAlignJustify
        return (
          <button
            key={align}
            type="button"
            className={`ppt-element-toolbar-btn ${(c.align || 'left') === align ? 'is-active' : ''}`}
            disabled={disabled}
            onClick={() => patch({ align })}
            title={`Align ${align}`}
          >
            <Icon size={15} />
          </button>
        )
      })}

      <span className="ppt-element-toolbar-divider" />

      {LIST_STYLE_OPTIONS.map(({ id, title, label, useIcon: Icon }) => (
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
      ))}

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

      <button
        type="button"
        className="ppt-element-toolbar-btn"
        disabled={disabled}
        onClick={() => patch({ textTransform: c.textTransform === 'uppercase' ? null : 'uppercase' })}
        title="Uppercase"
      >
        AA
      </button>
    </div>
  )
}
