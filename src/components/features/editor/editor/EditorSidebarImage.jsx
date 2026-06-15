import { useEffect, useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { predefinedMedia } from '../../../../constants/editorData';
import { loadPitchAssets, pitchImagesAsMedia } from '../../../../constants/pitchAssetLibrary';
import { loadProductLaunchAssets, productLaunchImagesAsMedia } from '../../../../constants/productLaunchAssetLibrary';
import { loadCourseModuleAssets, courseModuleImagesAsMedia } from '../../../../constants/courseModuleAssetLibrary';
import { loadSalesDemoAssets, salesDemoImagesAsMedia } from '../../../../constants/salesDemoAssetLibrary';
import { loadSocialShortAssets, socialShortImagesAsMedia } from '../../../../constants/socialShortAssetLibrary';
import { setCanvasDragData } from '../../../../utils/editorDragDrop';
import MediaUploadTile from './MediaUploadTile';

const EditorSidebarImage = ({ addLayer, workspaceId, onUploadError, onClose }) => {
  const [query, setQuery] = useState('');
  const [pitchMedia, setPitchMedia] = useState([]);
  const [launchMedia, setLaunchMedia] = useState([]);
  const [courseMedia, setCourseMedia] = useState([]);
  const [salesMedia, setSalesMedia] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);

  useEffect(() => {
    loadPitchAssets()
      .then((assets) => setPitchMedia(pitchImagesAsMedia(assets)))
      .catch(() => setPitchMedia([]));
    loadProductLaunchAssets()
      .then((assets) => setLaunchMedia(productLaunchImagesAsMedia(assets)))
      .catch(() => setLaunchMedia([]));
    loadCourseModuleAssets()
      .then((assets) => setCourseMedia(courseModuleImagesAsMedia(assets)))
      .catch(() => setCourseMedia([]));
    loadSalesDemoAssets()
      .then((assets) => setSalesMedia(salesDemoImagesAsMedia(assets)))
      .catch(() => setSalesMedia([]));
    loadSocialShortAssets()
      .then((assets) => setSocialMedia(socialShortImagesAsMedia(assets)))
      .catch(() => setSocialMedia([]));
  }, []);

  const filterItems = (items) => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.id.includes(q));
  };

  const pitchItems = useMemo(() => filterItems(pitchMedia), [pitchMedia, query]);
  const launchItems = useMemo(() => filterItems(launchMedia), [launchMedia, query]);
  const courseItems = useMemo(() => filterItems(courseMedia), [courseMedia, query]);
  const salesItems = useMemo(() => filterItems(salesMedia), [salesMedia, query]);
  const socialItems = useMemo(() => filterItems(socialMedia), [socialMedia, query]);
  const stockItems = useMemo(() => filterItems(predefinedMedia), [query]);

  const handleAdd = (media) => {
    addLayer('image', media.full, {
      role: media.role,
      style: media.role === 'logo' ? { objectFit: 'contain' } : undefined,
    });
  };

  const bindImageDrag = (media) => ({
    draggable: true,
    onDragStart: (e) => setCanvasDragData(e, { type: 'image', content: media.full }),
  });

  return (
    <div className="tool-panel-content">
      <div className="search-box">
        <MdSearch className="search-icon" size={18} />
        <input
          type="search"
          placeholder="Search images..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {socialItems.length > 0 && (
        <div className="tool-section">
          <h4 className="tool-section-title">Social Short</h4>
          <div className="media-grid premium-scrollbar">
            {socialItems.map((media) => (
              <div
                key={media.id}
                className="media-item media-item--draggable"
                onClick={() => handleAdd(media)}
                title={`Add or drag ${media.name} onto canvas or a frame`}
                {...bindImageDrag(media)}
              >
                <img src={media.image} alt={media.name} draggable={false} />
                {media.role === 'logo' && <div className="media-badge">LOGO</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {salesItems.length > 0 && (
        <div className="tool-section">
          <h4 className="tool-section-title">Sales Demo</h4>
          <div className="media-grid premium-scrollbar">
            {salesItems.map((media) => (
              <div
                key={media.id}
                className="media-item media-item--draggable"
                onClick={() => handleAdd(media)}
                title={`Add or drag ${media.name} onto canvas or a frame`}
                {...bindImageDrag(media)}
              >
                <img src={media.image} alt={media.name} draggable={false} />
                {media.role === 'logo' && <div className="media-badge">LOGO</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {courseItems.length > 0 && (
        <div className="tool-section">
          <h4 className="tool-section-title">Course Module</h4>
          <div className="media-grid premium-scrollbar">
            {courseItems.map((media) => (
              <div
                key={media.id}
                className="media-item media-item--draggable"
                onClick={() => handleAdd(media)}
                title={`Add or drag ${media.name} onto canvas or a frame`}
                {...bindImageDrag(media)}
              >
                <img src={media.image} alt={media.name} draggable={false} />
                {media.role === 'logo' && <div className="media-badge">LOGO</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {launchItems.length > 0 && (
        <div className="tool-section">
          <h4 className="tool-section-title">Product Launch</h4>
          <div className="media-grid premium-scrollbar">
            {launchItems.map((media) => (
              <div
                key={media.id}
                className="media-item media-item--draggable"
                onClick={() => handleAdd(media)}
                title={`Add or drag ${media.name} onto canvas or a frame`}
                {...bindImageDrag(media)}
              >
                <img src={media.image} alt={media.name} draggable={false} />
                {media.role === 'logo' && <div className="media-badge">LOGO</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {pitchItems.length > 0 && (
        <div className="tool-section">
          <h4 className="tool-section-title">Pitch Deck</h4>
          <div className="media-grid premium-scrollbar">
            <MediaUploadTile
              addLayer={addLayer}
              workspaceId={workspaceId}
              onUploadError={onUploadError}
              accept="image/*"
              label="Upload"
              onComplete={onClose}
            />
            {pitchItems.map((media) => (
              <div
                key={media.id}
                className="media-item media-item--draggable"
                onClick={() => handleAdd(media)}
                title={`Add or drag ${media.name} onto canvas or a frame`}
                {...bindImageDrag(media)}
              >
                <img src={media.image} alt={media.name} draggable={false} />
                {media.role === 'logo' && <div className="media-badge">LOGO</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tool-section">
        <h4 className="tool-section-title">Stock Images</h4>
        <div className="media-grid premium-scrollbar">
          {pitchItems.length === 0 && (
            <MediaUploadTile
              addLayer={addLayer}
              workspaceId={workspaceId}
              onUploadError={onUploadError}
              accept="image/*"
              label="Upload"
              onComplete={onClose}
            />
          )}
          {stockItems.map((media) => (
            <div
              key={media.id}
              className="media-item media-item--draggable"
              onClick={() => handleAdd(media)}
              title={`Add or drag ${media.name} onto canvas or a frame`}
              {...bindImageDrag(media)}
            >
              <img src={media.image} alt={media.name} draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarImage;
