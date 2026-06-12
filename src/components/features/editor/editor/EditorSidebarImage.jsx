import { useEffect, useMemo, useState } from 'react';
import { MdSearch } from 'react-icons/md';
import { predefinedMedia } from '../../../../constants/editorData';
import { loadPitchAssets, pitchImagesAsMedia } from '../../../../constants/pitchAssetLibrary';
import { setCanvasDragData } from '../../../../utils/editorDragDrop';

const EditorSidebarImage = ({ addLayer }) => {
  const [query, setQuery] = useState('');
  const [pitchMedia, setPitchMedia] = useState([]);

  useEffect(() => {
    loadPitchAssets()
      .then((assets) => setPitchMedia(pitchImagesAsMedia(assets)))
      .catch(() => setPitchMedia([]));
  }, []);

  const filterItems = (items) => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q) || item.id.includes(q));
  };

  const pitchItems = useMemo(() => filterItems(pitchMedia), [pitchMedia, query]);
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

      {pitchItems.length > 0 && (
        <div className="tool-section">
          <h4 className="tool-section-title">Pitch Deck</h4>
          <div className="media-grid premium-scrollbar">
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
