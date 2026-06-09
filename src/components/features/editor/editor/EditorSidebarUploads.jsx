import React, { useCallback, useEffect, useState } from 'react';
import { MdCloudUpload } from 'react-icons/md';
import { predefinedMedia, predefinedVideos } from '../../../../constants/editorData';
import assetService from '../../../../services/assetService';

const EditorSidebarUploads = ({ addLayer, workspaceId, onUploadError }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refreshAssets = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const list = await assetService.listAssets(workspaceId);
      setAssets(list.map(assetService.normalizeAsset).filter(Boolean));
    } catch (err) {
      console.warn('[Uploads] Failed to list workspace assets', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  const handleFiles = async (files) => {
    if (!files?.length) return;

    if (!workspaceId) {
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        addLayer(file.type.split('/')[0], url);
      });
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const uploaded = await assetService.uploadAsset(workspaceId, file);
        const normalized = assetService.normalizeAsset(uploaded);
        if (!normalized?.url) continue;
        addLayer(normalized.mediaType || file.type.split('/')[0], {
          url: normalized.url,
          assetId: normalized.id,
        });
      }
      await refreshAssets();
    } catch (err) {
      console.error('[Uploads] Upload failed', err);
      onUploadError?.(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openFilePicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*';
    input.multiple = true;
    input.onchange = (e) => handleFiles(Array.from(e.target.files || []));
    input.click();
  };

  return (
    <div className="tool-panel-content">
      <div className="tool-section">
        <div
          className="premium-upload-zone"
          onClick={openFilePicker}
          style={{ opacity: uploading ? 0.7 : 1, pointerEvents: uploading ? 'none' : 'auto' }}
        >
          <div className="upload-icon-circle">
            <MdCloudUpload size={24} />
          </div>
          <div className="upload-text">
            <h5>{uploading ? 'Uploading…' : 'Upload Assets'}</h5>
            <p>
              {workspaceId
                ? 'Saved to your workspace'
                : 'Local only — open a saved project to persist uploads'}
            </p>
          </div>
        </div>
      </div>

      <div className="tool-section">
        <h4 className="tool-section-title">Workspace Assets</h4>
        {loading && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading assets…</p>
        )}
        {!loading && workspaceId && assets.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No uploads yet.</p>
        )}
        <div className="media-grid premium-scrollbar">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="media-item"
              onClick={() =>
                addLayer(asset.mediaType || 'image', {
                  url: asset.url,
                  assetId: asset.id,
                })
              }
              title={`Add ${asset.name}`}
            >
              {asset.mediaType === 'video' ? (
                <video src={asset.url} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : asset.mediaType === 'audio' ? (
                <div style={{ padding: 8, fontSize: 10, textAlign: 'center' }}>{asset.name}</div>
              ) : (
                <img src={asset.url} alt={asset.name} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tool-section">
        <h4 className="tool-section-title">Sample Media</h4>
        <div className="media-grid premium-scrollbar">
          {[...predefinedMedia, ...predefinedVideos].map((media) => (
            <div
              key={media.id}
              className="media-item"
              onClick={() => addLayer(media.type || 'image', media.full)}
              title={`Add ${media.name}`}
            >
              {media.type === 'video' ? (
                <video src={media.full} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={media.image} alt={media.name} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorSidebarUploads;
