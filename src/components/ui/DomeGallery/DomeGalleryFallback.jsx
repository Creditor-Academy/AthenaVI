/**
 * Accessible 2D grid fallback when reduced motion is preferred or on small screens.
 */
export default function DomeGalleryFallback({ images = [], onImageClick, className = '' }) {
  if (!images.length) return null;

  const isDecorative = !onImageClick;

  return (
    <ul className={`dome-gallery-fallback ${className}`.trim()} aria-label="Template gallery">
      {images.map((image, index) => {
        const src = typeof image === 'string' ? image : image.src;
        const alt = typeof image === 'string' ? '' : image.alt || `Template ${index + 1}`;
        const mediaType =
          typeof image === 'object' && image.mediaType
            ? image.mediaType
            : /\.mp4(\?|$)/i.test(src || '')
              ? 'video'
              : 'image';
        const key = typeof image === 'object' && image.id ? image.id : `${src}-${index}`;

        const media =
          src && mediaType === 'video' ? (
            <video
              src={src}
              className="dome-gallery-fallback__img"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label={alt || 'Video preview'}
            />
          ) : src ? (
            <img src={src} alt={alt} className="dome-gallery-fallback__img" />
          ) : null;

        if (isDecorative) {
          return (
            <li key={key} className="dome-gallery-fallback__item">
              <div className="dome-gallery-fallback__button dome-gallery-fallback__button--static">
                {media}
                {alt ? <span className="dome-gallery-fallback__label">{alt}</span> : null}
              </div>
            </li>
          );
        }

        return (
          <li key={key} className="dome-gallery-fallback__item">
            <button
              type="button"
              className="dome-gallery-fallback__button"
              onClick={() => onImageClick?.({ src, alt, mediaType })}
              aria-label={alt || `View template ${index + 1}`}
            >
              {mediaType === 'video' && src ? (
                <video
                  src={src}
                  className="dome-gallery-fallback__img"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                />
              ) : src ? (
                <img src={src} alt="" className="dome-gallery-fallback__img" />
              ) : null}
              {alt ? <span className="dome-gallery-fallback__label">{alt}</span> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
