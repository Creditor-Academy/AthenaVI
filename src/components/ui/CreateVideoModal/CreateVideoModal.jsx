import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  MdCheck,
  MdCropLandscape,
  MdCropPortrait,
  MdCropSquare,
  MdSearch,
  MdAdd,
  MdClose,
  MdKeyboardArrowDown
} from 'react-icons/md'
import workspaceService from '../../../services/workspaceService.js'
import './CreateVideoModal.css'

const WIZARD_STEPS = [
  { id: 1, label: 'Page Size' },
  { id: 2, label: 'Choose Template' },
  { id: 3, label: 'Details' }
]

const PAGE_SIZES = [
  { id: 'portrait', label: 'Portrait', ratio: '9:16', Icon: MdCropPortrait },
  { id: 'landscape', label: 'Landscape', ratio: '16:9', Icon: MdCropLandscape },
  { id: 'square', label: 'Square', ratio: '1:1', Icon: MdCropSquare }
]

const TEMPLATE_FILTERS = [
  'All',
  'Interactive',
  'Corporate',
  'Training',
  'Quiz',
  'Onboarding',
  'Sales',
  'Minimalistic'
]

const TEMPLATE_ITEMS = [
  {
    id: 'tpl-pop-smart-quiz',
    name: 'Pop Smart Quiz',
    badge: 'NEW',
    badgeType: 'new',
    pageSizes: ['landscape', 'square'],
    tags: ['Interactive', 'Training', 'Quiz'],
    preview: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-playful-company-culture',
    name: 'Playful Company Culture Template',
    badge: 'INTERACTIVE',
    badgeType: 'interactive',
    pageSizes: ['landscape', 'portrait'],
    tags: ['Corporate', 'Onboarding'],
    preview: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-corporate-interactive-quiz',
    name: 'Corporate Interactive Quiz',
    badge: 'INTERACTIVE',
    badgeType: 'interactive',
    pageSizes: ['landscape', 'square'],
    tags: ['Corporate', 'Interactive', 'Quiz', 'Sales'],
    preview: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-interactive-training',
    name: 'Interactive Training Template',
    badge: 'NEW',
    badgeType: 'new',
    pageSizes: ['landscape', 'portrait'],
    tags: ['Training', 'Interactive'],
    preview: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-bright-circuit',
    name: 'Bright Circuit Template',
    badge: 'NEW',
    badgeType: 'new',
    pageSizes: ['square', 'portrait'],
    tags: ['Minimalistic'],
    preview: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-corporate-facilities-tour',
    name: 'Corporate Facilities Tour Template',
    badge: 'INTERACTIVE',
    badgeType: 'interactive',
    pageSizes: ['landscape'],
    tags: ['Corporate', 'Onboarding'],
    preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-interactive-corporate-quiz',
    name: 'Interactive Corporate Quiz',
    badge: 'INTERACTIVE',
    badgeType: 'interactive',
    pageSizes: ['landscape', 'square'],
    tags: ['Corporate', 'Interactive', 'Quiz'],
    preview: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-compliance-basics',
    name: 'Compliance Basics Quiz',
    badge: 'NEW',
    badgeType: 'new',
    pageSizes: ['landscape', 'portrait'],
    tags: ['Training', 'Corporate', 'Quiz'],
    preview: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'tpl-interactive-corporate-training',
    name: 'Interactive Corporate Training',
    badge: 'INTERACTIVE',
    badgeType: 'interactive',
    pageSizes: ['landscape', 'portrait', 'square'],
    tags: ['Interactive', 'Training', 'Corporate'],
    preview: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  }
]

const DEFAULT_WORKSPACES = []

const mapFolderNames = (workspace) => {
  if (!workspace) return []

  const directFolders = Array.isArray(workspace.folders) ? workspace.folders : []
  const nestedFolders = Array.isArray(workspace.workspaceFolders) ? workspace.workspaceFolders : []
  const combined = [...directFolders, ...nestedFolders]

  return combined
    .map((folder) => {
      if (typeof folder === 'string') return folder
      return folder?.name || ''
    })
    .filter(Boolean)
}

