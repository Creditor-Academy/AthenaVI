import {
  MdSettings,
  MdContentCopy,
  MdRecordVoiceOver,
  MdEdit,
  MdPersonAdd,
  MdSmartDisplay,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdMonitor,
  MdGridView,
  MdSchedule,
  MdSwapHoriz,
  MdSpeed,
} from 'react-icons/md';
import projectTemplate from '../../../../constants/projectTemplate.json';
import { buildSceneDurationPatch, estimateHeygenSceneDuration } from '../../../../utils/sceneDuration';
import { normalizeClipsToScene } from '../../../../utils/editorLayerUtils';
import { normalizeSceneClips } from '../../../../utils/clipLayout';
import {
  SCENE_TRANSITION_CATALOG,
  getSceneTransitionCatalogValue,
  normalizeSceneTransition,
} from '../../../../utils/sceneTransitionUtils';
import { sceneNeedsHeygenRegeneration } from '../../../../utils/heygenVideo';
import './SceneSettingsPanel.css';

const DURATION_PRESETS = [5, 8, 10, 15, 30];
const BLUR_PRESETS = [0, 4, 8, 12, 20];
const TRANSITION_DURATION_PRESETS = [0.3, 0.5, 0.8, 1];
const ENTRANCE_SPEED_OPTS = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const displayName = (name, emptyLabel = 'Not selected') => {
  const trimmed = (name || '').trim();
  return trimmed || emptyLabel;
};

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

