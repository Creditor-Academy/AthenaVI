import { MdTextFields } from 'react-icons/md';
import { FONT_COMBINATIONS, TEXT_STYLE_PRESETS } from '../../../../constants/textPresets';
import { buildTextDisplayStyle } from '../../../../utils/textEffects';

function comboPreviewStyle(combo) {
  const built = buildTextDisplayStyle(
    {
      ...combo.style,
      ...(combo.textEffect ? { textEffect: combo.textEffect } : {}),
    },
    1
  );
  const size = combo.previewFontSize ?? combo.style?.fontSize;
  return {
    ...built,
    fontSize: typeof size === 'number' ? `${size}px` : size,
    whiteSpace: combo.multiline ? 'pre-line' : 'nowrap',
    lineHeight: combo.multiline ? 1.15 : built.lineHeight,
    maxWidth: '100%',
  };
}

const EditorSidebarText = ({ addLayer, setSelectedLayerId, onClose }) => {
  const addTextClip = (text, meta = {}) => {
    const newId = addLayer('text', text, meta);
    if (newId && setSelectedLayerId) {
      setSelectedLayerId(newId);
    }
    onClose?.();
  };

  const handlePreset = (preset) => {
    addTextClip(preset.text, {
      style: {
        ...preset.style,
        ...(preset.textEffect ? { textEffect: preset.textEffect } : {}),
      },
    });
  };

  const handleCombination = (combo) => {
    addTextClip(combo.text, {
      style: {
        ...combo.style,
        ...(combo.textEffect ? { textEffect: combo.textEffect } : {}),
      },
    });
  };

  return (
    <div className="text-tool-panel">
      <button
        type="button"
        className="text-tool-add-btn"
        onClick={() => addTextClip('Text')}
      >
        <MdTextFields size={18} />
        Add a text box
      </button>

      <p className="text-tool-brand-hint">No brand fonts set for this Brand Kit</p>

      <div className="text-tool-section">
        <h4 className="text-tool-section-title">Default text styles</h4>
        <div className="text-tool-presets">
          {TEXT_STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`text-tool-preset text-tool-preset--${preset.id}`}
              onClick={() => handlePreset(preset)}
            >
              <span style={preset.style}>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-tool-section">
        <h4 className="text-tool-section-title">Font combinations</h4>
        <div className="text-tool-combos-grid">
          {FONT_COMBINATIONS.map((combo) => (
            <button
              key={combo.id}
              type="button"
              className="text-tool-combo-card"
              onClick={() => handleCombination(combo)}
              title={combo.text}
            >
              <span
                className={`text-tool-combo-preview${combo.multiline ? ' text-tool-combo-preview--multiline' : ''}`}
                style={comboPreviewStyle(combo)}
              >
                {combo.preview}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarText;
