import { useMemo, useState } from 'react';
import { CheckCircle2, Copy, ChevronDown, ChevronUp, Mic, Smile, Eye } from 'lucide-react';
import { buildScriptParagraphs, buildFullScriptText } from './digitalTwinScript';

const DELIVERY_TIPS = [
  'Speak at a natural, conversational pace — not too fast, not too slow.',
  'Pause briefly between sentences so the model captures clean mouth shapes.',
  'Vary your tone: warm and friendly, then clear and professional.',
];

const EXPRESSION_TIPS = [
  'Look directly into the camera lens the entire time.',
  'Start with a relaxed smile, then shift to a neutral, attentive expression.',
  'Keep your head mostly still; blink naturally.',
];

function DigitalTwinRecordingGuide({ speakerName = '' }) {
  const [expanded, setExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const paragraphs = useMemo(() => buildScriptParagraphs(speakerName), [speakerName]);

  const fullScript = useMemo(() => buildFullScriptText(speakerName), [speakerName]);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(fullScript);
      setCopyFeedback('Script copied');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyFeedback('Could not copy');
    }
  };

  return (
    <section className="digital-twin-recording-guide">
      <button
        type="button"
        className="digital-twin-recording-guide__toggle"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span>
          <Mic size={16} />
          Full recording guide & script
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded ? (
        <div className="digital-twin-recording-guide__body">
          <div className="digital-twin-recording-guide__columns">
            <div className="digital-twin-recording-guide__tips">
              <h4>
                <Mic size={16} />
                How to speak
              </h4>
              <ul>
                {DELIVERY_TIPS.map((tip) => (
                  <li key={tip}>
                    <CheckCircle2 size={14} />
                    {tip}
                  </li>
                ))}
              </ul>

              <h4>
                <Smile size={16} />
                Expressions
              </h4>
              <ul>
                {EXPRESSION_TIPS.map((tip) => (
                  <li key={tip}>
                    <CheckCircle2 size={14} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="digital-twin-recording-guide__script">
              <div className="digital-twin-recording-guide__script-header">
                <h4>
                  <Eye size={16} />
                  What to speak
                </h4>
                <button type="button" className="digital-twin-recording-guide__copy" onClick={handleCopyScript}>
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              {copyFeedback ? (
                <span className="digital-twin-recording-guide__copy-feedback">{copyFeedback}</span>
              ) : null}
              <div className="digital-twin-recording-guide__script-scroll">
                {paragraphs.map((part) => (
                  <article key={part.label} className="digital-twin-recording-guide__script-part">
                    <header>
                      <strong>{part.label}</strong>
                      <span>{part.direction}</span>
                    </header>
                    <p>{part.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default DigitalTwinRecordingGuide;
