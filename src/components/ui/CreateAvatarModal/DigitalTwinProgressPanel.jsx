import { CheckCircle2, Loader2 } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 'upload', label: 'Upload training video' },
  { id: 'consent', label: 'Consent verification' },
  { id: 'build', label: 'Build Digital Twin' },
];

function getPhaseCopy(phase, uploadProgress, status) {
  if (phase === 'uploading') {
    if (uploadProgress != null && uploadProgress < 100) {
      return {
        eyebrow: 'Step 1 of 3',
        title: `Uploading training video… ${uploadProgress}%`,
        lead: 'Securely sending your footage to our avatar engine. Keep this window open.',
      };
    }
    return {
      eyebrow: 'Step 1 of 3',
      title: 'Finishing upload',
      lead: 'Your training video is uploaded. Preparing the next step…',
    };
  }
  if (phase === 'creating') {
    return {
      eyebrow: 'Step 1 of 3',
      title: status || 'Processing your footage',
      lead: 'Analyzing your recording and registering your Digital Twin.',
    };
  }
  if (phase === 'training') {
    return {
      eyebrow: 'Step 3 of 3',
      title: status || 'Building your Digital Twin',
      lead: 'Training your likeness and voice — typically 5–10 minutes. We\'ll guide you to looks when ready.',
    };
  }
  return {
    eyebrow: 'Working',
    title: status || 'Please wait',
    lead: 'Setting up your Digital Twin.',
  };
}

function getActivePipelineIndex(phase) {
  if (phase === 'uploading' || phase === 'creating') return 0;
  if (phase === 'consent') return 1;
  if (phase === 'training') return 2;
  return 0;
}

function DigitalTwinProgressPanel({ phase, status, uploadProgress }) {
  const activeIndex = getActivePipelineIndex(phase);
  const copy = getPhaseCopy(phase, uploadProgress, status);
  const showUploadBar = phase === 'uploading' || phase === 'creating';
  const uploadPct = uploadProgress ?? (phase === 'creating' ? 100 : 0);

  return (
    <div className="dt-progress-panel">
      <div className="dt-progress-panel__visual">
        <div className="dt-progress-panel__ring">
          <Loader2 size={36} className="spin-animation dt-progress-panel__spinner" />
          <div className="dt-progress-panel__ring-glow" aria-hidden="true" />
        </div>
        <span className="dt-progress-panel__chip">
          <span className="dt-progress-panel__chip-dot" />
          In progress
        </span>
      </div>

      <div className="dt-progress-panel__content">
        <p className="dt-progress-panel__eyebrow">{copy.eyebrow}</p>
        <h3 className="dt-progress-panel__title">{copy.title}</h3>
        <p className="dt-progress-panel__lead">{copy.lead}</p>

        {showUploadBar ? (
          <div className="dt-progress-panel__bar-wrap">
            <div className="dt-progress-panel__bar-track">
              <div
                className="dt-progress-panel__bar-fill"
                style={{ width: `${Math.max(uploadPct, phase === 'creating' ? 100 : 4)}%` }}
              />
            </div>
            <div className="dt-progress-panel__bar-meta">
              <span>{uploadPct >= 100 ? 'Upload complete' : 'Uploading'}</span>
              <span>{Math.min(uploadPct, 100)}%</span>
            </div>
          </div>
        ) : null}

        <ol className="dt-progress-panel__steps" aria-label="Digital Twin pipeline">
          {PIPELINE_STEPS.map((step, index) => {
            const isDone = index < activeIndex;
            const isActive = index === activeIndex;
            return (
              <li
                key={step.id}
                className={`dt-progress-step${isDone ? ' is-done' : ''}${isActive ? ' is-active' : ''}`}
              >
                <span className="dt-progress-step__marker">
                  {isDone ? <CheckCircle2 size={14} /> : index + 1}
                </span>
                <span className="dt-progress-step__label">{step.label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default DigitalTwinProgressPanel;