const SceneSettingsPanel = ({
  activeScene,
  activeSceneId,
  updateScene,
  clips,
  generateSceneVideo,
  applyGlobalSetting,
  onOpenQuickCreate,
  onDuplicateScene,
}) => {
  const isGenerating = activeScene.heygenStatus === 'processing';
  const isGenerated = activeScene.heygenStatus === 'completed';
  const needsRegeneration = sceneNeedsHeygenRegeneration(activeScene);
  const isFailed = activeScene.heygenStatus === 'failed';
  const canGenerate = activeScene.avatarType && activeScene.voiceId && activeScene.script;
  const hasVoiceover = !!(
    activeScene.avatarType ||
    activeScene.voiceId ||
    (activeScene.script || '').trim()
  );

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

  return (
    <div className="scene-settings scene-config-panel">
      <div className="scene-settings__header">
        <div className="scene-settings__title-block">
          <div className="scene-settings__icon">
            <MdSettings size={18} />
          </div>
          <div>
            <div className="scene-settings__title">Scene settings</div>
            <div className="scene-settings__subtitle">No layer selected</div>
          </div>
        </div>
        {onDuplicateScene ? (
          <button type="button" className="scene-settings__dup-btn" onClick={onDuplicateScene}>
            <MdContentCopy size={13} />
            Duplicate
          </button>
        ) : null}
      </div>

      {/* Voiceover */}
      <div className="scene-settings__block">
        <div className="scene-settings__block-head">
          <span className="scene-settings__block-title">
            <MdRecordVoiceOver size={14} />
            AI voiceover
          </span>
          {hasVoiceover ? (
            <button type="button" className="scene-settings__ghost-btn" onClick={onOpenQuickCreate}>
              <MdEdit size={13} />
              {isGenerated || needsRegeneration ? 'Change' : 'Edit'}
            </button>
          ) : null}
        </div>
        <div className="scene-settings__block-body">
          {hasVoiceover ? (
            <>
              <div className="scene-settings__voice-row">
                <div>
                  <div className="scene-settings__voice-label">
                    <span className={`scene-settings__dot ${activeScene.avatarType ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                    Avatar
                  </div>
                  <div className="scene-settings__voice-value">{displayName(activeScene.avatarName)}</div>
                </div>
                {activeScene.avatarType && applyGlobalSetting ? (
                  <button type="button" className="scene-settings__apply-btn" onClick={() => applyGlobalSetting('avatar')}>
                    All scenes
                  </button>
                ) : null}
              </div>
              <div className="scene-settings__voice-row">
                <div>
                  <div className="scene-settings__voice-label">
                    <span className={`scene-settings__dot ${activeScene.voiceId ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                    Voice
                  </div>
                  <div className="scene-settings__voice-value">{displayName(activeScene.voiceName)}</div>
                </div>
                {activeScene.voiceId && applyGlobalSetting ? (
                  <button type="button" className="scene-settings__apply-btn" onClick={() => applyGlobalSetting('voice')}>
                    All scenes
                  </button>
                ) : null}
              </div>
              <div>
                <div className="scene-settings__voice-label">
                  <span className={`scene-settings__dot ${(activeScene.script || '').trim() ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                  Script
                </div>
                <p className="scene-settings__script">{(activeScene.script || '').trim()}</p>
                <span className="scene-settings__meta">{(activeScene.script || '').length} characters</span>
              </div>
            </>
          ) : (
            <div className="scene-settings__empty">
              <p>No presenter or script on this scene yet.</p>
              <button type="button" className="scene-settings__cta" onClick={onOpenQuickCreate}>
                <MdPersonAdd size={16} />
                Set up presenter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generate */}
      <div className="scene-settings__block">
        <div className="scene-settings__block-body">
          <button
            type="button"
            className="scene-settings__cta"
            disabled={isGenerating || (!canGenerate && !isGenerating)}
            onClick={() => generateSceneVideo(activeSceneId)}
          >
            {isGenerating ? (
              <>
                <span className="scene-settings__spin" />
                Generating…
              </>
            ) : isGenerated || needsRegeneration ? (
              <>
                <MdRefresh size={16} />
                {needsRegeneration ? 'Generate with new presenter' : 'Regenerate video'}
              </>
            ) : (
              <>
                <MdSmartDisplay size={16} />
                Generate scene video
              </>
            )}
          </button>
          {isGenerating && (
            <p className="scene-settings__status">HeyGen is processing. This may take a minute.</p>
          )}
          {needsRegeneration && (
            <p className="scene-settings__status">
              Presenter updated — generate again to replace the previous avatar video.
            </p>
          )}
          {isGenerated && !needsRegeneration && (
            <>
              <p className="scene-settings__status scene-settings__status--ok">
                <MdCheckCircle size={14} />
                Video ready — use Change above or the Avatar tool, then regenerate for a new look.
              </p>
              <button
                type="button"
                className="scene-settings__cta scene-settings__cta--secondary"
                onClick={() => {
                  const url =
                    activeScene.generatedVideoUrl ||
                    activeScene.clips?.find((c) => c.role === 'avatar' || c.type === 'video')?.src;
                  if (url) window.dispatchEvent(new CustomEvent('open-generated-video', { detail: { url } }));
                  else alert('Video URL not found. It might still be processing.');
                }}
              >
                <MdMonitor size={14} />
                View video
              </button>
            </>
          )}
          {isFailed && (
            <p className="scene-settings__status scene-settings__status--err">
              <MdWarning size={14} />
              Generation failed — try again
            </p>
          )}
        </div>
      </div>

      {/* Composition */}
      <div className="scene-settings__block">
        <div className="scene-settings__block-head">
          <span className="scene-settings__block-title">
            <MdGridView size={14} />
            Composition
          </span>
        </div>
        <div className="scene-settings__block-body">
          <div>
            <div className="scene-settings__field-label">Layout template</div>
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
                      tc[ai] = { ...tc[ai], src: existingAvatar.src, type: existingAvatar.type, role: 'avatar' };
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
          </div>
          <div>
            <div className="scene-settings__field-label">Background blur</div>
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
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="scene-settings__block">
        <div className="scene-settings__block-head">
          <span className="scene-settings__block-title">
            <MdSchedule size={14} />
            Timing
          </span>
        </div>
        <div className="scene-settings__block-body">
          <div>
            <div className="scene-settings__field-label">Duration</div>
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
                onChange={(v) => updateScene(activeSceneId, { duration: v, durationFromScript: false })}
              />
            </div>
            {activeScene.durationFromScript !== false && (activeScene.script || '').trim() && (
              <p className="scene-settings__hint">
                Auto from script (~{estimateHeygenSceneDuration(activeScene.script, activeScene.voiceSettings)}s).
                Adjust above to override.
              </p>
            )}
          </div>
          <div>
            <div className="scene-settings__field-label">Entrance speed</div>
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
          </div>
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
      </div>

      {/* Transition */}
      <div className="scene-settings__block">
        <div className="scene-settings__block-head">
          <span className="scene-settings__block-title">
            <MdSwapHoriz size={14} />
            Into this scene
          </span>
        </div>
        <div className="scene-settings__block-body">
          <div>
            <div className="scene-settings__field-label">Transition</div>
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
          </div>
          {catalogValue !== 'none' && (
            <div>
              <div className="scene-settings__field-label">Duration</div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneSettingsPanel;
