import StockMediaBrowser from './StockMediaBrowser';

const EditorSidebarImage = ({ addLayer, workspaceId, onUploadError, onClose }) => (
  <div className="tool-panel-content tool-panel-content--stock">
    <StockMediaBrowser
      variant="photo"
      addLayer={addLayer}
      workspaceId={workspaceId}
      onUploadError={onUploadError}
      onComplete={onClose}
    />
  </div>
);

export default EditorSidebarImage;
