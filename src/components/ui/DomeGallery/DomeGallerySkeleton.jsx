import React from 'react';
import './DomeGalleryShell.css';

const SKELETON_ITEMS = [
  // Center row
  { id: 1, style: { transform: 'translate(0, 0) scale(1.05)', opacity: 1, zIndex: 10 } },
  { id: 2, style: { transform: 'translate(-195px, -5px) scale(0.9)', opacity: 0.85, zIndex: 8 } },
  { id: 3, style: { transform: 'translate(195px, -5px) scale(0.9)', opacity: 0.85, zIndex: 8 } },
  { id: 4, style: { transform: 'translate(-370px, -15px) scale(0.75)', opacity: 0.55, zIndex: 6 } },
  { id: 5, style: { transform: 'translate(370px, -15px) scale(0.75)', opacity: 0.55, zIndex: 6 } },
  { id: 6, style: { transform: 'translate(-520px, -25px) scale(0.62)', opacity: 0.3, zIndex: 4 } },
  { id: 7, style: { transform: 'translate(520px, -25px) scale(0.62)', opacity: 0.3, zIndex: 4 } },

  // Top row
  { id: 8, style: { transform: 'translate(-98px, -125px) scale(0.9)', opacity: 0.75, zIndex: 7 } },
  { id: 9, style: { transform: 'translate(98px, -125px) scale(0.9)', opacity: 0.75, zIndex: 7 } },
  { id: 10, style: { transform: 'translate(-280px, -135px) scale(0.75)', opacity: 0.5, zIndex: 5 } },
  { id: 11, style: { transform: 'translate(280px, -135px) scale(0.75)', opacity: 0.5, zIndex: 5 } },

  // Bottom row
  { id: 12, style: { transform: 'translate(-98px, 115px) scale(0.9)', opacity: 0.75, zIndex: 7 } },
  { id: 13, style: { transform: 'translate(98px, 115px) scale(0.9)', opacity: 0.75, zIndex: 7 } },
  { id: 14, style: { transform: 'translate(-280px, 125px) scale(0.75)', opacity: 0.5, zIndex: 5 } },
  { id: 15, style: { transform: 'translate(280px, 125px) scale(0.75)', opacity: 0.5, zIndex: 5 } },
];

export default function DomeGallerySkeleton() {
  return (
    <div className="dome-gallery-skeleton" aria-hidden="true">
      {SKELETON_ITEMS.map((item) => (
        <div key={item.id} className="dome-gallery-skeleton__card" style={item.style}>
          <div className="dome-gallery-skeleton__media-placeholder" />
          <div className="dome-gallery-skeleton__text-placeholder">
            <div className="dome-gallery-skeleton__line" />
          </div>
        </div>
      ))}
    </div>
  );
}
