import React, { useState } from 'react';
import {
  MdAdd,
  MdClose,
  MdDelete,
  MdGridView,
  MdLayers,
  MdPlayArrow,
  MdAnimation,
  MdContentCopy,
} from 'react-icons/md';
import SidebarSceneThumb from './SidebarSceneThumb';
import SceneTransitionPicker from './SceneTransitionPicker';
import {
  getSceneTransitionCatalogValue,
  getSceneTransitionLabel,
  normalizeSceneTransition,
  sceneHasVisibleTransition,
} from '../../../../utils/sceneTransitionUtils';
import './EditorSidebar.css';

const SceneConnector = ({ nextScene, onAddScene, onOpenTransitionPicker }) => {
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
            onOpenTransitionPicker?.();
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
  const [transitionPickerSceneId, setTransitionPickerSceneId] = useState(null);

  const pickerScene = scenes.find((s) => s.id === transitionPickerSceneId);

  const handleSelectTransition = (value) => {
    if (!transitionPickerSceneId) return;
    updateScene?.(transitionPickerSceneId, { transition: normalizeSceneTransition(value) });
    setTransitionPickerSceneId(null);
  };

  return (
    <div className="tools-panel-new" style={{ display: 'flex', height: '100%', borderRight: '1px solid var(--border-color)' }}>
      <div className="scenes-sidebar">
        <div className="scenes-sidebar__header">
          <span className="scenes-sidebar__title">
            <MdGridView size={17} />
            {transitionPickerSceneId ? 'Transitions' : 'Scenes'}
          </span>
          {transitionPickerSceneId ? (
            <button
              type="button"
              className="scenes-sidebar__close-btn"
              onClick={() => setTransitionPickerSceneId(null)}
              aria-label="Close transitions"
              title="Close"
            >
              <MdClose size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="scenes-sidebar__add-btn"
              onClick={() => setShowTemplateModal?.(true)}
              title="Add scene"
            >
              <MdAdd size={18} />
            </button>
          )}
        </div>

        <div className="scenes-sidebar__viewport">
          <div className={`scenes-sidebar__track ${transitionPickerSceneId ? 'scenes-sidebar__track--picker' : ''}`}>
            <div className="scenes-sidebar__pane">
              <div className="scenes-sidebar__list premium-scrollbar">
                {scenes.map((scene, index) => {
                  const isActive = activeSceneId === scene.id;
                  return (
                    <React.Fragment key={scene.id}>
                      {index > 0 && (
                        <SceneConnector
                          nextScene={scene}
                          onAddScene={() => onAddSceneAfter?.(index - 1)}
                          onOpenTransitionPicker={() => setTransitionPickerSceneId(scene.id)}
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
            </div>

            <div className="scenes-sidebar__pane">
              {transitionPickerSceneId && (
                <SceneTransitionPicker
                  activeValue={getSceneTransitionCatalogValue(pickerScene)}
                  onSelect={handleSelectTransition}
                />
              )}
            </div>
          </div>
        </div>

        {!transitionPickerSceneId && (
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
        )}
      </div>
    </div>
  );
};

export default EditorSidebar;
