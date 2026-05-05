import React from 'react';
import { predefinedMedia, predefinedVideos } from '../../../../constants/editorData';

const EditorSidebarStock = ({ addLayer }) => {
  return (
    <div className="tool-panel-content">
      <div className="media-grid">
        {[...predefinedMedia, ...predefinedVideos].map((media) => (
          <div
            key={media.id}
            className="media-item"
            onClick={() => addLayer(media.type, media.full)}
            title={`Add ${media.name}`}
          >
            <img src={media.image} alt={media.name} />
            {media.type === 'video' && <div className="media-badge">VIDEO</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebarStock;
