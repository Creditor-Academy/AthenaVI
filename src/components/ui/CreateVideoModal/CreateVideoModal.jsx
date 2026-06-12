import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MdCheck,
  MdSearch,
  MdAdd,
  MdClose,
  MdCheckCircle,
  MdCancel,
  MdWarning
} from 'react-icons/md';
import workspaceService from '../../../services/workspaceService.js';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchEditorTemplateScenes,
  sceneMatchesAspectRatio,
} from '../../../utils/fetchEditorTemplates.js';
import TemplateScenePreview from '../../features/editor/editor/TemplateScenePreview';
import './CreateVideoModal.css';

const WIZARD_STEPS = [
  { id: 1, label: 'Canvas Size' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'Details' }
];

const CANVAS_OPTIONS = [
  { id: 'landscape', label: '16:9 Landscape', ratio: '16:9' },
  { id: 'portrait', label: '9:16 Portrait', ratio: '9:16' },
  { id: 'square', label: '1:1 Square', ratio: '1:1' },
  { id: 'four-five', label: '4:5 Vertical', ratio: '4:5' },
  { id: 'custom', label: 'Custom', ratio: 'Custom' }
];

const PREBUILT_TAGS = ['Professional', 'Presentation', 'Marketing', 'Social Media', 'Education', 'Personal'];

const TEMPLATE_FILTERS = ['All', 'Corporate', 'Training', 'Marketing', 'Social', 'Minimal'];

function normalizeId(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    return String(value.id || value._id || value.userId || value.user_id || value.sub || '');
  }
  return String(value);
}

function extractUserId(userObj) {
  if (!userObj) return '';
  return normalizeId(
    userObj.id || userObj._id || userObj.userId || userObj.user_id || userObj.sub || ''
  );
}

function readRole(workspace) {
  const role =
    workspace.role ||
    workspace.userRole ||
    workspace.membershipRole ||
    workspace.myRole ||
    workspace.memberRole ||
    workspace.currentUserRole ||
    workspace.membership?.role ||
    workspace.access?.role ||
    workspace.permission ||
    'MEMBER';
  return String(role).toUpperCase();
}

function normalizeWorkspace(workspace, currentUserId, authUser) {
  const id = workspace.id || workspace._id;
  const typeRaw = String(workspace.type || '').toUpperCase();
  const isPersonal = Boolean(workspace.isPersonal) || typeRaw === 'PRIVATE' || typeRaw === 'PERSONAL';

  const ownerId = normalizeId(
    workspace.ownerId ||
      workspace.ownerUserId ||
      workspace.owner_id ||
      workspace.owner?.id ||
      workspace.owner?._id ||
      workspace.owner
  );

  const creatorId = normalizeId(
    workspace.createdBy ||
      workspace.createdById ||
      workspace.creatorId ||
      workspace.creator?.id ||
      workspace.creator?._id
  );

  const role = readRole(workspace);

  const ownerInMembers = Array.isArray(workspace.members)
    ? workspace.members.some((member) => {
        const memberId = normalizeId(
          member.userId || member.user?.id || member.user?._id || member.user || member.id || member._id
        );
        return memberId === currentUserId && String(member.role || '').toUpperCase() === 'OWNER';
      })
    : false;

  const isOwner =
    isPersonal ||
    role === 'OWNER' ||
    (Boolean(currentUserId) && ownerId === currentUserId) ||
    ownerInMembers ||
    (Boolean(currentUserId) && creatorId === currentUserId);

  const effectiveRole = isPersonal ? 'OWNER' : (isOwner ? 'OWNER' : role || 'MEMBER');

  return {
    ...workspace,
    id,
    name: (() => {
      if (isPersonal) {
        const fullName = authUser?.name || workspace.owner?.name || '';
        let firstName = fullName.trim().split(/\s+/)[0];
        if (!firstName && (authUser?.email || workspace.owner?.email)) {
          const email = authUser?.email || workspace.owner?.email;
          firstName = email.split('@')[0].split(/[._-]/)[0];
        }
        if (firstName) {
          firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
          return `${firstName}'s Personal`;
        }
        return "Your Personal";
      }
      return workspace.name || workspace.title || 'Untitled Workspace';
    })(),
    section: isPersonal ? 'personal' : (isOwner ? 'my' : 'shared'),
    type: isPersonal ? 'personal' : 'workspace',
    userRole: effectiveRole
  };
}

