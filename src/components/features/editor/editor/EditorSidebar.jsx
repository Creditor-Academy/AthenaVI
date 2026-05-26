import React from 'react';
import {
  MdAdd,
  MdDelete,
  MdGridView,
  MdLayers,
  MdPlayArrow,
} from 'react-icons/md';

const EditorSidebar = ({
  activeSceneId,
  scenes = [],
  timelineScope = 'all',
  setTimelineScope,
  onSelectScene,
  onDeleteScene,
  setShowTemplateModal,
}) => {
  return (
    <div className="tools-panel-new" style={{ display: 'flex', height: '100%', borderRight: '1px solid var(--border-color)' }}>
      {/* Scenes List Sidebar */}
      <div className="scenes-sidebar" style={{
        width: '220px',
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdGridView size={16} /> Scenes
          </span>
          <button 
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
              boxShadow: '0 2px 6px rgba(var(--primary-rgb), 0.3)'
            }}
            title="Add Scene"
          >
            <MdAdd size={16} />
          </button>
        </div>

        {/* Scenes List */}
        <div className="premium-scrollbar" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {scenes.map((scene, index) => {
            const isActive = activeSceneId === scene.id;
            return (
              <div
                key={scene.id}
                onClick={() => {
                  if (onSelectScene) {
                    onSelectScene(scene.id);
                  }
                  if (setTimelineScope) {
                    setTimelineScope('single');
                  }
                }}
                style={{
                  position: 'relative',
                  background: isActive ? 'var(--bg-surface)' : 'var(--bg-card)',
                  border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(var(--primary-rgb), 0.15)' : 'none'
                }}
              >
                {/* Scene thumbnail */}
                <div style={{
                  height: '80px',
                  background: `url(${scene.avatar || 'https://via.placeholder.com/300x150?text=Scene'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* Badge */}
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
                    backdropFilter: 'blur(4px)'
                  }}>
                    #{index + 1}
                  </div>
                  {/* Duration Badge */}
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
                    backdropFilter: 'blur(4px)'
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
                      justifyContent: 'center'
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
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}>
                        <MdPlayArrow size={16} />
                      </div>
                    </div>
                  )}
                </div>
                {/* Scene Info */}
                <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '6px', flex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {scene.title || `Scene ${index + 1}`}
                    </span>
                  </div>
                  {scenes.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onDeleteScene) onDeleteScene(scene.id);
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
                        justifyContent: 'center'
                      }}
                      title="Delete Scene"
                    >
                      <MdDelete size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Option */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card)'
        }}>
          <button
            onClick={() => {
              if (setTimelineScope) {
                setTimelineScope('all');
              }
            }}
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
              transition: 'all 0.2s ease'
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