const CreateVideoModal = ({
  isOpen,
  onClose,
  onCreateVideo,
  workspaces = DEFAULT_WORKSPACES
}) => {
  const [step, setStep] = useState(1)
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState('landscape')
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)

  const [workspaceOptions, setWorkspaceOptions] = useState(workspaces)
  const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id || '')
  const [folderMap, setFolderMap] = useState(() => {
    const initialMap = {}
    workspaces.forEach((ws) => {
      initialMap[ws.id] = mapFolderNames(ws)
    })
    return initialMap
  })
  const [folder, setFolder] = useState('')
  const [videoTags, setVideoTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [videoName, setVideoName] = useState('')
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const dropdownAreaRef = useRef(null)

  const availableFolders = useMemo(() => {
    return folderMap[workspaceId] || []
  }, [folderMap, workspaceId])

  const selectedTemplate = useMemo(() => {
    if (selectedTemplateId === 'blank') return null
    return TEMPLATE_ITEMS.find((item) => item.id === selectedTemplateId) || null
  }, [selectedTemplateId])

  const filteredTemplates = useMemo(() => {
    return TEMPLATE_ITEMS.filter((item) => {
      const matchesPageSize = item.pageSizes.includes(pageSize)
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      const matchesFilter = selectedFilter === 'All' || item.tags.includes(selectedFilter)
      return matchesPageSize && matchesSearch && matchesFilter
    })
  }, [pageSize, searchQuery, selectedFilter])

  const canGoNext = step === 1 || (step === 2 && selectedTemplateId !== null)
  const canCreate = step === 3 && videoName.trim() && workspaceId && folder

  const selectedWorkspaceName = useMemo(() => {
    return workspaceOptions.find((item) => item.id === workspaceId)?.name || 'Select workspace'
  }, [workspaceId, workspaceOptions])

  useEffect(() => {
    let isMounted = true

    const loadWorkspaces = async () => {
      setLoadingWorkspaces(true)

      try {
        const fetched = await workspaceService.listWorkspaces()
        if (!isMounted) return

        const normalized = (fetched || []).map((ws) => ({
          id: ws.id,
          name: ws.name || ws.title || 'Untitled Workspace',
          ...ws
        }))

        setWorkspaceOptions(normalized)

        const folderEntries = await Promise.all(
          normalized.map(async (ws) => {
            let names = mapFolderNames(ws)
            if (!names.length) {
              try {
                const details = await workspaceService.getWorkspace(ws.id)
                names = mapFolderNames(details)
              } catch {
                names = []
              }
            }
            return [ws.id, names]
          })
        )

        if (!isMounted) return
        const nextFolderMap = Object.fromEntries(folderEntries)
        setFolderMap(nextFolderMap)

        if (normalized.length && !workspaceId) {
          setWorkspaceId(normalized[0].id)
        }
      } catch {
        if (!isMounted) return
        setWorkspaceOptions(workspaces)
      } finally {
        if (isMounted) setLoadingWorkspaces(false)
      }
    }

    loadWorkspaces()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownAreaRef.current && !dropdownAreaRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!workspaceId) {
      setFolder('')
      return
    }
    const firstFolder = (folderMap[workspaceId] || [])[0] || ''
    setFolder((prev) => prev || firstFolder)
  }, [workspaceId, folderMap])

  if (!isOpen) return null

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId)
    if (!videoName) {
      if (templateId === 'blank') {
        setVideoName('Untitled Video')
      } else {
        const matchedTemplate = TEMPLATE_ITEMS.find((item) => item.id === templateId)
        if (matchedTemplate?.name) {
          setVideoName(matchedTemplate.name)
        }
      }
    }
  }

  const handleAddTag = () => {
    const normalized = tagInput.trim()
    if (!normalized) return
    if (videoTags.includes(normalized)) {
      setTagInput('')
      return
    }
    setVideoTags((prev) => [...prev, normalized])
    setTagInput('')
  }

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (e.key === ',') {
        const withoutComma = tagInput.replace(/,$/, '')
        setTagInput(withoutComma)
      }
      handleAddTag()
    }
  }

  const handleWorkspaceChange = (nextWorkspaceId) => {

    if (nextWorkspaceId === '__create_workspace__') {
      const workspaceName = window.prompt('Enter new workspace name')
      if (!workspaceName || !workspaceName.trim()) return

      workspaceService.createWorkspace(workspaceName.trim())
        .then((createdWorkspace) => {
          const normalizedWorkspace = {
            id: createdWorkspace.id,
            name: createdWorkspace.name || createdWorkspace.title || workspaceName.trim(),
            ...createdWorkspace
          }
          setWorkspaceOptions((prev) => [...prev, normalizedWorkspace])
          setFolderMap((prev) => ({ ...prev, [normalizedWorkspace.id]: [] }))
          setWorkspaceId(normalizedWorkspace.id)
          setFolder('')
          setOpenDropdown(null)
        })
        .catch((error) => {
          window.alert(error?.message || 'Failed to create workspace')
        })
      return
    }

    setWorkspaceId(nextWorkspaceId)
    const nextFolders = folderMap[nextWorkspaceId] || []
    setFolder(nextFolders[0] || '')
    setOpenDropdown(null)
  }

  const handleFolderChange = (nextValue) => {
    if (nextValue === '__create_new__') {
      const folderName = window.prompt('Enter new folder name')
      if (folderName && folderName.trim()) {
        const trimmedFolder = folderName.trim()
        workspaceService.createFolder(workspaceId, trimmedFolder)
          .then(() => {
            setFolderMap((prev) => {
              const existing = prev[workspaceId] || []
              if (existing.includes(trimmedFolder)) return prev
              return {
                ...prev,
                [workspaceId]: [...existing, trimmedFolder]
              }
            })
            setFolder(trimmedFolder)
            setOpenDropdown(null)
          })
          .catch((error) => {
            window.alert(error?.message || 'Failed to create folder')
          })
      }
      return
    }
    setFolder(nextValue)
    setOpenDropdown(null)
  }

  const handleNext = () => {
    if (!canGoNext) return
    setStep((prev) => Math.min(3, prev + 1))
  }

  const handleBack = () => {
    if (step === 1) return
    setStep((prev) => Math.max(1, prev - 1))
  }

  const handleCreateVideo = () => {
    const selectedWorkspace = workspaceOptions.find((item) => item.id === workspaceId)
    const payload = {
      template: selectedTemplate,
      pageSize,
      workspace: selectedWorkspace?.name || '',
      folder,
      tags: videoTags,
      name: (videoName || '').trim()
    }

    if (onCreateVideo) {
      onCreateVideo(payload)
    }
  }

  return (
    <div className="create-video-modal-overlay" role="presentation">
      <div className="create-video-modal" role="dialog" aria-modal="true" aria-label="Create a video">
        <aside className="create-video-wizard-sidebar">
          <div className="create-video-logo-block">
            <div className="create-video-logo-mark">VI</div>
            <div className="create-video-logo-text">Athena VI</div>
          </div>
          <ol className="create-video-step-list" aria-label="Create video steps">
            {WIZARD_STEPS.map((stepItem) => {
              const isActive = step === stepItem.id
              const isCompleted = step > stepItem.id
              return (
                <li key={stepItem.id} className={`create-video-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <span className="create-video-step-dot" aria-hidden>
                    {isCompleted ? <MdCheck size={14} /> : stepItem.id}
                  </span>
                  <span className="create-video-step-label">{stepItem.label}</span>
                </li>
              )
            })}
          </ol>
        </aside>

        <section className="create-video-wizard-main">
          <header className="create-video-wizard-header">
            {step === 1 && (
              <>
                <h2>Choose your canvas size</h2>
                <p>Select the orientation for your video</p>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Start with a template</h2>
                <p>Pick a starting point for your video</p>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Name your video</h2>
                <p>Add details and choose where to save it</p>
              </>
            )}
          </header>

          <div className="create-video-wizard-body">
            {step === 1 && (
              <div className="create-video-page-size-grid" role="radiogroup" aria-label="Choose page size">
                {PAGE_SIZES.map(({ id, label, ratio, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={pageSize === id}
                    className={`create-video-size-card ${pageSize === id ? 'selected' : ''}`}
                    onClick={() => setPageSize(id)}
                  >
                    <span className={`create-video-size-visual ${id}`}>
                      <Icon size={36} />
                    </span>
                    <span className="create-video-size-name">{label}</span>
                    <span className="create-video-size-ratio">{ratio}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <>
                <label className="create-video-search" htmlFor="create-video-search-input">
                  <MdSearch size={18} />
                  <input
                    id="create-video-search-input"
                    type="search"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>

                <div className="create-video-filter-row" role="tablist" aria-label="Template filters">
                  {TEMPLATE_FILTERS.map((filterLabel) => (
                    <button
                      key={filterLabel}
                      type="button"
                      role="tab"
                      aria-selected={selectedFilter === filterLabel}
                      className={`create-video-filter-chip ${selectedFilter === filterLabel ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(filterLabel)}
                    >
                      {filterLabel}
                    </button>
                  ))}
                </div>

                <div className="create-video-template-grid" role="listbox" aria-label="Template options">
                  <button
                    type="button"
                    className={`create-video-template-card blank ${selectedTemplateId === 'blank' ? 'selected' : ''}`}
                    onClick={() => handleSelectTemplate('blank')}
                  >
                    <div className="create-video-thumb-wrap blank">
                      <span className="create-video-blank-plus"><MdAdd size={40} /></span>
                    </div>
                    <span className="create-video-template-name">Start from Blank</span>
                  </button>

                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className={`create-video-template-card ${selectedTemplateId === template.id ? 'selected' : ''}`}
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <div className="create-video-thumb-wrap">
                        <img src={template.preview} alt={template.name} />
                        <span className={`create-video-template-badge ${template.badgeType}`}>
                          {template.badge}
                        </span>
                        <span className="create-video-template-overlay" />
                      </div>
                      <span className="create-video-template-name">{template.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <div className="create-video-form-stack" ref={dropdownAreaRef}>
                <label className="create-video-field">
                  <span>Video Name *</span>
                  <input
                    type="text"
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    placeholder="Untitled Video"
                  />
                </label>

                <div className="create-video-field">
                  <span>Tags</span>
                  <div className="create-video-tag-input-shell" onClick={() => document.getElementById('create-video-tag-input')?.focus()}>
                    {videoTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="create-video-custom-tag"
                        onClick={() => setVideoTags((prev) => prev.filter((item) => item !== tag))}
                      >
                        {tag}
                        <MdClose size={12} />
                      </button>
                    ))}
                    <input
                      id="create-video-tag-input"
                      type="text"
                      value={tagInput}
                      placeholder="Add tags..."
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                    />
                  </div>
                </div>

                <div className="create-video-field">
                  <span>Workspace *</span>
                  <div className={`create-video-dropdown ${openDropdown === 'workspace' ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="create-video-dropdown-trigger"
                      onClick={() => setOpenDropdown((prev) => prev === 'workspace' ? null : 'workspace')}
                      disabled={loadingWorkspaces}
                    >
                      <span className={`create-video-dropdown-value ${!workspaceId ? 'placeholder' : ''}`}>
                        {loadingWorkspaces ? 'Loading workspaces...' : selectedWorkspaceName}
                      </span>
                      <MdKeyboardArrowDown size={18} className="create-video-dropdown-chevron" />
                    </button>

                    {openDropdown === 'workspace' && (
                      <div className="create-video-dropdown-menu" role="listbox" aria-label="Workspace options">
                        {!workspaceOptions.length && (
                          <button type="button" className="create-video-dropdown-item empty" disabled>
                            No workspace found
                          </button>
                        )}

                        {workspaceOptions.map((workspace) => (
                          <button
                            key={workspace.id}
                            type="button"
                            className={`create-video-dropdown-item ${workspace.id === workspaceId ? 'selected' : ''}`}
                            onClick={() => handleWorkspaceChange(workspace.id)}
                          >
                            <span>{workspace.name}</span>
                            {workspace.id === workspaceId && <MdCheck size={16} />}
                          </button>
                        ))}

                        <button
                          type="button"
                          className="create-video-dropdown-item create-action"
                          onClick={() => handleWorkspaceChange('__create_workspace__')}
                        >
                          <span>+ Create new workspace</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="create-video-field">
                  <span>Folder *</span>
                  <div className={`create-video-dropdown ${openDropdown === 'folder' ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="create-video-dropdown-trigger"
                      onClick={() => setOpenDropdown((prev) => prev === 'folder' ? null : 'folder')}
                      disabled={!workspaceId}
                    >
                      <span className={`create-video-dropdown-value ${!folder ? 'placeholder' : ''}`}>
                        {folder || 'Select folder'}
                      </span>
                      <MdKeyboardArrowDown size={18} className="create-video-dropdown-chevron" />
                    </button>

                    {openDropdown === 'folder' && (
                      <div className="create-video-dropdown-menu" role="listbox" aria-label="Folder options">
                        {!availableFolders.length && (
                          <button type="button" className="create-video-dropdown-item empty" disabled>
                            No folder found
                          </button>
                        )}

                        {availableFolders.map((folderName) => (
                          <button
                            key={folderName}
                            type="button"
                            className={`create-video-dropdown-item ${folderName === folder ? 'selected' : ''}`}
                            onClick={() => handleFolderChange(folderName)}
                          >
                            <span>{folderName}</span>
                            {folderName === folder && <MdCheck size={16} />}
                          </button>
                        ))}

                        <button
                          type="button"
                          className="create-video-dropdown-item create-action"
                          onClick={() => handleFolderChange('__create_new__')}
                        >
                          <span>+ Create new folder</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="create-video-footer">
            <button type="button" className="create-video-btn create-video-btn-ghost" onClick={onClose}>
              Cancel
            </button>

            <div className="create-video-footer-actions">
              <button type="button" className="create-video-btn create-video-btn-ghost" onClick={handleBack} disabled={step === 1}>
                Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  className="create-video-btn create-video-btn-primary"
                  onClick={handleNext}
                  disabled={!canGoNext}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="create-video-btn create-video-btn-primary"
                  onClick={handleCreateVideo}
                  disabled={!canCreate}
                >
                  Create
                </button>
              )}
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}

export default CreateVideoModal
