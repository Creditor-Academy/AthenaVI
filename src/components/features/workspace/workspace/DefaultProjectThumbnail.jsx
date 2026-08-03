import React from 'react';
import { MdSlideshow, MdImage } from 'react-icons/md';
import { Clapperboard } from 'lucide-react';
import './DefaultProjectThumbnail.css';

const DefaultProjectThumbnail = ({ title = '', category = 'video' }) => {
  const getVariant = (str) => {
    let hash = 0;
    const cleanStr = String(str || 'Athena');
    for (let i = 0; i < cleanStr.length; i++) {
      hash = (hash << 5) - hash + cleanStr.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % 4;
    return `dpt-var-${idx}`;
  };

  const variantClass = getVariant(title);

  return (
    <div className={`default-project-thumbnail ${variantClass}`}>
      <div className="dpt-bg-glow" />
      <div className="dpt-bg-pattern" />

      <div className="dpt-badge-container">
        <div className="dpt-icon-ring">
          {category === 'ppt' ? (
            <MdSlideshow size={30} />
          ) : category === 'image' ? (
            <MdImage size={30} />
          ) : (
            <Clapperboard size={28} />
          )}
        </div>
      </div>

      <div className="dpt-footer">
        <span className="dpt-indicator-dot" />
        <span className="dpt-footer-text">
          {category === 'ppt' ? 'Presentation' : category === 'image' ? 'Image' : 'Virtual Studio Video'}
        </span>
      </div>
    </div>
  );
};

export default DefaultProjectThumbnail;
