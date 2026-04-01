import { useState, useRef, useEffect } from 'react'
import {
  MdAdd,
  MdMoreVert,
  MdDelete,
  MdContentCopy,
  MdStar,
  MdStarBorder,
  MdArrowBack,
  MdSave,
  MdInfo,
  MdSettings,
  MdDeleteOutline,
  MdColorLens,
} from 'react-icons/md'

const styles = `
.brandkits-container {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.brandkits-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.brandkits-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.section-label {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 120px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 64px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px;
}

.empty-description {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px;
  line-height: 1.6;
}

.empty-create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-create-btn:hover {
  background: #2563eb;
}

.brandkits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.brandkit-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  position: relative;
}

.brandkit-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.brandkit-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.brandkit-name {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
}

.brandkit-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.default-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.brandkit-date {
  font-size: 13px;
  color: #64748b;
}

.brandkit-menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.brandkit-menu-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.brandkit-menu {
  position: absolute;
  top: 50px;
  right: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.menu-item:hover {
  background: #f8fafc;
}

.menu-item.delete {
  color: #ef4444;
}

.menu-item.delete:hover {
  background: #fef2f2;
}

.menu-icon {
  font-size: 18px;
  color: #64748b;
  flex-shrink: 0;
}

.menu-item.delete .menu-icon {
  color: #ef4444;
}

/* Create/Edit Brand Kit Page */
.brandkit-editor {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 32px;
}

.editor-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.editor-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.editor-title input {
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  outline: none;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 200px;
}

.editor-title input:focus {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: #2563eb;
}

.editor-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 32px;
}

.quick-create-section {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  height: fit-content;
}

.quick-create-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
}

.new-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #f3e8ff;
  color: #7c3aed;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.quick-create-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.5;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: #ffffff;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.customize-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.customize-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.customize-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 20px;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.upload-box {
  aspect-ratio: 1;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.upload-box:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.upload-icon {
  font-size: 32px;
  color: #94a3b8;
}

.upload-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
}

.color-upload-box {
  aspect-ratio: 1;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.color-upload-box:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.color-themes {
  margin-top: 20px;
}

.themes-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin: 0 0 12px;
}

.theme-card {
  background: linear-gradient(90deg, #ffffff 0%, #f1f5f9 25%, #cbd5e1 50%, #64748b 75%, #0f172a 100%);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  position: relative;
}

.theme-label {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.themes-hint {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 12px;
}

.font-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.font-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.font-select-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-icon {
  font-size: 20px;
  color: #64748b;
}

.font-placeholder {
  color: #94a3b8;
}

.font-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.font-action-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.settings-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  margin-top: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.settings-link:hover {
  color: #334155;
}
`

const initialBrandKits = [
  {
    id: 'bk1',
    name: "Workspace's brand kit",
    isDefault: true,
    edited: '4 seconds ago',
  },
]

