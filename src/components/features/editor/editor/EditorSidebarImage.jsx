import React from 'react';
import { MdSearch } from 'react-icons/md';
import { predefinedMedia } from '../../../../constants/editorData';

const EditorSidebarImage = ({ addLayer }) => {
  return (
    <div className="tool-panel-content">
      <div className="search-box">
        <MdSearch className="search-icon" size={18} />
        <input type="text" placeholder="Search images..." className="search-input" />
      </div>
      <div className="media-grid">
        {predefinedMedia.map((media) => (
          <div
            key={media.id}
            className="media-item"
            onClick={() => {
                addLayer('image', media.full);
            }}
            title={`Add ${media.name}`}
          >
            <img src={media.image} alt={media.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebarImage;
