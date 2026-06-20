import LibraryComingSoonIllustration from './LibraryComingSoonIllustration'

const COPY = {
  fonts: {
    badge: 'Typography in progress',
    heading: 'Fonts coming soon',
    sub: 'Upload and manage custom typefaces for your videos. We are polishing the font library experience.',
  },
  templates: {
    badge: 'Templates on the way',
    heading: 'Templates coming soon',
    sub: 'Reusable branded layouts will live here. Save time with ready-made designs tailored to your workspace.',
  },
}

function LibraryComingSoon({ category, onBrowseMedia }) {
  const copy = COPY[category] || COPY.templates

  return (
    <div className="library-coming-soon" role="status" aria-live="polite">
      <div className="library-coming-soon__orb library-coming-soon__orb--1" aria-hidden />
      <div className="library-coming-soon__orb library-coming-soon__orb--2" aria-hidden />
      <div className="library-coming-soon__dots" aria-hidden />

      <div className="library-coming-soon__content">
        <div className="library-coming-soon__visual">
          <LibraryComingSoonIllustration category={category} />
        </div>

        <div className="library-coming-soon__text">
          <p className="library-coming-soon__eyebrow">Coming soon</p>

          <div className="library-coming-soon__badge">
            <span className="library-coming-soon__badge-dot" />
            {copy.badge}
          </div>

          <h2 className="library-coming-soon__heading">{copy.heading}</h2>
          <p className="library-coming-soon__sub">{copy.sub}</p>

          <button type="button" className="library-coming-soon__btn" onClick={onBrowseMedia}>
            Browse media library
          </button>
        </div>
      </div>
    </div>
  )
}

export default LibraryComingSoon
