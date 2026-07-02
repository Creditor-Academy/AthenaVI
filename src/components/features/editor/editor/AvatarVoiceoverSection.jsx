import {
  MdRecordVoiceOver,
  MdPersonAdd,
  MdSmartDisplay,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdMonitor,
} from 'react-icons/md';
import { sceneNeedsHeygenRegeneration } from '../../../../utils/heygenVideo';
import {
  getSceneAvatarLookId,
  getSceneScript,
  getSceneVoiceId,
  hasScenePresenterSetup,
} from '../../../../utils/heygenAvatars';
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
  onOpenQuickCreate,
}) => {
  const isGenerating = activeScene.heygenStatus === 'processing';
  const isGenerated = activeScene.heygenStatus === 'completed';
  const needsRegeneration = sceneNeedsHeygenRegeneration(activeScene);
  const isFailed = activeScene.heygenStatus === 'failed';
  const avatarLookId = getSceneAvatarLookId(activeScene);
  const voiceId = getSceneVoiceId(activeScene);
  const script = getSceneScript(activeScene);
  const canGenerate = hasScenePresenterSetup(activeScene);
  const hasPartialPresenter = Boolean(
    !canGenerate && (avatarLookId || voiceId || script || activeScene.avatarName || activeScene.presenter?.avatarName)
  );
  const avatarName =
    activeScene.avatarName || activeScene.presenter?.avatarName || '';
  const voiceName = activeScene.voiceName || activeScene.presenter?.voiceName || '';

  return (
    <div className="scp-avatar-voiceover">
      <div className="scene-settings__block" style={{ margin: 0, border: 'none', background: 'transparent' }}>
        <div className="scene-settings__block-head" style={{ padding: '8px 0 6px' }}>
          <span className="scene-settings__block-title">
            <MdRecordVoiceOver size={14} />
            Presenter & Voice
          </span>
        </div>
        <div className="scene-settings__block-body" style={{ padding: 0 }}>
          {canGenerate ? (
            <>
              <div className="scene-settings__summary-grid">
                <div className="scene-settings__summary-card">
                  <div className="scene-settings__voice-label">
                    <span className={`scene-settings__dot ${avatarLookId ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                    Presenter
                  </div>
                  <div className="scene-settings__voice-value">{displayName(avatarName)}</div>
                </div>
                <div className="scene-settings__summary-card">
                  <div className="scene-settings__voice-label">
                    <span className={`scene-settings__dot ${voiceId ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                    Voice
                  </div>
                  <div className="scene-settings__voice-value">{displayName(voiceName)}</div>
                </div>
              </div>
              <div className="scene-settings__script-wrap">
                <div className="scene-settings__voice-label">
                  <span className={`scene-settings__dot ${script ? 'scene-settings__dot--on' : 'scene-settings__dot--off'}`} />
                  Narration Script
                </div>
                <p className="scene-settings__script">{script}</p>
                <span className="scene-settings__meta">{script.length} characters</span>
              </div>
              <button
                type="button"
                className="scene-settings__cta scene-settings__cta--secondary"
                style={{ marginTop: 10 }}
                onClick={onOpenQuickCreate}
              >
                <MdRefresh size={16} />
                Edit presenter
              </button>
            </>
          ) : (
            <div className="scene-settings__empty">
              <p>
                {hasPartialPresenter
                  ? 'Presenter setup is incomplete — choose a look, voice, and script to generate video.'
                  : 'No presenter or script on this scene yet.'}
              </p>
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
          {isGenerated && !needsRegeneration ? (
            <>
              <p className="scene-settings__status scene-settings__status--ok">
                <MdCheckCircle size={14} />
                Video ready — use Regenerate below to change presenter, voice, or script.
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
              <button
                type="button"
                className="scene-settings__cta"
                style={{ marginTop: 8 }}
                onClick={onOpenQuickCreate}
              >
                <MdRefresh size={16} />
                Regenerate video
              </button>
            </>
          ) : (
            <>
              {!canGenerate ? (
                <p className="scene-settings__status" style={{ marginBottom: 8 }}>
                  Set up presenter, voice, and script before generating video.
                </p>
              ) : null}
              <button
                type="button"
                className="scene-settings__cta"
                disabled={isGenerating || !canGenerate}
                onClick={() => generateSceneVideo?.(activeSceneId)}
              >
                {isGenerating ? (
                  <>
                    <span className="scene-settings__spin" />
                    Generating…
                  </>
                ) : needsRegeneration ? (
                  <>
                    <MdRefresh size={16} />
                    Generate with new presenter
                  </>
                ) : (
                  <>
                    <MdSmartDisplay size={16} />
                    Generate scene video
                  </>
                )}
              </button>
              {isGenerating && (
                <p className="scene-settings__status">Avatar video is processing. This may take a minute.</p>
              )}
              {needsRegeneration && (
                <p className="scene-settings__status">
                  Presenter updated — generate again to replace the previous avatar video.
                </p>
              )}
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
    </div>
  );
};

export default AvatarVoiceoverSection;
