import { useRef, useState } from 'react'
import { MdCloudUpload } from 'react-icons/md'
import assetService from '../../../../services/assetService'

const MediaUploadTile = ({
  addLayer,
  workspaceId,
  onUploadError,
  accept = 'image/jpeg,image/png,image/webp,video/mp4,audio/mpeg,audio/mp3,.mp3',
  label = 'Upload',
  onComplete,
}) => {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFiles = async (files) => {
    if (!files?.length) return

    if (!workspaceId) {
      files.forEach((file) => {
        const url = URL.createObjectURL(file)
        addLayer(file.type.split('/')[0], url)
      })
      onComplete?.()
      return
    }

    setUploading(true)
    try {
      for (const file of files) {
        const validationError = assetService.validateUploadFile(file)
        if (validationError) {
          onUploadError?.(validationError)
          continue
        }
        const uploaded = await assetService.uploadAsset(workspaceId, file)
        const normalized = assetService.normalizeAsset(uploaded)
        if (!normalized?.url) continue
        addLayer(normalized.mediaType || file.type.split('/')[0], {
          url: normalized.url,
          assetId: normalized.id,
        })
      }
      onComplete?.()
    } catch (err) {
      console.error('[Upload] Failed', err)
      onUploadError?.(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          handleFiles(Array.from(e.target.files || []))
          e.target.value = ''
        }}
      />
      <button
        type="button"
        className="media-upload-tile"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={label}
      >
        <span className="media-upload-tile__icon" aria-hidden>
          <MdCloudUpload size={28} />
        </span>
        <span className="media-upload-tile__label">
          {uploading ? 'Uploading…' : label}
        </span>
        <span className="media-upload-tile__hint">From your device</span>
      </button>
    </>
  )
}

export default MediaUploadTile
