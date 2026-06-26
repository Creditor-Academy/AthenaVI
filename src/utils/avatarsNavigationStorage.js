const KEYS = {
  lookContext: 'athenavi:avatarLookContext',
  activeSection: 'athenavi:avatarsActiveSection',
  personaGroupId: 'athenavi:avatarsPersonaGroupId',
};

const VALID_SECTIONS = new Set(['public', 'private', 'workspace']);

function readJson(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    if (value == null) {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode
  }
}

function readString(key) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(key, value) {
  try {
    if (value == null || value === '') {
      sessionStorage.removeItem(key);
      return;
    }
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function isValidLookContext(ctx) {
  return Boolean(ctx && typeof ctx === 'object' && ctx.groupId);
}

export function loadAvatarLookContext() {
  const ctx = readJson(KEYS.lookContext);
  return isValidLookContext(ctx) ? ctx : null;
}

export function saveAvatarLookContext(ctx) {
  if (!isValidLookContext(ctx)) {
    clearAvatarLookContext();
    return;
  }
  writeJson(KEYS.lookContext, ctx);
}

export function clearAvatarLookContext() {
  try {
    sessionStorage.removeItem(KEYS.lookContext);
  } catch {
    // ignore
  }
}

export function loadAvatarsActiveSection() {
  const section = readString(KEYS.activeSection);
  return VALID_SECTIONS.has(section) ? section : 'public';
}

export function saveAvatarsActiveSection(section) {
  if (!VALID_SECTIONS.has(section)) return;
  writeString(KEYS.activeSection, section);
}

export function loadAvatarsPersonaGroupId() {
  const id = readString(KEYS.personaGroupId);
  return id && String(id).trim() ? String(id).trim() : null;
}

export function saveAvatarsPersonaGroupId(groupId) {
  if (!groupId) {
    clearAvatarsPersonaGroupId();
    return;
  }
  writeString(KEYS.personaGroupId, String(groupId));
}

export function clearAvatarsPersonaGroupId() {
  try {
    sessionStorage.removeItem(KEYS.personaGroupId);
  } catch {
    // ignore
  }
}

/** Reset avatars list tab and persona when leaving the avatars area via sidebar. */
export function clearAvatarsListNavigation() {
  try {
    sessionStorage.removeItem(KEYS.activeSection);
    sessionStorage.removeItem(KEYS.personaGroupId);
  } catch {
    // ignore
  }
}
