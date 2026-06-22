import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchDomeGalleryContent } from '../../utils/domeGalleryContent';
import { TemplateDomeShowcase } from '../ui/DomeGallery';
import './WebsiteTemplateDomeSection.css';

function WebsiteTemplateDomeSection({ onLoginClick }) {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchDomeGalleryContent()
      .then((images) => {
        if (!cancelled) setGalleryImages(images);
      })
      .catch(() => {
        if (!cancelled) setGalleryImages([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="website-dome-section" aria-labelledby="website-dome-heading">
      <motion.div
        className="website-dome-section__intro"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="website-dome-section__eyebrow">Avatars &amp; scenes</span>
        <h2 id="website-dome-heading" className="website-dome-section__title">
          Your studio, in <span>3D motion</span>
        </h2>
        <p className="website-dome-section__subtitle">
          Real AI avatars and template scenes from our library — continuously rotating so you can
          see the breadth of what you can build.
        </p>
      </motion.div>

      {loading ? (
        <div className="website-dome-section__loading" aria-busy="true" aria-label="Loading gallery">
          <div className="website-dome-section__spinner" />
        </div>
      ) : galleryImages.length > 0 ? (
        <TemplateDomeShowcase
          images={galleryImages}
          borderless
          showDragHint={false}
          overlayBlurColor="#ffffff"
          grayscale={false}
          autoRotate
          autoRotateSpeed={12}
          interactive={false}
          enableDrag={false}
        />
      ) : null}

      {onLoginClick ? (
        <div className="website-dome-section__cta">
          <button type="button" className="website-dome-section__cta-btn" onClick={onLoginClick}>
            Start creating with templates
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default WebsiteTemplateDomeSection;
