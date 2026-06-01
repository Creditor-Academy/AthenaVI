import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdTextFields,
  MdColorLens,
} from 'react-icons/md';
import {
  FONT_FAMILIES,
  FONT_WEIGHT_OPTIONS,
  TEXT_TRANSFORM_OPTIONS,
  getClipTextContent,
  parseFontSize,
} from '../../../../utils/textClip';

const SectionHeader = ({ icon, label }) => (
  <div className="scp-section-header">
    <div className="scp-section-header__icon">{icon}</div>
    <span className="scp-section-header__label">{label}</span>
  </div>
);

const Row = ({ label, children, column = true }) => (
  <div className="scp-row" style={{
    display: 'flex',
    flexDirection: column ? 'column' : 'row',
    alignItems: column ? 'stretch' : 'center',
    justifyContent: column ? 'flex-start' : 'space-between',
    gap: column ? 6 : 8,
    padding: '6px 0',
    width: '100%',
    minWidth: 0,
  }}>
    {label ? (
      <span className="scp-row__label" style={{
        fontSize: 11,
        color: 'var(--text-muted, #64748b)',
        fontWeight: 600,
        flexShrink: 0,
      }}>
        {label}
      </span>
    ) : null}
    <div className="scp-row__control" style={{ minWidth: 0, width: '100%' }}>{children}</div>
  </div>
);

const SliderRow = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <div className="scp-slider-row" style={{ padding: '6px 0', width: '100%', minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      <span className="scp-value-badge">
        {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', height: 4, cursor: 'pointer', display: 'block' }}
    />
  </div>
);

const SelectRow = ({ label, value, options, onChange }) => (
  <Row label={label} column>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--bg-surface, #f8fafc)',
        border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
        borderRadius: 8,
        padding: '6px 10px',
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-main, #1a1b1c)',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  </Row>
);

const NumberInput = ({ value, min, max, step = 1, unit = '', onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value);
        if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
      }}
      style={{
        width: 72,
        boxSizing: 'border-box',
        background: 'var(--bg-surface, #f8fafc)',
        border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
        borderRadius: 8,
        padding: '6px 8px',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-main, #1a1b1c)',
        outline: 'none',
      }}
    />
    {unit ? <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span> : null}
  </div>
);

