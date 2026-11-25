import digitalTwinImage from '../../assets/avatar/Digital_Twin.png';
import photoAvatarImage from '../../assets/avatar/Photo_Avatar.png';
import promptBasedImage from '../../assets/avatar/Prompt_Based_Avatar.png';

const AVATAR_TYPE_OPTION_DEFS = [
  {
    id: 'digital_twin',
    title: 'Digital Twin',
    description: 'Clones your real appearance from video',
    badge: 'From Video',
    image: digitalTwinImage,
  },
  {
    id: 'photo',
    title: 'Photo Avatar',
    description: 'Animates a still image into a persona',
    badge: 'From Image',
    image: photoAvatarImage,
  },
  {
    id: 'prompt',
    title: 'Prompt Based',
    description: 'Generate a face entirely from text',
    badge: 'AI Generated',
    image: promptBasedImage,
  },
];

/** All defined types (includes digital twin for lookups when feature is on). */
export const AVATAR_TYPE_OPTIONS = AVATAR_TYPE_OPTION_DEFS;

const DEFAULT_AVATAR_CREATE_TYPE_ID = 'photo';

function envFlagTrue(name) {
  const raw = import.meta.env[name];
  if (raw == null || String(raw).trim() === '') return false;
  const normalized = String(raw).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * Matches backend `HEYGEN_DIGITAL_TWIN_CREATE_ENABLED` — opt-in only.
 * @returns {boolean}
 */
export function isHeygenDigitalTwinCreateEnabled() {
  return envFlagTrue('VITE_HEYGEN_DIGITAL_TWIN_CREATE_ENABLED');
}

export function isAvatarCreateTypeIdAllowed(typeId) {
  const id = typeId != null ? String(typeId).trim().toLowerCase() : '';
  if (id === 'digital_twin') return isHeygenDigitalTwinCreateEnabled();
  return id === 'photo' || id === 'prompt';
}

/** Types shown on Create Avatar (digital twin omitted unless env enabled). */
export function getCreatableAvatarTypeOptions() {
  if (isHeygenDigitalTwinCreateEnabled()) {
    return AVATAR_TYPE_OPTION_DEFS;
  }
  return AVATAR_TYPE_OPTION_DEFS.filter((option) => option.id !== 'digital_twin');
}

export function getDefaultAvatarCreateTypeId() {
  return DEFAULT_AVATAR_CREATE_TYPE_ID;
}

export function getAvatarTypeOption(id) {
  const option = AVATAR_TYPE_OPTION_DEFS.find((item) => item.id === id) || null;
  if (!option) return null;
  if (option.id === 'digital_twin' && !isHeygenDigitalTwinCreateEnabled()) return null;
  return option;
}