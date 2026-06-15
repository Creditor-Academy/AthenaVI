import { useEffect, useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { SHAPE_CATEGORIES, SHAPE_LIBRARY, shapeMatchesCategory } from '../../../../constants/shapeLibrary';
import { loadPitchAssets, pitchShapesAsLibrary } from '../../../../constants/pitchAssetLibrary';
import { loadProductLaunchAssets, productLaunchShapesAsLibrary } from '../../../../constants/productLaunchAssetLibrary';
import { loadCourseModuleAssets, courseModuleShapesAsLibrary } from '../../../../constants/courseModuleAssetLibrary';
import { loadSalesDemoAssets, salesDemoShapesAsLibrary } from '../../../../constants/salesDemoAssetLibrary';
import { loadSocialShortAssets, socialShortShapesAsLibrary } from '../../../../constants/socialShortAssetLibrary';

const ShapePreview = ({ style }) => {
  const isLine = style.height === '0px' || style.borderTop;
  const previewStyle = {
    ...style,
    width: isLine ? '36px' : '36px',
    height: isLine ? '4px' : '36px',
    maxWidth: '36px',
    maxHeight: isLine ? '4px' : '36px',
    background: style.background === 'transparent' && !style.borderTop
      ? 'transparent'
      : isLine
        ? 'transparent'
        : 'var(--shape-preview-fill, var(--text-muted))',
    borderColor: style.border?.includes('solid') ? 'var(--shape-preview-fill, var(--text-muted))' : undefined,
  };

  if (style.borderTop) {
    previewStyle.borderTop = style.borderTop.replace('var(--primary)', 'var(--shape-preview-fill, var(--text-muted))');
  }

  if (style.background === 'transparent' && style.border) {
    previewStyle.border = style.border.replace('var(--primary)', 'var(--shape-preview-fill, var(--text-muted))');
  }

  return <div className="shape-tool-preview" style={previewStyle} aria-hidden />;
};

const EditorSidebarShapes = ({ addLayer, activeSceneId, updateScene }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('shapes');
  const [pitchShapes, setPitchShapes] = useState([]);
  const [pitchBackgrounds, setPitchBackgrounds] = useState([]);
  const [launchShapes, setLaunchShapes] = useState([]);
  const [launchBackgrounds, setLaunchBackgrounds] = useState([]);
  const [courseShapes, setCourseShapes] = useState([]);
  const [courseBackgrounds, setCourseBackgrounds] = useState([]);
  const [salesShapes, setSalesShapes] = useState([]);
  const [salesBackgrounds, setSalesBackgrounds] = useState([]);
  const [socialShapes, setSocialShapes] = useState([]);
  const [socialBackgrounds, setSocialBackgrounds] = useState([]);

  useEffect(() => {
    loadPitchAssets()
      .then((assets) => {
        setPitchShapes(pitchShapesAsLibrary(assets));
        setPitchBackgrounds(assets.backgrounds || []);
      })
      .catch(() => {
        setPitchShapes([]);
        setPitchBackgrounds([]);
      });
    loadProductLaunchAssets()
      .then((assets) => {
        setLaunchShapes(productLaunchShapesAsLibrary(assets));
        setLaunchBackgrounds(assets.backgrounds || []);
      })
      .catch(() => {
        setLaunchShapes([]);
        setLaunchBackgrounds([]);
      });
    loadCourseModuleAssets()
      .then((assets) => {
        setCourseShapes(courseModuleShapesAsLibrary(assets));
        setCourseBackgrounds(assets.backgrounds || []);
      })
      .catch(() => {
        setCourseShapes([]);
        setCourseBackgrounds([]);
      });
    loadSalesDemoAssets()
      .then((assets) => {
        setSalesShapes(salesDemoShapesAsLibrary(assets));
        setSalesBackgrounds(assets.backgrounds || []);
      })
      .catch(() => {
        setSalesShapes([]);
        setSalesBackgrounds([]);
      });
    loadSocialShortAssets()
      .then((assets) => {
        setSocialShapes(socialShortShapesAsLibrary(assets));
        setSocialBackgrounds(assets.backgrounds || []);
      })
      .catch(() => {
        setSocialShapes([]);
        setSocialBackgrounds([]);
      });
  }, []);

  const allShapes = useMemo(
    () => [...SHAPE_LIBRARY, ...pitchShapes, ...launchShapes, ...courseShapes, ...salesShapes, ...socialShapes],
    [pitchShapes, launchShapes, courseShapes, salesShapes, socialShapes]
  );

  const bundleBackgrounds = {
    pitch: pitchBackgrounds,
    'product-launch': launchBackgrounds,
    'course-module': courseBackgrounds,
    'sales-demo': salesBackgrounds,
    'social-short': socialBackgrounds,
  };
  const activeBackgrounds = bundleBackgrounds[category] || [];
  const showSceneBackgrounds =
    Boolean(bundleBackgrounds[category]?.length) &&
    updateScene &&
    activeSceneId;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allShapes.filter((shape) => {
      if (!shapeMatchesCategory(shape, category)) return false;
      if (!q) return true;
      return shape.name.toLowerCase().includes(q) || shape.id.includes(q);
    });
  }, [allShapes, query, category]);

  const handleAdd = (shape) => {
    addLayer('shape', shape);
  };

  return (
    <div className="shape-tool-panel">
      <div className="shape-tool-search">
        <MdSearch size={18} className="shape-tool-search-icon" aria-hidden />
        <input
          type="search"
          className="shape-tool-search-input"
          placeholder="Search shapes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="shape-tool-tabs" role="tablist" aria-label="Shape categories">
        {SHAPE_CATEGORIES.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={category === tab.id}
            className={`shape-tool-tab ${category === tab.id ? 'shape-tool-tab--active' : ''}`}
            onClick={() => setCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {showSceneBackgrounds && (
        <div className="shape-tool-backgrounds">
          <p className="shape-tool-results-label">Scene backgrounds</p>
          <p className="shape-tool-results-hint">Use a color instead of a hero image, or pick any custom color.</p>
          <div className="shape-tool-bg-row">
            {activeBackgrounds.map((bg) => {
              const isGradient = bg.value.includes('gradient');
              return (
                <button
                  key={bg.id}
                  type="button"
                  className="shape-tool-bg-swatch"
                  title={bg.name}
                  style={isGradient ? { backgroundImage: bg.value } : { backgroundColor: bg.value }}
                  onClick={() =>
                    updateScene(activeSceneId, {
                      background: {
                        type: isGradient ? 'gradient' : 'solid',
                        value: bg.value,
                        editable: true,
                        modes: ['solid', 'gradient', 'image'],
                      },
                    })
                  }
                />
              );
            })}
            <label className="shape-tool-bg-custom" title="Custom color">
              <span aria-hidden>+</span>
              <input
                type="color"
                aria-label="Custom scene background color"
                onChange={(e) =>
                  updateScene(activeSceneId, {
                    background: {
                      type: 'solid',
                      value: e.target.value,
                      editable: true,
                      modes: ['solid', 'gradient', 'image'],
                    },
                  })
                }
              />
            </label>
          </div>
        </div>
      )}

      <p className="shape-tool-results-label">
        {filtered.length} {filtered.length === 1 ? 'shape' : 'shapes'}
      </p>

      <div className="shape-tool-grid premium-scrollbar">
        {filtered.map((shape) => (
          <button
            key={shape.id}
            type="button"
            className="shape-tool-cell"
            title={shape.name}
            onClick={() => handleAdd(shape)}
          >
            <ShapePreview style={shape.style} />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="shape-tool-empty">No shapes match your search.</p>
        )}
      </div>
    </div>
  );
};

export default EditorSidebarShapes;
