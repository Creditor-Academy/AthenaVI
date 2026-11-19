import { Suspense } from 'react';
import { lazyWithReload } from '../../../utils/lazyWithReload.js';
import './DomeGalleryShell.css';

const DomeGallery = lazyWithReload(() => import('./DomeGallery'));

function DomeGallerySpinner() {
  return (
    <div className="dome-gallery-shell__loading" aria-busy="true" aria-label="Loading gallery">
      <div className="dome-gallery-shell__spinner" />
      <p>Loading gallery…</p>
    </div>
  );
}

export default function DomeGalleryLazy(props) {
  return (
    <Suspense fallback={<DomeGallerySpinner />}>
      <DomeGallery {...props} />
    </Suspense>
  );
}

export { DomeGallery };
