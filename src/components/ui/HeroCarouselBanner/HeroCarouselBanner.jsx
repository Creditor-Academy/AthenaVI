import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import './HeroCarouselBanner.css';

export default function HeroCarouselBanner({ slides = [], autoPlayInterval = 6000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    timerRef.current = setInterval(nextSlide, autoPlayInterval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides, autoPlayInterval, nextSlide]);

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id || idx}
            className={`hero-carousel-slide ${isActive ? 'is-active' : ''}`}
            style={{
              backgroundImage: slide.bgImage ? `url(${slide.bgImage})` : undefined,
            }}
          >
            {/* Ambient Radial Lighting Overlays */}
            <div className={`hero-carousel-glow ${slide.themeGlow || 'glow-amber'}`} />
            <div className="hero-carousel-overlay" />
            <div className="hero-carousel-noise" />

            <div className="hero-carousel-content-wrapper">
              {/* Left Column: Tag, Title, Subtitle, CTA */}
              <div className="hero-carousel-main">
                {slide.tag && (
                  <div className="hero-carousel-tag">
                    <span className="hero-carousel-tag-dot" />
                    <span>{typeof slide.tag === 'string' ? slide.tag.replace(/^[\s•·]+/, '') : slide.tag}</span>
                  </div>
                )}

                <h2 className="hero-carousel-title">{slide.title}</h2>
                <p className="hero-carousel-subtitle">{slide.subtitle}</p>

                {slide.ctaText && (
                  <div className="hero-carousel-cta-row">
                    <button
                      type="button"
                      className="hero-carousel-cta-btn"
                      onClick={() => slide.onCtaClick?.(slide)}
                    >
                      <span>{slide.ctaText}</span>
                      <Sparkles className="hero-cta-icon" size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column: Stat Counters */}
              {slide.stats && slide.stats.length > 0 && (
                <div className="hero-carousel-stats">
                  {slide.stats.map((stat, sIdx) => (
                    <div key={sIdx} className="hero-carousel-stat-item">
                      <div className="hero-carousel-stat-icon" aria-hidden>
                        {sIdx === 0 ? '⊹' : '⚡'}
                      </div>
                      <div className="hero-carousel-stat-value">{stat.value}</div>
                      <div className="hero-carousel-stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation Controls (Only if > 1 slide) */}
      {totalSlides > 1 && (
        <div className="hero-carousel-controls">
          <button
            type="button"
            className="hero-carousel-arrow hero-carousel-arrow--prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="hero-carousel-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`hero-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-carousel-arrow hero-carousel-arrow--next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
