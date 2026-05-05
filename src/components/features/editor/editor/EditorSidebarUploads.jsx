import React from 'react';
import { MdCloudUpload } from 'react-icons/md';
import { predefinedMedia } from '../../../../constants/editorData';

const EditorSidebarUploads = ({ addLayer }) => {
  return (
    <div className="tool-panel-content">
      <div className="tool-section">
        <div
          className="premium-upload-zone"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,video/*,audio/*';
            input.multiple = true;
            input.onchange = (e) => {
              const files = Array.from(e.target.files);
              files.forEach(file => {
                const url = URL.createObjectURL(file);
                addLayer(file.type.split('/')[0], url);
              });
            };
            input.click();
          }}
        >
          <div className="upload-icon-circle">
            <MdCloudUpload size={24} />
          </div>
          <div className="upload-text">
            <h5>Upload Assets</h5>
            <p>Support for Image, Video and Audio</p>
          </div>
        </div>
      </div>

      <div className="tool-section">
        <h4 className="tool-section-title">My Assets</h4>
        <div className="media-grid premium-scrollbar">
          {predefinedMedia.map((media) => (
            <div
              key={media.id}
              className="media-item"
              onClick={() => addLayer('image', media.full)}
              title={`Add ${media.name}`}
            >
              <img src={media.image} alt={media.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarUploads;
