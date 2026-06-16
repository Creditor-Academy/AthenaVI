import StockMediaBrowser from './StockMediaBrowser';

const EditorSidebarVideo = ({ addLayer, workspaceId, onUploadError, onClose }) => (
  <div className="tool-panel-content tool-panel-content--stock">
    <StockMediaBrowser
      variant="video"
      addLayer={addLayer}
      workspaceId={workspaceId}
      onUploadError={onUploadError}
      onComplete={onClose}
    />
  </div>
);

export default EditorSidebarVideo;
