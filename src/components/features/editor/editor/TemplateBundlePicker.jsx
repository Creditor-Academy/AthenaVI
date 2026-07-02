import { useMemo, useState } from 'react';
import { MdArrowBack, MdLayers, MdTimer, MdPlayCircleOutline } from 'react-icons/md';
import TemplateCard from '../../../TemplateCard';
import TemplateScenePreview from './TemplateScenePreview';
import './TemplateBundlePicker.css';

function BundleCard({ bundle, onOpen, isSelected }) {
  const sceneCount = bundle.scenes?.length || bundle.totalSlides || 0;
  const totalDuration = (bundle.scenes || []).reduce((sum, scene) => sum + (scene.duration || 8), 0);

  return (
    <div
      className={`template-bundle-card${isSelected ? ' template-bundle-card--selected' : ''}`}
      onClick={() => onOpen(bundle)}
    >
      <div className="template-bundle-card__preview">
        {bundle.coverScene ? (
          <TemplateScenePreview template={bundle.coverScene} compact />
        ) : (
          <div className="template-bundle-card__preview-fallback" />
        )}
        {isSelected && (
          <div className="template-bundle-card__selected-badge">
            ✓ Selected
          </div>
        )}
        <span className="template-bundle-card__category">
          {bundle.category}
        </span>
        <span
          className={`template-bundle-card__count${isSelected ? ' template-bundle-card__count--below-selected' : ''}`}
        >
          {sceneCount} scenes
        </span>
      </div>
      <div className="template-bundle-card__body">
        <h4 className={`template-bundle-card__title${isSelected ? ' template-bundle-card__title--selected' : ''}`}>
          {bundle.name}
        </h4>
        <p className="template-bundle-card__desc">
          {bundle.description}
        </p>
        <div className="template-bundle-card__meta">
          <span>
            <MdLayers size={14} />
            {sceneCount} scenes
          </span>
          <span>
            <MdTimer size={14} />
            ~{totalDuration}s
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Two-level template picker: bundles → scenes with apply-one / apply-all actions.
 */
const TemplateBundlePicker = ({
  bundles = [],
  loading = false,
  searchQuery = '',
  activeLayout = 'All Layouts',
  onSelectScene,
  onApplyBundle,
  emptyMessage = 'No templates found matching your criteria.',
  selectedSceneId = null,
  selectedBundleId = null,
}) => {
  const [activeBundle, setActiveBundle] = useState(null);

  const filteredBundles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bundles.filter((bundle) => {
      const matchesSearch =
        !query ||
        bundle.name.toLowerCase().includes(query) ||
        bundle.category.toLowerCase().includes(query) ||
        bundle.description?.toLowerCase().includes(query) ||
        (bundle.scenes || []).some(
          (scene) =>
            (scene.title || '').toLowerCase().includes(query) ||
            (scene.tags || []).some((tag) => tag.toLowerCase().includes(query))
        );

      if (!matchesSearch) return false;
      if (activeLayout === 'All Layouts') return true;
      return (bundle.scenes || []).some((scene) => scene.layoutType === activeLayout);
    });
  }, [bundles, searchQuery, activeLayout]);

  const filteredScenes = useMemo(() => {
    if (!activeBundle) return [];
    const query = searchQuery.trim().toLowerCase();
    return (activeBundle.scenes || []).filter((scene) => {
      const matchesSearch =
        !query ||
        (scene.title || '').toLowerCase().includes(query) ||
        (scene.tags || []).some((tag) => tag.toLowerCase().includes(query));
      const matchesLayout = activeLayout === 'All Layouts' || scene.layoutType === activeLayout;
      return matchesSearch && matchesLayout;
    });
  }, [activeBundle, searchQuery, activeLayout]);

  if (loading) {
    return (
      <div className="tbp-grid">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="tbp-skeleton" />
        ))}
      </div>
    );
  }

  if (!activeBundle) {
    if (filteredBundles.length === 0) {
      return (
        <div className="empty-state tbp-empty">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="tbp-grid">
        {filteredBundles.map((bundle) => (
          <BundleCard
            key={bundle.file || bundle.id}
            bundle={bundle}
            onOpen={setActiveBundle}
            isSelected={selectedBundleId && String(selectedBundleId) === String(bundle.id)}
          />
        ))}
      </div>
    );
  }

  const sceneCount = activeBundle.scenes?.length || 0;
  const totalDuration = (activeBundle.scenes || []).reduce((sum, scene) => sum + (scene.duration || 8), 0);

  return (
    <div className="template-bundle-detail">
      <div className="template-bundle-detail__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <button
            type="button"
            className="template-bundle-detail__back"
            onClick={() => setActiveBundle(null)}
          >
            <MdArrowBack size={18} />
            Back
          </button>
          <div style={{ minWidth: 0 }}>
            <div className="template-bundle-detail__category">
              {activeBundle.category}
            </div>
            <h3 className="template-bundle-detail__title">{activeBundle.name}</h3>
            <p className="template-bundle-detail__subtitle">
              {sceneCount} scenes · ~{totalDuration}s · {activeBundle.aspectRatio || '16:9'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="template-bundle-detail__apply"
          onClick={() => onApplyBundle?.(activeBundle)}
        >
          <MdPlayCircleOutline size={18} />
          Apply all {sceneCount} scenes
        </button>
      </div>

      {activeBundle.description ? (
        <p className="template-bundle-detail__description">{activeBundle.description}</p>
      ) : null}

      {filteredScenes.length === 0 ? (
        <div className="empty-state tbp-empty">
          <p>No scenes match your filters.</p>
        </div>
      ) : (
        <div className="tbp-scene-grid">
          {filteredScenes.map((scene) => (
            <TemplateCard
              key={scene.id}
              template={scene}
              onSelect={(selected) => onSelectScene?.(selected, activeBundle)}
              isSelected={selectedSceneId && String(selectedSceneId) === String(scene.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateBundlePicker;
