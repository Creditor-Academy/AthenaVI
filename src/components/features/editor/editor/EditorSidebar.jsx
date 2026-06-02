import React, { useState } from 'react';
import {
  MdAdd,
  MdDelete,
  MdGridView,
  MdLayers,
  MdPlayArrow,
  MdAnimation,
  MdContentCopy,
} from 'react-icons/md';

const TRANSITION_OPTIONS = [
  { value: 'fade', label: 'Dissolve' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'blur', label: 'Blur' },
  { value: 'none', label: 'None' },
];

const SceneBetweenGap = ({
  nextScene,
  onAddScene,
  onTransitionChange,
}) => {
  const [showTransitionPicker, setShowTransitionPicker] = useState(false);
  const transition = nextScene?.transition || 'fade';
  const transitionLabel = TRANSITION_OPTIONS.find((o) => o.value === transition)?.label || 'Fade';

  return (
    <div className="scene-between-gap">
      <div className="scene-between-line" />
      <div className="scene-between-actions">
        <button
          type="button"
          className="scene-between-btn"
          title="Add scene here"
          onClick={(e) => {
            e.stopPropagation();
            onAddScene?.();
          }}
        >
          <MdAdd size={16} />
        </button>
        <div className="scene-between-transition-wrap">
          <button
            type="button"
            className="scene-between-btn scene-between-btn--transition"
            title={`Transition: ${transitionLabel}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowTransitionPicker((v) => !v);
            }}
          >
            <MdAnimation size={16} />
          </button>
          {showTransitionPicker && (
            <div
              className="scene-transition-picker"
              onClick={(e) => e.stopPropagation()}
            >
              {TRANSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`scene-transition-option ${transition === opt.value ? 'active' : ''}`}
                  onClick={() => {
                    onTransitionChange?.(opt.value);
                    setShowTransitionPicker(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditorSidebar = ({
  activeSceneId,
  scenes = [],
  timelineScope = 'all',
  setTimelineScope,
  onSelectScene,
  onDeleteScene,
  onDuplicateScene,
  setShowTemplateModal,
  onAddSceneAfter,
  updateScene,
}) => {
  return (
    <div className="tools-panel-new" style={{ display: 'flex', height: '100%', borderRight: '1px solid var(--border-color)' }}>
      <div className="scenes-sidebar" style={{
        width: '220px',
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdGridView size={16} /> Scenes
          </span>
          <button
            type="button"
            onClick={() => setShowTemplateModal && setShowTemplateModal(true)}
            style={{
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(var(--primary-rgb), 0.3)',
            }}
            title="Add Scene"
          >
            <MdAdd size={16} />
          </button>
        </div>

        <div className="premium-scrollbar" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}>
          {scenes.map((scene, index) => {
            const isActive = activeSceneId === scene.id;
            return (
              <React.Fragment key={scene.id}>
                {index > 0 && (
                  <SceneBetweenGap
                    nextScene={scene}
                    onAddScene={() => onAddSceneAfter?.(index - 1)}
                    onTransitionChange={(value) => updateScene?.(scene.id, { transition: value })}
                  />
                )}
                <div
                  onClick={() => {
                    onSelectScene?.(scene.id);
                    setTimelineScope?.('single');
                  }}
                  style={{
                    position: 'relative',
                    background: isActive ? 'var(--bg-surface)' : 'var(--bg-card)',
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(var(--primary-rgb), 0.15)' : 'none',
                  }}
                >
                  <div style={{
                    height: '80px',
                    background: scene.avatar
                      ? `url(${scene.avatar})`
                      : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      #{index + 1}
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '6px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                    }}>
                      {(scene.duration || 8.0).toFixed(1)}s
                    </div>

                    {isActive && timelineScope === 'single' && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(var(--primary-rgb), 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <div style={{
                          background: 'var(--primary)',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}>
                          <MdPlayArrow size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '6px', flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {scene.title || `Scene ${index + 1}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {onDuplicateScene && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateScene(scene.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Duplicate Scene"
                        >
                          <MdContentCopy size={13} />
                        </button>
                      )}
                      {scenes.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteScene?.(scene.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Delete Scene"
                        >
                          <MdDelete size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div style={{
          padding: '12px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
        }}>
          <button
            type="button"
            onClick={() => setTimelineScope?.('all')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: timelineScope === 'all' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: timelineScope === 'all' ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
              color: timelineScope === 'all' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <MdLayers size={16} /> View All Sequence
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebar;
