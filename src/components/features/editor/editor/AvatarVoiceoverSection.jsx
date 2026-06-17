import {
  MdRecordVoiceOver,
  MdEdit,
  MdPersonAdd,
  MdSmartDisplay,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdMonitor,
  MdPerson,
} from 'react-icons/md';
import { sceneNeedsHeygenRegeneration } from '../../../../utils/heygenVideo';
import './SceneSettingsPanel.css';

const displayName = (name, emptyLabel = 'Not selected') => {
  const trimmed = (name || '').trim();
  return trimmed || emptyLabel;
};

/**
 * Reusable avatar / voiceover / generate controls (from Scene settings).
 */
const AvatarVoiceoverSection = ({
  activeScene,
  activeSceneId,
  generateSceneVideo,
  applyGlobalSetting,
  onOpenQuickCreate,
  setActiveTab,
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

  return (
    <div className="scp-avatar-voiceover">
      <div className="scene-settings__block" style={{ margin: 0, border: 'none', background: 'transparent' }}>
        <div className="scene-settings__block-head" style={{ padding: '8px 0 6px' }}>
          <span className="scene-settings__block-title">
            <MdRecordVoiceOver size={14} />
            Presenter & Voice
          </span>
          {hasVoiceover ? (
            <button type="button" className="scene-settings__ghost-btn" onClick={onOpenQuickCreate}>
              <MdEdit size={13} />
              {isGenerated || needsRegeneration ? 'Change' : 'Edit'}
            </button>
          ) : null}
        </div>
        <div className="scene-settings__block-body" style={{ padding: 0 }}>
          {hasVoiceover ? (
            <>
              <div className="scene-settings__summary-grid">
                <div className="scene-settings__summary-card">
                  <div className="scene-settings__voice-label">
                    <span className={`scene-settings__dot ${activeScene.avatarType ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                    Presenter
                  </div>
                  <div className="scene-settings__voice-value">{displayName(activeScene.avatarName)}</div>
                  {activeScene.avatarType && applyGlobalSetting ? (
                    <button type="button" className="scene-settings__apply-btn scene-settings__apply-btn--inline" onClick={() => applyGlobalSetting('avatar')}>
                      Apply to all scenes
                    </button>
                  ) : null}
                </div>
                <div className="scene-settings__summary-card">
                  <div className="scene-settings__voice-label">
                    <span className={`scene-settings__dot ${activeScene.voiceId ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                    Voice
                  </div>
                  <div className="scene-settings__voice-value">{displayName(activeScene.voiceName)}</div>
                  {activeScene.voiceId && applyGlobalSetting ? (
                    <button type="button" className="scene-settings__apply-btn scene-settings__apply-btn--inline" onClick={() => applyGlobalSetting('voice')}>
                      Apply to all scenes
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="scene-settings__script-wrap">
                <div className="scene-settings__voice-label">
                  <span className={`scene-settings__dot ${(activeScene.script || '').trim() ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                  Narration Script
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

      <div className="scene-settings__block" style={{ margin: '12px 0 0', border: 'none', background: 'transparent' }}>
        <div className="scene-settings__block-body" style={{ padding: 0 }}>
          <button
            type="button"
            className="scene-settings__cta"
            disabled={isGenerating || (!canGenerate && !isGenerating)}
            onClick={() => generateSceneVideo?.(activeSceneId)}
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

      {setActiveTab ? (
        <button
          type="button"
          className="scp-btn scp-btn--ghost scp-btn--block"
          style={{ marginTop: 10 }}
          onClick={() => setActiveTab('avatar')}
        >
          <MdPerson size={14} />
          Browse avatars
        </button>
      ) : null}
    </div>
  );
};

export default AvatarVoiceoverSection;