function BrandKits() {
  const [brandKits, setBrandKits] = useState(initialBrandKits)
  const [showEditor, setShowEditor] = useState(false)
  const [editingKit, setEditingKit] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [kitName, setKitName] = useState("Workspace's brand kit")
  const menuRefs = useRef({})

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((itemId) => {
        if (menuRefs.current[itemId] && !menuRefs.current[itemId].contains(event.target)) {
          setMenuOpen(null)
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCreate = () => {
    setEditingKit(null)
    setKitName('New Brand Kit')
    setShowEditor(true)
  }

  const handleEdit = (kit) => {
    setEditingKit(kit)
    setKitName(kit.name)
    setShowEditor(true)
  }

  const handleSave = () => {
    if (editingKit) {
      setBrandKits((prev) =>
        prev.map((kit) =>
          kit.id === editingKit.id ? { ...kit, name: kitName, edited: 'Just now' } : kit
        )
      )
    } else {
      const newKit = {
        id: `bk${Date.now()}`,
        name: kitName,
        isDefault: false,
        edited: 'Just now',
      }
      setBrandKits([...brandKits, newKit])
    }
    setShowEditor(false)
    setEditingKit(null)
  }

  const handleDelete = (kitId) => {
    if (window.confirm('Are you sure you want to delete this brand kit?')) {
      setBrandKits((prev) => prev.filter((kit) => kit.id !== kitId))
      setMenuOpen(null)
    }
  }

  const handleCopyId = (kitId) => {
    navigator.clipboard.writeText(kitId)
    setMenuOpen(null)
    alert('Brand Kit ID copied to clipboard!')
  }

  const handleRemoveDefault = (kitId) => {
    setBrandKits((prev) =>
      prev.map((kit) => ({
        ...kit,
        isDefault: kit.id === kitId ? false : kit.isDefault,
      }))
    )
    setMenuOpen(null)
  }

  if (showEditor) {
    return (
      <>
        <style>{styles}</style>
        <div className="brandkit-editor">
          <div className="editor-header">
            <div className="editor-header-left">
              <button className="back-btn" onClick={() => setShowEditor(false)}>
                <MdArrowBack size={18} />
              </button>
              <div className="editor-title">
                <input
                  type="text"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="Brand Kit Name"
                />
              </div>
            </div>
            <button className="save-btn" onClick={handleSave}>
              <MdSave size={18} />
              Save
            </button>
          </div>

          <div className="editor-content">
            <div className="quick-create-section">
              <h3 className="quick-create-title">
                Create your Brand Kit in just 1 click
                <span className="new-badge">NEW</span>
              </h3>
              <p className="quick-create-description">
                Search a brand or its website and we'll create its Brand Kit for you.
              </p>
              <input
                type="text"
                className="search-input"
                placeholder="Search brand or type URL"
              />
            </div>

            <div className="customize-section">
              <div className="customize-card">
                <h3 className="customize-title">Logo</h3>
                <div className="upload-grid">
                  <div className="upload-box">
                    <MdAdd className="upload-icon" />
                    <span className="upload-label">Primary</span>
                    <div className="upload-info">
                      <MdInfo size={14} />
                      <span>Upload logo</span>
                    </div>
                  </div>
                  <div className="upload-box">
                    <MdAdd className="upload-icon" />
                    <span className="upload-label">Negative</span>
                    <div className="upload-info">
                      <MdInfo size={14} />
                      <span>Upload logo</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="customize-card">
                <h3 className="customize-title">Colors</h3>
                <div className="color-upload-box" style={{ width: '100%', height: '120px' }}>
                  <MdAdd className="upload-icon" />
                </div>
                <div className="color-themes">
                  <div className="themes-label">Color themes</div>
                  <div className="theme-card">
                    <span className="theme-label">Theme 1</span>
                  </div>
                  <p className="themes-hint">Add a color to see automatically generated themes</p>
                </div>
              </div>

              <div className="customize-card">
                <h3 className="customize-title">Text styles</h3>
                <div className="font-select">
                  <div className="font-select-content">
                    <span className="font-icon">T</span>
                    <span className="font-placeholder">Choose primary font</span>
                  </div>
                  <div className="font-actions">
                    <button className="font-action-btn">
                      <MdDeleteOutline size={18} />
                    </button>
                  </div>
                </div>
                <div className="settings-link">
                  <MdSettings size={16} />
                  <span>Settings</span>
                </div>
              </div>

              <div className="customize-card">
                <h3 className="customize-title">Avatars</h3>
                <div className="color-upload-box" style={{ width: '100%', height: '120px' }}>
                  <MdAdd className="upload-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="brandkits-container">
        <div className="brandkits-header">
          <h1 className="brandkits-title">Brand Kits</h1>
          <button className="create-btn" onClick={handleCreate}>
            <MdAdd size={18} />
            Create Brand Kit
          </button>
        </div>

        {brandKits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <MdColorLens size={64} />
            </div>
            <h2 className="empty-title">Your workspace does not have any Brand Kits</h2>
            <p className="empty-description">
              Express your brand identity through consistent fonts, colors, and other assets so you can connect with your audience on a deeper level.
            </p>
            <button className="empty-create-btn" onClick={handleCreate}>
              Create a Brand Kit
            </button>
          </div>
        ) : (
          <>
            <p className="section-label">Workspace Brand Kits</p>
            <div className="brandkits-list">
              {brandKits.map((kit) => (
                <div key={kit.id} className="brandkit-card" ref={el => menuRefs.current[kit.id] = el}>
                  <div className="brandkit-info">
                    <div>
                      <h3 className="brandkit-name">{kit.name}</h3>
                      <div className="brandkit-meta">
                        {kit.isDefault && (
                          <span className="default-badge">DEFAULT</span>
                        )}
                        <span className="brandkit-date">Edited {kit.edited}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="brandkit-menu-btn"
                    onClick={() => setMenuOpen(menuOpen === kit.id ? null : kit.id)}
                  >
                    <MdMoreVert size={20} />
                  </button>
                  {menuOpen === kit.id && (
                    <div className="brandkit-menu" onClick={(e) => e.stopPropagation()}>
                      {kit.isDefault && (
                        <button
                          className="menu-item"
                          onClick={() => handleRemoveDefault(kit.id)}
                        >
                          <MdStarBorder className="menu-icon" />
                          Remove as default
                        </button>
                      )}
                      <button
                        className="menu-item"
                        onClick={() => handleCopyId(kit.id)}
                      >
                        <MdContentCopy className="menu-icon" />
                        Copy ID
                      </button>
                      <button
                        className="menu-item delete"
                        onClick={() => handleDelete(kit.id)}
                      >
                        <MdDelete className="menu-icon" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default BrandKits

