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
  fetchEditorTemplateBundles,
  sceneMatchesAspectRatio,
} from '../../../utils/fetchEditorTemplates.js';
import TemplateBundlePicker from '../../features/editor/editor/TemplateBundlePicker';
import { sanitizeUserFacingMessage } from '../../../utils/userFacingMessage.js';
import {
  DUPLICATE_PROJECT_NAME_MESSAGE,
  findDuplicateProjectName,
} from '../../../utils/projectNameValidation.js';
import './CreateVideoModal.css';

const WIZARD_STEPS = [
  { id: 1, label: 'Canvas Size' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'Details' }
];

const CANVAS_OPTIONS = [
  { id: 'landscape', label: '16:9 Landscape', ratio: '16:9' },
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
  initialFolderId = '',
  presenterSeed = null,
  templateSeed = null,
}) => {
  const { user: authUser } = useAuth();
  const currentUserId = extractUserId(authUser);

  const [step, setStep] = useState(() => templateSeed ? 3 : 1);

  const [canvasSize, setCanvasSize] = useState('landscape');
  const [customCanvas, setCustomCanvas] = useState({ width: '', height: '' });

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => templateSeed?.templateId || null);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateBundles, setTemplateBundles] = useState([]);

  const [workspaceOptions, setWorkspaceOptions] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(initialWorkspaceId || '');

  const [folderOptions, setFolderOptions] = useState([]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderId, setFolderId] = useState(initialFolderId || '');
  const [folderProjects, setFolderProjects] = useState([]);
  const [folderProjectsLoading, setFolderProjectsLoading] = useState(false);
  const [folderProjectsLoadError, setFolderProjectsLoadError] = useState(false);

  const [showInlineWorkspaceCreate, setShowInlineWorkspaceCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const [showInlineFolderCreate, setShowInlineFolderCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [videoTitle, setVideoTitle] = useState(() => templateSeed?.name || '');
  const [videoTags, setVideoTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingName, setVerifyingName] = useState(false);
  const [showNameDuplicateError, setShowNameDuplicateError] = useState(false);
  const [toast, setToast] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message: sanitizeUserFacingMessage(message), type });
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
    if (selectedTemplateId === 'blank' || !selectedTemplateId) return null;

    if (String(selectedTemplateId).startsWith('bundle:')) {
      const bundleId = String(selectedTemplateId).replace('bundle:', '');
      const bundle = templateBundles.find((item) => String(item.id) === bundleId);
      return bundle ? { scenes: bundle.scenes, bundle } : null;
    }

    if (String(selectedTemplateId).startsWith('scene:')) {
      const sceneId = String(selectedTemplateId).replace('scene:', '');
      for (const bundle of templateBundles) {
        const scene = (bundle.scenes || []).find((item) => String(item.id) === sceneId);
        if (scene) return { scene, bundle };
      }
      return null;
    }

    for (const bundle of templateBundles) {
      const scene = (bundle.scenes || []).find((item) => String(item.id) === String(selectedTemplateId));
      if (scene) return { scene, bundle };
    }
    return null;
  }, [selectedTemplateId, templateBundles]);

  const aspectRatio = useMemo(
    () => canvasToAspectRatio(canvasSize, customCanvas),
    [canvasSize, customCanvas]
  );

  const filteredBundles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return templateBundles.filter((bundle) => {
      const matchesSearch =
        !query ||
        (bundle.name || '').toLowerCase().includes(query) ||
        (bundle.category || '').toLowerCase().includes(query) ||
        (bundle.description || '').toLowerCase().includes(query) ||
        (bundle.scenes || []).some(
          (scene) =>
            (scene.title || '').toLowerCase().includes(query) ||
            (scene.tags || []).some((tag) => String(tag).toLowerCase().includes(query))
        );
      const matchesFilter = selectedFilter === 'All' || bundle.filterCategory === selectedFilter;
      const matchesRatio = (bundle.scenes || []).some((scene) => sceneMatchesAspectRatio(scene, aspectRatio));
      return matchesSearch && matchesFilter && matchesRatio;
    });
  }, [templateBundles, searchQuery, selectedFilter, aspectRatio]);

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
    if (!trimmedVideoTitle || !folderId || folderProjectsLoadError) {
      return false;
    }
    if (folderProjectsLoading && folderProjects.length === 0) {
      return false;
    }
    return Boolean(findDuplicateProjectName(trimmedVideoTitle, folderProjects));
  }, [trimmedVideoTitle, folderId, folderProjects, folderProjectsLoading, folderProjectsLoadError]);

  const showDuplicateNameError = isProjectNameDuplicate || showNameDuplicateError;

  const canProceedStep1 = Boolean(aspectRatio);
  const canProceedStep2 = selectedTemplateId !== null;
  const canCreateVideo =
    Boolean(trimmedVideoTitle) &&
    !isProjectNameDuplicate &&
    !folderProjectsLoading &&
    !folderProjectsLoadError &&
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
      setFolderProjectsLoading(false);
      setFolderProjectsLoadError(false);
      return;
    }

    setFolderProjectsLoading(true);
    setFolderProjectsLoadError(false);
    try {
      const projects = await workspaceService.listProjectsInFolder(nextWorkspaceId, nextFolderId);
      setFolderProjects(projects || []);
    } catch (error) {
      setFolderProjects([]);
      setFolderProjectsLoadError(true);
      showToast(
        sanitizeUserFacingMessage(error?.message) ||
          'Could not load existing projects in this folder',
        'error'
      );
    } finally {
      setFolderProjectsLoading(false);
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
      setTemplateBundles([]);
      return;
    }
    // If we already have a templateSeed with its bundle injected, seed templateBundles
    // immediately so selectedTemplate resolves before the async fetch completes.
    if (templateSeed?.bundle) {
      setTemplateBundles((prev) => {
        const exists = prev.some((b) => String(b.id) === String(templateSeed.bundle.id));
        return exists ? prev : [templateSeed.bundle, ...prev];
      });
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
    if (!workspaceId || !folderId) {
      setFolderProjects([]);
      setFolderProjectsLoading(false);
      setFolderProjectsLoadError(false);
      return;
    }

    setFolderProjects([]);
    setFolderProjectsLoading(true);
    setFolderProjectsLoadError(false);
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
          name: video.name || video.title,
          folderId: video.folderId || createdFolderId,
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
      const bundles = await fetchEditorTemplateBundles();
      setTemplateBundles(bundles);
    } catch {
      setTemplateBundles([]);
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
      } else if (String(templateId).startsWith('bundle:')) {
        const bundleId = String(templateId).replace('bundle:', '');
        const bundle = templateBundles.find((item) => String(item.id) === bundleId);
        if (bundle?.name) setVideoTitle(bundle.name);
      } else if (String(templateId).startsWith('scene:')) {
        const sceneId = String(templateId).replace('scene:', '');
        for (const bundle of templateBundles) {
          const scene = (bundle.scenes || []).find((item) => String(item.id) === sceneId);
          if (scene?.title) {
            setVideoTitle(scene.title);
            break;
          }
        }
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
    if (submitting || verifyingName || folderProjectsLoading) return;

    const title = videoTitle.trim();
    if (
      !title ||
      !aspectRatio ||
      !workspaceId ||
      !folderId ||
      !canCreateInWorkspace(selectedWorkspace)
    ) {
      return;
    }

    // Step 1: always check the server for an existing project with this name before creating.
    setVerifyingName(true);
    let nameCheck;
    try {
      nameCheck = await workspaceService.verifyProjectNameInFolder(workspaceId, folderId, title);
    } catch (error) {
      showToast(
        sanitizeUserFacingMessage(error?.message) ||
          'Could not verify project name. Please try again.',
        'error'
      );
      return;
    } finally {
      setVerifyingName(false);
    }

    if (!nameCheck.available) {
      setFolderProjects(nameCheck.projects || []);
      setShowNameDuplicateError(true);
      return;
    }

    setShowNameDuplicateError(false);

    const payload = {
      title,
      tags: videoTags,
      aspectRatio: canvasSize === 'custom' ? 'custom' : aspectRatio,
      folderId,
    };

    if (canvasSize === 'custom' && customCanvas.width && customCanvas.height) {
      payload.customWidth = parseInt(customCanvas.width, 10) || 1920;
      payload.customHeight = parseInt(customCanvas.height, 10) || 1080;
    }

    // Step 2: name is free — create the project.
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

        // Resolve template payload: prefer selectedTemplate (from picker),
        // fall back to templateSeed.bundle when coming from the template page.
        let templatePayload = null;
        if (selectedTemplate) {
          templatePayload = selectedTemplate.scenes?.length
            ? { scenes: selectedTemplate.scenes }
            : selectedTemplate.scene
              ? { scene: selectedTemplate.scene }
              : null;
        } else if (templateSeed?.bundle?.scenes?.length) {
          templatePayload = { scenes: templateSeed.bundle.scenes };
        }

        onCreateVideo({
          template: templatePayload,
          pageSize: canvasSize,
          canvasSize: aspectRatio,
          workspace: selectedWorkspace?.name || '',
          workspaceId,
          folder: folderOptions.find((folder) => String(folder.id) === String(folderId))?.name || '',
          folderId,
          tags: videoTags,
          name: payload.title,
          videoId: eventVideo.id,
          ...(presenterSeed ? { presenterSeed } : {}),
        });
      }
    } catch (error) {
      showToast(
        sanitizeUserFacingMessage(error?.message) || 'Failed to create project. Please try again.',
        'error'
      );
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
              // When templateSeed is used, steps before the current are pre-completed
              const isCompleted = step > stepItem.id || (templateSeed && stepItem.id < 3);
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
                <p>Choose a template group, apply all scenes, or pick a single layout</p>
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
            {presenterSeed?.avatarName ? (
              <div className="create-video-presenter-banner" role="status">
                Using <strong>{presenterSeed.avatarName}</strong>
                {presenterSeed.lookName && presenterSeed.lookName !== presenterSeed.avatarName
                  ? <> — {presenterSeed.lookName}</>
                  : null}
                {' '}as your presenter
              </div>
            ) : null}
            {step === 1 && (
              <div>
                <div className="create-video-page-size-grid create-video-page-size-grid--single" role="radiogroup" aria-label="Choose canvas size">
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
                <p className="create-video-canvas-note">
                  Only 16:9 Landscape is available. More aspect ratios coming soon.
                </p>
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
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="create-video-template-skeleton" />
                    ))}
                  </div>
                ) : (
                  <div className="create-video-bundle-picker">
                    <button
                      type="button"
                      className={`create-video-template-card blank ${selectedTemplateId === 'blank' ? 'selected' : ''}`}
                      onClick={() => handleSelectTemplate('blank')}
                      style={{ marginBottom: 16, maxWidth: 220 }}
                    >
                      <div className="create-video-thumb-wrap blank">
                        <span className="create-video-blank-plus">
                          <MdAdd size={40} />
                        </span>
                      </div>
                      <span className="create-video-template-name">Start from Blank</span>
                    </button>

                    <TemplateBundlePicker
                      bundles={filteredBundles}
                      loading={false}
                      searchQuery={searchQuery}
                      activeLayout="All Layouts"
                      onSelectScene={(scene) => handleSelectTemplate(`scene:${scene.id}`)}
                      onApplyBundle={(bundle) => handleSelectTemplate(`bundle:${bundle.id}`)}
                      emptyMessage="No template groups match your canvas size or filters."
                      selectedSceneId={
                        selectedTemplateId && String(selectedTemplateId).startsWith('scene:')
                          ? String(selectedTemplateId).replace('scene:', '')
                          : null
                      }
                      selectedBundleId={
                        selectedTemplateId && String(selectedTemplateId).startsWith('bundle:')
                          ? String(selectedTemplateId).replace('bundle:', '')
                          : null
                      }
                    />

                    {selectedTemplateId && selectedTemplateId !== 'blank' ? (
                      <p className="create-video-selection-note">
                        Selected:{' '}
                        {String(selectedTemplateId).startsWith('bundle:')
                          ? `${selectedTemplate?.bundle?.name || 'Template bundle'} (all scenes)`
                          : selectedTemplate?.scene?.title || 'Scene'}
                      </p>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <div className="create-video-form-stack">
                {templateSeed && (
                  <div className="create-video-template-seed-banner">
                    <span className="create-video-template-seed-banner__icon">🎬</span>
                    <div className="create-video-template-seed-banner__text">
                      <span className="create-video-template-seed-banner__label">Template selected</span>
                      <span className="create-video-template-seed-banner__name">{templateSeed.name}</span>
                    </div>
                  </div>
                )}
                <label className="create-video-field">
                  <span className="create-video-field-label">Project Title *</span>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(event) => {
                      setVideoTitle(event.target.value);
                      setShowNameDuplicateError(false);
                    }}
                    placeholder="Enter project title..."
                    className={showDuplicateNameError ? 'create-video-input-error' : ''}
                    aria-invalid={showDuplicateNameError}
                    aria-describedby={showDuplicateNameError ? 'project-title-duplicate-error' : undefined}
                  />
                  {showDuplicateNameError && (
                    <p
                      id="project-title-duplicate-error"
                      className="create-video-title-error"
                      role="alert"
                    >
                      {DUPLICATE_PROJECT_NAME_MESSAGE}
                    </p>
                  )}
                  {folderProjectsLoading && (
                    <span className="create-video-field-hint">Checking existing projects…</span>
                  )}
                  {folderProjectsLoadError && (
                    <span className="create-video-field-error">
                      Could not verify existing projects in this folder
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

              {step === 2 && selectedTemplateId && selectedTemplateId !== 'blank' && (
                <div className="create-video-selection-chip">
                  <span className="create-video-selection-chip__check">✓</span>
                  <span className="create-video-selection-chip__label">
                    {String(selectedTemplateId).startsWith('bundle:')
                      ? `${selectedTemplate?.bundle?.name || 'Template bundle'} (all scenes)`
                      : selectedTemplate?.scene?.title || 'Scene selected'}
                  </span>
                </div>
              )}

              {step === 2 && selectedTemplateId === 'blank' && (
                <div className="create-video-selection-chip">
                  <span className="create-video-selection-chip__check">✓</span>
                  <span className="create-video-selection-chip__label">Blank canvas</span>
                </div>
              )}

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
                  disabled={
                    !trimmedVideoTitle ||
                    !aspectRatio ||
                    !workspaceId ||
                    !folderId ||
                    !canCreateInWorkspace(selectedWorkspace) ||
                    submitting ||
                    verifyingName ||
                    folderProjectsLoading ||
                    folderProjectsLoadError
                  }
                  title={
                    showDuplicateNameError
                      ? DUPLICATE_PROJECT_NAME_MESSAGE
                      : folderProjectsLoadError
                      ? 'Could not verify existing projects in this folder'
                      : selectedWorkspace && !canCreateInWorkspace(selectedWorkspace)
                        ? 'You need Editor access to create a project in this workspace'
                        : ''
                  }
                >
                  {verifyingName ? 'Checking...' : submitting ? 'Creating...' : 'Create Project'}
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
          <div
            className={`create-video-toast create-video-toast--${toast.type}`}
            role="alert"
            aria-live="polite"
          >
            {toast.type === 'success' ? (
              <MdCheckCircle className="create-video-toast-icon" />
            ) : toast.type === 'warning' ? (
              <MdWarning className="create-video-toast-icon" />
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
