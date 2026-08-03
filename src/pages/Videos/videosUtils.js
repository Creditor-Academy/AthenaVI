import { normalizeId } from '../TeamWorkspace/workspaceUtils.js';

export const VIDEO_SECTION_OPTIONS = [
  { value: 'all', label: 'All Workspaces' },
  { value: 'personal', label: 'Personal Workspace' },
  { value: 'my-workspace', label: 'My Workspaces' },
  { value: 'shared-with-me', label: 'Shared with Me' },
];

export const WORK_CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'avatar_video', label: 'Videos' },
  { id: 'ppt', label: 'Presentation' },
  { id: 'image', label: 'Images' },
];

export const SAMPLE_WORK_ITEMS = [];

export function getVideoSection(video, workspaceById, currentUserId) {
  const workspace = workspaceById?.get(video.workspaceId);
  const nested = video.workspace || {};
  const typeRaw = String(
    workspace?.type || nested.type || video.workspaceType || ''
  ).toLowerCase();

  const isPersonal =
    workspace?.type === 'personal' ||
    typeRaw === 'personal' ||
    typeRaw === 'private' ||
    video.workspaceId === 'personal';

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

export function getVideoSectionSubtitle(tabId, categoryId = 'all') {
  let categoryLabel = 'work items';
  if (categoryId === 'avatar_video') categoryLabel = 'videos';
  else if (categoryId === 'ppt') categoryLabel = 'presentations';
  else if (categoryId === 'image') categoryLabel = 'images';

  switch (tabId) {
    case 'personal':
      return `Showing personal workspace ${categoryLabel}.`;
    case 'my-workspace':
      return `Showing team workspace ${categoryLabel} owned by you.`;
    case 'shared-with-me':
      return `Showing ${categoryLabel} shared with you.`;
    default:
      return `Manage, search, and export your videos, presentations, and images.`;
  }
}

export function getVideoEmptyTitle(tabId, hasSearch, categoryId = 'all') {
  if (hasSearch) return 'No matching items found';
  let catText = 'items';
  if (categoryId === 'avatar_video') catText = 'videos';
  else if (categoryId === 'ppt') catText = 'presentations';
  else if (categoryId === 'image') catText = 'images';

  switch (tabId) {
    case 'personal':
      return `No personal ${catText} yet`;
    case 'my-workspace':
      return `No team workspace ${catText} yet`;
    case 'shared-with-me':
      return `No shared ${catText} yet`;
    default:
      return `No ${catText} available`;
  }
}

export function getVideoEmptyHint(tabId, hasSearch, categoryId = 'all') {
  if (hasSearch) {
    return 'Try adjusting your search query, clearing filters, or switching categories.';
  }
  if (categoryId === 'avatar_video') {
    return 'Export a video from the studio editor to populate your video library.';
  }
  if (categoryId === 'ppt') {
    return 'Create or export a presentation deck to view it in this category.';
  }
  if (categoryId === 'image') {
    return 'Generate or upload images and graphics to populate your gallery.';
  }
  return 'Create videos, presentations, or images to see your work here.';
}

export function getCategoryFilterOptions(activeCategory) {
  if (activeCategory === 'avatar_video') {
    return [
      { value: 'all', label: 'All Videos' },
      { value: 'my_renders', label: 'Rendered by me' },
      { value: 'large_files', label: 'Large files (50MB+)' },
    ];
  }
  if (activeCategory === 'ppt') {
    return [
      { value: 'all', label: 'All Presentations' },
      { value: 'large_decks', label: 'Large Decks (15+ slides)' },
      { value: 'my_renders', label: 'Created by me' },
    ];
  }
  if (activeCategory === 'image') {
    return [
      { value: 'all', label: 'All Images' },
      { value: '4k_images', label: '4K Ultra HD' },
      { value: 'my_renders', label: 'Created by me' },
    ];
  }
  return [
    { value: 'all', label: 'All items' },
    { value: 'large_files', label: 'Large files (50MB+)' },
    { value: 'my_renders', label: 'Created by me' },
  ];
}

export const VIDEO_SORT_OPTIONS = [
  { value: 'completed_desc', label: 'Newest first' },
  { value: 'completed_asc', label: 'Oldest first' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'size_desc', label: 'Largest first' },
  { value: 'size_asc', label: 'Smallest first' },
];

export const VIDEO_GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'category', label: 'Category' },
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

export function applyVideoFilters(
  videos,
  { searchQuery, filterBy, currentUserId, workspaceMap, activeSection, activeCategory = 'all' }
) {
  const q = searchQuery.trim().toLowerCase();

  return videos.filter((item) => {
    // Category filter
    const itemCategory = item.category || 'avatar_video';
    if (activeCategory !== 'all' && itemCategory !== activeCategory) {
      return false;
    }

    // Workspace section filter
    const section = getVideoSection(item, workspaceMap, currentUserId);
    if (activeSection !== 'all' && section !== activeSection) return false;

    // Filter dropdown conditions
    if (filterBy === 'large_files') {
      const bytes = Number(item.fileSizeBytes) || 0;
      if (bytes < LARGE_FILE_BYTES) return false;
    }

    if (filterBy === 'my_renders' && currentUserId) {
      const triggeredById = getTriggeredById(item);
      if (triggeredById && triggeredById !== currentUserId) return false;
    }

    if (filterBy === 'large_decks') {
      if (item.category !== 'ppt' || (item.slideCount || 0) < 15) return false;
    }

    if (filterBy === '4k_images') {
      if (item.category !== 'image' || !String(item.dimensions || '').includes('3840')) return false;
    }

    if (!q) return true;
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.workspaceName || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.triggeredBy?.name || '').toLowerCase().includes(q)
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

  if (groupBy === 'category') {
    const categoryNames = {
      avatar_video: 'Videos',
      ppt: 'Presentations',
      image: 'Images',
    };
    const groups = new Map();
    videos.forEach((item) => {
      const catKey = item.category || 'avatar_video';
      const label = categoryNames[catKey] || 'Other Work';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(item);
    });

    return Array.from(groups.entries()).map(([label, items]) => ({
      key: label,
      label,
      videos: items,
    }));
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
