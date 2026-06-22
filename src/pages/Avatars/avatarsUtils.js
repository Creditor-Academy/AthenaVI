export const AVATAR_SECTION_TABS = [
  { id: 'public', label: 'Public Library' },
  { id: 'private', label: 'My Avatars' },
  { id: 'workspace', label: 'Team Shared' },
];

export function getAvatarSectionSubtitle(tabId) {
  switch (tabId) {
    case 'private':
      return 'Custom avatars you created for your account.';
    case 'workspace':
      return 'Avatars shared with your team workspaces.';
    default:
      return 'Browse the public avatar library.';
  }
}

export function getAvatarEmptyTitle(tabId, hasSearch) {
  if (hasSearch) return 'No matching avatars';
  switch (tabId) {
    case 'private':
      return 'No custom avatars yet';
    case 'workspace':
      return 'No team avatars yet';
    default:
      return 'No avatars found';
  }
}

export function getAvatarEmptyHint(tabId, hasSearch) {
  if (hasSearch) {
    return 'Try a different search term or switch to another section.';
  }
  switch (tabId) {
    case 'private':
      return 'Create a custom avatar to use in your video projects.';
    case 'workspace':
      return 'Shared avatars from your team will appear here.';
    default:
      return 'The public library could not be loaded or is empty.';
  }
}

export const AVATAR_SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'role_asc', label: 'Role (A-Z)' },
];

export const AVATAR_FILTER_OPTIONS = [
  { value: 'all', label: 'All avatars' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'unknown', label: 'Unknown gender' },
];

export const AVATAR_GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'gender', label: 'Gender' },
  { value: 'style', label: 'Style' },
];

export function applyAvatarFilters(avatars, { searchQuery, filterBy }) {
  const q = (searchQuery || '').trim().toLowerCase();
  return (avatars || []).filter((avatar) => {
    if (!avatar) return false;
    const name = (avatar.name || '').toLowerCase();
    const role = (avatar.role || '').toLowerCase();
    const matchesSearch = !q || name.includes(q) || role.includes(q);

    if (!matchesSearch) return false;

    const gender = (avatar.gender || 'Unknown').toLowerCase();
    if (filterBy === 'female') return gender.includes('female') || gender === 'f';
    if (filterBy === 'male') return gender.includes('male') || gender === 'm';
    if (filterBy === 'unknown') return !gender || gender === 'unknown';
    return true;
  });
}

export function sortAvatars(avatars, sortBy) {
  const list = [...(avatars || [])];
  list.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    const roleA = (a.role || '').toLowerCase();
    const roleB = (b.role || '').toLowerCase();
    switch (sortBy) {
      case 'name_desc':
        return nameB.localeCompare(nameA);
      case 'role_asc':
        return roleA.localeCompare(roleB);
      case 'name_asc':
      default:
        return nameA.localeCompare(nameB);
    }
  });
  return list;
}

export function groupAvatars(avatars, groupBy) {
  if (!groupBy || groupBy === 'none') {
    return [{ key: 'all', label: '', avatars: avatars || [] }];
  }

  const buckets = new Map();
  for (const avatar of avatars || []) {
    let key = 'Other';
    if (groupBy === 'gender') {
      key = avatar.gender || 'Unknown';
    } else if (groupBy === 'style') {
      key = avatar.style || avatar.category || 'General';
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(avatar);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, label: key, avatars: items }));
}
