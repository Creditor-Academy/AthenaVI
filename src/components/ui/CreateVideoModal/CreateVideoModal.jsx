import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MdCheck,
  MdSearch,
  MdAdd,
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdLayers,
  MdFace,
  MdFolderOpen,
  MdAspectRatio,
  MdClose,
  MdApps,
  MdBusinessCenter,
  MdSchool,
  MdCampaign,
  MdGroups,
  MdCropSquare,
  MdTimer,
  MdPlayCircleOutline,
} from 'react-icons/md';
import workspaceService from '../../../services/workspaceService.js';
import { useAuth } from '../../../contexts/AuthContext';
import {
  fetchEditorTemplateBundles,
  sceneMatchesAspectRatio,
} from '../../../utils/fetchEditorTemplates.js';
import TemplateScenePreview from '../../features/editor/editor/TemplateScenePreview';
import { sanitizeUserFacingMessage } from '../../../utils/userFacingMessage.js';
import {
  DUPLICATE_PROJECT_NAME_MESSAGE,
  findDuplicateProjectName,
} from '../../../utils/projectNameValidation.js';
import { usePptDaypart } from '../../../utils/pptDaypart';
import bgMorning from '../../../assets/ppt-bg/morning.png';
import bgAfternoon from '../../../assets/ppt-bg/afternoon.png';
import bgEvening from '../../../assets/ppt-bg/evening.png';
import bgNight from '../../../assets/ppt-bg/night.png';
import './CreateVideoModal.css';

const DAYPART_BACKGROUNDS = {
  morning: bgMorning,
  afternoon: bgAfternoon,
  evening: bgEvening,
  night: bgNight,
};

const WIZARD_STEPS = [
  { id: 1, label: 'Canvas size' },
  { id: 2, label: 'Template' },
  { id: 3, label: 'Details' }
];

const STEP_COPY = {
  1: { title: 'Choose a canvas size', subtitle: 'Pick the shape of your video.' },
  2: { title: 'Pick a template', subtitle: 'Use a whole template, a single scene from one, or start blank.' },
  3: { title: 'Name your project', subtitle: 'Give it a title and choose where to save it.' },
};

// Only landscape can be created today; the others are shown so people know they're coming.
const CANVAS_OPTIONS = [
  { id: 'landscape', label: 'Landscape', ratio: '16:9', hint: 'YouTube, websites and presentations', available: true },
  { id: 'portrait', label: 'Portrait', ratio: '9:16', hint: 'Reels, TikTok and Stories', available: false },
  { id: 'square', label: 'Square', ratio: '1:1', hint: 'Instagram and LinkedIn feeds', available: false },
  { id: 'four-five', label: 'Vertical post', ratio: '4:5', hint: 'Instagram and Facebook posts', available: false },
];

const PREBUILT_TAGS = ['Professional', 'Presentation', 'Marketing', 'Social Media', 'Education', 'Personal'];

const TEMPLATE_FILTERS = ['All', 'Corporate', 'Training', 'Marketing', 'Social', 'Minimal'];

