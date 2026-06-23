export function normalizeVoiceGender(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (value.startsWith('m') || value === 'man' || value === 'boy') return 'male';
  if (value.startsWith('f') || value === 'woman' || value === 'girl') return 'female';
  return 'unknown';
}
