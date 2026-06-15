import { MdPlayArrow } from 'react-icons/md';
import SidebarSceneThumb from './SidebarSceneThumb';
import './AllSequencesPanel.css';

/**
 * Grid overview of all project scenes for quick navigation.
 */
const AllSequencesPanel = ({ scenes = [], activeSceneId, onSelectScene }) => (
  <div className="all-sequences-panel premium-scrollbar">
    <p className="all-sequences-panel__hint">
      {scenes.length} scene{scenes.length === 1 ? '' : 's'} in this project. Click any scene to jump to it.
    </p>
    <div className="all-sequences-panel__grid">
      {scenes.map((scene, index) => {
        const isActive = activeSceneId === scene.id;
        return (
          <button
            key={scene.id}
            type="button"
            className={`all-sequences-panel__card ${isActive ? 'all-sequences-panel__card--active' : ''}`}
            onClick={() => onSelectScene?.(scene.id)}
            aria-current={isActive ? 'true' : undefined}
          >
            <div className="all-sequences-panel__thumb">
              <SidebarSceneThumb scene={scene} isActive={isActive} />
              <span className="all-sequences-panel__badge">#{index + 1}</span>
              <span className="all-sequences-panel__duration">
                {(scene.duration || 8.0).toFixed(1)}s
              </span>
              {isActive ? (
                <div className="all-sequences-panel__active-overlay" aria-hidden>
                  <span className="all-sequences-panel__play">
                    <MdPlayArrow size={16} />
                  </span>
                </div>
              ) : null}
            </div>
            <span className="all-sequences-panel__title">
              {scene.title || `Scene ${index + 1}`}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default AllSequencesPanel;
