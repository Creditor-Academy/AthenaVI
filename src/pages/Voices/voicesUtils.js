import { normalizeVoiceGender } from '../../utils/voiceGender';

export { normalizeVoiceGender };

export const VOICE_SECTION_TABS = [
  { id: 'public', label: 'Public Library' },
  { id: 'private', label: 'My Voices' },
];

export function getVoiceSectionSubtitle(tabId) {
  switch (tabId) {
    case 'private':
      return 'Custom voices you created for your account.';
    default:
      return 'Browse the public voice library.';
  }
}

export function getVoiceEmptyTitle(tabId, hasSearch) {
  if (hasSearch) return 'No matching voices';
  switch (tabId) {
    case 'private':
      return 'No custom voices yet';
    default:
      return 'No voices found';
  }
}

export function getVoiceEmptyHint(tabId, hasSearch) {
  if (hasSearch) {
    return 'Try a different search term or switch to another section.';
  }
  switch (tabId) {
    case 'private':
      return 'Create a custom voice to use in your video projects.';
    default:
      return 'The public library could not be loaded or is empty.';
  }
}

export const VOICE_SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'language_asc', label: 'Language (A-Z)' },
];

export const VOICE_FILTER_OPTIONS = [
  { value: 'all', label: 'All voices' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'processing', label: 'Processing' },
];

export const VOICE_GROUP_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'language', label: 'Language' },
  { value: 'gender', label: 'Gender' },
];

export function applyVoiceFilters(voices, { searchQuery, filterBy }) {
  const q = (searchQuery || '').trim().toLowerCase();
  return (voices || []).filter((voice) => {
    if (!voice) return false;
    const name = (voice.name || '').toLowerCase();
    const language = (voice.language || '').toLowerCase();
    const matchesSearch = !q || name.includes(q) || language.includes(q);

    if (!matchesSearch) return false;

    const gender = (voice.gender || '').toLowerCase();
    if (filterBy === 'female') return gender.includes('female') || gender === 'f';
    if (filterBy === 'male') return gender.includes('male') || gender === 'm';
    if (filterBy === 'processing') return voice.status === 'processing';
    return true;
  });
}

export function sortVoices(voices, sortBy) {
  const list = [...(voices || [])];
  list.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    const langA = (a.language || '').toLowerCase();
    const langB = (b.language || '').toLowerCase();
    switch (sortBy) {
      case 'name_desc':
        return nameB.localeCompare(nameA);
      case 'language_asc':
        return langA.localeCompare(langB);
      case 'name_asc':
      default:
        return nameA.localeCompare(nameB);
    }
  });
  return list;
}

export function groupVoices(voices, groupBy) {
  if (!groupBy || groupBy === 'none') {
    return [{ key: 'all', label: '', voices: voices || [] }];
  }

  const buckets = new Map();
  for (const voice of voices || []) {
    let key = 'Other';
    if (groupBy === 'language') {
      key = voice.language || 'Unknown';
    } else if (groupBy === 'gender') {
      key = voice.gender || 'Unknown';
    }
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(voice);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, label: key, voices: items }));
}
