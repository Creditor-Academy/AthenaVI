import { predefinedVideos } from '../../../../constants/editorData';
import MediaUploadTile from './MediaUploadTile';

const EditorSidebarVideo = ({ addLayer, workspaceId, onUploadError, onClose }) => {
  return (
    <div className="tool-panel-content">
      <div className="media-grid premium-scrollbar">
        <MediaUploadTile
          addLayer={addLayer}
          workspaceId={workspaceId}
          onUploadError={onUploadError}
          accept="video/*,image/*"
          label="Upload"
          onComplete={onClose}
        />
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
