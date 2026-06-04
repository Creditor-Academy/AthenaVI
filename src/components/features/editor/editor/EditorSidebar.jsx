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
import SidebarSceneThumb from './SidebarSceneThumb';
import {
  SCENE_TRANSITION_OPTIONS,
  getSceneTransitionType,
  getSceneTransitionLabel,
  normalizeSceneTransition,
  sceneHasVisibleTransition,
} from '../../../../utils/sceneTransitionUtils';
import './EditorSidebar.css';

const SceneConnector = ({ nextScene, onAddScene, onTransitionChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const transitionType = getSceneTransitionType(nextScene);
  const transitionLabel = getSceneTransitionLabel(nextScene);
  const hasTransition = sceneHasVisibleTransition(nextScene);

  return (
    <div className="scene-connector">
      <div className="scene-connector__line" aria-hidden />
      <div className="scene-connector__center">
        <button
          type="button"
          className={`scene-connector__transition ${hasTransition ? '' : 'scene-connector__transition--none'}`}
          title={hasTransition ? `Transition into next scene: ${transitionLabel}` : 'Add transition'}
          onClick={(e) => {
            e.stopPropagation();
            setShowPicker((v) => !v);
          }}
        >
          <MdAnimation size={12} />
          {hasTransition ? transitionLabel : 'Transition'}
        </button>
        <button
          type="button"
          className="scene-connector__add"
          title="Insert scene here"
          onClick={(e) => {
            e.stopPropagation();
            onAddScene?.();
          }}
        >
          <MdAdd size={15} />
        </button>
        {showPicker && (
          <div className="scene-connector__picker" onClick={(e) => e.stopPropagation()}>
            {SCENE_TRANSITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`scene-connector__picker-option ${transitionType === opt.value ? 'scene-connector__picker-option--active' : ''}`}
                onClick={() => {
                  onTransitionChange?.(opt.value);
                  setShowPicker(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="scene-connector__line" aria-hidden />
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
      <div className="scenes-sidebar">
        <div className="scenes-sidebar__header">
          <span className="scenes-sidebar__title">
            <MdGridView size={17} />
            Scenes
          </span>
          <button
            type="button"
            className="scenes-sidebar__add-btn"
            onClick={() => setShowTemplateModal?.(true)}
            title="Add scene"
          >
            <MdAdd size={18} />
          </button>
        </div>

        <div className="scenes-sidebar__list premium-scrollbar">
          {scenes.map((scene, index) => {
            const isActive = activeSceneId === scene.id;
            return (
              <React.Fragment key={scene.id}>
                {index > 0 && (
                  <SceneConnector
                    nextScene={scene}
                    onAddScene={() => onAddSceneAfter?.(index - 1)}
                    onTransitionChange={(value) =>
                      updateScene?.(scene.id, { transition: normalizeSceneTransition(value) })
                    }
                  />
                )}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectScene?.(scene.id);
                    setTimelineScope?.('single');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectScene?.(scene.id);
                      setTimelineScope?.('single');
                    }
                  }}
                  className={`scene-list-card ${isActive ? 'scene-list-card--active' : ''}`}
                >
                  <div className="scene-list-card__thumb">
                    <SidebarSceneThumb scene={scene} isActive={isActive} />
                    <div className="scene-list-card__badge">#{index + 1}</div>
                    <div className="scene-list-card__duration">
                      {(scene.duration || 8.0).toFixed(1)}s
                    </div>
                    {isActive && timelineScope === 'single' && (
                      <div className="scene-list-card__active-overlay">
                        <div className="scene-list-card__play">
                          <MdPlayArrow size={16} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="scene-list-card__footer">
                    <span className="scene-list-card__title">
                      {scene.title || `Scene ${index + 1}`}
                    </span>
                    <div className="scene-list-card__actions">
                      {onDuplicateScene && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateScene(scene.id);
                          }}
                          className="scene-list-card__action-btn"
                          title="Duplicate scene"
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
                          className="scene-list-card__action-btn"
                          title="Delete scene"
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

        <div className="scenes-sidebar__footer">
          <button
            type="button"
            className={`scenes-sidebar__sequence-btn ${timelineScope === 'all' ? 'scenes-sidebar__sequence-btn--active' : 'scenes-sidebar__sequence-btn--idle'}`}
            onClick={() => setTimelineScope?.('all')}
          >
            <MdLayers size={16} />
            View all sequence
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorSidebar;