function canvasToAspectRatio(canvasSize, customSize) {
  if (canvasSize === 'landscape') return '16:9';
  if (canvasSize === 'portrait') return '9:16';
  if (canvasSize === 'square') return '1:1';
  if (canvasSize === 'four-five') return '4:5';
  if (canvasSize === 'custom') {
    if (!customSize.width || !customSize.height) return '';
    return `${customSize.width}:${customSize.height}`;
  }
  return '';
}

function canCreateInWorkspace(workspace) {
  if (!workspace) return false;
  const role = String(workspace.userRole || '').toUpperCase();
  if (workspace.type === 'personal') return true;
  return role !== 'VIEWER';
}

const CreateVideoModal = ({
  isOpen,
  onClose,
  onCreateVideo,
  initialWorkspaceId = '',
  initialFolderId = ''
}) => {
  const { user: authUser } = useAuth();
  const currentUserId = extractUserId(authUser);

  const [step, setStep] = useState(1);

  const [canvasSize, setCanvasSize] = useState('landscape');
  const [customCanvas, setCustomCanvas] = useState({ width: '', height: '' });

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateItems, setTemplateItems] = useState([]);

  const [workspaceOptions, setWorkspaceOptions] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(initialWorkspaceId || '');

  const [folderOptions, setFolderOptions] = useState([]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderId, setFolderId] = useState(initialFolderId || '');
  const [folderProjects, setFolderProjects] = useState([]);

  const [showInlineWorkspaceCreate, setShowInlineWorkspaceCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const [showInlineFolderCreate, setShowInlineFolderCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [videoTitle, setVideoTitle] = useState('');
  const [videoTags, setVideoTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const selectedWorkspace = useMemo(
    () => workspaceOptions.find((workspace) => String(workspace.id) === String(workspaceId)) || null,
    [workspaceId, workspaceOptions]
  );

  const selectedTemplate = useMemo(() => {
    if (selectedTemplateId === 'blank') return null;
    const item = templateItems.find((template) => String(template.id) === String(selectedTemplateId));
    return item?.scene || null;
  }, [selectedTemplateId, templateItems]);

  const aspectRatio = useMemo(
    () => canvasToAspectRatio(canvasSize, customCanvas),
    [canvasSize, customCanvas]
  );

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return templateItems.filter((item) => {
      const name = (item.name || item.scene?.title || '').toLowerCase();
      const matchesSearch =
        name.includes(query) ||
        (item.tags || []).some((tag) => String(tag).toLowerCase().includes(query)) ||
        (item.bundleCategory || '').toLowerCase().includes(query);
      const matchesFilter = selectedFilter === 'All' || item.category === selectedFilter;
      const matchesRatio = sceneMatchesAspectRatio(item.scene, aspectRatio);
      return matchesSearch && matchesFilter && matchesRatio;
    });
  }, [templateItems, searchQuery, selectedFilter, aspectRatio]);

  const hasDirtyData = useMemo(() => {
    return Boolean(
      videoTitle.trim() ||
        selectedTemplateId ||
        videoTags.length ||
        workspaceId ||
        folderId ||
        showInlineWorkspaceCreate ||
        showInlineFolderCreate ||
        newWorkspaceName.trim() ||
        newFolderName.trim() ||
        (canvasSize === 'custom' && (customCanvas.width || customCanvas.height)) ||
        canvasSize !== 'landscape'
    );
  }, [
    videoTitle,
    selectedTemplateId,
    videoTags,
    workspaceId,
    folderId,
    showInlineWorkspaceCreate,
    showInlineFolderCreate,
    newWorkspaceName,
    newFolderName,
    canvasSize,
    customCanvas.width,
    customCanvas.height
  ]);

  const trimmedVideoTitle = videoTitle.trim();

  const isProjectNameDuplicate = useMemo(() => {
    if (!trimmedVideoTitle || !folderId) return false;
    return folderProjects.some((project) => {
      const name = (project.name || project.title || '').trim();
      return name.toLowerCase() === trimmedVideoTitle.toLowerCase();
    });
  }, [trimmedVideoTitle, folderId, folderProjects]);

  const canProceedStep1 = Boolean(aspectRatio);
  const canProceedStep2 = selectedTemplateId !== null;
  const canCreateVideo =
    Boolean(trimmedVideoTitle) &&
    !isProjectNameDuplicate &&
    Boolean(aspectRatio) &&
    Boolean(workspaceId) &&
    Boolean(folderId) &&
    Boolean(canCreateInWorkspace(selectedWorkspace));

  async function loadWorkspaces() {
    setWorkspaceLoading(true);
    try {
      const fetched = await workspaceService.listWorkspaces();
      const normalized = (fetched || []).map((ws) => normalizeWorkspace(ws, currentUserId, authUser));
      setWorkspaceOptions(normalized);

      const defaultWorkspace =
        normalized.find((workspace) => String(workspace.id) === String(initialWorkspaceId)) ||
        normalized.find((workspace) => workspace.section === 'personal') ||
        normalized[0] ||
        null;

      if (defaultWorkspace) {
        setWorkspaceId((prev) => prev || defaultWorkspace.id);
      }
    } catch {
      setWorkspaceOptions([]);
    } finally {
      setWorkspaceLoading(false);
    }
  }

  async function loadFolderProjects(nextWorkspaceId, nextFolderId) {
    if (!nextWorkspaceId || !nextFolderId) {
      setFolderProjects([]);
      return;
    }

    try {
      const projects = await workspaceService.listProjects(nextWorkspaceId, nextFolderId);
      setFolderProjects(projects || []);
    } catch {
      setFolderProjects([]);
    }
  }

  async function loadFolders(nextWorkspaceId) {
    setFolderLoading(true);
    try {
      const folders = await workspaceService.listFolders(nextWorkspaceId);
      const normalized = (folders || []).map((folder) => ({ ...folder, id: folder.id || folder._id }));
      setFolderOptions(normalized);

      if (String(nextWorkspaceId) !== String(workspaceId)) {
        setFolderId('');
        return;
      }

      const preferred =
        normalized.find((folder) => String(folder.id) === String(initialFolderId)) ||
        normalized[0] ||
        null;

      setFolderId((prev) => {
        if (!prev && preferred) return preferred.id;
        if (prev && normalized.some((folder) => String(folder.id) === String(prev))) return prev;
        return preferred?.id || '';
      });
    } catch {
      setFolderOptions([]);
      setFolderId('');
    } finally {
      setFolderLoading(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    loadWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!aspectRatio) {
      setTemplateItems([]);
      return;
    }
    loadTemplates();
  }, [isOpen, aspectRatio]);

  useEffect(() => {
    if (!isOpen) return;
    if (!workspaceId) {
      setFolderOptions([]);
      setFolderId('');
      setFolderProjects([]);
      return;
    }
    loadFolders(workspaceId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, workspaceId]);

  useEffect(() => {
    if (!isOpen) return;
    loadFolderProjects(workspaceId, folderId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, workspaceId, folderId]);

  useEffect(() => {
    if (!isOpen) return;

    const onWorkspaceCreated = (event) => {
      const created = event.detail?.workspace;
      if (!created) return;
      const normalized = normalizeWorkspace(created, currentUserId, authUser);
      setWorkspaceOptions((prev) => {
        if (prev.some((workspace) => String(workspace.id) === String(normalized.id))) return prev;
        return [...prev, normalized];
      });
      setWorkspaceId(normalized.id);
    };

    const onFolderCreated = (event) => {
      const createdFolder = event.detail?.folder;
      const createdWorkspaceId = event.detail?.workspaceId;
      if (!createdFolder || !createdWorkspaceId) return;

      if (String(createdWorkspaceId) === String(workspaceId)) {
        setFolderOptions((prev) => {
          if (prev.some((folder) => String(folder.id) === String(createdFolder.id || createdFolder._id))) {
            return prev;
          }
          return [...prev, { ...createdFolder, id: createdFolder.id || createdFolder._id }];
        });
      }
    };

    const onVideoCreated = (event) => {
      const createdWorkspaceId = event.detail?.workspaceId;
      const createdFolderId = event.detail?.folderId;
      const video = event.detail?.video;
      if (!video || !createdWorkspaceId || !createdFolderId) return;

      if (
        String(createdWorkspaceId) === String(workspaceId) &&
        String(createdFolderId) === String(folderId)
      ) {
        const normalizedVideo = {
          ...video,
          id: video.id || video._id,
          name: video.name || video.title
        };
        setFolderProjects((prev) => {
          if (prev.some((project) => String(project.id) === String(normalizedVideo.id))) return prev;
          return [...prev, normalizedVideo];
        });
      }
    };

    window.addEventListener('workspace:created', onWorkspaceCreated);
    window.addEventListener('workspace:folder-created', onFolderCreated);
    window.addEventListener('workspace:video-created', onVideoCreated);

    return () => {
      window.removeEventListener('workspace:created', onWorkspaceCreated);
      window.removeEventListener('workspace:folder-created', onFolderCreated);
      window.removeEventListener('workspace:video-created', onVideoCreated);
    };
  }, [isOpen, workspaceId, folderId, currentUserId]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const closeWithGuard = () => {
    if (hasDirtyData) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const scenes = await fetchEditorTemplateScenes();
      setTemplateItems(scenes);
    } catch {
      setTemplateItems([]);
    } finally {
      setTemplatesLoading(false);
    }
  }

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) return;
    if (step === 2 && !canProceedStep2) return;
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    if (!videoTitle.trim()) {
      if (templateId === 'blank') {
        setVideoTitle('Untitled Project');
      } else {
        const picked = templateItems.find((item) => String(item.id) === String(templateId));
        if (picked?.name) setVideoTitle(picked.name);
      }
    }
  };

  const handleToggleTag = (tag) => {
    setVideoTags((prev) => {
      if (prev.includes(tag)) return prev.filter((item) => item !== tag);
      return [...prev, tag];
    });
  };

  const handleWorkspaceSelect = (event) => {
    const value = event.target.value;
    if (value === '__create_workspace__') {
      setShowInlineWorkspaceCreate(true);
      return;
    }

    setWorkspaceId(value);
    setFolderId('');
    setShowInlineWorkspaceCreate(false);
    setShowInlineFolderCreate(false);
  };

  const handleFolderSelect = (event) => {
    const value = event.target.value;
    if (value === '__create_folder__') {
      setShowInlineFolderCreate(true);
      return;
    }

    setFolderId(value);
    setShowInlineFolderCreate(false);
  };

  const handleCreateWorkspaceInline = async () => {
    const trimmedName = newWorkspaceName.trim();
    if (!trimmedName) return;

    setCreatingWorkspace(true);
    try {
      const created = await workspaceService.createWorkspace(trimmedName);
      const normalized = normalizeWorkspace({ ...created, userRole: 'OWNER' }, currentUserId, authUser);

      setWorkspaceOptions((prev) => {
        if (prev.some((workspace) => String(workspace.id) === String(normalized.id))) return prev;
        return [...prev, normalized];
      });
      setWorkspaceId(normalized.id);
      setFolderOptions([]);
      setFolderId('');
      setShowInlineWorkspaceCreate(false);
      setNewWorkspaceName('');
      showToast('Workspace created successfully', 'success');

      window.dispatchEvent(new CustomEvent('workspace:created', { detail: { workspace: normalized } }));
    } catch (error) {
      showToast(error?.message || 'Failed to create workspace. Please try again.', 'error');
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleCreateFolderInline = async () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName || !workspaceId) return;

    setCreatingFolder(true);
    try {
      const created = await workspaceService.createFolder(workspaceId, trimmedName);
      const normalizedFolder = {
        ...created,
        id: created.id || created._id,
        name: created.name || trimmedName
      };

      setFolderOptions((prev) => {
        if (prev.some((folder) => String(folder.id) === String(normalizedFolder.id))) return prev;
        return [...prev, normalizedFolder];
      });
      setFolderId(normalizedFolder.id);
      setShowInlineFolderCreate(false);
      setNewFolderName('');
      showToast('Folder created successfully', 'success');

      window.dispatchEvent(
        new CustomEvent('workspace:folder-created', {
          detail: { workspaceId, folder: normalizedFolder }
        })
      );
    } catch (error) {
      showToast(error?.message || 'Failed to create folder. Please try again.', 'error');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCreate = async () => {
    if (!canCreateVideo || isProjectNameDuplicate) return;

    const payload = {
      title: trimmedVideoTitle,
      tags: videoTags,
      aspectRatio: canvasSize === 'custom' ? 'custom' : aspectRatio,
    };

    if (folderId) {
      payload.folderId = folderId;
    }

    if (canvasSize === 'custom' && customCanvas.width && customCanvas.height) {
      payload.customWidth = parseInt(customCanvas.width, 10) || 1920;
      payload.customHeight = parseInt(customCanvas.height, 10) || 1080;
    }

    setSubmitting(true);
    try {
      const createdProject = await workspaceService.createProject(workspaceId, payload);

      const eventVideo = {
        ...createdProject,
        id: createdProject.id || createdProject._id,
        name: createdProject.name || createdProject.title || payload.title
      };

      window.dispatchEvent(
        new CustomEvent('workspace:video-created', {
          detail: {
            workspaceId,
            folderId,
            video: eventVideo
          }
        })
      );

      if (onCreateVideo) {
        showToast('Project created successfully', 'success');
        onCreateVideo({
          template: selectedTemplate
            ? {
                scenes: [],
                scene: selectedTemplate
              }
            : null,
          pageSize: canvasSize,
          canvasSize: aspectRatio,
          workspace: selectedWorkspace?.name || '',
          workspaceId,
          folder: folderOptions.find((folder) => String(folder.id) === String(folderId))?.name || '',
          folderId,
          tags: videoTags,
          name: payload.title,
          videoId: eventVideo.id
        });
      }
    } catch (error) {
      showToast(error?.message || 'Failed to create project. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedWorkspaces = {
    personal: workspaceOptions.filter((workspace) => workspace.section === 'personal'),
    my: workspaceOptions.filter((workspace) => workspace.section === 'my'),
    shared: workspaceOptions.filter((workspace) => workspace.section === 'shared')
  };

  return (
    <div className="create-video-modal-overlay" role="presentation" onClick={closeWithGuard}>
      <div className="create-video-modal" role="dialog" aria-modal="true" aria-label="Create a project" onClick={(event) => event.stopPropagation()}>
        <aside className="create-video-wizard-sidebar">
          <div className="create-video-logo-block">
            <div className="create-video-logo-mark">VI</div>
            <div className="create-video-logo-text">Athena VI</div>
          </div>

          <ol className="create-video-step-list" aria-label="Create project steps">
            {WIZARD_STEPS.map((stepItem) => {
              const isActive = step === stepItem.id;
              const isCompleted = step > stepItem.id;
              return (
                <li key={stepItem.id} className={`create-video-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <span className="create-video-step-dot" aria-hidden>
                    {isCompleted ? <MdCheck size={14} /> : stepItem.id}
                  </span>
                  <span className="create-video-step-label">{stepItem.label}</span>
                </li>
              );
            })}
          </ol>
        </aside>

        <section className="create-video-wizard-main">
          <header className="create-video-wizard-header">
            {step === 1 && (
              <>
                <h2>Choose your canvas size</h2>
                <p>Select an aspect ratio before continuing</p>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Start with a template</h2>
                <p>Templates are filtered by selected canvas size</p>
              </>
            )}
            {step === 3 && (
              <>
                <h2>Name your project</h2>
                <p>Choose title, tags, workspace, and folder</p>
              </>
            )}
          </header>

          <div className="create-video-wizard-body">
            {step === 1 && (
              <div>
                <div className="create-video-page-size-grid" role="radiogroup" aria-label="Choose canvas size">
                  {CANVAS_OPTIONS.map(({ id, label, ratio }) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={canvasSize === id}
                      className={`create-video-size-card ${canvasSize === id ? 'selected' : ''}`}
                      onClick={() => setCanvasSize(id)}
                    >
                      <span className={`create-video-size-visual ${id}`}>
                        {ratio}
                      </span>
                      <span className="create-video-size-name">{label}</span>
                      <span className="create-video-size-ratio">{ratio}</span>
                    </button>
                  ))}
                </div>

                {canvasSize === 'custom' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Width"
                      value={customCanvas.width}
                      onChange={(event) => setCustomCanvas((prev) => ({ ...prev, width: event.target.value }))}
                      className="create-video-inline-input"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Height"
                      value={customCanvas.height}
                      onChange={(event) => setCustomCanvas((prev) => ({ ...prev, height: event.target.value }))}
                      className="create-video-inline-input"
                    />
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <>
                <label className="create-video-search" htmlFor="create-video-search-input">
                  <MdSearch size={18} />
                  <input
                    id="create-video-search-input"
                    type="search"
                    placeholder="Search templates"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
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

                {templatesLoading ? (
                  <div className="create-video-template-grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="create-video-template-skeleton" />
                    ))}
                  </div>
                ) : (
                  <div className="create-video-template-grid" role="listbox" aria-label="Template options">
                    <button
                      type="button"
                      className={`create-video-template-card blank ${selectedTemplateId === 'blank' ? 'selected' : ''}`}
                      onClick={() => handleSelectTemplate('blank')}
                    >
                      <div className="create-video-thumb-wrap blank">
                        <span className="create-video-blank-plus">
                          <MdAdd size={40} />
                        </span>
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
                          {template.scene ? (
                            <TemplateScenePreview template={template.scene} />
                          ) : (
                            <img src={template.thumbnail} alt={template.name} />
                          )}
                          <span className={`create-video-template-badge ${template.badgeType || 'new'}`}>{template.badge || '01'}</span>
                          <span className="create-video-template-overlay" />
                        </div>
                        <span className="create-video-template-name">{template.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <div className="create-video-form-stack">
                <label className="create-video-field">
                  <span>Project Title *</span>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(event) => setVideoTitle(event.target.value)}
                    placeholder="Enter project title..."
                    className={isProjectNameDuplicate ? 'create-video-input-error' : ''}
                  />
                  {isProjectNameDuplicate && (
                    <span className="create-video-field-error">
                      A project with this name already exists in this folder
                    </span>
                  )}
                </label>

                <div className="create-video-field">
                  <span>Tags</span>
                  <div className="create-video-tag-pills">
                    {PREBUILT_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`create-video-tag-pill ${videoTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => handleToggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="create-video-field">
                  <span>Workspace *</span>
                  <select value={workspaceId} onChange={handleWorkspaceSelect} disabled={workspaceLoading}>
                    {!workspaceOptions.length && <option value="">No workspaces available</option>}

                    {groupedWorkspaces.personal.length > 0 && (
                      <optgroup label="Personal Workspace">
                        {groupedWorkspaces.personal.map((workspace) => (
                          <option key={workspace.id} value={workspace.id}>
                            {workspace.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {groupedWorkspaces.my.length > 0 && (
                      <optgroup label="My Workspaces">
                        {groupedWorkspaces.my.map((workspace) => (
                          <option key={workspace.id} value={workspace.id}>
                            {workspace.name}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {groupedWorkspaces.shared.length > 0 && (
                      <optgroup label="Shared With Me">
                        {groupedWorkspaces.shared.map((workspace) => (
                          <option key={workspace.id} value={workspace.id}>
                            {workspace.name} ({workspace.userRole})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <option value="__create_workspace__">+ Create New Workspace</option>
                  </select>
                </label>

                {showInlineWorkspaceCreate && (
                  <div className="create-video-inline-row">
                    <input
                      className="create-video-inline-input"
                      type="text"
                      placeholder="New workspace name"
                      value={newWorkspaceName}
                      onChange={(event) => setNewWorkspaceName(event.target.value)}
                    />
                    <button type="button" className="create-video-btn create-video-btn-primary" onClick={handleCreateWorkspaceInline} disabled={creatingWorkspace}>
                      {creatingWorkspace ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                )}

                <label className="create-video-field">
                  <span>Choose Folder *</span>
                  <select value={folderId} onChange={handleFolderSelect} disabled={folderLoading || !workspaceId}>
                    {!folderOptions.length && <option value="">No folders available</option>}
                    {folderOptions.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                    <option value="__create_folder__">+ Create New Folder</option>
                  </select>
                </label>

                {showInlineFolderCreate && (
                  <div className="create-video-inline-row">
                    <input
                      className="create-video-inline-input"
                      type="text"
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(event) => setNewFolderName(event.target.value)}
                    />
                    <button type="button" className="create-video-btn create-video-btn-primary" onClick={handleCreateFolderInline} disabled={creatingFolder || !workspaceId}>
                      {creatingFolder ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                )}

                {selectedWorkspace && !canCreateInWorkspace(selectedWorkspace) && (
                  <div className="create-video-warning">
                    You are a Viewer in this shared workspace. Project creation is disabled here.
                  </div>
                )}
              </div>
            )}
          </div>

          <footer className="create-video-footer">
            <button type="button" className="create-video-btn create-video-btn-ghost" onClick={closeWithGuard}>
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
                  disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  className="create-video-btn create-video-btn-primary"
                  onClick={handleCreate}
                  disabled={!canCreateVideo || submitting}
                  title={
                    selectedWorkspace && !canCreateInWorkspace(selectedWorkspace)
                      ? 'You need Editor access to create a project in this workspace'
                      : ''
                  }
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              )}
            </div>
          </footer>
        </section>

        {showDiscardConfirm && (
          <div className="create-video-confirm-overlay" onClick={() => setShowDiscardConfirm(false)}>
            <div className="create-video-confirm-dialog" onClick={(event) => event.stopPropagation()}>
              <div className="create-video-confirm-icon-wrap">
                <MdWarning className="create-video-confirm-icon" />
              </div>
              <h3 className="create-video-confirm-title">Discard changes?</h3>
              <p className="create-video-confirm-text">Discard this project setup? Your progress will be lost.</p>
              <div className="create-video-confirm-actions">
                <button
                  type="button"
                  className="create-video-btn create-video-btn-ghost"
                  onClick={() => setShowDiscardConfirm(false)}
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  className="create-video-btn create-video-btn-primary"
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    showToast('Changes discarded', 'error');
                    onClose();
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`create-video-toast create-video-toast--${toast.type}`}>
            {toast.type === 'success' ? (
              <MdCheckCircle className="create-video-toast-icon" />
            ) : (
              <MdCancel className="create-video-toast-icon" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateVideoModal;
