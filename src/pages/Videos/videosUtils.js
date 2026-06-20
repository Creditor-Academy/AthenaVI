import { normalizeId } from '../TeamWorkspace/workspaceUtils.js';

export const VIDEO_SECTION_TABS = [
  { id: 'all', label: 'All' },
  { id: 'personal', label: 'Personal' },
  { id: 'my-workspace', label: 'My Workspace' },
  { id: 'shared-with-me', label: 'Shared with Me' },
];

export function getVideoSection(video, workspaceById, currentUserId) {
  const workspace = workspaceById?.get(video.workspaceId);
  const nested = video.workspace || {};
  const typeRaw = String(
    workspace?.type || nested.type || video.workspaceType || ''
  ).toLowerCase();

  const isPersonal =
    workspace?.type === 'personal' ||
    typeRaw === 'personal' ||
    typeRaw === 'private';

  if (isPersonal) return 'personal';

  const ownerId = normalizeId(
    workspace?.ownerId ||
    nested.ownerId ||
    nested.owner?.id ||
    nested.owner
  );
  const role = String(
    workspace?.userRole ||
    video.membershipRole ||
    nested.userRole ||
    nested.role ||
    ''
  ).toUpperCase();

  const isOwner =
    role === 'OWNER' ||
    (Boolean(currentUserId) && ownerId && ownerId === currentUserId);

  return isOwner ? 'my-workspace' : 'shared-with-me';
}

export function getVideoSectionSubtitle(tabId) {
  switch (tabId) {
    case 'personal':
      return 'Completed exports from your personal workspace.';
    case 'my-workspace':
      return 'Completed exports from team workspaces you own.';
    case 'shared-with-me':
      return 'Completed exports from workspaces shared with you.';
    default:
      return 'Completed final exports across all your workspaces.';
  }
}

export function getVideoEmptyTitle(tabId, hasSearch) {
  if (hasSearch) return 'No matching exports';
  switch (tabId) {
    case 'personal':
      return 'No personal exports yet';
    case 'my-workspace':
      return 'No team workspace exports yet';
    case 'shared-with-me':
      return 'No shared workspace exports yet';
    default:
      return 'No completed exports yet';
  }
}

export function getVideoEmptyHint(tabId, hasSearch) {
  if (hasSearch) {
    return 'Try a different search term or switch to another section.';
  }
  switch (tabId) {
    case 'personal':
      return 'Finish a render in your personal workspace and it will show up here.';
    case 'my-workspace':
      return 'Completed renders from team workspaces you own will appear in this list.';
    case 'shared-with-me':
      return 'Exports from workspaces shared with you will appear here once available.';
    default:
      return 'Finish a render from the editor to see your completed exports here.';
  }
}

export function getVideoEmptyMessage(tabId, hasSearch) {
  return getVideoEmptyTitle(tabId, hasSearch);
}

export const VIDEO_SORT_OPTIONS = [
  { value: 'completed_desc', label: 'Newest first' },
  { value: 'completed_asc', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'size_desc', label: 'Largest first' },
  { value: 'size_asc', label: 'Smallest first' },
];

export const VIDEO_FILTER_OPTIONS = [
  { value: 'all', label: 'All exports' },
  { value: 'large_files', label: 'Large files (50MB+)' },
  { value: 'my_renders', label: 'Rendered by me' },
];

export const VIDEO_GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'date', label: 'Completed date' },
];

const LARGE_FILE_BYTES = 50 * 1024 * 1024;

function getTriggeredById(video) {
  const triggeredBy = video?.triggeredBy;
  if (!triggeredBy) return '';
  return normalizeId(
    triggeredBy.id ||
    triggeredBy._id ||
    triggeredBy.userId ||
    triggeredBy.user_id
  );
}

export function applyVideoFilters(videos, { searchQuery, filterBy, currentUserId, workspaceMap, activeSection }) {
  const q = searchQuery.trim().toLowerCase();

  return videos.filter((video) => {
    const section = getVideoSection(video, workspaceMap, currentUserId);
    if (activeSection !== 'all' && section !== activeSection) return false;

    if (filterBy === 'large_files') {
      const bytes = Number(video.fileSizeBytes) || 0;
      if (bytes < LARGE_FILE_BYTES) return false;
    }

    if (filterBy === 'my_renders' && currentUserId) {
      const triggeredById = getTriggeredById(video);
      if (triggeredById && triggeredById !== currentUserId) return false;
    }

    if (!q) return true;
    return (
      video.title.toLowerCase().includes(q) ||
      video.workspaceName.toLowerCase().includes(q) ||
      (video.triggeredBy?.name || '').toLowerCase().includes(q)
    );
  });
}

export function sortVideos(videos, sortBy) {
  const list = [...videos];

  list.sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return String(a.title || '').localeCompare(String(b.title || ''));
      case 'name_desc':
        return String(b.title || '').localeCompare(String(a.title || ''));
      case 'size_asc':
        return (Number(a.fileSizeBytes) || 0) - (Number(b.fileSizeBytes) || 0);
      case 'size_desc':
        return (Number(b.fileSizeBytes) || 0) - (Number(a.fileSizeBytes) || 0);
      case 'completed_asc':
        return new Date(a.completedAt || 0) - new Date(b.completedAt || 0);
      case 'completed_desc':
      default:
        return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    }
  });

  return list;
}

function getMonthGroupLabel(iso) {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function groupVideos(videos, groupBy) {
  if (groupBy === 'none' || videos.length === 0) {
    return [{ key: 'all', label: null, videos }];
  }

  if (groupBy === 'workspace') {
    const groups = new Map();
    videos.forEach((video) => {
      const label = video.workspaceName || 'Workspace';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(video);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, items]) => ({ key: label, label, videos: items }));
  }

  if (groupBy === 'date') {
    const groups = new Map();
    videos.forEach((video) => {
      const label = getMonthGroupLabel(video.completedAt);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(video);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => {
        const dateA = videos.find((v) => getMonthGroupLabel(v.completedAt) === a)?.completedAt;
        const dateB = videos.find((v) => getMonthGroupLabel(v.completedAt) === b)?.completedAt;
        return new Date(dateB || 0) - new Date(dateA || 0);
      })
      .map(([label, items]) => ({ key: label, label, videos: items }));
  }

  return [{ key: 'all', label: null, videos }];
}
