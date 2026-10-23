import {
  MdSettings,
  MdContentCopy,
  MdGridView,
  MdSchedule,
  MdSwapHoriz,
  MdSpeed,
  MdRecordVoiceOver,
} from 'react-icons/md';
import AvatarVoiceoverSection from './AvatarVoiceoverSection';
import PropertiesAccordion from './PropertiesAccordion';
import projectTemplate from '../../../../constants/projectTemplate.json';
import { buildSceneDurationPatch, estimateHeygenSceneDuration } from '../../../../utils/sceneDuration';
import { normalizeClipsToScene } from '../../../../utils/editorLayerUtils';
import { normalizeSceneClips } from '../../../../utils/clipLayout';
import {
  SCENE_TRANSITION_CATALOG,
  getSceneTransitionCatalogValue,
  normalizeSceneTransition,
} from '../../../../utils/sceneTransitionUtils';
import './SceneSettingsPanel.css';
import './PropertiesAccordion.css';

const DURATION_PRESETS = [5, 8, 10, 15, 30];
const BLUR_PRESETS = [0, 4, 8, 12, 20];
const TRANSITION_DURATION_PRESETS = [0.3, 0.5, 0.8, 1];
const ENTRANCE_SPEED_OPTS = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const PANEL_GROUP = {
  SCENE: 'Scene',
};

const PanelHeader = ({ icon, title, subtitle }) => (
  <div className="scp-panel-header">
    <div className="scp-panel-header__icon">{icon}</div>
    <div>
      <div className="scp-panel-header__title">{title}</div>
      {subtitle ? <div className="scp-panel-header__subtitle">{subtitle}</div> : null}
    </div>
  </div>
);

const Stepper = ({ value, min, max, step, unit, onChange }) => (
  <div className="scene-settings__stepper">
    <button
      type="button"
      className="scene-settings__stepper-btn"
      onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
      aria-label="Decrease"
    >
      −
    </button>
    <span className="scene-settings__stepper-val">
      {typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value}
      {unit}
    </span>
    <button
      type="button"
      className="scene-settings__stepper-btn"
      onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
      aria-label="Increase"
    >
      +
    </button>
  </div>
);

const Field = ({ label, children }) => (
  <div className="scene-settings__field">
    {label ? <div className="scene-settings__field-label">{label}</div> : null}
    {children}
  </div>
);

