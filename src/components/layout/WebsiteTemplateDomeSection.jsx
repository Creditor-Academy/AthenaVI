import { useEffect, useState } from 'react';
import { fetchDomeGalleryContent, getStaticDomeGalleryContent } from '../../utils/domeGalleryContent';
import { TemplateDomeShowcase } from '../ui/DomeGallery';
import './WebsiteTemplateDomeSection.css';

function WebsiteTemplateDomeSection({ onLoginClick }) {
  const [galleryImages, setGalleryImages] = useState(getStaticDomeGalleryContent);

  useEffect(() => {
    let cancelled = false;
    fetchDomeGalleryContent()
      .then((images) => {
        if (!cancelled && images.length > 0) {
          setGalleryImages(images);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="website-dome-section" aria-labelledby="website-dome-heading">
      <div className="website-dome-section__intro">
        <h2 id="website-dome-heading" className="website-dome-section__title">
          Your studio, in <span>3D motion</span>
        </h2>
        <p className="website-dome-section__subtitle">
          Real AI avatars and template scenes from our library — continuously rotating so you can
          see the breadth of what you can build.
        </p>
      </div>

      {galleryImages.length > 0 && (
        <TemplateDomeShowcase
          images={galleryImages}
          borderless
          showDragHint={false}
          overlayBlurColor="#040817"
          grayscale={false}
          autoRotate
          autoRotateSpeed={12}
          interactive={false}
          enableDrag={false}
        />
      )}
    </section>
  );
}

export default WebsiteTemplateDomeSection;