const AlignButtons = ({ value, onChange }) => {
  const btns = [
    { icon: <MdFormatAlignLeft size={14} />, val: 'left' },
    { icon: <MdFormatAlignCenter size={14} />, val: 'center' },
    { icon: <MdFormatAlignRight size={14} />, val: 'right' },
  ];
  const active = value || 'left';
  return (
    <div className="scp-align-group">
      {btns.map(({ icon, val }) => (
        <button
          key={val}
          type="button"
          className={`scp-align-btn ${active === val ? 'active' : ''}`}
          onClick={() => onChange(val)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

const StyleToggleButtons = ({ items }) => (
  <div className="scp-align-group">
    {items.map(({ key, icon, active, onClick, title }) => (
      <button
        key={key}
        type="button"
        title={title}
        className={`scp-align-btn ${active ? 'active' : ''}`}
        onClick={onClick}
      >
        {icon}
      </button>
    ))}
  </div>
);

const Card = ({ children }) => (
  <div className="scp-card">{children}</div>
);

function readOpacity(layer) {
  const raw = layer?.opacity ?? layer?.style?.opacity;
  if (raw == null || raw === '') return 1;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}

function parsePx(value, fallback = 0) {
  if (value == null || value === '') return fallback;
  const n = parseFloat(String(value).replace('px', ''));
  return Number.isNaN(n) ? fallback : n;
}

const TextLayerPropertiesPanel = ({
  activeLayer,
  updateLayer,
  updateStyle,
  isHeading = false,
}) => {
  const updateTextContent = (text) => {
    const existing =
      typeof activeLayer.content === 'object' && activeLayer.content !== null
        ? activeLayer.content
        : {};
    updateLayer({ content: { ...existing, text } });
  };

  const textContent = getClipTextContent(activeLayer);
  const fontSize = parseFontSize(activeLayer.style?.fontSize, isHeading ? 48 : 32);
  const fontWeight = String(activeLayer.style?.fontWeight || (isHeading ? '900' : '700'));
  const fontStyle = activeLayer.style?.fontStyle || 'normal';
  const textDecoration = activeLayer.style?.textDecoration || 'none';
  const layerOpacity = readOpacity(activeLayer);

  return (
    <>
      <SectionHeader icon={<MdTextFields size={14} />} label="Content" />
      <Card>
        {isHeading ? (
          <input
            type="text"
            value={textContent}
            onChange={(e) => updateTextContent(e.target.value)}
            placeholder="Main title..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'white',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
              borderRadius: 8,
              padding: '7px 10px',
              fontSize: 12,
              color: 'var(--text-main, #1a1b1c)',
              outline: 'none',
            }}
          />
        ) : (
          <textarea
            value={textContent}
            onChange={(e) => updateTextContent(e.target.value)}
            rows={4}
            placeholder="Enter text..."
            style={{
              width: '100%',
              resize: 'vertical',
              boxSizing: 'border-box',
              background: 'white',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 12,
              color: 'var(--text-main, #1a1b1c)',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.5,
            }}
          />
        )}
      </Card>

      <SectionHeader icon={<MdColorLens size={14} />} label="Typography & Style" />
      <Card>
        <SelectRow
          label="Font family"
          value={activeLayer.style?.fontFamily || FONT_FAMILIES[0].value}
          options={FONT_FAMILIES}
          onChange={(v) => updateStyle({ fontFamily: v })}
        />

        <Row label="Font size" column={false}>
          <NumberInput
            value={fontSize}
            min={8}
            max={300}
            unit="px"
            onChange={(v) => updateStyle({ fontSize: v })}
          />
        </Row>
        <SliderRow
          label="Font size"
          value={fontSize}
          min={8}
          max={200}
          unit="px"
          onChange={(v) => updateStyle({ fontSize: v })}
        />

        <SelectRow
          label="Font weight"
          value={fontWeight}
          options={FONT_WEIGHT_OPTIONS}
          onChange={(v) => updateStyle({ fontWeight: v })}
        />

        <Row label="Font style">
          <StyleToggleButtons
            items={[
              {
                key: 'bold',
                title: 'Bold',
                icon: <MdFormatBold size={14} />,
                active: ['700', '800', '900', 'bold'].includes(fontWeight),
                onClick: () =>
                  updateStyle({
                    fontWeight: ['700', '800', '900', 'bold'].includes(fontWeight) ? '400' : '700',
                  }),
              },
              {
                key: 'italic',
                title: 'Italic',
                icon: <MdFormatItalic size={14} />,
                active: fontStyle === 'italic',
                onClick: () =>
                  updateStyle({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' }),
              },
              {
                key: 'underline',
                title: 'Underline',
                icon: <MdFormatUnderlined size={14} />,
                active: textDecoration.includes('underline'),
                onClick: () =>
                  updateStyle({
                    textDecoration: textDecoration.includes('underline') ? 'none' : 'underline',
                  }),
              },
              {
                key: 'strike',
                title: 'Strikethrough',
                    icon: <MdStrikethroughS size={14} />,
                active: textDecoration.includes('line-through'),
                onClick: () =>
                  updateStyle({
                    textDecoration: textDecoration.includes('line-through') ? 'none' : 'line-through',
                  }),
              },
            ]}
          />
        </Row>

        <SelectRow
          label="Text transform"
          value={activeLayer.style?.textTransform || 'none'}
          options={TEXT_TRANSFORM_OPTIONS}
          onChange={(v) => updateStyle({ textTransform: v })}
        />

        <Row label="Text color">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={activeLayer.style?.color || '#000000'}
              onChange={(e) => updateStyle({ color: e.target.value })}
              style={{
                width: 36,
                height: 28,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                padding: 2,
                background: 'none',
              }}
            />
            <input
              type="text"
              value={activeLayer.style?.color || '#000000'}
              onChange={(e) => updateStyle({ color: e.target.value })}
              style={{
                flex: 1,
                boxSizing: 'border-box',
                background: 'white',
                border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                borderRadius: 8,
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </div>
        </Row>

        <Row label="Background">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={
                activeLayer.style?.backgroundColor &&
                activeLayer.style.backgroundColor !== 'transparent'
                  ? activeLayer.style.backgroundColor
                  : '#ffffff'
              }
              onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
              style={{
                width: 36,
                height: 28,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                padding: 2,
                background: 'none',
              }}
            />
            <button
              type="button"
              className="scp-btn scp-btn--ghost"
              onClick={() => updateStyle({ backgroundColor: 'transparent' })}
              style={{ fontSize: 10, padding: '4px 8px' }}
            >
              Clear
            </button>
          </div>
        </Row>

        <Row label="Alignment">
          <AlignButtons
            value={activeLayer.style?.textAlign}
            onChange={(v) => updateStyle({ textAlign: v })}
          />
        </Row>

        <SliderRow
          label="Line height"
          value={parseFloat(activeLayer.style?.lineHeight) || 1.2}
          min={0.8}
          max={3}
          step={0.1}
          onChange={(v) => updateStyle({ lineHeight: v })}
        />

        <SliderRow
          label="Letter spacing"
          value={parsePx(activeLayer.style?.letterSpacing, 0)}
          min={-2}
          max={24}
          step={0.5}
          unit="px"
          onChange={(v) => updateStyle({ letterSpacing: `${v}px` })}
        />

        <SliderRow
          label="Padding"
          value={parsePx(activeLayer.style?.padding, 0)}
          min={0}
          max={64}
          unit="px"
          onChange={(v) => updateStyle({ padding: v ? `${v}px` : '0px' })}
        />

        <SliderRow
          label="Opacity"
          value={Math.round(layerOpacity * 100)}
          min={0}
          max={100}
          unit="%"
          onChange={(v) => updateLayer({ opacity: v / 100 })}
        />
      </Card>
    </>
  );
};

export default TextLayerPropertiesPanel;
