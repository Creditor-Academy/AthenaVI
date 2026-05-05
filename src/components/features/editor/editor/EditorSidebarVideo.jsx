import React from 'react';
import { predefinedVideos } from '../../../../constants/editorData';

const EditorSidebarVideo = ({ addLayer }) => {
  return (
    <div className="tool-panel-content">
      <div className="media-grid">
        {predefinedVideos.map((video) => (
          <div
            key={video.id}
            className="media-item"
            onClick={() => addLayer('video', video.full)}
            title={`Add ${video.name}`}
          >
            <img src={video.image} alt={video.name} />
            <div className="media-badge">VIDEO</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebarVideo;
