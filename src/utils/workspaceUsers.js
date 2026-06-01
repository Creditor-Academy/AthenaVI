export function normalizeUserId(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'object') {
    return String(
      value.id || value._id || value.userId || value.user_id || value.sub || ''
    );
  }
  return String(value);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getNameInitials(name) {
  if (!name || name === '-' || name === 'Unknown') return '?';

  const cleaned = String(name).trim();
  if (!cleaned) return '?';

  if (cleaned.toLowerCase() === 'you') return 'Y';

  if (cleaned.includes('@')) {
    const local = cleaned.split('@')[0];
    const parts = local.split(/[._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return local.slice(0, 2).toUpperCase();
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  const single = parts[0];
  return single.length >= 2 ? `${single[0]}${single[1]}`.toUpperCase() : single[0].toUpperCase();
}

const AVATAR_COLOR_PALETTE = [
  '#7c3aed',
  '#2563eb',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#db2777',
  '#4f46e5',
  '#0d9488',
  '#9333ea',
  '#ea580c',
  '#65a30d'
];

const AVATAR_FALLBACK_COLOR = '#64748b';

function hashString(value) {
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/** Stable accent color per display name (same name → same color). */
export function getAvatarColorForName(name) {
  const cleaned = String(name || '').trim().toLowerCase();
  if (!cleaned || cleaned === '-' || cleaned === 'unknown') {
    return AVATAR_FALLBACK_COLOR;
  }

  const index = hashString(cleaned) % AVATAR_COLOR_PALETTE.length;
  return AVATAR_COLOR_PALETTE[index];
}

export function getAuthDisplayName(authUser) {
  if (!authUser) return '';
  if (authUser.name) return authUser.name;
  const fullName = [authUser.firstName, authUser.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  return authUser.username || authUser.email || '';
}

export function buildWorkspaceUserLookup(workspace, currentUserId, authUser) {
  const lookup = new Map();

  const add = (id, name) => {
    const key = normalizeUserId(id);
    const label = typeof name === 'string' ? name.trim() : '';
    if (!key || !label || UUID_RE.test(label)) return;
    lookup.set(key, label);
  };

  const selfName = getAuthDisplayName(authUser);
  if (currentUserId && selfName) {
    add(currentUserId, selfName);
  }

  if (workspace?.owner) {
    add(
      workspace.owner.id || workspace.owner._id || workspace.ownerId,
      workspace.owner.name || workspace.owner.username || workspace.owner.email
    );
  }

  add(workspace?.ownerId, workspace?.ownerName);

  (workspace?.members || []).forEach((member) => {
    const memberId =
      member.userId ||
      member.user?.id ||
      member.user?._id ||
      member.id ||
      member._id;
    const memberName =
      member.user?.name ||
      member.user?.username ||
      member.user?.email ||
      member.name ||
      member.username ||
      member.email;
    add(memberId, memberName);
  });

  return lookup;
}

export function extractUserIdFromRef(ref) {
  if (ref == null || ref === '') return '';
  if (typeof ref === 'string') {
    if (ref.includes('@')) return '';
    return normalizeUserId(ref);
  }
  if (typeof ref === 'object') {
    return normalizeUserId(ref);
  }
  return '';
}

export function pickUserRef(entity, kind = 'creator') {
  if (!entity) return null;

  if (kind === 'creator') {
    return (
      entity.creator ||
      entity.createdByUser ||
      entity.user ||
      entity.createdBy ||
      entity.createdById ||
      entity.owner ||
      entity.ownerId ||
      null
    );
  }

  return (
    entity.updatedByUser ||
    entity.lastModifiedByUser ||
    entity.updatedBy ||
    entity.updatedById ||
    entity.lastModifiedById ||
    entity.modifiedBy ||
    entity.modifiedById ||
    entity.creator ||
    entity.createdByUser ||
    entity.createdBy ||
    entity.createdById ||
    null
  );
}

export function resolveUserDisplayName(userRef, lookup, currentUserId, authUser) {
  const userId = extractUserIdFromRef(userRef);

  if (userId && currentUserId && userId === currentUserId) {
    return getAuthDisplayName(authUser) || 'You';
  }

  if (userId && lookup?.get(userId)) {
    return lookup.get(userId);
  }

  if (typeof userRef === 'object' && userRef) {
    const direct =
      userRef.name ||
      userRef.username ||
      userRef.displayName ||
      userRef.email;
    if (direct && !UUID_RE.test(direct)) return direct;
  }

  if (typeof userRef === 'string' && userRef.includes('@')) {
    return userRef;
  }

  return 'Unknown';
}
