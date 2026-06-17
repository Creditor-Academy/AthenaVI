import { useMemo, useState } from 'react';
import { MdArrowBack, MdLayers, MdTimer, MdPlayCircleOutline } from 'react-icons/md';
import TemplateCard from '../../../TemplateCard';
import TemplateScenePreview from './TemplateScenePreview';

const bundleGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '24px',
  width: '100%',
};

const sceneGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
  gap: '20px',
  width: '100%',
};

function BundleCard({ bundle, onOpen }) {
  const [isHovered, setIsHovered] = useState(false);
  const sceneCount = bundle.scenes?.length || bundle.totalSlides || 0;
  const totalDuration = (bundle.scenes || []).reduce((sum, scene) => sum + (scene.duration || 8), 0);

  return (
    <div
      className="template-bundle-card"
      style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? '0 16px 32px -12px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onClick={() => onOpen(bundle)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0f172a' }}>
        {bundle.coverScene ? (
          <TemplateScenePreview template={bundle.coverScene} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e293b, #0f172a)' }} />
        )}
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(15,23,42,0.82)',
            color: '#fff',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            borderRadius: 999,
          }}
        >
          {bundle.category}
        </span>
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255,255,255,0.92)',
            color: '#475569',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: 8,
          }}
        >
          {sceneCount} scenes
        </span>
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{bundle.name}</h4>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 13,
            lineHeight: 1.45,
            color: '#64748b',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {bundle.description}
        </p>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <MdLayers size={14} />
            {sceneCount} scenes
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
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
      <div style={bundleGridStyle}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            style={{
              aspectRatio: '16/9',
              borderRadius: 14,
              background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
              backgroundSize: '200% 100%',
              animation: 'bundle-shimmer 1.2s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (!activeBundle) {
    if (filteredBundles.length === 0) {
      return (
        <div className="empty-state" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div style={bundleGridStyle}>
        {filteredBundles.map((bundle) => (
          <BundleCard key={bundle.file || bundle.id} bundle={bundle} onOpen={setActiveBundle} />
        ))}
      </div>
    );
  }

  const sceneCount = activeBundle.scenes?.length || 0;
  const totalDuration = (activeBundle.scenes || []).reduce((sum, scene) => sum + (scene.duration || 8), 0);

  return (
    <div className="template-bundle-detail">
      <div
        className="template-bundle-detail__header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
          padding: '16px 18px',
          borderRadius: 14,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setActiveBundle(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid #e2e8f0',
              background: '#fff',
              color: '#475569',
              borderRadius: 10,
              padding: '8px 12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <MdArrowBack size={18} />
            Back
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {activeBundle.category}
            </div>
            <h3 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{activeBundle.name}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              {sceneCount} scenes · ~{totalDuration}s · {activeBundle.aspectRatio || '16:9'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onApplyBundle?.(activeBundle)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: '#3b82f6',
            color: '#fff',
            borderRadius: 10,
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 8px 20px -8px rgba(59,130,246,0.55)',
            flexShrink: 0,
          }}
        >
          <MdPlayCircleOutline size={18} />
          Apply all {sceneCount} scenes
        </button>
      </div>

      {activeBundle.description ? (
        <p style={{ margin: '0 0 18px', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{activeBundle.description}</p>
      ) : null}

      {filteredScenes.length === 0 ? (
        <div className="empty-state" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>
          <p>No scenes match your filters.</p>
        </div>
      ) : (
        <div style={sceneGridStyle}>
          {filteredScenes.map((scene) => (
            <TemplateCard
              key={scene.id}
              template={scene}
              onSelect={(selected) => onSelectScene?.(selected, activeBundle)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateBundlePicker;