const FILTER_ICONS = {
  All: MdApps,
  Corporate: MdBusinessCenter,
  Training: MdSchool,
  Marketing: MdCampaign,
  Social: MdGroups,
  Minimal: MdCropSquare,
};

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
  // Custom sizes aren't offered yet; kept so the payload code below still handles them.
  const [customCanvas] = useState({ width: '', height: '' });

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

  // Workspace and folder are filled in automatically, so they don't count as the person's changes.
  const hasDirtyData = useMemo(() => {
    return Boolean(
      videoTitle.trim() ||
      selectedTemplateId ||
      videoTags.length ||
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
    if (isOpen) {
      if (initialWorkspaceId) setWorkspaceId(initialWorkspaceId);
      if (initialFolderId) setFolderId(initialFolderId);
    }
  }, [isOpen, initialWorkspaceId, initialFolderId]);

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

  const daypart = usePptDaypart();
  // The template whose scenes are open in the right sidebar.
  const [drawerBundleId, setDrawerBundleId] = useState(null);
  const scrollRef = useRef(null);
  const titleInputRef = useRef(null);
  const escapeRef = useRef(() => {});

  // The page covers the dashboard, so the dashboard behind it shouldn't scroll.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') escapeRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    scrollRef.current?.scrollTo?.({ top: 0 });
    if (step === 3) {
      const id = window.setTimeout(() => titleInputRef.current?.focus(), 60);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isOpen, step]);

  if (!isOpen) return null;

  const closeWithGuard = () => {
    if (hasDirtyData) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  escapeRef.current = () => {
    if (showDiscardConfirm) setShowDiscardConfirm(false);
    else if (drawerBundleId) setDrawerBundleId(null);
    else closeWithGuard();
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

    const isDuplicate = workspaceOptions.some(
      (ws) => String(ws.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showToast('This workspace name already exists', 'error');
      return;
    }

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

    const isDuplicate = folderOptions.some(
      (f) => String(f.name || '').trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (isDuplicate) {
      showToast('This folder name already exists in this workspace', 'error');
      return;
    }

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

  const stepCopy = STEP_COPY[step] || STEP_COPY[1];
  const selectedCanvas = CANVAS_OPTIONS.find((option) => option.id === canvasSize) || CANVAS_OPTIONS[0];
  const selectedFolder = folderOptions.find((folder) => String(folder.id) === String(folderId)) || null;
  const isBundleSelected = Boolean(selectedTemplateId) && String(selectedTemplateId).startsWith('bundle:');

  // What the person picked on the template step, in words.
  const templateSummary = (() => {
    if (selectedTemplateId === 'blank') return { title: 'Blank canvas', detail: 'Start with an empty scene' };
    if (isBundleSelected) {
      const bundle = selectedTemplate?.bundle || templateSeed?.bundle;
      const count = bundle?.scenes?.length || 0;
      return {
        title: bundle?.name || templateSeed?.name || 'Template',
        detail: count ? `All ${count} scenes` : 'All scenes',
      };
    }
    if (selectedTemplate?.scene) {
      return {
        title: selectedTemplate.scene.title || 'Scene',
        detail: selectedTemplate.bundle?.name ? `One scene from ${selectedTemplate.bundle.name}` : 'One scene',
      };
    }
    if (templateSeed?.name) return { title: templateSeed.name, detail: 'Template' };
    return null;
  })();

  const previewScene =
    selectedTemplate?.scene ||
    selectedTemplate?.bundle?.coverScene ||
    selectedTemplate?.scenes?.[0] ||
    templateSeed?.bundle?.coverScene ||
    templateSeed?.bundle?.scenes?.[0] ||
    null;

  const createDisabled = !canCreateVideo || submitting || verifyingName;

  const createTitle = showDuplicateNameError
    ? DUPLICATE_PROJECT_NAME_MESSAGE
    : folderProjectsLoadError
      ? 'Could not verify existing projects in this folder'
      : selectedWorkspace && !canCreateInWorkspace(selectedWorkspace)
        ? 'You need Editor access to create a project in this workspace'
        : '';

  const blankSelected = selectedTemplateId === 'blank';
  const selectedSceneKey =
    selectedTemplateId && String(selectedTemplateId).startsWith('scene:')
      ? String(selectedTemplateId).replace('scene:', '')
      : null;
  // The template that holds the current pick (the whole template or one of its scenes).
  const selectedBundleKey = isBundleSelected
    ? String(selectedTemplateId).replace('bundle:', '')
    : selectedSceneKey && selectedTemplate?.bundle
      ? String(selectedTemplate.bundle.id)
      : null;
  const bundleSeconds = (bundle) =>
    (bundle?.scenes || []).reduce((sum, scene) => sum + (Number(scene.duration) || 8), 0);
  const drawerBundle = drawerBundleId
    ? templateBundles.find((bundle) => String(bundle.id) === String(drawerBundleId)) || null
    : null;
  const drawerSceneCount = drawerBundle?.scenes?.length || 0;
  const drawerAllSelected = Boolean(drawerBundle) && selectedBundleKey === String(drawerBundle.id) && isBundleSelected;

  const categoryCounts = (() => {
    const query = searchQuery.trim().toLowerCase();
    const counts = Object.fromEntries(TEMPLATE_FILTERS.map((label) => [label, 0]));
    templateBundles.forEach((bundle) => {
      const matchesRatio = (bundle.scenes || []).some((scene) => sceneMatchesAspectRatio(scene, aspectRatio));
      const matchesSearch =
        !query ||
        [bundle.name, bundle.category, bundle.description].some((text) => (text || '').toLowerCase().includes(query)) ||
        (bundle.scenes || []).some((scene) => (scene.title || '').toLowerCase().includes(query));
      if (!matchesRatio || !matchesSearch) return;
      counts.All += 1;
      if (counts[bundle.filterCategory] != null) counts[bundle.filterCategory] += 1;
    });
    return counts;
  })();

  const pickFromDrawer = (templateId) => {
    handleSelectTemplate(templateId);
    setDrawerBundleId(null);
  };

  return (
    <div
      className={`cvp-page cvp-page--${daypart}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cvp-title"
      style={{ backgroundImage: `url(${DAYPART_BACKGROUNDS[daypart] || bgAfternoon})` }}
    >
      <div className="cvp-head">
        <header className="cvp-topbar">
          <button type="button" className="cvp-exit" onClick={closeWithGuard}>
            <MdArrowBack size={18} aria-hidden />
            <span>Dashboard</span>
          </button>

          <ol className="cvp-progress" aria-label="Create video steps">
            {WIZARD_STEPS.map((stepItem, index) => {
              const isActive = step === stepItem.id;
              const isCompleted = step > stepItem.id || (templateSeed && stepItem.id < 3);
              return (
                <li
                  key={stepItem.id}
                  className={`cvp-progress-item${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {index > 0 ? <span className="cvp-progress-line" aria-hidden /> : null}
                  <span className="cvp-progress-dot" aria-hidden>
                    {isCompleted && !isActive ? <MdCheck size={14} /> : stepItem.id}
                  </span>
                  <span className="cvp-progress-label">{stepItem.label}</span>
                </li>
              );
            })}
          </ol>

          <span className="cvp-topbar-spacer" aria-hidden />
        </header>

        <div className="cvp-hero" key={`hero-${step}`}>
          <h1 id="cvp-title" className="cvp-title">{stepCopy.title}</h1>
          <p className="cvp-subtitle">{stepCopy.subtitle}</p>
          {presenterSeed?.avatarName ? (
            <p className="cvp-presenter-chip" role="status">
              <MdFace size={16} aria-hidden />
              <span>
                Presenter: <strong>{presenterSeed.avatarName}</strong>
                {presenterSeed.lookName && presenterSeed.lookName !== presenterSeed.avatarName
                  ? <> · {presenterSeed.lookName}</>
                  : null}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="cvp-scroll" ref={scrollRef}>
        <main className={`cvp-body cvp-body--step-${step}`} key={`body-${step}`}>
          {step === 1 && (
            <div className="cvp-canvas-grid" role="radiogroup" aria-label="Canvas size">
              {CANVAS_OPTIONS.map((option) => {
                const isSelected = canvasSize === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-disabled={!option.available}
                    disabled={!option.available}
                    className={`cvp-canvas-card${isSelected ? ' selected' : ''}${option.available ? '' : ' soon'}`}
                    onClick={() => option.available && setCanvasSize(option.id)}
                  >
                    {isSelected ? (
                      <span className="cvp-canvas-check" aria-hidden>
                        <MdCheck size={16} />
                      </span>
                    ) : null}
                    {!option.available ? <span className="cvp-canvas-soon">Coming soon</span> : null}
                    <span className="cvp-canvas-stage" aria-hidden>
                      <span className={`cvp-canvas-frame cvp-canvas-frame--${option.id}`}>
                        <span className="cvp-canvas-presenter" />
                        <span className="cvp-canvas-lines">
                          <span />
                          <span />
                        </span>
                      </span>
                    </span>
                    <span className="cvp-canvas-text">
                      <strong>{option.label}</strong>
                      <span className="cvp-canvas-ratio">{option.ratio}</span>
                    </span>
                    <span className="cvp-canvas-hint">{option.hint}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <section className="cvp-tpl" aria-label="Templates">
              <aside className="cvp-tpl-side" aria-label="Find a template">
                <label className="cvp-search" htmlFor="create-video-search-input">
                  <MdSearch size={18} aria-hidden />
                  <input
                    id="create-video-search-input"
                    type="search"
                    placeholder="Search templates"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>

                <p className="cvp-tpl-side-label">Categories</p>
                <div className="cvp-filter-list" role="tablist" aria-label="Template categories" aria-orientation="vertical">
                  {TEMPLATE_FILTERS.map((filterLabel) => {
                    const Icon = FILTER_ICONS[filterLabel] || MdApps;
                    const active = selectedFilter === filterLabel;
                    return (
                      <button
                        key={filterLabel}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        className={`cvp-filter-item${active ? ' active' : ''}`}
                        onClick={() => setSelectedFilter(filterLabel)}
                      >
                        <span className="cvp-filter-item__icon" aria-hidden>
                          <Icon size={17} />
                        </span>
                        <span className="cvp-filter-item__label">{filterLabel === 'All' ? 'All templates' : filterLabel}</span>
                        {!templatesLoading ? (
                          <span className="cvp-filter-item__count">{categoryCounts[filterLabel] ?? 0}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="cvp-tpl-main">
              <div className="cvp-tpl-grid">
                <button
                  type="button"
                  className={`cvp-tpl-card cvp-tpl-card--blank${blankSelected ? ' selected' : ''}`}
                  onClick={() => handleSelectTemplate('blank')}
                  aria-pressed={blankSelected}
                >
                  <span className="cvp-tpl-card__preview">
                    <span className="cvp-tpl-card__plus" aria-hidden>
                      <MdAdd size={30} />
                    </span>
                    {blankSelected ? (
                      <span className="cvp-tpl-card__selected">
                        <MdCheck size={14} aria-hidden />
                        Selected
                      </span>
                    ) : null}
                  </span>
                  <span className="cvp-tpl-card__body">
                    <strong>Blank canvas</strong>
                    <span className="cvp-tpl-card__desc">Start with an empty scene and build the video your way.</span>
                    <span className="cvp-tpl-card__meta">
                      <span>
                        <MdLayers size={14} aria-hidden />
                        1 scene
                      </span>
                    </span>
                  </span>
                </button>

                {templatesLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="cvp-tpl-card cvp-tpl-card--skeleton" aria-hidden>
                      <span className="cvp-tpl-card__preview" />
                      <span className="cvp-tpl-card__body">
                        <span className="cvp-skeleton-line" />
                        <span className="cvp-skeleton-line cvp-skeleton-line--short" />
                      </span>
                    </div>
                  ))
                  : filteredBundles.map((bundle) => {
                    const sceneCount = bundle.scenes?.length || bundle.totalSlides || 0;
                    const isSelected = selectedBundleKey === String(bundle.id);
                    return (
                      <button
                        key={bundle.file || bundle.id}
                        type="button"
                        className={`cvp-tpl-card${isSelected ? ' selected' : ''}`}
                        onClick={() => setDrawerBundleId(bundle.id)}
                        aria-haspopup="dialog"
                      >
                        <span className="cvp-tpl-card__preview">
                          {bundle.coverScene ? (
                            <TemplateScenePreview template={bundle.coverScene} compact />
                          ) : (
                            <span className="cvp-tpl-card__fallback" />
                          )}
                          {bundle.category ? (
                            <span className="cvp-tpl-card__category">{bundle.category}</span>
                          ) : null}
                          {isSelected ? (
                            <span className="cvp-tpl-card__selected">
                              <MdCheck size={14} aria-hidden />
                              Selected
                            </span>
                          ) : (
                            <span className="cvp-tpl-card__count">{sceneCount} scenes</span>
                          )}
                          <span className="cvp-tpl-card__view" aria-hidden>
                            <span>View scenes</span>
                          </span>
                        </span>
                        <span className="cvp-tpl-card__body">
                          <strong>{bundle.name}</strong>
                          {bundle.description ? (
                            <span className="cvp-tpl-card__desc">{bundle.description}</span>
                          ) : null}
                          <span className="cvp-tpl-card__meta">
                            <span>
                              <MdLayers size={14} aria-hidden />
                              {sceneCount} scenes
                            </span>
                            <span>
                              <MdTimer size={14} aria-hidden />
                              ~{bundleSeconds(bundle)}s
                            </span>
                          </span>
                          {isSelected && templateSummary ? (
                            <span className="cvp-tpl-card__pick">
                              <MdCheck size={14} aria-hidden />
                              {templateSummary.detail}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
              </div>

              {!templatesLoading && filteredBundles.length === 0 ? (
                <p className="cvp-tpl-empty">No templates match your search or category.</p>
              ) : null}
              </div>
            </section>
          )}

          {step === 3 && (
            <div className="cvp-details">
              <section className="cvp-panel cvp-form" aria-label="Project details">
                <label className="cvp-field">
                  <span className="cvp-field-label">Project title</span>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={videoTitle}
                    onChange={(event) => {
                      setVideoTitle(event.target.value);
                      setShowNameDuplicateError(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !createDisabled) {
                        event.preventDefault();
                        handleCreate();
                      }
                    }}
                    placeholder="e.g. Product launch walkthrough"
                    className={showDuplicateNameError ? 'cvp-input-error' : ''}
                    aria-invalid={showDuplicateNameError}
                    aria-describedby={showDuplicateNameError ? 'project-title-duplicate-error' : undefined}
                  />
                  {showDuplicateNameError && (
                    <p id="project-title-duplicate-error" className="cvp-field-error" role="alert">
                      {DUPLICATE_PROJECT_NAME_MESSAGE}
                    </p>
                  )}
                  {folderProjectsLoading && (
                    <span className="cvp-field-hint">Checking existing projects…</span>
                  )}
                  {folderProjectsLoadError && (
                    <span className="cvp-field-error">Could not verify existing projects in this folder</span>
                  )}
                </label>

                <div className="cvp-field">
                  <span className="cvp-field-label">
                    Tags <span className="cvp-field-optional">Optional</span>
                  </span>
                  <div className="cvp-tag-pills">
                    {PREBUILT_TAGS.map((tag) => {
                      const active = videoTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={active}
                          className={`cvp-tag-pill${active ? ' active' : ''}`}
                          onClick={() => handleToggleTag(tag)}
                        >
                          {active ? <MdCheck size={14} aria-hidden /> : null}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="cvp-field-row">
                  <label className="cvp-field">
                    <span className="cvp-field-label">Workspace</span>
                    <select value={workspaceId} onChange={handleWorkspaceSelect} disabled={workspaceLoading}>
                      {!workspaceOptions.length && (
                        <option value="">{workspaceLoading ? 'Loading…' : 'No workspaces available'}</option>
                      )}

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

                  <label className="cvp-field">
                    <span className="cvp-field-label">Folder</span>
                    <select value={folderId} onChange={handleFolderSelect} disabled={folderLoading || !workspaceId}>
                      {!folderOptions.length && (
                        <option value="">{folderLoading ? 'Loading…' : 'No folders available'}</option>
                      )}
                      {folderOptions.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                      <option value="__create_folder__">+ Create New Folder</option>
                    </select>
                  </label>
                </div>

                {showInlineWorkspaceCreate && (
                  <div className="cvp-inline-row">
                    <input
                      className="cvp-inline-input"
                      type="text"
                      placeholder="New workspace name"
                      value={newWorkspaceName}
                      onChange={(event) => setNewWorkspaceName(event.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="cvp-btn cvp-btn-primary cvp-btn-small"
                      onClick={handleCreateWorkspaceInline}
                      disabled={creatingWorkspace || !newWorkspaceName.trim()}
                    >
                      {creatingWorkspace ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="cvp-btn cvp-btn-ghost cvp-btn-small"
                      onClick={() => {
                        setShowInlineWorkspaceCreate(false);
                        setNewWorkspaceName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {showInlineFolderCreate && (
                  <div className="cvp-inline-row">
                    <input
                      className="cvp-inline-input"
                      type="text"
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(event) => setNewFolderName(event.target.value)}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="cvp-btn cvp-btn-primary cvp-btn-small"
                      onClick={handleCreateFolderInline}
                      disabled={creatingFolder || !workspaceId || !newFolderName.trim()}
                    >
                      {creatingFolder ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="cvp-btn cvp-btn-ghost cvp-btn-small"
                      onClick={() => {
                        setShowInlineFolderCreate(false);
                        setNewFolderName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {selectedWorkspace && !canCreateInWorkspace(selectedWorkspace) && (
                  <div className="cvp-warning" role="alert">
                    You are a Viewer in this shared workspace. Project creation is disabled here.
                  </div>
                )}
              </section>

              <aside className="cvp-panel cvp-summary" aria-label="Your video">
                <div className="cvp-summary-preview">
                  {previewScene ? (
                    <TemplateScenePreview template={previewScene} compact />
                  ) : (
                    <span className="cvp-summary-blank">
                      <MdAdd size={28} aria-hidden />
                      Blank canvas
                    </span>
                  )}
                  <span className="cvp-summary-ratio">{selectedCanvas.ratio}</span>
                </div>
                <h2 className="cvp-summary-title">{trimmedVideoTitle || 'Untitled project'}</h2>
                <dl className="cvp-summary-list">
                  <div>
                    <dt>
                      <MdAspectRatio size={16} aria-hidden />
                      Canvas
                    </dt>
                    <dd>{selectedCanvas.label} · {selectedCanvas.ratio}</dd>
                  </div>
                  <div>
                    <dt>
                      <MdLayers size={16} aria-hidden />
                      Template
                    </dt>
                    <dd>
                      {templateSummary ? (
                        <>
                          {templateSummary.title}
                          <small>{templateSummary.detail}</small>
                        </>
                      ) : (
                        'None'
                      )}
                    </dd>
                  </div>
                  {presenterSeed?.avatarName ? (
                    <div>
                      <dt>
                        <MdFace size={16} aria-hidden />
                        Presenter
                      </dt>
                      <dd>{presenterSeed.avatarName}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>
                      <MdFolderOpen size={16} aria-hidden />
                      Saves to
                    </dt>
                    <dd>
                      {selectedWorkspace?.name || '—'}
                      {selectedFolder?.name ? <small>{selectedFolder.name}</small> : null}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          )}
        </main>
      </div>

      <footer className="cvp-footer">
        <div className="cvp-footer-inner">
          {step === 1 ? (
            <button type="button" className="cvp-btn cvp-btn-ghost" onClick={closeWithGuard}>
              Cancel
            </button>
          ) : (
            <button type="button" className="cvp-btn cvp-btn-ghost" onClick={handleBack}>
              <MdArrowBack size={18} aria-hidden />
              Back
            </button>
          )}

          {step === 2 && templateSummary ? (
            <div className="cvp-selection-chip" role="status">
              <span className="cvp-selection-chip__check" aria-hidden>
                <MdCheck size={13} />
              </span>
              <span className="cvp-selection-chip__label">
                {templateSummary.title}
                <small>{templateSummary.detail}</small>
              </span>
            </div>
          ) : (
            <span className="cvp-footer-step">Step {step} of {WIZARD_STEPS.length}</span>
          )}

          {step < 3 ? (
            <button
              type="button"
              className="cvp-btn cvp-btn-primary"
              onClick={handleNext}
              disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2)}
              title={step === 2 && !canProceedStep2 ? 'Pick a template or a blank canvas to continue' : undefined}
            >
              Continue
              <MdArrowForward size={18} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              className="cvp-btn cvp-btn-primary"
              onClick={handleCreate}
              disabled={createDisabled}
              title={createTitle}
            >
              {verifyingName ? 'Checking…' : submitting ? 'Creating…' : 'Create project'}
              {!verifyingName && !submitting ? <MdArrowForward size={18} aria-hidden /> : null}
            </button>
          )}
        </div>
      </footer>

      {drawerBundle && (
        <>
          <div className="cvp-drawer-backdrop" onClick={() => setDrawerBundleId(null)} aria-hidden />
          <aside
            className="cvp-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cvp-drawer-title"
          >
            <header className="cvp-drawer-header">
              <div className="cvp-drawer-heading">
                {drawerBundle.category ? (
                  <span className="cvp-drawer-eyebrow">{drawerBundle.category}</span>
                ) : null}
                <h2 id="cvp-drawer-title">{drawerBundle.name}</h2>
                <p>
                  {drawerSceneCount} scenes · ~{bundleSeconds(drawerBundle)}s · {drawerBundle.aspectRatio || '16:9'}
                </p>
              </div>
              <button
                type="button"
                className="cvp-drawer-close"
                onClick={() => setDrawerBundleId(null)}
                aria-label="Close sidebar"
                autoFocus
              >
                <MdClose size={20} aria-hidden />
              </button>
            </header>

            <div className="cvp-drawer-body">
              {drawerBundle.description ? (
                <p className="cvp-drawer-desc">{drawerBundle.description}</p>
              ) : null}

              <div className="cvp-drawer-label">
                <strong>Scenes</strong>
                <span>Tap a scene to use only that one</span>
              </div>

              <div className="cvp-drawer-scenes">
                {(drawerBundle.scenes || []).map((scene, index) => {
                  const isSelected = selectedSceneKey === String(scene.id);
                  const kind = scene.layoutType || scene.tags?.[0] || '';
                  return (
                    <button
                      key={scene.id || index}
                      type="button"
                      className={`cvp-scene-card${isSelected ? ' selected' : ''}`}
                      onClick={() => pickFromDrawer(`scene:${scene.id}`)}
                      aria-pressed={isSelected}
                    >
                      <span className="cvp-scene-card__preview">
                        <TemplateScenePreview template={scene} compact />
                        <span className="cvp-scene-card__num">{index + 1}</span>
                        <span className="cvp-scene-card__time">{Number(scene.duration) || 8}s</span>
                        {isSelected ? (
                          <span className="cvp-scene-card__check" aria-hidden>
                            <MdCheck size={14} />
                          </span>
                        ) : null}
                      </span>
                      <span className="cvp-scene-card__body">
                        <strong>{scene.title || `Scene ${index + 1}`}</strong>
                        {kind ? <span>{kind}</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <footer className="cvp-drawer-footer">
              <button
                type="button"
                className="cvp-btn cvp-btn-primary cvp-drawer-apply"
                onClick={() => pickFromDrawer(`bundle:${drawerBundle.id}`)}
              >
                {drawerAllSelected ? <MdCheck size={18} aria-hidden /> : <MdPlayCircleOutline size={18} aria-hidden />}
                {drawerAllSelected ? `Using all ${drawerSceneCount} scenes` : `Use all ${drawerSceneCount} scenes`}
              </button>
            </footer>
          </aside>
        </>
      )}

      {showDiscardConfirm && (
        <div className="cvp-confirm-overlay" onClick={() => setShowDiscardConfirm(false)}>
          <div
            className="cvp-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cvp-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cvp-confirm-icon-wrap">
              <MdWarning className="cvp-confirm-icon" />
            </div>
            <h3 id="cvp-confirm-title" className="cvp-confirm-title">Discard this video?</h3>
            <p className="cvp-confirm-text">The choices you made here will be lost.</p>
            <div className="cvp-confirm-actions">
              <button
                type="button"
                className="cvp-btn cvp-btn-ghost"
                onClick={() => setShowDiscardConfirm(false)}
                autoFocus
              >
                Keep editing
              </button>
              <button
                type="button"
                className="cvp-btn cvp-btn-danger"
                onClick={() => {
                  setShowDiscardConfirm(false);
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
        <div className={`cvp-toast cvp-toast--${toast.type}`} role="alert" aria-live="polite">
          {toast.type === 'success' ? (
            <MdCheckCircle className="cvp-toast-icon" />
          ) : toast.type === 'warning' ? (
            <MdWarning className="cvp-toast-icon" />
          ) : (
            <MdCancel className="cvp-toast-icon" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CreateVideoModal;
