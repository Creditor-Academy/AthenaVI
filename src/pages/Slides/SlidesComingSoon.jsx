import LibraryComingSoonIllustration from '../Library/LibraryComingSoonIllustration'
import '../Library/Library.css'

const COPY = {
  'ppt-generator': {
    badge: 'Deck generation in progress',
    heading: 'PPT Generator coming soon',
    sub: 'Describe a topic and generate polished PowerPoint decks. We are finishing the generator experience.',
  },
  'image-generator': {
    badge: 'Image generation on the way',
    heading: 'Image Generator coming soon',
    sub: 'Create branded visuals for your slides with AI. The image generator is almost ready.',
  },
}

function SlidesComingSoon({ section, onBackHome }) {
  const copy = COPY[section] || COPY['ppt-generator']

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
