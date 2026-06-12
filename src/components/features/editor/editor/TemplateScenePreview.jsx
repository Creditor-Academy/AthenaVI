import { useMemo } from 'react';
import LiveCanvasRenderer from './LiveCanvasRenderer';
import { prepareTemplateSceneForEditor } from '../../../../utils/templateSceneUtils';

/**
 * WYSIWYG template thumbnail — same clip layout as the live editor canvas.
 */
const TemplateScenePreview = ({ template, className = '' }) => {
  const scene = useMemo(
    () => (template?.clips?.length ? prepareTemplateSceneForEditor(template) : null),
    [template]
  );

  if (!scene) return null;

  return (
    <div
      className={`template-scene-preview ${className}`.trim()}
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
        background: '#f8fafc',
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <LiveCanvasRenderer scene={scene} overlayMode={false} />
      </div>
    </div>
  );
};

export default TemplateScenePreview;
