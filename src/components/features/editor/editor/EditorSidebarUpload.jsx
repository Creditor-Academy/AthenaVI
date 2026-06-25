import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MdAudiotrack,
  MdCloudUpload,
  MdDeleteOutline,
  MdDriveFileRenameOutline,
  MdImage,
  MdVideocam,
} from 'react-icons/md';
import assetService, { isAssetInUseError, formatAssetInUseMessage } from '../../../../services/assetService';
import workspaceService from '../../../../services/workspaceService';
import { useAuth } from '../../../../contexts/AuthContext';
import { extractUserId } from '../../../../pages/TeamWorkspace/workspaceUtils';
import { canManageAsset } from '../../../../utils/assetPermissions';
import { assertUploadFits, dispatchStorageRefresh, formatStorageLimitMessage, isStorageLimitError } from '../../../../utils/storageQuota';
import { setCanvasDragData } from '../../../../utils/editorDragDrop';

const SOURCE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'upload', label: 'Uploads' },
  { id: 'stock', label: 'Stock' },
];

const EditorSidebarUpload = ({ addLayer, onAddAudio, workspaceId, onUploadError, onClose }) => {
  const { user } = useAuth();
  const currentUserId = extractUserId(user);
  const inputRef = useRef(null);
  const [assets, setAssets] = useState([]);
  const [workspaceMeta, setWorkspaceMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all');

  const refreshAssets = useCallback(async () => {
    if (!workspaceId) {
      setAssets([]);
      return;
    }
    setLoading(true);
    try {
      const list = await assetService.listAllAssets(workspaceId, { source: sourceFilter });
      setAssets(list.map((item) => assetService.normalizeAsset(item)).filter(Boolean));
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, sourceFilter]);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  useEffect(() => {
    if (!workspaceId) {
      setWorkspaceMeta(null);
      return;
    }
    let cancelled = false;
    workspaceService
      .getWorkspace(workspaceId)
      .then((ws) => {
        if (!cancelled) setWorkspaceMeta(ws);
      })
      .catch(() => {
        if (!cancelled) setWorkspaceMeta(null);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const assetCanManage = (asset) => canManageAsset(asset, workspaceMeta, currentUserId);

  const handleFiles = async (files) => {
    if (!files?.length) return;

    if (!workspaceId) {
      files.forEach((file) => {
        const url = URL.createObjectURL(file);
        addLayer(file.type.split('/')[0], url);
      });
      onClose?.();
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        const validationError = assetService.validateUploadFile(file);
        if (validationError) {
          onUploadError?.(validationError);
          continue;
        }
        await assertUploadFits(workspaceId, file.size);
        const uploaded = await assetService.uploadAsset(workspaceId, file);
        let normalized = assetService.normalizeAsset(uploaded);
        if (!normalized?.url && normalized?.id) {
          const list = await assetService.listAssets(workspaceId, { take: 100, source: 'upload' });
          const match = list.find((item) => String(item.id || item._id) === String(normalized.id));
          normalized = assetService.normalizeAsset(match) || normalized;
        }
        if (!normalized?.url) {
          onUploadError?.('Upload succeeded but the image URL is missing. Try selecting it from workspace assets.');
          continue;
        }
        if ((normalized.mediaType || file.type.split('/')[0]) === 'audio') {
          onAddAudio?.(normalized.url, normalized.id, { name: normalized.name || file.name });
        } else {
          addLayer(normalized.mediaType || file.type.split('/')[0], {
            url: normalized.url,
            assetId: normalized.id,
          });
        }
      }
      await refreshAssets();
      dispatchStorageRefresh();
      onClose?.();
    } catch (err) {
      onUploadError?.(
        isStorageLimitError(err) ? formatStorageLimitMessage(err) : err?.message || 'Upload failed'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRename = async (asset, event) => {
    event?.stopPropagation();
    event?.preventDefault();
    if (!workspaceId || !asset?.id || renamingId) return;

    const nextName = window.prompt('Rename asset', asset.name);
    if (nextName == null) return;
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === asset.name) return;

    setRenamingId(asset.id);
    try {
      const updated = await assetService.renameAsset(workspaceId, asset.id, trimmed);
      const normalized = assetService.normalizeAsset(updated);
      if (normalized) {
        setAssets((prev) => prev.map((item) => (item.id === normalized.id ? normalized : item)));
      }
    } catch (err) {
      onUploadError?.(err?.message || 'Failed to rename asset');
    } finally {
      setRenamingId(null);
    }
  };

  const handleDelete = async (assetId, event) => {
    event?.stopPropagation();
    event?.preventDefault();
    if (!workspaceId || !assetId) return;
    setDeletingId(assetId);
    try {
      await assetService.deleteAsset(workspaceId, assetId);
      setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
      dispatchStorageRefresh();
    } catch (err) {
      onUploadError?.(
        isAssetInUseError(err)
          ? formatAssetInUseMessage(err)
          : err?.message || 'Failed to delete asset'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const bindMediaDrag = (type, content) => ({
    draggable: type === 'image',
    onDragStart: (e) => {
      if (type !== 'image') return;
      setCanvasDragData(e, { type: 'image', content });
    },
  });

  const mediaIcon = (type) => {
    if (type === 'video') return <MdVideocam size={18} />;
    if (type === 'audio') return <MdAudiotrack size={18} />;
    return <MdImage size={18} />;
  };

  const addAssetToCanvas = (asset) => {
    if (asset.mediaType === 'audio') {
      if (!onAddAudio) {
        onUploadError?.('Audio cannot be added in this context.');
        return;
      }
      onAddAudio(asset.url, asset.id, { name: asset.name });
      onClose?.();
      return;
    }
    addLayer(asset.mediaType || 'image', {
      url: asset.url,
      assetId: asset.id,
    });
    onClose?.();
  };

  return (
    <div className="tool-panel-content upload-insert-panel">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,video/mp4,audio/mpeg,audio/mp3,.mp3"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(Array.from(e.target.files || []));
          e.target.value = '';
        }}
      />

      <button
        type="button"
        className="upload-insert-panel__dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <span className="upload-insert-panel__icon" aria-hidden>
          <MdCloudUpload size={36} />
        </span>
        <span className="upload-insert-panel__title">
          {uploading ? 'Uploading…' : 'Upload from your device'}
        </span>
        <span className="upload-insert-panel__hint">
          JPEG, PNG, WebP, MP4, MP3 · max 50 MB ·{' '}
          {workspaceId ? 'Saved to your workspace' : 'Local preview only until project is saved'}
        </span>
      </button>

      {workspaceId ? (
        <div className="upload-insert-panel__library">
          <div className="upload-insert-panel__library-head">
            <h4 className="upload-insert-panel__library-title">Workspace assets</h4>
            <div className="upload-insert-panel__source-tabs" role="tablist" aria-label="Asset source">
              {SOURCE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={sourceFilter === tab.id}
                  className={`upload-insert-panel__source-tab${
                    sourceFilter === tab.id ? ' is-active' : ''
                  }`}
                  onClick={() => setSourceFilter(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="upload-insert-panel__grid upload-insert-panel__grid--skeleton" aria-busy="true">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={`asset-skeleton-${index}`} className="upload-insert-panel__asset-skeleton" aria-hidden />
              ))}
            </div>
          ) : null}
          {!loading && assets.length === 0 ? (
            <p className="upload-insert-panel__status">No assets in this view yet.</p>
          ) : null}
          {!loading ? (
          <div className="upload-insert-panel__grid premium-scrollbar">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className="upload-insert-panel__asset"
                onClick={() => addAssetToCanvas(asset)}
                title={`Add ${asset.name}`}
                {...bindMediaDrag(asset.mediaType || 'image', {
                  url: asset.url,
                  assetId: asset.id,
                })}
              >
                {asset.mediaType === 'video' ? (
                  <video src={asset.url} muted playsInline />
                ) : asset.mediaType === 'audio' ? (
                  <span className="upload-insert-panel__audio">{mediaIcon('audio')}</span>
                ) : (
                  <img src={asset.url} alt={asset.name} draggable={false} />
                )}
                {asset.source === 'stock' ? (
                  <span className="upload-insert-panel__badge">Stock</span>
                ) : null}
                {assetCanManage(asset) ? (
                <>
                <span
                  className="upload-insert-panel__rename"
                  role="button"
                  tabIndex={0}
                  aria-label={`Rename ${asset.name}`}
                  onClick={(e) => handleRename(asset, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleRename(asset, e);
                  }}
                >
                  <MdDriveFileRenameOutline size={16} />
                </span>
                <span
                  className="upload-insert-panel__delete"
                  role="button"
                  tabIndex={0}
                  aria-label={`Delete ${asset.name}`}
                  onClick={(e) => handleDelete(asset.id, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleDelete(asset.id, e);
                  }}
                >
                  <MdDeleteOutline size={16} />
                </span>
                </>
                ) : null}
                <span className="upload-insert-panel__asset-label">
                  {mediaIcon(asset.mediaType)}
                  <span>{asset.name}</span>
                </span>
              </button>
            ))}
          </div>
          ) : null}
        </div>
      ) : (
        <p className="upload-insert-panel__notice">
          Open a saved workspace project to persist uploads and reuse them across scenes.
        </p>
      )}
    </div>
  );
};

export default EditorSidebarUpload;
