/** Speaker notes panel for the current slide. */

export default function SpeakerNotesPanel({ notes = '', onChange, disabled = false }) {
  return (
    <div className="ppt-speaker-notes-panel">
      <p className="ppt-slide-panel-hint">
        Speaker notes appear during present mode and in exported decks when supported.
      </p>
      <textarea
        placeholder="Add notes for this slide…"
        value={notes}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        rows={5}
      />
    </div>
  )
}
