import React from 'react';
import { MdClose, MdGeneratingTokens } from 'react-icons/md';
import './GeneratedVideoModal.css';

const GeneratedVideoModal = ({
  isOpen,
  onClose,
  videoUrl,
  creditsUsed = null,
  onUseInEditor,
  onRemake,
  sceneTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="generated-video-modal-wrap">
      <div className="generated-video-modal">
        <button type="button" className="generated-video-modal__close" onClick={onClose} aria-label="Close">
          <MdClose size={16} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 className="generated-video-modal__title">
            <span>✨</span> AI Presenter Ready
          </h2>
          <p className="generated-video-modal__subtitle">
            Your presenter is ready for <strong>{sceneTitle || 'Scene'}</strong>. Preview below, then confirm to use it in the editor.
          </p>
        </div>

        {creditsUsed != null && Number(creditsUsed) > 0 && (
          <div className="generated-video-modal__credits">
            <MdGeneratingTokens size={16} aria-hidden />
            <span>
              {Number(creditsUsed).toLocaleString()} credit{Number(creditsUsed) === 1 ? '' : 's'} used
            </span>
          </div>
        )}

        {videoUrl ? (
          <div className="generated-video-modal__player">
            <video src={videoUrl} controls autoPlay />
          </div>
        ) : (
          <div className="generated-video-modal__processing">
            <p style={{ margin: 0, fontSize: '13px' }}>Video processing...</p>
          </div>
        )}

        <div className="generated-video-modal__footer">
          <button type="button" className="generated-video-modal__remake" onClick={onRemake}>
            Remake
          </button>
          <button type="button" className="generated-video-modal__confirm" onClick={onUseInEditor}>
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratedVideoModal;
