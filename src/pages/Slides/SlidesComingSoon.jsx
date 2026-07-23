import LibraryComingSoonIllustration from '../Library/LibraryComingSoonIllustration'
import '../Library/Library.css'

const COPY = {
  'ppt-ai': {
    badge: 'AI decks in progress',
    heading: 'AI PPT Generation coming soon',
    sub: 'Describe a topic and generate polished PowerPoint decks with AI. We are finishing this experience.',
  },
  'ppt-builder': {
    badge: 'Builder on the way',
    heading: 'PPT Builder coming soon',
    sub: 'Build presentations slide by slide with full layout control. The PPT builder workspace is almost ready.',
  },
  'image-ai': {
    badge: 'AI visuals in progress',
    heading: 'AI Image Generation coming soon',
    sub: 'Create branded visuals for your slides from a prompt. The AI image generator is polishing up.',
  },
  'image-editor': {
    badge: 'Editor on the way',
    heading: 'Image Editor coming soon',
    sub: 'Upload, crop, and polish images for your decks. The image editor will land here next.',
  },
}

function SlidesComingSoon({ section, onBackHome }) {
  const copy = COPY[section] || COPY['ppt-ai']

  return (
    <div className="library-coming-soon" role="status" aria-live="polite">
      <div className="library-coming-soon__orb library-coming-soon__orb--1" aria-hidden />
      <div className="library-coming-soon__orb library-coming-soon__orb--2" aria-hidden />
      <div className="library-coming-soon__dots" aria-hidden />

      <div className="library-coming-soon__content">
        <div className="library-coming-soon__visual">
          <LibraryComingSoonIllustration category="templates" />
        </div>

        <div className="library-coming-soon__text">
          <p className="library-coming-soon__eyebrow">Coming soon</p>

          <div className="library-coming-soon__badge">
            <span className="library-coming-soon__badge-dot" />
            {copy.badge}
          </div>

          <h2 className="library-coming-soon__heading">{copy.heading}</h2>
          <p className="library-coming-soon__sub">{copy.sub}</p>

          <button type="button" className="library-coming-soon__btn" onClick={onBackHome}>
            Back to Slides home
          </button>
        </div>
      </div>
    </div>
  )
}

export default SlidesComingSoon