const SceneSettingsPanel = ({
  activeScene,
  activeSceneId,
  updateScene,
  clips,
  generateSceneVideo,
  onOpenQuickCreate,
  onDuplicateScene,
}) => {
  const transition = normalizeSceneTransition(activeScene.transition);
  const catalogValue = getSceneTransitionCatalogValue(activeScene);

  const patchTransition = (patch) => {
    updateScene(activeSceneId, {
      transition: normalizeSceneTransition({
        ...transition,
        ...patch,
      }),
    });
  };

  const sections = [
    {
      id: 'presenter',
      title: 'Presenter & Voice',
      group: PANEL_GROUP.SCENE,
      icon: <MdRecordVoiceOver size={14} />,
      content: (
        <AvatarVoiceoverSection
          activeScene={activeScene}
          activeSceneId={activeSceneId}
          generateSceneVideo={generateSceneVideo}
          onOpenQuickCreate={onOpenQuickCreate}
        />
      ),
    },
    {
      id: 'composition',
      title: 'Composition',
      group: PANEL_GROUP.SCENE,
      icon: <MdGridView size={14} />,
      content: (
        <div className="scene-settings__fields">
          <Field label="Layout template">
            <select
              className="scene-settings__select"
              value={activeScene.layout || 'split-right'}
              onChange={(e) => {
                const newLayout = e.target.value;
                const template = projectTemplate.project.scenes.find((t) => t.id === newLayout);
                let newClips = clips;
                if (template) {
                  let tc = JSON.parse(JSON.stringify(template.clips));
                  const existingAvatar = clips.find((c) => c.role === 'avatar' || c.type === 'video');
                  if (existingAvatar) {
                    const ai = tc.findIndex(
                      (c) =>
                        c.label?.toLowerCase().includes('avatar') ||
                        c.label?.toLowerCase().includes('media') ||
                        c.label?.toLowerCase().includes('center image') ||
                        (c.type === 'image' && !c.label?.toLowerCase().includes('logo'))
                    );
                    if (ai !== -1) {
                      tc[ai] = {
                        ...tc[ai],
                        src: existingAvatar.src,
                        type: existingAvatar.type,
                        role: 'avatar',
                      };
                    }
                  }
                  const existingText = clips.find((c) => c.type === 'text' || c.role === 'main-text');
                  if (existingText) {
                    const ti = tc.findIndex((c) => c.type === 'text');
                    if (ti !== -1) tc[ti].content = existingText.content;
                  }
                  newClips = normalizeClipsToScene(
                    normalizeSceneClips(tc),
                    activeScene?.duration || 8
                  );
                }
                updateScene(activeSceneId, { layout: newLayout, clips: newClips });
              }}
            >
              {projectTemplate.project.scenes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Background blur">
            <div className="scene-settings__chips">
              {BLUR_PRESETS.map((px) => (
                <button
                  key={px}
                  type="button"
                  className={`scene-settings__chip ${(activeScene.bgBlur || 0) === px ? 'scene-settings__chip--active' : ''}`}
                  onClick={() => updateScene(activeSceneId, { bgBlur: px })}
                >
                  {px === 0 ? 'Off' : `${px}px`}
                </button>
              ))}
            </div>
          </Field>
        </div>
      ),
    },
    {
      id: 'timing',
      title: 'Timing',
      group: PANEL_GROUP.SCENE,
      icon: <MdSchedule size={14} />,
      content: (
        <div className="scene-settings__fields">
          <Field label="Duration">
            <div className="scene-settings__chips">
              {DURATION_PRESETS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className={`scene-settings__chip ${Math.round((activeScene.duration || 8) * 10) === sec * 10 ? 'scene-settings__chip--active' : ''}`}
                  onClick={() =>
                    updateScene(activeSceneId, { duration: sec, durationFromScript: false })
                  }
                >
                  {sec}s
                </button>
              ))}
            </div>
            <div className="scene-settings__row" style={{ marginTop: 8 }}>
              <span className="scene-settings__meta">Fine tune</span>
              <Stepper
                value={activeScene.duration || 8}
                min={1}
                max={60}
                step={0.5}
                unit="s"
                onChange={(v) =>
                  updateScene(activeSceneId, { duration: v, durationFromScript: false })
                }
              />
            </div>
            {activeScene.durationFromScript !== false && (activeScene.script || '').trim() ? (
              <p className="scene-settings__hint">
                Auto from script (~
                {estimateHeygenSceneDuration(activeScene.script, activeScene.voiceSettings)}s).
                Adjust above to override.
              </p>
            ) : null}
          </Field>
          <Field label="Entrance speed">
            <div className="scene-settings__chips">
              {ENTRANCE_SPEED_OPTS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`scene-settings__chip ${(activeScene.entranceSpeed || 'normal') === opt.value ? 'scene-settings__chip--active' : ''}`}
                  onClick={() => updateScene(activeSceneId, { entranceSpeed: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="scene-settings__row">
            <span className="scene-settings__field-label" style={{ marginBottom: 0 }}>
              <MdSpeed size={12} style={{ verticalAlign: -2, marginRight: 4 }} />
              Voice speed
            </span>
            <Stepper
              value={activeScene.voiceSettings?.speed || 1}
              min={0.5}
              max={2}
              step={0.1}
              unit="×"
              onChange={(v) => {
                if (activeScene.durationFromScript === false) {
                  updateScene(activeSceneId, {
                    voiceSettings: { ...(activeScene.voiceSettings || {}), speed: v },
                  });
                  return;
                }
                const patch = buildSceneDurationPatch(activeScene, {
                  voiceSettings: { ...(activeScene.voiceSettings || {}), speed: v },
                });
                updateScene(activeSceneId, {
                  voiceSettings: { ...(activeScene.voiceSettings || {}), speed: v },
                  ...patch,
                });
              }}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'transition',
      title: 'Into this scene',
      group: PANEL_GROUP.SCENE,
      icon: <MdSwapHoriz size={14} />,
      content: (
        <div className="scene-settings__fields">
          <Field label="Transition">
            <select
              className="scene-settings__select"
              value={catalogValue}
              onChange={(e) => patchTransition({ value: e.target.value })}
            >
              {SCENE_TRANSITION_CATALOG.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          {catalogValue !== 'none' ? (
            <Field label="Duration">
              <div className="scene-settings__chips">
                {TRANSITION_DURATION_PRESETS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    className={`scene-settings__chip ${Math.abs((transition.duration ?? 0.5) - sec) < 0.05 ? 'scene-settings__chip--active' : ''}`}
                    onClick={() => patchTransition({ duration: sec })}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </Field>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div
      className="scene-settings scene-config-panel"
      style={{ padding: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <div className="scene-settings__header" style={{ padding: '0 14px' }}>
        <PanelHeader
          icon={<MdSettings size={17} />}
          title="Scene settings"
          subtitle="No layer selected"
        />
        {onDuplicateScene ? (
          <button type="button" className="scene-settings__dup-btn" onClick={onDuplicateScene}>
            <MdContentCopy size={13} />
            Duplicate
          </button>
        ) : null}
      </div>
      <div style={{ padding: '0 14px' }}>
        <PropertiesAccordion
          sections={sections}
          defaultExpandedIds={['presenter', 'composition', 'timing']}
        />
      </div>
    </div>
  );
};

export default SceneSettingsPanel;
