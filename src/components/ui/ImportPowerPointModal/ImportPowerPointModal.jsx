import React, { useRef, useState } from 'react'
import { MdClose, MdUploadFile } from 'react-icons/md'
import presentationService from '../../../services/presentationService'
import './ImportPowerPointModal.css'

const ImportPowerPointModal = ({ workspaceId, onClose, onImported }) => {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pptx', 'ppt'].includes(ext)) {
      setError('Please upload a .pptx or .ppt file')
      return
    }

    if (!workspaceId) {
      setError('Select a workspace before importing')
      return
    }

    setUploading(true)
    setError('')
    try {
      const result = await presentationService.importPresentation(workspaceId, file, {
        title: file.name.replace(/\.(pptx|ppt)$/i, ''),
      })
      const presentationId =
        result?.presentationId ||
        result?.id ||
        result?.presentation?.id
      onImported?.({
        presentationId,
        workspaceId,
        title: result?.title || file.name,
        warnings: result?.warnings || result?.unsupportedElements || [],
      })
      onClose?.()
    } catch (err) {
      setError(err.message || 'Import failed — unsupported elements may appear as placeholders')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  return (
    <div
      className="ppt-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ppt-modal-content">
        <button className="ppt-close-btn" onClick={onClose} aria-label="Close modal">
          <MdClose size={20} />
        </button>

        <div className="ppt-left-panel">
          <h2 className="ppt-title">Import PowerPoint</h2>

          <div
            className={`ppt-upload-area ${dragOver ? 'is-drag-over' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="file-shape">
              <MdUploadFile size={28} />
            </div>
            <span className="ppt-drop-text">
              {uploading ? 'Importing…' : 'Drag & drop your .pptx file'}
            </span>
            <button className="ppt-choose-btn" type="button" disabled={uploading}>
              Choose file
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pptx,.ppt"
              style={{ display: 'none' }}
            />
          </div>
          {error && (
            <p style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>{error}</p>
          )}
        </div>

        <div className="ppt-right-panel">
          <p className="ppt-info-text">
            You can edit text, images, videos, and shapes after import. Unsupported elements
            appear as yellow placeholder boxes.
          </p>
          <ul className="ppt-info-list">
            <li>Text blocks and basic shapes</li>
            <li>Images and embedded media</li>
            <li>Tables and charts (simplified)</li>
            <li>Slide transitions (metadata only)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ImportPowerPointModal
